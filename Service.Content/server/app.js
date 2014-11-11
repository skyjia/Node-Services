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
var multer  = require('multer');


app.use(logger(cfg.logger.format));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());

app.use(multer({
    // The destination directory for the uploaded files.
    dest: cfg.upload_path,

    limit: {
        // in bytes (Default: Infinity)
        fileSize: 10*1024*1024 // 10MB
    },

    // rename the uploaded files
//    rename: function (fieldname, filename) {
//        return filename.replace(/\s+/g, '-').toLowerCase() +'_' +Date.now()
//    },

    // triggered when a file starts to be uploaded
    onFileUploadStart: function (file) {
        console.log(file.fieldname + ' is starting ...');
        return true;
        // return false to stop file uploading.
    },

    // trigger when a file is completely uploaded
    onFileUploadComplete: function (file) {
        console.log(file.fieldname + ' uploaded to  ' + file.path);
    },

    // trigger when an error fires
    onError: function (error, next) {
        console.log(error);
        next(error);
    },

    // triggered when a file size exceeds the specification in the "limit" object
    onFileSizeLimit: function (file) {
        console.log('Failed: ', file.originalname);
        fs.unlink('./' + file.path); // delete the partially written file
    }
}));

var index = require('./routes/index.js');
app.use('/', index);

var content = require('./routes/content');
app.use('/objects', content);


/* register error handler */
var registerErrorHandler = require('./error_handler.js');
registerErrorHandler(app);
