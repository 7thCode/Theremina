/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace LineModule {

    const _ = require('lodash');

    const line = require('@line/bot-sdk');
    const mongoose: any = require('mongoose');
    mongoose.Promise = global.Promise;

    const core = require(process.cwd() + '/gs');
    const share: any = core.share;
    const Wrapper = share.Wrapper;

    const ContextModel: any = require(share.Models("plugins/context/context"));
    const plugins_config = share.plugins_config;

    const watson = require('watson-developer-cloud');

    const conversation = watson.conversation({
        username: "e10b9084-d755-4b1b-bcd7-58f14aad1eb5",
        password: "PZJDFO5nq8pd",
        version: 'v1',
        version_date: '2017-05-26'
    });

    export class Line {

        constructor() {

        }

        /**
         * @param error
         * @param line_client
         * @param line_event
         * @returns none
         */
        static error_message(error: any, line_client: any, line_event: any): void {
            line_client.replyMessage(line_event.replyToken, {
                type: "text",
                text: error.message
            }).then();
        }

        /**
         * @param message
         * @param context
         * @param callback
         * @returns none
         */
        static tell_watson(message: string, context: any, callback: (error: any, watson_response: any) => void): void {
            conversation.message({
                workspace_id: "45e5e0ef-b7d8-494b-b926-e03b3e1b3311",
                input: {'text': message},
                context: context
            }, callback);
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public bot_hook(request: any, response: any): void {

            if (request.body.events) {
                let line_client = new line.Client(plugins_config.line.token);

                let promises = [];
                request.body.events.map((line_event: any): void => {
                    if (line_event.type == "message" || line_event.message.type == "text") {
                        let reply: any = {
                            type: "text",
                            text: line_event.message.text + "?"
                        };
                        //   line_event.source.userId --- watson_response.context
                        ContextModel.findOne({$and: [{userid: line_event.source.userId}, {type: "line"}]})
                            .then((result: any): void => {

                                Line.tell_watson(line_event.message.text, result.context, (error: any, watson_response: any) => {
                                    if (!error) {

                                        if (result) {
                                            result.context = watson_response.context;
                                        } else {// firsttime
                                            result = new ContextModel();
                                            result.type = "line";
                                            result.userid = line_event.source.userId;
                                            result.context = watson_response.context;
                                        }

                                        result.save().then((): void => {
                                            reply = {
                                                type: "text",
                                                text: watson_response.output.text[0]
                                            };
                                            promises.push(line_client.replyMessage(line_event.replyToken, reply).then((): void => {
                                            }).catch((error: any): void => {
                                                Line.error_message(error, line_client, line_event);
                                            }));
                                            Promise.all(promises).then((results: any[]): void => {
                                            }).catch((error: any): void => {
                                                Line.error_message(error, line_client, line_event);
                                            });
                                        }).catch((error: any): void => {
                                            Line.error_message(error, line_client, line_event);
                                        });
                                    } else {
                                        Line.error_message(error, line_client, line_event);
                                    }
                                });

                            }).catch((error: any): void => {
                            Line.error_message(error, line_client, line_event);
                        });
                    }
                });
            } else {
                response.sendStatus(200);
            }
        }
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