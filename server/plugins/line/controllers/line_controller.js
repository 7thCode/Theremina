/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LineModule;
(function (LineModule) {
    var _ = require('lodash');
    var line = require('@line/bot-sdk');
    var mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    var core = require(process.cwd() + '/gs');
    var share = core.share;
    var Watson = require(share.Server("plugins/watson/modules/watson_module")).Watson;
    var ContextModel = require(share.Models("plugins/context/context"));
    var plugins_config = share.plugins_config;
    //   const watson = require('watson-developer-cloud');
    /*
        const conversation = watson.conversation({
            username: "e10b9084-d755-4b1b-bcd7-58f14aad1eb5",
            password: "PZJDFO5nq8pd",
            version: 'v1',
            version_date: '2017-05-26'
        });
    */
    var Line = /** @class */ (function () {
        function Line() {
        }
        /**
         * @param error
         * @param line_client
         * @param line_event
         * @returns none
         */
        Line.error_message = function (error, line_client, line_event) {
            line_client.replyMessage(line_event.replyToken, {
                type: "text",
                text: error.message
            }).then();
        };
        /**
         * @param message
         * @param context
         * @param callback
         * @returns none
         */
        /*       static tell_watson(message: string, context: any, callback: (error: any, watson_response: any) => void): void {
                   conversation.message({
                       workspace_id: "07cd3b4e-438f-443e-beea-97ec7bba71e4",
                       input: {'text': message},
                       context: context
                   }, callback);
               }
       */
        /**
         * @param request
         * @param response
         * @returns none
         */
        Line.prototype.bot_hook = function (request, response) {
            if (request.body.events) {
                var line_client_1 = new line.Client(plugins_config.line.token);
                var promises_1 = [];
                request.body.events.map(function (line_event) {
                    if (line_event.type == "message" || line_event.message.type == "text") {
                        var reply_1 = {
                            type: "text",
                            text: line_event.message.text + "?"
                        };
                        //   line_event.source.userId --- watson_response.context
                        ContextModel.findOne({ $and: [{ userid: line_event.source.userId }, { type: "line" }] })
                            .then(function (result) {
                            Watson.tell(line_event.message.text, result.context, function (error, watson_response) {
                                //    Line.tell_watson(line_event.message.text, result.context, (error: any, watson_response: any) => {
                                if (!error) {
                                    if (result) {
                                        result.context = watson_response.context;
                                    }
                                    else {
                                        result = new ContextModel();
                                        result.type = "line";
                                        result.userid = line_event.source.userId;
                                        result.context = watson_response.context;
                                    }
                                    result.save().then(function () {
                                        reply_1 = {
                                            type: "text",
                                            text: watson_response.output.text[0]
                                        };
                                        promises_1.push(line_client_1.replyMessage(line_event.replyToken, reply_1).then(function () {
                                        }).catch(function (error) {
                                            Line.error_message(error, line_client_1, line_event);
                                        }));
                                        Promise.all(promises_1).then(function (results) {
                                        }).catch(function (error) {
                                            Line.error_message(error, line_client_1, line_event);
                                        });
                                    }).catch(function (error) {
                                        Line.error_message(error, line_client_1, line_event);
                                    });
                                }
                                else {
                                    Line.error_message(error, line_client_1, line_event);
                                }
                            });
                        }).catch(function (error) {
                            Line.error_message(error, line_client_1, line_event);
                        });
                    }
                });
            }
            else {
                response.sendStatus(200);
            }
        };
        return Line;
    }());
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