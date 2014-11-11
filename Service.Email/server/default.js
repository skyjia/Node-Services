#!/usr/bin/env node

(function(){
    var path = require('path');
    var app = require('./app.js');
    var cfg = app.locals.cfg;
    var debug = require('debug')(cfg.name);

    var DEFAULT_HTTP_PORT = 3000;
    var DEFAULT_HTTPS_PORT = 3443;

    var http = require('http');
    if(cfg.protocol==="http"){

        var http_server = http.createServer(app);
        http_server.listen(cfg.http.port || process.env.PORT || DEFAULT_HTTP_PORT, function (){
            console.log('HTTP server listening on port ' + http_server.address().port);
            console.log('Node:', cfg.name);
        });
    }

    var https = require('https');
    var fs = require('fs');

    if(cfg.protocol==="https"){

        var options = {
            key: fs.readFileSync(path.resolve(cfg.https.key)),
            cert: fs.readFileSync(path.resolve(cfg.https.cert))
        };

        var https_server = https.createServer(options, app);
        https_server.listen(cfg.https.port || process.env.PORT || DEFAULT_HTTPS_PORT,function (){
            console.log('HTTPS server listening on port ' + https_server.address().port);
            console.log('Node:', cfg.name);
        });
    }
})();

