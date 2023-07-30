
var express = require('express');
var router = express.Router();
var multer = require('multer')
const { pool } = require("../dbConfig");
const e = require('express');
const request = require('request');
var session = require('express-session');
const upload = multer();
const pgp = require('pg-promise')();
require('dotenv')



router.post('/', upload.none(), (req, res) => {

    const formData = req.body;
    console.log(formData);

    try {

        const { vendorId, contractId, transactionId, roleId, lines: linesJSON, finalTotalAmount, cgst, sgst, igst, utgst, taxSubTotal, total } = formData;
        const lines = JSON.parse(linesJSON);
        const convertedCgst = parseFloat(cgst) || null;
        const convertedSgst = parseFloat(sgst) || null;
        const convertedIgst = parseFloat(igst) || null;
        const convertedUtgst = parseFloat(utgst) || null;

        pool.query(
            'SELECT "status" , "level" FROM "ApprovalTable" WHERE "recordId" = $1 AND "roleId" = $2',
            [transactionId, roleId],
            (approvalErr, approvalResult) => {
                if (approvalErr) {
                    console.log(approvalErr);
                    return res.status(500).send({ success: false, message: "Internal Server Error" });

                }
                if (approvalResult.rowCount > 0) {
                    const level = approvalResult.rows[0].level;
                    const level1 = level + 1;
                    pool.query(
                        'SELECT "status", "level" FROM "ApprovalTable" WHERE "recordId" = $1 AND "level" = $2',
                        [transactionId, level1],
                        async (approvalErr, approvalResult1) => {
                            if (approvalErr) {
                                console.log(approvalErr);
                                return res.status(500).send({ success: false, message: "Internal Server Error" });

                            }
                            if (approvalResult1.rowCount > 0) {
                                const status = approvalResult1.rows[0].status;
                                pool.query(
                                    'INSERT INTO "Invoices" ("VendorId","ContractId","InvoiceTotal","Status","CGST","SGST","IGST","UTGST","TaxSubtotal","Total") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id',
                                    [vendorId, contractId, finalTotalAmount, status, convertedCgst, convertedSgst, convertedIgst, convertedUtgst, taxSubTotal, total],
                                    async (err, result) => {

                                        console.log(result);
                                        console.log("returning id", result.rows[0].id);
                                        const id = result.rows[0].id;

                                        lines.forEach((x) => {
                                            const { itemId, quantity, rate, totalAmount } = x;
                                            pool.query(
                                                'INSERT INTO "InvoiceLines" ("InvoiceId","ItemId","Quantity","Rate","Amount") VALUES ($1,$2,$3,$4,$5)',
                                                [id, itemId, quantity, rate, totalAmount]
                                            );

                                        });
                                    }
                                )
                            }
                        })
                } else {

                    pool.query(
                        'SELECT "status", "level" FROM "ApprovalTable" WHERE "recordId" = $1 AND "level" = $2',
                        [transactionId, 0],
                        async (approvalErr, approvalResult1) => {
                            if (approvalErr) {
                                console.log(approvalErr);
                                return res.status(500).send({ success: false, message: "Internal Server Error" });
                            }
                            if (approvalResult1.rowCount > 0) {
                                const status = approvalResult1.rows[0].status;
                                pool.query(
                                    'INSERT INTO "Invoices" ("VendorId","ContractId","InvoiceTotal","Status","CGST","SGST","IGST","UTGST","TaxSubtotal","Total") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id',
                                    [vendorId, contractId, finalTotalAmount, status, convertedCgst, convertedSgst, convertedIgst, convertedUtgst, taxSubTotal, total],
                                    async (err, result) => {

                                        console.log(result);
                                        console.log("returning id", result.rows[0].id);
                                        const id = result.rows[0].id;

                                        lines.forEach((x) => {
                                            const { itemId, quantity, rate, totalAmount } = x;
                                            pool.query(
                                                'INSERT INTO "InvoiceLines" ("InvoiceId","ItemId","Quantity","Rate","Amount") VALUES ($1,$2,$3,$4,$5)',
                                                [id, itemId, quantity, rate, totalAmount]
                                            );
                                        });
                                    }
                                )
                            }
                        })
                }
            })
        return res.status(200).send({ message: "success" });
    }

    catch (error) {
        console.error(error);
        res.status(401).send({ message: "error" });

    }
})

module.exports = router;