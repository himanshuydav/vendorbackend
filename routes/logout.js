var express = require('express');
var router = express.Router();
const { pool } = require("../dbConfig");
const e = require('express');
const request = require('request');
var session = require('express-session');
const pgp = require('pg-promise')();
require('dotenv')


router.get('/', function (req, res, next) {
    ssn = req.session
    ssn.auth = null


})









module.exports = router