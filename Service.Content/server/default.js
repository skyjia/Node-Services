#!/usr/bin/env node

(function () {
    var app = require('./app.js');
    var cfg = app.locals.cfg;
    var debug = require('debug')(cfg.name);

    var DEFAULT_HTTP_PORT = 3000;

    var http = require('http');
    var http_server = http.createServer(app);
    http_server.listen(cfg.http.port || process.env.PORT || DEFAULT_HTTP_PORT, function () {
        console.log('HTTP server listening on port ' + http_server.address().port);
        console.log('Node:', cfg.name);
    });
})();
