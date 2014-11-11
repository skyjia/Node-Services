var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var app = require('../app');

var settings = app.locals.cfg;
var smtp_options = settings.smtp;
var transporter = nodemailer.createTransport(smtpTransport(smtp_options));

module.exports = transporter;
