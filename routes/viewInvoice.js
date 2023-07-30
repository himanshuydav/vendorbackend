var express = require('express');
var router = express.Router();
const { pool } = require("../dbConfig");
const e = require('express');
const request = require('request');
var session = require('express-session');
const pgp = require('pg-promise')();
require('dotenv')


router.get("/row/:itemId", async (req, res) => {
    const itemId = req.params.itemId;
    console.log("itemId is", itemId);

    try {
        const query = `
            SELECT inv."InvoiceTotal", v."LegalName", inv."id", c."DocumentNo", inv."CGST", inv."SGST", inv."IGST", inv."UTGST", inv."TaxSubtotal", inv."Total",

            (
                SELECT json_agg(json_build_object(
                  'ItemId', invl."ItemId",
                  'ItemName', it."Name",
                  'Quantity', invl."Quantity",
                  'Amount', invl."Amount",
                  'Rate', invl."Rate"
                ))
                FROM "InvoiceLines" invl
                INNER JOIN "Items" it ON invl."ItemId" = it."id"
                WHERE invl."InvoiceId" = inv."id"
            ) AS "LineItems"
                     
            FROM "Invoices" inv
            INNER JOIN "Vendors" v ON inv."VendorId" = v."id"
            INNER JOIN "Contracts" c ON inv."ContractId" = c."id"
    
            WHERE inv."id" = $1
          `;

        const values = [itemId];
        const result = await pool.query(query, values);
        console.log(result.rows[0])

        const lineItems = result.rows[0].LineItems || [];
        console.log(lineItems);


        res.send({
            VendorName: result.rows[0].LegalName,
            DocumentNo: result.rows[0].DocumentNo,
            Id: result.rows[0].id,
            ContractTotal: result.rows[0].ContractTotal,
            InvoiceTotal: result.rows[0].InvoiceTotal,
            Cgst: result.rows[0].CGST,
            Sgst: result.rows[0].SGST,
            Igst: result.rows[0].IGST,
            UTgst: result.rows[0].UTGST,
            TaxSubtotal: result.rows[0].TaxSubtotal,
            Total: result.rows[0].Total,
            lineItems: lineItems
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }



})






module.exports = router;