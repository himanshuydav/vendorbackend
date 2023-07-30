var express = require('express');
var router = express.Router();
const { pool } = require("../dbConfig");
const e = require('express');
const request = require('request');
var session = require('express-session');
const pgp = require('pg-promise')();
require('dotenv')


/** Contract Listing */

router.get("/list", async function (req, res, next) {

  console.log("USERTYPE", ssn.auth)

  if (ssn.auth === "Vendor") {

    Id = ssn.VendorId
    console.log("id is", Id)

    idv = Id.split("VEN")
    console.log("idv is", idv[1])


    const queries = [{
      query: 'SELECT c."id", c."StartDate", c."EndDate", c."DocumentNo", c."Status", v."LegalName", s."Name" FROM "Contracts" c JOIN "Vendors" v ON c."VendorId" = v."VendorId" JOIN "Status" s ON c."Status" = s."StatusId" WHERE c."IsActive" = true AND c."VendorId" = $1',
      values: [Id]
    },
    {
      query: 'SELECT inv."id", v."LegalName", inv."ContractId", inv."DocumentNo", inv."InvoiceTotal", inv."Status", s."Name", cn."DocumentNo" AS "ContractDocId" FROM "Invoices" inv JOIN "Vendors" v ON inv."VendorId" = v."id" JOIN "Contracts" cn ON inv."ContractId" = cn."id" JOIN "Status" s ON inv."Status" = s."StatusId" WHERE inv."VendorId" = $1',
      values: [idv[1]]
    }
    ]

    const sql = pgp.helpers.concat(queries);
    const db = pgp(`postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`);
    const resp = await db.multi(sql);
    console.log("hiiiii", resp);
    res.status(200).send({
      message: "success",
      list: resp[0],
      InvoiceList: resp[1]
    });

  }

  else if (ssn.auth === "Staff") {

    const queries = [{
      query: `SELECT
      c."id",
      c."StartDate",
      c."EndDate",
      c."DocumentNo",
      c."Status",
      c."CreatedBy",
      c."RejectionReason",
      c."RejectedByRole",
      c."Department",
      v."LegalName",
      s."Name",
      c."CreatedAt",
      c."ContractTotal",
      SUM(i."InvoiceTotal") AS "InvoiceTotal",
      c."ContractTotal" - SUM(i."InvoiceTotal") AS "Difference"
  FROM "Contracts" c
  JOIN "Vendors" v ON c."VendorId" = v."VendorId"
  JOIN "Status" s ON c."Status" = s."StatusId"
  LEFT JOIN "Invoices" i ON c."id" = i."ContractId"
  WHERE c."IsActive" = true
  GROUP BY
      c."id",
      c."StartDate",
      c."EndDate",
      c."DocumentNo",
      c."Status",
      c."CreatedBy",
      c."RejectionReason",
      c."RejectedByRole",
      c."Department",
      v."LegalName",
      s."Name",
      c."CreatedAt",
      c."ContractTotal";
  `

    },
    {
      query: `SELECT (
        SELECT json_object_agg("Name", "StatusCount") AS "StatusCounts"
        FROM (
            SELECT s."Name", COUNT(*) AS "StatusCount"
            FROM "Invoices" inv 
            JOIN "Status" s ON inv."Status" = s."StatusId"
            GROUP BY s."Name"
        ) AS status_counts_subquery
    ) AS body,
    json_agg(json_build_object(
        'id', inv."id",
        'LegalName', v."LegalName",
        'ContractId', inv."ContractId",
        'DocumentNo', inv."DocumentNo",
        'InvoiceTotal', inv."InvoiceTotal",
        'Status', inv."Status",
        'Name', s."Name",
        'ContractDocId', cn."DocumentNo"
            )) AS lines
        FROM "Invoices" inv 
        JOIN "Vendors" v ON inv."VendorId" = v."id" 
        JOIN "Status" s ON inv."Status" = s."StatusId"
        JOIN "Contracts" cn ON inv."ContractId" = cn."id";
`

    }
]

    const sql = pgp.helpers.concat(queries);
    const db = pgp(`postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`);
    const resp = await db.multi(sql);
    console.log("hiiiii", resp);
    res.status(200).send({
      message: "success",
      list: resp[0],
      InvoiceList: resp[1],
    });

  }

  else if (ssn.auth === "Finance") {

    const queries = [{
      query: 'SELECT c."id", c."StartDate", c."EndDate", c."DocumentNo", c."Status", v."LegalName", s."Name" FROM "Contracts" c JOIN "Vendors" v ON c."VendorId" = v."VendorId" JOIN "Status" s ON c."Status" = s."StatusId" WHERE c."IsActive" = true'

    },
    {
      query: `SELECT inv."id", v."LegalName", inv."ContractId", inv."DocumentNo", 
      inv."InvoiceTotal", inv."Status", s."Name", cn."DocumentNo" AS "ContractDocId" FROM "Invoices" inv 
      JOIN "Vendors" v ON inv."VendorId" = v."id" 
      JOIN "Status" s ON inv."Status" = s."StatusId"
      JOIN "Contracts" cn ON  inv."ContractId" = cn."id"`

    }]

    const sql = pgp.helpers.concat(queries);
    const db = pgp(`postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`);
    const resp = await db.multi(sql);
    console.log("hiiiii", resp);
    res.status(200).send({
      message: "success",
      list: resp[0],
      InvoiceList: resp[1]
    });

  }

});


module.exports = router;