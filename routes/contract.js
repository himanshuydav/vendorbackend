var express = require('express');
var router = express.Router();
const { pool } = require("../dbConfig");
const e = require('express');
const request = require('request');
var session = require('express-session');
const pgp = require('pg-promise')();
require('dotenv')
const multer = require("multer");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "assets/contracts/");
    },
    filename: function (req, file, cb) {
        const unique = Date.now();
        cb(null, unique + '-' + file.originalname);
    },
});
const upload = multer({
    storage: storage
});
router.post("/", upload.array("files", 10), (req, res) => {
    const formData = req.body;
    console.log(formData);
    const files = req.files;
    console.log("files", files);
    try {
        const {
            startDate,
            endDate,
            vendor,
            transactionId,
            roleId,
            lineItems: lineItemsJSON,
            finalTotalAmount
        } = formData;
        const lineItems = JSON.parse(lineItemsJSON);
        pool.query('SELECT "VendorId" FROM "Vendors" WHERE "id" = $1', [vendor],
            (vendorErr, vendorResult) => {
                if (vendorErr) {
                    console.log(vendorErr);
                    return res.status(500).send({ success: false, message: "Internal Server Error" });
                }
                console.log("haids", vendorResult.rowCount);
                pool.query(
                    'SELECT "status" , "level" FROM "ApprovalTable" WHERE "recordId" = $1 AND "roleId" = $2',
                    [transactionId, roleId],
                    (approvalErr, approvalResult) => {
                        if (approvalErr) {
                            console.log(approvalErr);
                            return res.status(500).send({ success: false, message: "Internal Server Error" });
                        }
                        // console.log("ApprovalTable", approvalResult)
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
                                        const vendorId = vendorResult.rows[0].VendorId;
                                        pool.query(
                                            'INSERT INTO "Contracts" ("StartDate","EndDate","VendorId","ContractTotal","Status") VALUES ($1,$2,$3,$4,$5) RETURNING id',
                                            [startDate, endDate, vendorId, finalTotalAmount, status],
                                            async (err, result) => {
                                                console.log("Contractid", result.rows[0].id);
                                                const id = result.rows[0].id;
                                                lineItems.forEach((x) => {
                                                    const {
                                                        quantity,
                                                        item,
                                                        totalAmount,
                                                        baseRate
                                                    } = x;
                                                    pool.query(
                                                        'INSERT INTO "ContractLines" ("ContractId","ItemId","Quantity","Amount","Rate") VALUES ($1,$2,$3,$4,$5)',
                                                        [id, item, quantity, totalAmount, baseRate]);
                                                });
                                                files.forEach((file) => {
                                                    const {
                                                        originalname,
                                                        path
                                                    } = file;
                                                    pool.query(
                                                        'INSERT INTO "ContractDocuments" ("ContractId","Name","Path") VALUES ($1,$2,$3)',
                                                        [id, originalname, path],
                                                        (fileErr) => {
                                                            if (fileErr) {
                                                                console.log(fileErr);
                                                                return res.status(500).send({ success: false, message: "Internal Server Error" });
                                                            }
                                                        }
                                                    );
                                                });
                                            }
                                        );
                                    }
                                })
                        }
                        else {
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
                                        const vendorId = vendorResult.rows[0].VendorId;
                                        pool.query(
                                            'INSERT INTO "Contracts" ("StartDate","EndDate","VendorId","ContractTotal","Status") VALUES ($1,$2,$3,$4,$5) RETURNING id',
                                            [startDate, endDate, vendorId, finalTotalAmount, status],
                                            async (err, result) => {
                                                console.log("returning id", result.rows[0].id);
                                                const id = result.rows[0].id;
                                                lineItems.forEach((x) => {
                                                    const {
                                                        quantity,
                                                        item,
                                                        totalAmount,
                                                        baseRate
                                                    } = x;
                                                    pool.query(
                                                        'INSERT INTO "ContractLines" ("ContractId","ItemId","Quantity","Amount","Rate") VALUES ($1,$2,$3,$4,$5)',
                                                        [id, item, quantity, totalAmount, baseRate]
                                                    );
                                                });
                                                files.forEach((file) => {
                                                    const {
                                                        originalname,
                                                        path
                                                    } = file;
                                                    pool.query(
                                                        'INSERT INTO "ContractDocuments" ("ContractId","Name","Path") VALUES ($1,$2,$3)',
                                                        [id, originalname, path],
                                                        (fileErr) => {
                                                            if (fileErr) {
                                                                console.log(fileErr);
                                                                return res.status(500).send({ success: false, message: "Internal Server Error" });
                                                            }
                                                        }
                                                    );
                                                });
                                            }
                                        );
                                    }
                                })
                        }
                    }
                );
            });
        return res.status(200).send({ message: "success" });
    } catch (error) {
        res.status(401).send({ message: "error" });
    }
});
module.exports = router;
