/**
 * Created by Dev on 2014/9/25.
 */

var app = require('../app');
var settings = app.locals.cfg;

var uuid = require('uuid');
var S = require('string');

var redis = require('redis');
var client = redis.createClient(
    settings.redis_conn.port,
    settings.redis_conn.ip,
    settings.redis_conn.options);

client.on("error", function (err) {
    console.log("Error " + err);
});

var repository = (function(){

    function createSessionID() {
        var result = uuid.v1();
        result = S(result).strip('-').s;
        return result;
    }

    function getSessionKey(client_id, session_id) {
        if (session_id) {
            return [client_id, "_ses_", session_id].join("");
        } else {
            return [client_id, "_ses_", createSessionID()].join("");
        }
    }

    function getExpireIn(expire_in) {
        if (expire_in === null) {return null;}
        return (expire_in <= settings.max_session_expiration) ? expire_in : settings.max_session_expiration;
    }

    return {
        "deleteSession": function(client_id, session_id, callback) {
            var sessionKey = getSessionKey(client_id, session_id);

            client.del(sessionKey, callback);
        },
        "setSessionFields": function(client_id, session_id, fields, expire_in, callback) {
            var sessionKey = getSessionKey(client_id, session_id);
            var expireIn = getExpireIn(expire_in);

            if (expireIn === null) {
                client.hmset([sessionKey].concat(fields), callback);
            } else {
                var multi = client.multi();
                multi.hmset([sessionKey].concat(fields));
                multi.expire(sessionKey, expireIn);
                multi.exec(function(errs, replies){
                    if (callback) {
                        callback.call(null,
                            errs ? errs[0] : null,
                            replies ? replies[0] : null);
                    }
                });
            }
        },
        "getSessionFields": function(client_id, session_id, field_names, expire_in, callback) {
            var sessionKey = getSessionKey(client_id, session_id);
            var expireIn = getExpireIn(expire_in);

            if (expireIn === null) {
                client.hmget([sessionKey].concat(field_names), callback);
            } else {
                var multi = client.multi();
                multi.hmget([sessionKey].concat(field_names));
                multi.expire(sessionKey, expireIn);
                multi.exec(function(errs, replies) {
                    if (callback) {
                        callback.call(this,
                            errs ? errs[0] : null,
                            replies ? replies[0] : null);
                    }
                });
            }
        },
        "getSessionAllFields": function(client_id, session_id, expire_in, callback) {
            var sessionKey = getSessionKey(client_id, session_id);
            var expireIn = getExpireIn(expire_in);

            if (expireIn === null) {
                client.hgetall(sessionKey, callback);
            } else {
                client.multi()
                    .hgetall(sessionKey)
                    .expire(sessionKey, expireIn)
                    .exec(function(errs, replies) {
                        if (callback) {
                            callback.call(this,
                                errs ? errs[0] : null,
                                replies ? replies[0] : null);
                        }
                    });
            }
        },
        "deleteSessionFields": function(client_id, session_id, field_names, expire_in, callback) {
            var sessionKey = getSessionKey(client_id, session_id);
            var expireIn = getExpireIn(expire_in);

            if (expireIn === null) {
                client.hdel([sessionKey].concat(field_names), callback);
            } else {
                var multi = client.multi();
                 multi.hdel([sessionKey].concat(field_names));
                 multi.expire(sessionKey, expireIn);
                 multi.exec(function(errs, replies){
                     if(callback) {
                         callback.call(this,
                             errs ? errs[0] : null,
                             replies ? replies[0] : null);
                     }
                 });
            }
        },
        "renewExpiration": function(client_id, session_id, expire_in, callback) {
            var sessionKey = getSessionKey(client_id, session_id);
            var expireIn = getExpireIn(expire_in);

            if (expireIn !== null) {
                client.expire(sessionKey, expireIn, callback);
            }
        },
        "isExists": function(client_id, session_id, callback) {
            var sessionKey = getSessionKey(client_id, session_id);

            client.exists(sessionKey, callback);
        }
    };
})();

module.exports = repository;
