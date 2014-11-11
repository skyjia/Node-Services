/**
 * Module dependencies.
 */
var path = require('path');
var fs = require('fs');
var currentEnv = process.env.NODE_ENV || 'development';
// Parsing and checking the arguments from command
var argv = require('optimist')
    .usage('Usage: $0 -c path/to/your_config_file')
    .alias('c', 'config')
    .describe('c', 'Set the config file.')
    .argv;


// Loading configuration
//  1. Loading `./conf/default.yml` (relative to app.js file), the default config file.
//  2.a. Loading `./conf/$NODE_ENV$.yml` (relative to launching path) if `-c` argument is not specified. (NODE_ENV defaults to `development`)
//  2.b. Loading `-c` specified file if using `-c` argument.
var configFiles = [path.resolve(__dirname, "./conf/default.yml")];
var env_config_filepath = path.resolve("./conf/"+currentEnv+".yml");
if(fs.existsSync(env_config_filepath)){
    configFiles.push(env_config_filepath);
}

if(argv.config){
    var user_config_filepath = path.resolve(argv.config);
    if(fs.existsSync(user_config_filepath)){
        configFiles.push(user_config_filepath)
    }
}

var config_loader = require('configuration-loader').createLoader(configFiles);
var cfg = config_loader.reload();

// Load express
var express = require('express');
var app = express();
app.locals.cfg = cfg;
module.exports = app;

if(cfg.trust_proxy){
    // Refer to:
    // http://expressjs.com/guide.html#proxies
    app.enable('trust proxy');
}

// Import application required packages
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

app.use(logger(cfg.logger.format));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());


/* register customized middleware */
var registerCustomerMiddleware = require('./customized_middleware.js');
registerCustomerMiddleware(app);


/* register routes */
var registerRoutes = require('./routes.js');
registerRoutes(app);


/* register error handler */
var registerErrorHandler = require('./error_handler.js');
registerErrorHandler(app);


