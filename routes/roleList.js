var express = require('express');
var router = express.Router();
const { pool } = require("../dbConfig");
const e = require('express');
const request = require('request');
var session = require('express-session');
const pgp = require('pg-promise')();
require('dotenv')


router.get('/', (req, res) => {
    pool.query(
        'Select "id","RoleName","Levels" from "Role" where "Role"."IsActive" = true',
        (err, result) => {
            if (result.rowCount > 0) {
                console.log(result.rows);
                var roleList = result.rows;
                return res.status(200).send({ message: "success", roleList: roleList });
            } else {
                console.log("error", err);
                return res.status(500).send({ message: "serverError" });
            }
        }
    );
});




module.exports = router