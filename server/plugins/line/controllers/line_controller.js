/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LineModule;
(function (LineModule) {
    const _ = require('lodash');
    const line = require('@line/bot-sdk');
    const core = require(process.cwd() + '/gs');
    const share = core.share;
    const Wrapper = share.Wrapper;
    const plugins_config = share.plugins_config;
    //  const ApiAiModule = require(share.Server("plugins/apiai/modules/apiai_module"));
    //  const ai = new ApiAiModule.ApiAi();
    class Line {
        constructor() {
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        bot_hook(request, response) {
            if (request.body.events) {
                let client = new line.Client(plugins_config.line.token);
                let promises = [];
                request.body.events.map((event) => {
                    if (event.type == "message" || event.message.type == "text") {
                        if (event.message.text == "こんにちは") {
                            promises.push(client.replyMessage(event.replyToken, {
                                type: "text",
                                text: "これはこれは"
                            }));
                        }
                    }
                });
                Promise.all(promises).then((results) => {
                    console.log(`${response.length} events processed.`);
                }).catch((error) => {
                });
            }
            else {
                response.sendStatus(200);
            }
        }
    }
    LineModule.Line = Line;
    /**
     * @param request
     * @param response
     * @returns none
     */
    /*
    public bot_push(request: any, response: any): void {
        let message = request.params.message;
        line.client.pushMessage({
            to: plugins_config.line.uid,
            messages: [
                {
                    "type": "text",
                    "text": message
                }
            ]
        });
        Wrapper.SendSuccess(response, {});
    }

} */
})(LineModule = exports.LineModule || (exports.LineModule = {}));
module.exports = LineModule;
//# sourceMappingURL=line_controller.js.map