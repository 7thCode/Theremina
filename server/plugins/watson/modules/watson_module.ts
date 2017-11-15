/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace WatsonModule {

    const _ = require('lodash');

    const core = require(process.cwd() + '/gs');
    const share: any = core.share;

    const plugins_config = share.plugins_config;

    const watson = require('watson-developer-cloud');

    const conversation = watson.conversation({
        username: "e10b9084-d755-4b1b-bcd7-58f14aad1eb5",
        password: "PZJDFO5nq8pd",
        version: 'v1',
        version_date: '2017-05-26'
    });

    export class Watson {

        constructor() {

        }

        /**
         * @param message
         * @param context
         * @param callback
         * @returns none
         */
        static tell(message: string, context: any, callback: (error: any, watson_response: any) => void): void {
            conversation.message({
                workspace_id: "07cd3b4e-438f-443e-beea-97ec7bba71e4",
                input: {'text': message},
                context: context
            }, callback);
        }

    }
}

module.exports = WatsonModule;