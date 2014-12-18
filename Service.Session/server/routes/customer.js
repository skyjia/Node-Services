/**
 * Created by Dev on 2014/11/19.
 */
var express = require('express');
var router = express.Router();

var app = require('../app');
var settings = app.locals.cfg;
var constVars = require('../const');
var _ = require('lodash');
var when = require('when');

var errHandleHelper = require('../helper/error_handle_helper.js');
var sessionHelper = require('../helper/session_helper.js');

var validateFilter = require('../action_filter/request_validate_filter.js');
var customerRepository = require('../repository/customer_repository.js');
var sessionRepository = require('../repository/session_repository.js');

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

//### DESCRIPTION
//
//  Get customer's sessions
//
//### HTTP REQUEST
//
//  GET /customer/:customer_id/session
//
//### HTTP REQUEST URL PARAMETERS
//
//  - clientid : the client id where customer session belongs to
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
//  return following JSON when exist session
//
//    {
//        "customerID": "111",
//        "session": [
//            {
//                "sessionID": "df80e8d047a911e4ba91c53bb34bc63b",
//                "value": {
//                    "k1": "v12323",
//                    "k2": "v22323",
//                    "CustomerID": "111"
//                }
//            },
//            {
//                "sessionID": "df80e8d047a911e4ba91c53bb34ea63e",
//                "value": {
//                    "k1": "v1",
//                    "k2": "v2",
//                    "CustomerID": "111"
//                }
//            }
//        ]
//    }
//
//  return following JSON when not exist session
//
//  {
//      "customerID" : 12121,
//      "session" : []
//  }
//
//### EXCEPTIONS
//
//  N/A
//
router.get("/:customerID/session", validateFilter, function(req, res, next) {
    var clientID = req.query.clientid;
    var customerID = req.params.customerID;

    customerRepository.searchCustomerSession(clientID, customerID, function(err, reply) {
        if (err) { next(err); return; }

        var result = {
            "customerID" : customerID,
            "session" : []
        };

        if (!reply || reply.length === 0) {
            res.status(200).json(result);
            return;
        }

        var sessionIDs = _.map(reply, function(key) {
            var segments = customerRepository.extractCustomerSessionKey(key);
            return segments.sessionID;
        });

        var promise = when.map(sessionIDs, function(value, index) {
            var sessionID = value;
            var deferred = when.defer();
            sessionRepository.getSessionAllFields(clientID, sessionID, null, function(err, reply) {
                if (err) { next(err); return; }

                result.session.push({
                    sessionID : sessionID,
                    value : reply
                });

                deferred.resolve(reply);
            });
            return deferred.promise;
        });

        promise.done(function (replies) {
            res.status(200).json(result);
        });
    });
});

module.exports = router;
