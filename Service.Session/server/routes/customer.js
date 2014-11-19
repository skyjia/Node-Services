/**
 * Created by Dev on 2014/11/19.
 */
var express = require('express');
var router = express.Router();

var app = require('../app');
var settings = app.locals.cfg;
var constVars = require('../const');
var _ = require('lodash');

var errHandleHelper = require('../helper/error_handle_helper.js');
var sessionHelper = require('../helper/session_helper.js');

var validateFilter = require('../action_filter/request_validate_filter.js');
var customerRepository = require('../repository/customer_repository.js');

//### DESCRIPTION
//
//  Get the count of customer's session
//
//### HTTP REQUEST
//
//  GET /customer/:customer_id/session_count
//
//### HTTP REQUEST HEADERS
//
//  - client_id : required, the id of client app
//
//### HTTP RESPONSE STATUS
//
//  200
//
//### HTTP RESPONSE BODY
//
//  {
//      "customerID" : 12121,
//      "sessionCount" : 3
//  }
//
//### EXCEPTIONS
//
//  N/A
//
router.get("/:customerID/session_count", validateFilter, function(req, res, next){
    var clientID = req.get(constVars.HTTP_HEADER_CLIENT_ID);
    var customerID = req.params.customerID;

    customerRepository.searchCustomerSession(clientID, customerID, function(err, reply) {
        if (err) { next(err); return; }

        var result = { customerID : customerID, sessionCount : reply.length };
        res.status(200).json(result);
    });
});

module.exports = router;
