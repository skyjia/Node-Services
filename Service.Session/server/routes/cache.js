var express = require('express');
var router = express.Router();

var app = require('../app');
var settings = app.locals.cfg;
var const_vars = require('../const');
var _ = require('lodash');

var validateFilter = require('../action_filter/request_validate_filter.js');
var cacheRepository = require('../repository/cache_repository.js');

//### DESCRIPTION
//
//  Delete a cache
//
//### HTTP REQUEST
//
//  DELETE /cache/:key
//
//### HTTP REQUEST HEADERS
//
//  - client_id : required, the id of client app
//
//### HTTP RESPONSE STATUS
//
//  200
//
//### EXCEPTIONS
//
//  N/A
//
router.delete("/:key", validateFilter, function(req, res, next){
    var clientID = req.get(const_vars.HTTP_HEADER_CLIENT_ID);
    var key = req.params.key;

    cacheRepository.deleteCache(clientID, key, function(err, reply) {
        if (err) { next(err); return; }

        res.status(200).end();
    });
});

//### DESCRIPTION
//
//  Set the value of cache, overwrite the value if cache already exists.
//
//### HTTP REQUEST
//
//  POST /cache/:key
//
//### HTTP REQUEST HEADERS
//
//  - client_id :   required, the id of client app
//  - expire_in :   optional, in seconds, expiration duration,
//                  use defined maxium value if expire_in exceeds the limits.
//                  if specified, overwrite current expiration.
//
//### HTTP REQUEST BODY
//
//  { "field_name1" : "field_value1", "field_name2" : "field_value2" }
//
//  - field_name : string, the field's name
//  - field_value : string, the field's value
//
//### HTTP RESPONSE STATUS
//
//  200
//
//### EXCEPTIONS
//
//  N/A
//
router.post("/:key", validateFilter, function(req, res, next){
    var clientID = req.get(const_vars.HTTP_HEADER_CLIENT_ID);
    var expireIn = req.get(const_vars.HTTP_HEADER_EXPIRE_IN);
    var key = req.params.key;
    var fields = req.body;

    cacheRepository.setCacheFields(clientID, key, fields, expireIn, function(err, reply){
        if (err) { next(err); return; }

        res.status(200).end();
    });
});

//### DESCRIPTION
//
//  Get the value of cache
//
//### HTTP REQUEST
//
//  GET /cache/:key
//
//### HTTP REQUEST HEADERS
//
//  client_id:  required, the id of client app
//  expire_in:  optional, in seconds,  expiration duration,
//              use defined maxium value if expire_in exceeds the limits.
//              if specified, overwrite current expiration.
//
//### HTTP RESPONSE BODY
//
//  { "field_name1" : "field_value1", "field_name2" : "field_value2" }
//
//  - field_name : string, the field's name
//  - field_value : string, the field's value
//
//### HTTP RESPONSE STATUS
//
//  200
//
//### EXCEPTIONS
//
//  - return 404 if cache not exists
//
router.get("/:key", validateFilter, function(req, res, next) {
    var clientID = req.get(const_vars.HTTP_HEADER_CLIENT_ID);
    var expireIn = req.get(const_vars.HTTP_HEADER_EXPIRE_IN);
    var key = req.params.key;

    cacheRepository.getSessionAllFields(clientID, key, expireIn, function(err, reply){
        if (err) { next(err); return; }

        if (!reply) {
            res.status(404).json({"message": "Cache doesn't exist"});
            return;
        }

        res.status(200).json(reply);
    });
});

//### DESCRIPTION
//
//  Renew the expiration of cache
//
//### HTTP REQUEST
//
//  PUT /cache/:key
//
//### HTTP REQUEST HEADERS
//
//  - client_id :   required, the id of client app
//  - expire_in :   optional, in seconds, expiration duration,
//                  use defined maxium value if expire_in exceeds the limits.
//                  if specified, overwrite current expiration.
//
//### HTTP RESPONSE STATUS
//
//  200
//
//### EXCEPTIONS
//
//  N/A
//
router.put("/:key", validateFilter, function(req, res, next) {
    var clientID = req.get(const_vars.HTTP_HEADER_CLIENT_ID);
    var expireIn = req.get(const_vars.HTTP_HEADER_EXPIRE_IN);
    var key = req.params.key;

    cacheRepository.renewExpiration(clientID, key, expireIn, function(err, reply){
        if (err) { next(err); return; }

        res.status(200).end();
    });
});

module.exports = router;
