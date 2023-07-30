var express = require('express');
var router = express.Router();
const { pool } = require("../dbConfig");
const e = require('express');
const request = require('request');
var session = require('express-session');
const pgp = require('pg-promise')();
require('dotenv')
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

router.get("/contract/:fileId", async function (req, res, next) {
    const fileId = req.params.fileId;
    console.log("id", fileId);
    try {
        const query = `SELECT * FROM "ContractDocuments" WHERE "ContractDocuments"."id" = $1`;
        const values = [fileId];
        const result = await pool.query(query, values);

        if (result.rows.length > 0) {
            const filePath = path.join(result.rows[0].Path);
            const fileName = path.join(result.rows[0].Name);

            fs.readFile(filePath, function (err, data) {
                if (!err) {
                    const mimeType = 'application/pdf';
                    res.setHeader('Content-Type', mimeType);
                    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
                    res.write(data);
                    res.end();
                } else {
                    console.log(err);
                    res.status(500).json({ error: "Error reading the file" });
                }
            });
        }
        else {
            res.status(404).json({ error: "File not found" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "internal Server Error" });
    }
})

// router.get("/invoice/:fileId", async function (req, res, next) {
//     const fileId = req.params.fileId;
//     console.log("approvalId", fileId);
//     try {
//         const query = `SELECT * FROM "ContractDocuments" WHERE "ContractDocuments"."id" = $1`;

//         const values = [fileId];
//         const result = await pool.query(query, values);

//         if (result.rows.length > 0) {
//             // console.log("../"+__dirname)
//             filePath = path.join(result.rows[0].Path);
//             fs.readFile(filePath, { encoding: 'base64' }, function (err, data) {
//                 if (!err) {
//                     console.log('received data: ' + data);
//                     res.writeHead(200, { 'Content-Type': 'images/jpeg' });
//                     res.write(data);
//                     res.end();
//                 } else {
//                     console.log(err);
//                 }
//             });

//             // var base64String = body.fileData;
//             // var fileName = body.name;
//             // // res.writeHead(200, {'filename': fileName,'Content-Type':});
//             // res.writeHead(200, {"Content-Disposition": "attachment;filename=" + fileName,'Content-Type':  body.fileType});
//             // var buf = Buffer.from(base64String, 'base64');
//             // res.end(buf);
//         } else {
//             res.json([]);
//         }
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ error: "internal Server Error" });
//     }

//     ;
// })




module.exports = router