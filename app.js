var createError = require('http-errors');
const express = require('express');
const session = require('express-session');
// var path = require('path');
const path = __dirname + '/build/';
const cors = require('cors')
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const multer = require("multer");

var app = express();
var ssn;

app.use(session({
  secret: 'Secretkey',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

/** ROUTES */
var indexRouter = require('./routes/login');
var contractListRouter = require('./routes/contractList');
var itemListRouter = require('./routes/itemList');
var createContract = require('./routes/contract');
var termListing = require('./routes/terms')
var vendorListing = require('./routes/vendorListing')
var subsidiaryList = require('./routes/subsidiaryList')
var viewContract = require('./routes/viewContract')
var vendorDetails = require('./routes/vendorDetails')
var invoice = require('./routes/invoice')
var logout = require('./routes/logout')
var updateStatus = require('./routes/updateStatus')
var getInvoice = require('./routes/getInvoice');
var roleList = require('./routes/roleList');
var approvalList = require('./routes/approvalList');
var nextApproval = require('./routes/nextApproval');
var viewApproval = require('./routes/viewApproval');
var viewInvoice = require('./routes/viewInvoice');
var finance = require('./routes/finance');
var fileRouter = require('./routes/ReadFile');



app.use(logger('dev'));
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/** PATH DEFINE */

app.use("/login", indexRouter);
app.use("/contract-creation", createContract);
app.use("/contract", contractListRouter);
app.use("/items", itemListRouter);
app.use("/terms", termListing);
app.use("/vendors", vendorListing);
app.use("/subsidiary", subsidiaryList);
app.use("/view-contract", viewContract)
app.use("/vendor-details", vendorDetails)
app.use("/invoice-creation", invoice)
app.use("/logout", logout)
app.use("/contract", updateStatus)
app.use("/getInvoice", getInvoice)
app.use("/roles", roleList)
app.use("/approvalList", approvalList)
app.use("/nextApproval", nextApproval)
app.use("/viewApproval", viewApproval)
app.use("/view-invoice", viewInvoice)
app.use("/finance", finance)
app.use("/file", fileRouter);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log(err)
  res.render('error');
});

app.listen(3001)

module.exports = app;