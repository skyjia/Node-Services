var express = require('express');
var router = express.Router();

var app = require('../app');
var settings = app.locals.cfg;
var constVars = require('../const');
var _ = require('lodash');
var errHandleHelper = require('../helper/error_handle_helper.js');

var validateFilter = require('../action_filter/request_validate_filter.js');
var sessionRepository = require('../repository/session_repository.js');

//### DESCRIPTION
//
//Delete a session
//
//### HTTP REQUEST
//
//`DELETE /session/:session_id`
//
//### HTTP REQUEST HEADERS
//
//- `client_id` : required, the id of client app
//
//### HTTP RESPONSE STATUS
//
//`200`
//
//### EXCEPTIONS
//
//- session not exists, return 500
//
router.delete("/:session_id", validateFilter, function(req, res, next){
    var clientID = req.get(constVars.HTTP_HEADER_CLIENT_ID);
    var sessionID = req.params.session_id;

    sessionRepository.isExists(clientID, sessionID, function(err, reply){

        if (err) { next(err); return; }

        if (!reply) {
            var errCust = errHandleHelper.createNetISError(
                500,
                constVars.NetISErrorCode.LOGIC_ERROR,
                "Session doesn't exist",
                "Session doesn't exist",
                { errAbbr : constVars.LogicErrorAbbr.SESSION_NOT_EXIST }
            );
            next(errCust);
            return;
        }

        sessionRepository.deleteSession(clientID, sessionID, function(err, reply) {

            if (err) { next(err); return; }

            res.status(200).end();
        });
    });
});


//### DESCRIPTION
//
//Set the value of session field,
//create a new session if session not exists,
//overwrite the field value if field already exists.
//
//### HTTP REQUEST
//
//`POST /session/:session_id/field`
//
//### HTTP REQUEST HEADERS
//
//- `client_id` : required, the id of client app
//- `expire_in` : optional, in seconds, session expiration duration,
// use defined maxium value if expire_in exceeds the limits.
// if specified, overwrite current expiration.
//
//### HTTP REQUEST BODY
//
//`{ "field_name1" : "field_value1", "field_name2" : "field_value2" }`
//
//- `field_name` : string, the field's name
//- `field_value` : string, the field's value
//
//### HTTP RESPONSE STATUS
//
//`201`
//
//### EXCEPTIONS
//
//
//
router.post("/:session_id/field", validateFilter, function(req, res, next){
    var clientID = req.get(constVars.HTTP_HEADER_CLIENT_ID);
    var expireIn = req.get(constVars.HTTP_HEADER_EXPIRE_IN);
    var sessionID = req.params.session_id;
    var fields = req.body;

    sessionRepository.setSessionFields(clientID, sessionID, fields, expireIn, function(err, reply) {
        if (err) { next(err); return; }

        res.status(201).end();
    });
});


//### DESCRIPTION
//
//Get the value of session fields
//
//### HTTP REQUEST
//
//`GET /session/:session_id/field/:field_name1,:field_name2`
//
//### HTTP REQUEST HEADERS
//
//- `client_id` : required, the id of client app
//- `expire_in` : optional, in seconds, session expiration duration,
// use defined maxium value if expire_in exceeds the limits.
// if specified, overwrite current expiration.
//
//### HTTP RESPONSE STATUS
//
//200
//
//### HTTP RESPONSE BODY
//
//`{"field_name1" : "field_value1", "field_name2" : "field_value2"}`
//
//If part of field_name exist, return the values of existing field_name
//
//`{"field_name1" : "field_value1"}`
//
//If no field_name exists, return empty json object
//
//`{}`
//
//### EXCEPTIONS
//
//- session not exists, return 404
//
router.get("/:session_id/field/:field_names", validateFilter, function(req, res, next){
    var clientID = req.get(constVars.HTTP_HEADER_CLIENT_ID);
    var expireIn = req.get(constVars.HTTP_HEADER_EXPIRE_IN);
    var sessionID = req.params.session_id;
    var fieldNames = req.params.field_names.split(constVars.SPLIT_COMMA);

    sessionRepository.isExists(clientID, sessionID, function(err, reply) {

        if (err) { next(err); return; }

        if (!reply) {
            res.status(404).json({"message": "Session doesn't exist"});
            return;
        }

        sessionRepository.getSessionFields(clientID, sessionID, fieldNames, expireIn, function(err, reply){

            if (err) { next(err); return; }

            var result = _.zipObject(fieldNames, reply);
            res.status(200).json(result);
        });
    });
});

//### DESCRIPTION
//
//Get the values of all session fields
//
//### HTTP REQUEST
//
//`GET /session/:session_id/field`
//
//### HTTP REQUEST HEADERS
//
//- `client_id` : required, the id of client app
//- `expire_in` : optional, in seconds, session expiration duration,
// use defined maxium value if expire_in exceeds the limits.
// if specified, overwrite current expiration.
//
//### HTTP RESPONSE STATUS
//
//`200`
//
//### HTTP RESPONSE BODY
//
//`{"field_name1" : "field_value1", ..., "field_nameN" : "field_valueN"}`
//
//If no field_name exists, return empty json object
//
//`{}`
//
//### EXCEPTIONS
//
//- session not exists, return 404
//
router.get("/:session_id/field", validateFilter, function(req, res, next){
    var clientID = req.get(constVars.HTTP_HEADER_CLIENT_ID);
    var expireIn = req.get(constVars.HTTP_HEADER_EXPIRE_IN);
    var sessionID = req.params.session_id;

    sessionRepository.getSessionAllFields(clientID, sessionID, expireIn, function(err, reply){

        if (err) { next(err); return; }

        if (!reply) {
            res.status(404).json({"message": "Session doesn't exist"});
            return;
        }

        res.status(200).json(reply);
    });
});

//### DESCRIPTION
//
//Delete session field
//
//### HTTP REQUEST
//
//`DELETE /session/:session_id/field/:field_name1,:field_name2`
//
//### HTTP REQUEST HEADERS
//
//- `client_id` : required, the id of client app
//- `expire_in` : optional, in seconds, session expiration duration,
// use defined maxium value if expire_in exceeds the limits.
// if specified, overwrite current expiration.
//
//### HTTP RESPONSE STATUS
//
//200
//
//### EXCEPTIONS
//
//- session not exists, return 500
//
router.delete("/:session_id/field/:field_names", validateFilter, function(req, res, next){
    var clientID = req.get(constVars.HTTP_HEADER_CLIENT_ID);
    var expireIn = req.get(constVars.HTTP_HEADER_EXPIRE_IN);
    var sessionID = req.params.session_id;
    var fieldNames = req.params.field_names.split(constVars.SPLIT_COMMA);

    sessionRepository.isExists(clientID, sessionID, function(err, reply){

        if (err) { next(err); return; }

        if (!reply) {
            var errCust = errHandleHelper.createNetISError(
                500,
                constVars.NetISErrorCode.LOGIC_ERROR,
                "Session doesn't exist",
                "Session doesn't exist",
                { errAbbr : constVars.LogicErrorAbbr.SESSION_NOT_EXIST }
            );
            next(err);
            return;
        }

        sessionRepository.deleteSessionFields(clientID, sessionID, fieldNames, expireIn, function(err, reply){

            if (err) { next(err); return; }

            res.status(200).end();
        });
    });
});

//### DESCRIPTION
//
//Renew the expiration of session
//
//### HTTP REQUEST
//
//`PUT /session/:session_id`
//
//### HTTP REQUEST HEADERS
//
//- `client_id` : required, the id of client app
//- `expire_in` : optional, in seconds, session expiration duration,
// use defined maxium value if expire_in exceeds the limits.
// if specified, overwrite current expiration.
//
//### HTTP RESPONSE STATUS
//
//`200`
//
//### EXCEPTIONS
//
//- session not exists, return 500
//
router.put("/:session_id", validateFilter, function(req, res, next){
    var sessionID = req.params.session_id;
    var clientID = req.get(constVars.HTTP_HEADER_CLIENT_ID);
    var expireIn = req.get(constVars.HTTP_HEADER_EXPIRE_IN);

    sessionRepository.isExists(clientID, sessionID, function(err, reply){

        if (err) { next(err); return; }

        if (!reply) {
            var errCust = errHandleHelper.createNetISError(
                500,
                constVars.NetISErrorCode.LOGIC_ERROR,
                "Session doesn't exist",
                "Session doesn't exist",
                { errAbbr : constVars.LogicErrorAbbr.SESSION_NOT_EXIST }
            );
            next(err);
            return;
        }

        sessionRepository.renewExpiration(clientID, sessionID, expireIn, function(err, reply) {

            if (err) { next(err); return; }

            res.status(200).end();
        });
    });
});

module.exports = router;
