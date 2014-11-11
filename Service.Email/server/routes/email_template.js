/**
 * Created by skyjia on 9/26/14.
 */
var _ = require('lodash');

// Using swig template
//  http://paularmstrong.github.io/swig/
var swig = require('swig');
var path=require('path');
var fs = require('fs');
var express = require('express');
var router = express.Router();

var app = require('../app.js');
var settings = app.locals.cfg;

var transporter = require('../helpers/email_sender.js');
var constVars = require('../const.js');
var errHandleHelper = require('../helpers/error_handle_helper.js');

var TEMPLATES_FOLDER = path.resolve(settings.templates_folder_path);

// HTTP REQUEST
//      POST {base_url}/email_template/:template_name/send
//
// DESCRIPTION
//      The POST operation sends email using HTML forms.
//      Parameters that are passed as json to POST in HTTP request body.
//
// HTTP REQUEST BODY (application/json)
//    recipients - recipients information.
//      from - The e-mail address of the sender. All e-mail addresses can be plain 'sender@server.com' or formatted 'Sender Name <sender@server.com>'
//      to - Comma separated list or an array of recipients e-mail addresses that will appear on the To: field
//      cc - Comma separated list or an array of recipients e-mail addresses that will appear on the Cc: field
//      bcc - Comma separated list or an array of recipients e-mail addresses that will appear on the Bcc: field
//      replyTo - An e-mail address that will appear on the Reply-To: field
//    subject_data - key-value pairs for parsing subject
//    body_data - key-value pairs for parsing subject
//    type - send email message as `text` or `html`.
//
// SYNTAX
//    POST /email_template/hello/send HTTP/1.1
//    Host: localhost:3000
//    Content-Type: application/json
//    Cache-Control: no-cache
//
//    {
//        "recipients": {
//            "from": "from@foo.com",
//            "to": "to@bar.com",
//            "cc": "cc@bar.com",
//            "bcc": "bcc@bar.com",
//            "replyTo": "replyTo@foo.com"
//        },
//        "subject_data": {
//            "user_display_name": "Steve Jobs"
//        },
//        "body_data": {
//            "user_display_name": "Steve Jobs",
//            "verification_code": "abcdef1234567890"
//        },
//        "type": "html"
//    }
//
router.post('/:template_name/send', function(req, res, next){
    var template_name = req.params.template_name;

    // Check templates existing.
    var subject_template_path = path.join(TEMPLATES_FOLDER,template_name+'_subject');
    var body_template_path = path.join(TEMPLATES_FOLDER,template_name+'_body');

    if(!fs.existsSync(subject_template_path) || !fs.existsSync(body_template_path)){
        var err = errHandleHelper.createNetISError(
            500,
            constVars.NetISErrorCode.LOGIC_ERROR,
            "template is not found.",
            "template is not found.",
            { errAbbr : constVars.LogicErrorAbbr.TEMPLATE_NOT_FOUND }
        );
        next(err);
        return;
    }

    var data = req.body;
    var type = data.type || 'html';

    // Building message
    var msg = _.cloneDeep(data.recipients);

    msg.subject = swig.renderFile(subject_template_path, data.subject_data);
    msg[type] = swig.renderFile(body_template_path, data.body_data);

    // Sending message
    transporter.sendMail(msg, function(err, info){
        if(err){
            console.log(err);
        } else {
            console.log('Message sent: ' + info.response);
        }
    });

    res.send('request received.');
});


module.exports = router;
