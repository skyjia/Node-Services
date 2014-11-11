/**
 * Created by Dev on 2014/8/14.
 */


var email = require('./routes/email.js');
var email_template = require('./routes/email_template.js');

var registerRoutes = function(app) {

    app.use('/', require('./routes/index.js'));
    app.use('/email', email);
    app.use('/email_template', email_template);
};

module.exports = registerRoutes;
