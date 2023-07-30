var express = require('express');
var router = express.Router();
const { pool } = require("../dbConfig");
const e = require('express');
const request = require('request');
var session = require('express-session');
const pgp = require('pg-promise')();
require('dotenv')



/** Subsidiary Listing */

router.get("/", (req, res) => {
  pool.query(
    'Select "Id","Name" from "Subsidiary" where "Subsidiary"."IsActive" = true',
    (err, result) => {
      if (result.rowCount > 0) {
        var subsidiary = result.rows;
        return res
          .status(200)
          .send({ message: "success", subsidiary: subsidiary });
      } else {
        console.log("error", err);
        return res.status(500).send({ message: "serverError" });
      }
    }
  );
});

module.exports = router;