/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FacebookModule;
(function (FacebookModule) {
    var core = require(process.cwd() + '/gs');
    var share = core.share;
    var plugins_config = share.plugins_config;
    var request = require('request');
    var Facebook = /** @class */ (function () {
        function Facebook() {
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        Facebook.prototype.bot_hook = function (request, response) {
            var verify_token = plugins_config.facebook.token;
            var token = request.query["hub.verify_token"];
            if (token == verify_token) {
                response.send(request.query["hub.challenge"]);
            }
            else {
                response.send("");
            }
        };
        /**
         * @param req
         * @param response
         * @returns none
         */
        Facebook.prototype.bot_push = function (req, response) {
            var token = plugins_config.facebook.token;
            var receivedMessage = function (event) {
                var sendGenericMessage = function (recipientId, messageText) {
                    // To be expanded in later sections
                };
                var sendTextMessage = function (recipientId, messageText) {
                    var callSendAPI = function (messageData) {
                        request({
                            uri: 'https://graph.facebook.com/v2.7/me/messages',
                            qs: { access_token: token },
                            method: 'POST',
                            json: {
                                recipient: { id: recipientId },
                                message: messageData,
                            }
                        }, function (error, response, body) {
                            if (!error && response.statusCode == 200) {
                                var recipientId_1 = body.recipient_id;
                                var messageId = body.message_id;
                                //              console.log("Successfully sent generic message with id %s to recipient %s", messageId, recipientId);
                            }
                            else {
                                //             console.error("Unable to send message.");
                                //            console.error(response);
                                //            console.error(error);
                            }
                        });
                    };
                    var messageData = {
                        recipient: {
                            id: recipientId
                        },
                        message: {
                            text: messageText
                        }
                    };
                    callSendAPI(messageData);
                };
                var senderID = event.sender.id;
                var recipientID = event.recipient.id;
                var timeOfMessage = event.timestamp;
                var message = event.message;
                //       console.log("Received message for user %d and page %d at %d with message:", senderID, recipientID, timeOfMessage);
                //         console.log(JSON.stringify(message));
                //        let messageId:any = message.mid;
                var messageText = message.text;
                var messageAttachments = message.attachments;
                if (messageText) {
                    switch (messageText) {
                        case 'generic':
                            sendGenericMessage(senderID, messageText);
                            break;
                        default:
                            sendTextMessage(senderID, messageText);
                    }
                }
                else if (messageAttachments) {
                    sendTextMessage(senderID, "Message with attachment received");
                }
            };
            var data = req.body;
            if (data.object === 'page') {
                data.entry.forEach(function (entry) {
                    //     let pageID:any = entry.id;
                    //     let timeOfEvent:any = entry.time;
                    entry.messaging.forEach(function (event) {
                        if (event.message) {
                            receivedMessage(event);
                        }
                        else {
                            //              console.log("Webhook received unknown event: ", event);
                        }
                    });
                });
                response.sendStatus(200);
            }
        };
        return Facebook;
    }());
    FacebookModule.Facebook = Facebook;
})(FacebookModule = exports.FacebookModule || (exports.FacebookModule = {}));
module.exports = FacebookModule;
//# sourceMappingURL=facebook_controller.js.map