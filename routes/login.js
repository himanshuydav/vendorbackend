var express = require('express');
var router = express.Router();
const { pool } = require("../dbConfig");
const e = require('express');
const request = require('request');
var session = require('express-session');
const pgp = require('pg-promise')();
require('dotenv')



/** Login API */

router.post('/', function (req, res, next) {
  ssn = req.session;
  let { email, password, userType } = req.body;

  ssn.auth = userType
  console.log(ssn.auth)
  /* Finance Login */
  if (userType == 'Finance') {

    try {
      pool.query(
        `Select *  from "Finance" where "Finance"."Email" = $1`, [email], (err, results) => {
          console.log(results);
          var body = results.rows;
          if (results.rowCount > 0) {
            pool.query(`Select * from "FinanceCreds" where "FinanceCreds"."FinId" = $1 and "FinanceCreds"."Password" = $2`, [results.rows[0].FinId, password], (err, result) => {
              if (result.rowCount > 0) {
                console.log("Finance login")

                pool.query(`Select "id", "RoleName" from "Role" where "Role"."id" = $1`, [result.rows[0].RoleId], (err, resultrole) => {

                  if (resultrole.rowCount > 0) {
                    var roles = resultrole.rows;

                    pool.query(`Select * from "Transactions"`, (err, transactionsResult) => {
                      console.log(transactionsResult)

                      if (transactionsResult.rowCount > 0) {
                        var transactions = transactionsResult.rows;

                        return res.status(200).send({ message: "success", body: body, role: "Finance", roles: roles, transactions: transactions });
                      }
                      else {

                        console.log("No records found");
                        return res.status(401).send({ message: "error", error: "No records found" });

                      }
                    });
                  }

                  else {
                    return res.status(401).send({ message: "Role is not defined" })
                  }

                })
              }
              else {
                console.log("Invalid login")
                return res.status(401).send({ message: "error", error: "Invalid Creds" })
              }
            })
          }
          else {
            console.log("Invalid login")
            return res.status(401).send({ message: "error" })
          }
        });
    }

    catch (error) {

      console.log(error)

      res.status(401).send({ message: "Invalid Creds" })

    }
  }
  /** Staff Login */
  else if (userType == 'Staff') {

    try {
      pool.query(
        `Select "Name","StaffId","EmailId"  from "Staff" where "Staff"."EmailId" = $1`, [email], (err, results) => {
          console.log(results);
          var body = results.rows;
          if (results.rowCount > 0) {
            pool.query(`Select * from "StaffCreds" where "StaffCreds"."StaffId" = $1 and "StaffCreds"."Password" = $2`, [results.rows[0].StaffId, password], (err, result) => {
              if (result.rowCount > 0) {
                console.log("Staff login")

                pool.query(`Select "id", "RoleName" from "Role" where "Role"."id" = $1`, [result.rows[0].RoleId], (err, resultrole) => {
                  if (resultrole.rowCount > 0) {
                    var roles = resultrole.rows;

                    pool.query(`Select * from "Transactions"`, (err, transactionsResult) => {
                      console.log(transactionsResult)
                      if (transactionsResult.rowCount > 0) {
                        var transactions = transactionsResult.rows;

                        return res.status(200).send({ message: "success", body: body, role: "Staff", roles: roles, transactions: transactions });

                      } else {
                        console.log("No records found");
                        return res.status(401).send({ message: "error", error: "No records found" });
                      }
                    });

                  }
                  else {
                    return res.status(401).send({ message: "Role is not defined" })
                  }
                })
              }
              else {
                console.log("Invalid login")
                return res.status(401).send({ message: "error", error: "Invalid Creds" })
              }
            })
          }
          else {
            console.log("Invalid login")
            return res.status(401).send({ message: "error" })
          }
        });
    }
    catch (error) {
      console.log(error)
      res.status(401).send({ message: "Invalid Creds" })
    }
  }
  /** Vendor Login */
  else if (userType == "Vendor") {
    try {
      pool.query(
        `Select * from "Vendors" where "Vendors"."EmailId" = $1`, [email], (err, results) => {
          console.log(results);
          var body = results.rows;
          if (results.rowCount > 0) {
            pool.query(`Select * from "VendorCreds" where "VendorCreds"."VendorId" = $1 and "VendorCreds"."Password" = $2`, [results.rows[0].VendorId, password], (err, result) => {
              if (result.rowCount > 0) {
                console.log("Vendor Login");
                ssn.VendorId = results.rows[0].VendorId;

                pool.query(`Select "id", "RoleName" from "Role" where "Role"."id" = $1`, [result.rows[0].RoleId], (err, resultrole) => {
                  if (resultrole.rowCount > 0) {
                    var roles = resultrole.rows;

                    pool.query(`Select * from "Transactions"`, (err, transactionsResult) => {
                      console.log(transactionsResult)
                      if (transactionsResult.rowCount > 0) {
                        var transactions = transactionsResult.rows;

                        return res.status(200).send({ message: "success", body: body, role: "Vendor", roles: roles, transactions: transactions });

                      } else {
                        console.log("No records found");
                        return res.status(401).send({ message: "error", error: "No records found" });
                      }
                    });

                  }
                  else {
                    return res.status(401).send({ message: "Role is not defined" })
                  }
                })
              }
              else {
                console.log("Invalid login")
                return res.status(401).send({ message: "error" })
              }
            })
          }
          else {
            console.log("Invalid login")
            return res.status(401).send({ message: "error" })
          }
        }
      )
    } catch (error) {
      console.log(error)
      res.status(401).send({ message: "error" })
    }
  }
})

module.exports = router;