/**
 * Created by Dev on 2014/9/25.
 */

var _ = require('lodash');
var S = require('string');

var app = require('../app');
var settings = app.locals.cfg;
var const_vars = require('../const');

function isContainedInWhiteList(client_id) {
    var prefix = settings.allowed_clients[client_id];
    return prefix ? true : false;
}

var validate_filter = function(req, res, next) {

    var clientID = req.get(const_vars.HTTP_HEADER_CLIENT_ID);
    var expireIn = req.get(const_vars.HTTP_HEADER_EXPIRE_IN);

    if (!isContainedInWhiteList(clientID)) {
        res.status(500);
        res.json({"message": const_vars.HTTP_HEADER_CLIENT_ID + " isn't allowed in white list"});
        return;
    }

    if (expireIn && !S(expireIn).isNumeric()) {
        res.status(500);
        res.json({"message": const_vars.HTTP_HEADER_EXPIRE_IN + " isn't numeric"});
        return;
    }

    next();
};

module.exports = validate_filter;
