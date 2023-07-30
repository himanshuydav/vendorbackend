var express = require('express');
var router = express.Router();
const { pool } = require("../dbConfig");
const e = require('express');
const request = require('request');
var session = require('express-session');
const pgp = require('pg-promise')();
require('dotenv')
const multer = require("multer");




router.get("/:recordId", async (req, res) => {
    const recordId = req.params.recordId;
    console.log("recordId", recordId);

    try {
        const query = `
        SELECT a."level0", r."RoleName"
        FROM "ApprovalTable" a 
        JOIN "Role" r ON a."level0" = r."id"    
        WHERE "recordId" = $1`;

        const values = [recordId];

        const result = await pool.query(query, values);

        if (result.rows.length > 0) {

            res.json(result.rows);
        } else {
            res.status(404).json({ error: "approval not found" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "internal Server Error" });
    }
});





module.exports = router