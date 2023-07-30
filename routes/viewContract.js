var express = require("express");
var router = express.Router();
const { pool } = require("../dbConfig");
const e = require("express");
const request = require("request");
var session = require("express-session");
const pgp = require("pg-promise")();
require("dotenv");

router.get("/row/:itemId", async (req, res) => {
  const itemId = req.params.itemId;
  console.log("itemId is", itemId);

  try {
    const query = `
        SELECT c."id", c."StartDate", c."EndDate", c."DocumentNo", c."ContractTotal", v."id" AS "VendorId", v."LegalName", t."Term", s."Name",
                 
        (
          SELECT json_agg(json_build_object(
            'ItemId', cl."ItemId",
            'ItemName', it."Name",
            'Quantity', cl."Quantity",
            'Amount', cl."Amount",
            'Rate', cl."Rate"
          ))
          FROM "ContractLines" cl
          INNER JOIN "Items" it ON cl."ItemId" = it."id"
          WHERE cl."ContractId" = c."id"
        ) AS "LineItems",
        
        
        (
          SELECT json_agg(json_build_object(
            'FileId', "id", 
            'FileName', "Name",
            'Path', "Path"
          ))
          FROM "ContractDocuments"
          WHERE "ContractId" = c."id"
        ) AS "Files"


        FROM "Contracts" c
        INNER JOIN "Vendors" v ON c."VendorId" = v."VendorId"
        INNER JOIN "Terms" t ON v."TermId" = t."id"
        INNER JOIN "Subsidiary" s ON v."SubsidiaryId" = s."Id"
        
        WHERE c."id" = $1
      `;

    const values = [itemId];
    const result = await pool.query(query, values);

    const lineItems = result.rows[0].LineItems || [];
    console.log(lineItems);

    const files = result.rows[0].Files || [];
    console.log(files);

    res.send({
      ContractId: result.rows[0].id,
      StartDate: result.rows[0].StartDate,
      EndDate: result.rows[0].EndDate,
      DocumentNo: result.rows[0].DocumentNo,
      ContractTotal: result.rows[0].ContractTotal,
      VendorId: result.rows[0].VendorId,
      VendorName: result.rows[0].LegalName,
      Term: result.rows[0].Term,
      Subsidiary: result.rows[0].Name,
      lineItems: lineItems,
      files: files,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
