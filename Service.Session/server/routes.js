/**
 * Created by Dev on 2014/8/14.
 */


var session = require('./routes/session.js');

var registerRoutes = function(app) {

    app.use('/', require('./routes/index.js'));
    app.use('/session/', require('./routes/session.js'));
    app.use('/cache/', require('./routes/cache.js'));
};

module.exports = registerRoutes;
