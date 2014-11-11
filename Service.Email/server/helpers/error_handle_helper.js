/**
 * Created by Dev on 2014/10/13.
 */
var _ = require('lodash');
var constVars = require('../const.js');

var errorHandleHelper = (function () {

    return {

        createNetISError: function (statusCode, code, userFriendlyMessage, devMessage, errorData) {
            var result = new Error();
            result.status = statusCode;
            result.code = code;
            if (userFriendlyMessage) {
                result.userFriendlyMessage = userFriendlyMessage
            }

            if (devMessage) {
                result.devMessage = devMessage
            }

            if (errorData) {
                result.errorData = errorData
            }


            return result;
        },

        getErrorResponse: function (err) {
            var responseObj;

            if (err.code) {
                responseObj = {
                    status: err.status || 500,
                    code: err.code,
                    userFriendlyMessage: err.userFriendlyMessage || "",
                    devMessage: err.devMessage || "",
                    errorData: err.errorData || ""
                }
            } else {
                responseObj = {
                    status: err.status || 500,
                    code: constVars.NetISErrorCode.OPERATIONAL_ERROR,
                    userFriendlyMessage: "",
                    devMessage: err.message || "Unknown error",
                    errorData: err
                };
            }

            return responseObj;
        }
    };

})();

module.exports = errorHandleHelper;