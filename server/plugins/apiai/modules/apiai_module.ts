/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace ApiAiModule {

    const _: any = require('lodash');

    const apiai: any = require('apiai-promise');

    const core: any = require(process.cwd() + '/gs');
    const share: any = core.share;

    const plugins_config: any = share.plugins_config;
    const ai: any = apiai(plugins_config.apiai.token);

    export class ApiAi {

        constructor() {

        }

        public inquiry(sessionId: any, ask: string, callback: (eror, result) => void): void {
            return ai.textRequest(ask, {
                sessionId: sessionId
            }).then((result) => {
                callback(null, result);
            }).catch((error) => {
                callback(error, null);
            });
        }
    }
}

module.exports = ApiAiModule;