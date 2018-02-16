/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ApiAiModule;
(function (ApiAiModule) {
    var _ = require('lodash');
    var apiai = require('apiai-promise');
    var core = require(process.cwd() + '/gs');
    var share = core.share;
    var plugins_config = share.plugins_config;
    var ai = apiai(plugins_config.apiai.token);
    var ApiAi = /** @class */ (function () {
        function ApiAi() {
        }
        ApiAi.prototype.inquiry = function (sessionId, ask, callback) {
            return ai.textRequest(ask, {
                sessionId: sessionId
            }).then(function (result) {
                callback(null, result);
            }).catch(function (error) {
                callback(error, null);
            });
        };
        return ApiAi;
    }());
    ApiAiModule.ApiAi = ApiAi;
})(ApiAiModule = exports.ApiAiModule || (exports.ApiAiModule = {}));
module.exports = ApiAiModule;
//# sourceMappingURL=apiai_module.js.map