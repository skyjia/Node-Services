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

var cache_name_midfix = "_c_";

var repository = (function () {

    function getCacheKey(client_id, key) {
        return [client_id, cache_name_midfix, key].join("");
    }

    function getExpireIn(expire_in) {
        if (expire_in === null) {
            return null;
        }
        else {
            return (expire_in <= settings.max_cache_expiration)
                ? expire_in : settings.max_cache_expiration;
        }
    }

    return {
        "deleteCache": function (client_id, key, callback) {
            var cacheKey = getCacheKey(client_id, key);

            client.del(cacheKey, callback);
        },
        "setCacheFields": function (client_id, key, fieldValuePairs, expire_in, callback) {
            var cacheKey = getCacheKey(client_id, key);
            var expireIn = getExpireIn(expire_in);

            if (expireIn === null) {
                client.hmset([cacheKey].concat(fieldValuePairs), callback);
            } else {
                client.multi()
                    .hmset(cacheKey, fieldValuePairs)
                    .expire(cacheKey, expireIn)
                    .exec(function (errs, replies) {
                        if (callback) {
                            callback.call(null,
                                errs ? errs[0] : null,
                                replies ? replies[0] : null);
                        }
                    });
            }
        },
        "getSessionAllFields": function (client_id, key, expire_in, callback) {
            var cacheKey = getCacheKey(client_id, key);
            var expireIn = getExpireIn(expire_in);

            if (expireIn === null) {
                client.hgetall(cacheKey, callback);
            } else {
                client.multi()
                    .hgetall(cacheKey)
                    .expire(cacheKey, expireIn)
                    .exec(function (errs, replies) {
                        if (callback) {
                            callback.call(null,
                                errs ? errs[0] : null,
                                replies ? replies[0] : null);
                        }
                    });
            }
        },
        "renewExpiration": function (client_id, key, expire_in, callback) {
            var cacheKey = getCacheKey(client_id, key);
            var expireIn = getExpireIn(expire_in);

            if (expireIn !== null) {
                client.expire(cacheKey, expireIn, callback);
            }
        }
    };
})();

module.exports = repository;
