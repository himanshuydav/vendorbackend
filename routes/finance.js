var express = require('express');
var router = express.Router();
const { pool } = require("../dbConfig");
const e = require('express');
const request = require('request');
var session = require('express-session');
const pgp = require('pg-promise')();
require('dotenv')

router.post('/', async (req, res) => {
    const reqData = req.body;
    console.log(reqData)

    try {

        const {
            InvoiceId,
            TDS,
            Total
        } = reqData;

        pool.query(
            'INSERT INTO "Payment" ("InvoiceId","TDS %","Total") VALUES ($1,$2,$3)',
            [InvoiceId, TDS, Total],
            async (err, result) => {

                if (err) {
                    console.log(err);
                    return res.status(500).send({ message: "internal Server Error" });
                }
                console.log(result);
                res.status(200).send({ message: "success" });
            })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: 'internal server error' });

    }

});

module.exports = router;