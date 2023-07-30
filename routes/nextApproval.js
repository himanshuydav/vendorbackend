var express = require('express');
var router = express.Router();
const { pool } = require("../dbConfig");
const e = require('express');
const request = require('request');
var session = require('express-session');
const pgp = require('pg-promise')();
require('dotenv')





router.post('/', (req, res) => {

    const reqData = req.body
    console.log(reqData);

    try {

        const { recordId, level, RoleId } = reqData
        pool.query(`Select "" from ApprovalTable where recordId =$1`, [recordId], (err, approvalList) => {
            if (approvalList) {
                for (let i = 0; i < level.length; i++) {
                    const level = level[i];
                    const RoleId = RoleId[i];

                    pool.query(`Select "" from Roles where id =$1`, [RoleId], (err, resultset) => {
                        if (resultset) {
                            pool.query(`Select "StatusId" from Status where RoleId =$1`, [RoleId], (err, StatusId) => {

                                pool.query(`Select "Id" from Roles where id =$1`, [RoleId], (err, resultset) => {
                                    pool.query(`UPDATE  "ApprovalTable" SET "RoleId" ,"Status" WHERE "level" = $3 AND "recordId"= $4) VALUES ($1,$2,$3,$4)`, [RoleId, StatusId.row[0].StatusId, level, recordId], (err, result) => {

                                        if (err) {
                                            console.error(err);
                                        } else {
                                            console.log(`Updated values`);
                                        }
                                    });
                                })
                            });

                        }
                    });
                }
            }
            else {
                for (let i = 0; i < level.length; i++) {
                    const level = level[i];
                    const RoleId = RoleId[i];

                    pool.query(`Select "" from Roles where id =$1`, [RoleId], (err, resultset) => {
                        if (resultset) {
                            pool.query(`Select "StatusId" from Status where RoleId =$1`, [RoleId], (err, StatusId) => {
                                pool.query(`Select "Id" from Roles where id =$1`, [RoleId], (err, resultset) => {


                                    pool.query(`INSERT INTO "ApprovalTable" ("recordId","level0","level1") VALUES ($1,$2,$3)`, [recordId, level, RoleId], (err, result) => {

                                        if (err) {
                                            console.error(err);
                                        } else {
                                            console.log(`Inserted values (${recordId},${level0Value},${RoleId})`);
                                        }
                                    });
                                })
                            });

                        }
                    });
                }

                return res.status(200).send({ message: "success" });
            }
        })
    }

    catch (error) {

        res.status(401).send({ message: "error" });

    }

})


module.exports = router