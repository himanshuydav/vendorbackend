var express = require('express');
var router = express.Router();
const { pool } = require("../dbConfig");
const e = require('express');
const request = require('request');
var session = require('express-session');
const pgp = require('pg-promise')();
require('dotenv')



router.get("/vendor/:vendorId", async (req, res) => {
  const vendorId = req.params.vendorId;
  console.log("vendorId", vendorId);

  try {
    const query = `
      SELECT v."VendorId", t."Term", s."Name"
      FROM "Vendors" v
      JOIN "Terms" t ON v."TermId" = t."id"
      JOIN "Subsidiary" s ON v."SubsidiaryId" = s."Id"
      WHERE v."id" = $1`;

    const values = [vendorId];

    const result = await pool.query(query, values);

    if (result.rows.length > 0) {
   
      res.json(result.rows);
    } else {
      res.status(404).json({ error: "vendor not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "internal Server Error" });
  }
});

module.exports = router;
