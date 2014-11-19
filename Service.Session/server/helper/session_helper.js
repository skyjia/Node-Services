/**
 * Created by Dev on 2014/10/13.
 */
var app = require('../app');
var settings = app.locals.cfg;
var _ = require('lodash');
var constVars = require('../const.js');

var sessionHelper = (function () {

    return {
        getCustomerID: function (fields) {
            if (!fields) return null;
            if (fields['CustomerID']) return fields['CustomerID'];
            if (fields['customer_id']) return fields['customer_id'];
            if (fields['customerID']) return fields['customerID'];
            return null;
        },
        /**
         * Convert expireIn to expireAt
         *
         * @param expireIn in second
         */
        convertToExpireAt : function(expireIn) {
            if (!expireIn) { return null; }
            expireIn = parseInt(expireIn, 10);
            expireIn = (expireIn <= settings.max_session_expiration) ?
                expireIn : settings.max_session_expiration;
            var result = Date.now() + expireIn*1000;
            return result
        }
    };

})();

module.exports = sessionHelper;
