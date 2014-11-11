var express = require('express');
var router = express.Router();
var transporter = require('../helpers/email_sender.js');

// HTTP REQUEST
//      POST {base_url}/email/
//
// DESCRIPTION
//      The POST operation sends email with json.
//
// HTTP REQUEST BODY (application/json)
//    from - The e-mail address of the sender. All e-mail addresses can be plain 'sender@server.com' or formatted 'Sender Name <sender@server.com>'
//    to - Comma separated list or an array of recipients e-mail addresses that will appear on the To: field
//    cc - Comma separated list or an array of recipients e-mail addresses that will appear on the Cc: field
//    bcc - Comma separated list or an array of recipients e-mail addresses that will appear on the Bcc: field
//    replyTo - An e-mail address that will appear on the Reply-To: field
//    subject - The subject of the e-mail
//    text - The plaintext version of the message as an Unicode string
//    html - The HTML version of the message as an Unicode string
//
// SYNTAX
//    POST /email/_form HTTP/1.1
//    Host: localhost:3000
//    Content-Type: application/json
//    Cache-Control: no-cache
//
//    {
//        "from":"from@foo.com",
//        "to":"to@bar.com",
//        "cc":"cc@bar.com",
//        "bcc":"bcc@bar.com",
//        "replyTo":"replyTo@foo.com",
//        "subject":"Hello",
//        "html": "Hello <strong>world</strong>!"
//    }
router.post('/', function(req, res, next) {
    var data = {};
    data.from = req.body.from;
    data.to = req.body.to;
    data.cc = req.body.cc;
    data.bcc = req.body.bcc;
    data.replyTo = req.body.replyTo;
    data.subject = req.body.subject;
    data.text = req.body.text;
    data.html = req.body.html;

    transporter.sendMail(data, function(err, info){
        if(err){
            console.log(err);
        } else {
            console.log('Message sent: ' + info.response);
        }
    });

    res.send('request received.');
});


// HTTP REQUEST
//      POST {base_url}/email/_form
//
// DESCRIPTION
//      The POST operation sends email using HTML forms.
//      Parameters that are passed as form fields to POST in the x-www-form-urlencoded encoded message body.
//
// FORM FIELDS
//    from - The e-mail address of the sender. All e-mail addresses can be plain 'sender@server.com' or formatted 'Sender Name <sender@server.com>'
//    to - Comma separated list or an array of recipients e-mail addresses that will appear on the To: field
//    cc - Comma separated list or an array of recipients e-mail addresses that will appear on the Cc: field
//    bcc - Comma separated list or an array of recipients e-mail addresses that will appear on the Bcc: field
//    replyTo - An e-mail address that will appear on the Reply-To: field
//    subject - The subject of the e-mail
//    text - The plaintext version of the message as an Unicode string
//    html - The HTML version of the message as an Unicode string
//
// SYNTAX
//    POST /email/_form HTTP/1.1
//    Host: localhost:3000
//    Cache-Control: no-cache
//    Content-Type: application/x-www-form-urlencoded
//
//    from=from%40foo.com&to=to%40bar.com&cc=cc%40bar.com&bcc=bcc%40bar.com&replyTo=replyTo%40foo.com&subject=hello&html=%3Cspan%3Ehello%3Cstrong%3Eworld%3C%2Fstrong%3E!%3C%2Fspan%3E&text=hello%2C+world!
//
router.post('/_form', function(req, res, next) {
    var data = {};
    data.from = req.body.from;
    data.to = req.body.to;
    data.cc = req.body.cc;
    data.bcc = req.body.bcc;
    data.replyTo = req.body.replyTo;
    data.subject = req.body.subject;
    data.text = req.body.text;
    data.html = req.body.html;

    transporter.sendMail(data, function(err, info){
        if(err){
            console.log(err);
        } else {
            console.log('Message sent: ' + info.response);
        }
    });

    res.send('request received.');
});

module.exports = router;
