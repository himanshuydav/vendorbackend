var express = require('express');
var router = express.Router();
const { pool } = require("../dbConfig");
const e = require('express');
const request = require('request');
var session = require('express-session');
const pgp = require('pg-promise')();
require('dotenv')


router.post('/approve', async (req, res) => {
    const reqData = req.body;
    console.log(reqData)

    try {

        const {
            transactionId,
            roleId,
            DocumentId
        } = reqData;

        pool.query(
            'SELECT "status", "level" FROM "ApprovalTable" WHERE "recordId" = $1 AND "roleId" = $2',
            [transactionId, roleId],

            async (approvalErr, approvalResult) => {
                if (approvalErr) {
                    console.log(approvalErr);

                    return res.status(500).send({
                        success: false,
                        message: "Internal Server Error"
                    });

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

                                return res.status(500).send({
                                    success: false,
                                    message: "Internal Server Error"
                                });

                            }

                            if (approvalResult1.rowCount > 0) {
                                const status = approvalResult1.rows[0].status;

                                if (reqData.transactionId == 3) {

                                    pool.query(

                                        'UPDATE "Contracts" SET "Status" = $1 WHERE "id" = $2',

                                        [status, DocumentId],

                                        async (updateErr, updateResult) => {

                                            if (updateErr) {

                                                console.log(updateErr);

                                                return res.status(500).send({
                                                    success: false,
                                                    message: "Internal Server Error"
                                                });

                                            }

                                            console.log(updateResult);

                                            res.status(200).send({
                                                success: true,
                                                message: "status updated successfully"
                                            });

                                        }

                                    );

                                } else if (reqData.transactionId == 2) {

                                    pool.query(

                                        'UPDATE "Invoices" SET "Status" = $1 WHERE "id" = $2',

                                        [status, DocumentId],

                                        async (updateErr, updateResult) => {

                                            if (updateErr) {

                                                console.log(updateErr);

                                                return res.status(500).send({
                                                    success: false,
                                                    message: "Internal Server Error"
                                                });

                                            }

                                            console.log(updateResult);

                                            res.status(200).send({
                                                success: true,
                                                message: "status updated successfully"
                                            });

                                        }

                                    );

                                }

                            } else {

                                if (reqData.transactionId == 3) {

                                    pool.query(

                                        'UPDATE "Contracts" SET "Status" = $1 WHERE "id" = $2',

                                        [2, DocumentId],

                                        async (updateErr, updateResult) => {

                                            if (updateErr) {

                                                console.log(updateErr);

                                                return res.status(500).send({
                                                    success: false,
                                                    message: "Internal Server Error"
                                                });

                                            }

                                            console.log(updateResult);

                                            res.status(200).send({
                                                success: true,
                                                message: "status updated successfully"
                                            });

                                        }

                                    );

                                } else if (reqData.transactionId == 2) {

                                    pool.query(

                                        'UPDATE "Invoices" SET "Status" = $1 WHERE "id" = $2',

                                        [2, DocumentId],

                                        async (updateErr, updateResult) => {

                                            if (updateErr) {

                                                console.log(updateErr);

                                                return res.status(500).send({
                                                    success: false,
                                                    message: "Internal Server Error"
                                                });

                                            }

                                            console.log(updateResult);

                                            res.status(200).send({
                                                success: true,
                                                message: "status updated successfully"
                                            });

                                        }

                                    );

                                }

                            }

                        })
                } else {

                    // console.log("ewvdus")

                    pool.query(

                        'SELECT "status", "level" FROM "ApprovalTable" WHERE "recordId" = $1 AND "level" = $2',

                        [transactionId, 0],

                        async (approvalErr, approvalResult1) => {
                            if (approvalErr) {

                                console.log(approvalErr);

                                return res.status(500).send({
                                    success: false,
                                    message: "Internal Server Error"
                                });

                            }

                            const status = approvalResult1.rows[0].status;
                            const level = approvalResult1.rows[0].level;

                            if (reqData.transactionId == 3) {

                                pool.query(

                                    'UPDATE "Contracts" SET "Status" = $1 WHERE "id" = $2',

                                    [status, DocumentId],

                                    async (updateErr, updateResult) => {

                                        if (updateErr) {

                                            console.log(updateErr);

                                            return res.status(500).send({
                                                success: false,
                                                message: "Internal Server Error"
                                            });

                                        }

                                        console.log(updateResult);

                                        res.status(200).send({
                                            success: true,
                                            message: "status updated successfully"
                                        });

                                    }

                                );

                            } else if (reqData.transactionId == 2) {

                                pool.query(

                                    'UPDATE "Invoices" SET "Status" = $1 WHERE "id" = $2',

                                    [status, DocumentId],

                                    async (updateErr, updateResult) => {

                                        if (updateErr) {

                                            console.log(updateErr);

                                            return res.status(500).send({
                                                success: false,
                                                message: "Internal Server Error"
                                            });

                                        }

                                        console.log(updateResult);

                                        res.status(200).send({
                                            success: true,
                                            message: "status updated successfully"
                                        });

                                    }

                                );

                            }

                        })
                }

            })
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'failed to update status' });

    }




});

router.post('/reject', async (req, res) => {

    const reqData = req.body
    try {

        const { DocumentId, transactionId, Rejection_Reason, Rejected_RoleId, level } = reqData;
        if (level == "") {
            if (reqData.transactionId == 3) {
                pool.query(

                    'UPDATE "Contracts" SET "Status" = 3, "RejectionReason" = $2 WHERE "id" = $1',
                    [DocumentId, Rejection_Reason],
                    async (updateErr, updateResult) => {

                        if (updateErr) {
                            console.log(updateErr);
                            return res.status(500).send({ message: "internal Server Error" });
                        }
                        console.log(updateResult);
                        res.status(200).send({ message: "status updated successfully" });
                    }
                )
            }
            else if (reqData.transactionId == 2) {
                pool.query(

                    'UPDATE "Invoices" SET "Status" = 3, "RejectionReason" = $2 WHERE "id" = $1',
                    [DocumentId, Rejection_Reason],
                    async (updateErr, updateResult) => {

                        if (updateErr) {
                            console.log(updateErr);
                            return res.status(500).send({ message: "internal Server Error" });
                        }
                        console.log(updateResult);
                        res.status(200).send({ message: "status updated successfully" });
                    }
                )
            }
        }
        else {
            pool.query(
                'SELECT "status", "level" FROM "ApprovalTable" WHERE "recordId" = $1 AND "roleId" = $2',
                [transactionId, Rejected_RoleId],

                async (approvalErr, approvalResult) => {
                    if (approvalErr) {
                        console.log(approvalErr);

                        return res.status(500).send({
                            success: false,
                            message: "Internal Server Error"
                        });

                    }
                    if (approvalResult.rowCount > 0) {
                        //    level =  approvalResult.rows[0].level;
                        //    level =  level - 1;
                        pool.query(
                            'SELECT "status", "level" FROM "ApprovalTable" WHERE "recordId" = $1 AND "level" = $2',
                            [transactionId, level],

                            async (approvalErr, approvalResult1) => {
                                if (approvalErr) {

                                    console.log(approvalErr);

                                    return res.status(500).send({
                                        success: false,
                                        message: "Internal Server Error"
                                    });

                                }

                                if (approvalResult1.rowCount > 0) {
                                    if (reqData.transactionId == 3) {
                                        pool.query(

                                            'UPDATE "Contracts" SET "RejectedByRole" = $4, "Status" = $3, "RejectionReason" = $2 WHERE "id" = $1',
                                            [DocumentId, Rejection_Reason, approvalResult1.rows[0].status, Rejected_RoleId],
                                            async (updateErr, updateResult) => {

                                                if (updateErr) {
                                                    console.log(updateErr);
                                                    return res.status(500).send({ message: "internal Server Error" });
                                                }
                                                console.log(updateResult);
                                                res.status(200).send({ message: "status updated successfully" });
                                            }
                                        )
                                    }
                                    else if (reqData.transactionId == 2) {
                                        pool.query(

                                            'UPDATE "Invoices" SET "Status" = $3, "RejectionReason" = $2 WHERE "id" = $1',
                                            [DocumentId, Rejection_Reason, approvalResult1.rows[0].status],
                                            async (updateErr, updateResult) => {

                                                if (updateErr) {
                                                    console.log(updateErr);
                                                    return res.status(500).send({ message: "internal Server Error" });
                                                }
                                                console.log(updateResult);
                                                res.status(200).send({ message: "status updated successfully" });
                                            }
                                        )
                                    }
                                }

                            })

                    }
                    else {
                        if (reqData.transactionId == 3) {
                            pool.query(

                                'UPDATE "Contracts" SET "Status" = 3, "RejectionReason" = $2 WHERE "id" = $1',
                                [DocumentId, Rejection_Reason],
                                async (updateErr, updateResult) => {

                                    if (updateErr) {
                                        console.log(updateErr);
                                        return res.status(500).send({ message: "internal Server Error" });
                                    }
                                    console.log(updateResult);
                                    res.status(200).send({ message: "status updated successfully" });
                                }
                            )
                        }
                        else if (reqData.transactionId == 2) {
                            pool.query(

                                'UPDATE "Invoices" SET "Status" = 3, "RejectionReason" = $2 WHERE "id" = $1',
                                [DocumentId, Rejection_Reason],
                                async (updateErr, updateResult) => {

                                    if (updateErr) {
                                        console.log(updateErr);
                                        return res.status(500).send({ message: "internal Server Error" });
                                    }
                                    console.log(updateResult);
                                    res.status(200).send({ message: "status updated successfully" });
                                }
                            )
                        }
                    }
                })
        }
    }

    catch (error) {

        console.log(error);
        res.status(500).json({ error: 'failed to update status' });
    }

})

module.exports = router


