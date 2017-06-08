/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace ApiAiModule {

    const _ = require('lodash');

    const apiai = require('apiai-promise');

    const core = require(process.cwd() + '/core');
    const share: any = core.share;
    const config = share.config;
    const Wrapper = share.Wrapper;
    const logger = share.logger;

    const plugins_config = share.plugins_config;
    const ai = apiai(plugins_config.apiai.token);

    export class ApiAi {

        constructor() {

        }

        public inquiry(sessionId: any, ask: string, callback: (eror, result) => void): void {
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
}

module.exports = ApiAiModule;