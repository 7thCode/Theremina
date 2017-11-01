/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace LineModule {

    const _ = require('lodash');

    const line = require('@line/bot-sdk');

    const core = require(process.cwd() + '/gs');
    const share: any = core.share;
    const Wrapper = share.Wrapper;

    const plugins_config = share.plugins_config;

    //  const ApiAiModule = require(share.Server("plugins/apiai/modules/apiai_module"));
    //  const ai = new ApiAiModule.ApiAi();

    export class Line {

        constructor() {

        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public bot_hook(request: any, response: any): void {

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

                Promise.all(promises).then((results: any[]): void => {
                    console.log(`${response.length} events processed.`);
                }).catch((error: any): void => {

                });

            } else {
                response.sendStatus(200);
            }

        }


        /*
                  const promises = request.body.events.map((event: any): any => {
                      let text = "";


                      let sessionId = "10000";
                      switch (event.source.type) {
                          case "user" :
                              sessionId = event.source.userId;
                              break;
                          case "group" :
                              sessionId = event.source.groupId;
                              break;
                          default:
                      }

                      let promise = ai.inquiry(sessionId, event.message.text, (response) => {
                          text = response;
                      });

                      promise.then((response) => {
                          line.client.replyMessage({
                              replyToken: event.replyToken,
                              messages: [{
                                  type: 'text',
                                  text: text
                              }]
                          });
                      }).catch((error) => {
                      });

                      return promise;

                  });
                  Promise.all(promises).then(() => response.json({success: true}));
      */

    }

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
}

module.exports = LineModule;