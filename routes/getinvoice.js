var express = require('express');
var router = express.Router();
const { pool } = require("../dbConfig");
const e = require('express');
const request = require('request');
var session = require('express-session');
const pgp = require('pg-promise')();
var InvoiceID = "";
require('dotenv')



router.get("/row/:itemId", async (req, res) => {

  const itemId = req.params.itemId;
  console.log("itemId is", itemId);

  try {
    const query = `
    SELECT
    c."id", c."StartDate", c."EndDate", c."DocumentNo", c."ContractTotal",
    v."id" AS "VendorId", v."LegalName", t."Term", s."Name",

    (
      SELECT
        json_agg(json_build_object(
          'itemId', cl."ItemId",
          'itemName', it."Name",
          'contractQuantity', cl."Quantity",
          'amount', cl."Amount",
          'rate', cl."Rate",
          'invoiceQuantityTotal', COALESCE(ail."TotalQuantity", 0),
          'remainingQunatity', cl."Quantity" - COALESCE(ail."TotalQuantity", 0)
        )) FROM
        "ContractLines" cl
        INNER JOIN "Items" it ON cl."ItemId" = it."id"
        LEFT JOIN (
          SELECT il."ItemId", SUM(il."Quantity") AS "TotalQuantity" FROM "InvoiceLines" il
          WHERE il."InvoiceId" IN ( SELECT "id" FROM "Invoices"
              WHERE "ContractId" = c."id"
            )
          GROUP BY il."ItemId") ail ON cl."ItemId" = ail."ItemId"
          WHERE  cl."ContractId" = c."id"
        ) AS "LineItems",


    COALESCE(SUM(i."InvoiceTotal"), 0) AS "TotalInvoicedAmount",
    (c."ContractTotal" - COALESCE(SUM(i."InvoiceTotal"), 0)) AS "PendingBill"

    
    FROM "Contracts" c
    INNER JOIN "Vendors" v ON c."VendorId" = v."VendorId"
    INNER JOIN "Terms" t ON v."TermId" = t."id"
    INNER JOIN "Subsidiary" s ON v."SubsidiaryId" = s."Id"
    LEFT JOIN "Invoices" i ON c."id" = i."ContractId"
    
    WHERE  c."id" = $1
    GROUP BY  c."id",  v."id",  t."Term",  s."Name"
    `;


    const values = [itemId];
    const result = await pool.query(query, values);

    const lineItems = result.rows[0].LineItems || [];

    const totalInvoicedAmount = result.rows[0].TotalInvoicedAmount
    const pendingBill = result.rows[0].PendingBill


    res.send({
      contractId: result.rows[0].id,
      documentNo: result.rows[0].DocumentNo,
      vendorId: result.rows[0].VendorId,
      vendorName: result.rows[0].LegalName,
      term: result.rows[0].Term,
      subsidiary: result.rows[0].Name,
      contractTotal: result.rows[0].ContractTotal,
      totalInvoicedAmount: totalInvoicedAmount,
      pendingBill: pendingBill,
      lines: lineItems,
    });


  }

  catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }

});

// console.log(result.rows);




module.exports = router;
