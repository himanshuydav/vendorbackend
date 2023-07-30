var express = require('express');
var router = express.Router();
const { pool } = require("../dbConfig");
const e = require('express');
const request = require('request');
var session = require('express-session');
const pgp = require('pg-promise')();
require('dotenv')



router.get("/:approvalId", async (req, res) => {
    const approvalId = req.params.approvalId;
    console.log("approvalId", approvalId);

    try {
        const query = `SELECT "id", "RoleName", "Levels" FROM "Role" WHERE "Role"."Levels" > $1`;

        const values = [approvalId];
        const result = await pool.query(query, values);

        if (result.rows.length > 0) {

            res.json(result.rows);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "internal Server Error" });
    }
});

/** Rejected Lower Level */
router.post("/rejectedlist", async(req, res) =>{
    const reqData = req.body;
    try{
        const {transactionId, RoleId} = reqData;
        pool.query('SELECT "status", "level" FROM "ApprovalTable" WHERE "recordId" = $1 AND "roleId" = $2',
            [transactionId, RoleId],
            async (approvalErr, approvalResult) => {
                if (approvalErr) {
                    console.log(approvalErr);

                    return res.status(500).send({
                        success: false,
                        message: "Internal Server Error"
                    });

                }
                if (approvalResult.rowCount > 0) {
                    pool.query(`SELECT "roleId", "level", r."RoleName" 
                    FROM "ApprovalTable" a 
                    INNER JOIN "Role" r ON a."roleId" = r."id" WHERE "recordId" = $1 AND "level" < $2`,
                    [transactionId ,approvalResult.rows[0].level],

                    async (approvalErr1, approvalResult1) => {
                        if (approvalErr1) {
                            console.log(approvalErr);

                            return res.status(500).send({
                                success: false,
                                message: "Internal Server Error"
                            });

                        }
                        if(approvalResult1.rowCount > 0){
                            var Approver = approvalResult1.rows;
                            return res.status(200).send({success:true, Approverlist: Approver });
                        }
                        else{
                            var Approver = approvalResult1.rows;
                            return res.status(200).send({success:true, Approverlist: Approver });
                        }
                        })
                }
                else{
                    res.status(200).send({success:false, message:"No Approval Matrix" });
                }
            })
    }
       catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed' });
    }
})

module.exports = router