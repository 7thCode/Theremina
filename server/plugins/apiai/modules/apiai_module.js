/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ApiAiModule;
(function (ApiAiModule) {
    const _ = require('lodash');
    const apiai = require('apiai-promise');
    const core = require(process.cwd() + '/gs');
    const share = core.share;
    const plugins_config = share.plugins_config;
    const ai = apiai(plugins_config.apiai.token);
    class ApiAi {
        constructor() {
        }
        inquiry(sessionId, ask, callback) {
            return ai.textRequest(ask, {
                sessionId: sessionId
            }).then((result) => {
                callback(null, result);
                /*     switch (response.result.source) {
                 case "agent":
                 callback(response.result.fulfillment.speech);
                 break;
                 case "domains":
                 callback(response.result.source.action);
                 break;
                 default:
                 }
                 */
            }).catch((error) => {
                callback(error, null);
            });
        }
    }
    ApiAiModule.ApiAi = ApiAi;
})(ApiAiModule = exports.ApiAiModule || (exports.ApiAiModule = {}));
module.exports = ApiAiModule;
//# sourceMappingURL=apiai_module.js.map