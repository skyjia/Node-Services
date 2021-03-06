/**
 * Created by Dev on 2014/8/14.
 */

var app = require('./app');
var cfg = app.locals.cfg;
var constVars = require('./const.js');
var _ = require('lodash');
var errHandleHelper = require('./helper/error_handle_helper.js');

var registerErrorhandler = function(app) {

    /// catch 404 and forward to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    /// error handlers
    app.use(function(err, req, res, next) {
        var responseObj = errHandleHelper.getErrorResponse(err);

        res.status(responseObj.status).json(responseObj);
    });

};

module.exports = registerErrorhandler;
