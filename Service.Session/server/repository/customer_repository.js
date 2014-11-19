/**
 * Created by Dev on 2014/11/19.
 */
var app = require('../app');
var settings = app.locals.cfg;
const justValueHolder = 'v1';

var redis = require('redis');
var client = redis.createClient(
    settings.redis_conn.port,
    settings.redis_conn.ip,
    settings.redis_conn.options);

client.on("error", function (err) {
    console.log("Error " + err);
});

var repository = (function(){

    function getCustomerSessionKey(clientID, customerID, sessionID) {
        return [clientID, '_exist_', customerID, '_', sessionID].join('');
    }

    function extractCustomerSessionKey(key) {
        if (!key) return null;
        var segments = key.split('_');
        return {
            clientID : segments[0],
            customerID : segments[2],
            sessionID : segments[3]
        };
    }

    return {
        "extractCustomerSessionKey" : function(key) {
            return extractCustomerSessionKey(key);
        },
        "addCustomerSession": function(clientID, customerID, sessionID, expireAt, callback) {
            var key = getCustomerSessionKey(clientID, customerID, sessionID);

            if (expireAt === null) {
                client.set(key, justValueHolder);
            } else {
                var multi = client.multi();
                multi.set(key, justValueHolder);
                multi.pexpireat(key, expireAt);
                multi.exec(function(errs, replies){
                    if (callback) {
                        callback.call(null,
                            errs ? errs[0] : null,
                            replies ? replies[0] : null);
                    }
                });
            }
        },
        "deleteCustomerSession": function(clientID, customerID, sessionID, callback) {
            var key = getCustomerSessionKey(clientID, customerID, sessionID);

            client.del(key, callback);
        },
        "renewExpiration": function(clientID, customerID, sessionID, expireAt, callback) {
            var key = getCustomerSessionKey(clientID, customerID, sessionID);

            if (expireAt != null) {
                client.pexpireat(key, expireAt, callback);
            }
        },
        "searchCustomerSession": function(clientID, customerID, callback) {
            var query = getCustomerSessionKey(clientID, customerID, '') + '*';
            client.keys(query, callback);
        }
    };
})();

module.exports = repository;
