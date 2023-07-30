var express = require('express');
var router = express.Router();
const { pool } = require("../dbConfig");
const e = require('express');
const request = require('request');
var session = require('express-session');
const pgp = require('pg-promise')();
require('dotenv')


/** Terms Listing */

router.get("/", (req, res) => {
  pool.query(
    'Select "id","Term" from "Terms" where "Terms"."IsActive" = true',
    (err, result) => {
      console.log(result);

      if (result.rowCount > 0) {
        console.log(result.rows);
        var terms = result.rows;

        return res.status(200).send({ message: "success", terms: terms });
      } else {
        console.log("error", err);
        return res.status(500).send({ message: "serverError" });
      }
    }
  );
});

module.exports = router;