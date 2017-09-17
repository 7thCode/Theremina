/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FacebookModule;
(function (FacebookModule) {
    const core = require(process.cwd() + '/gs');
    const share = core.share;
    const config = share.config;
    const Wrapper = share.Wrapper;
    const logger = share.logger;
    const plugins_config = share.plugins_config;
    const request = require('request');
    class Facebook {
        constructor() {
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        bot_hook(req, response) {
            let verify_token = plugins_config.facebook.token;
            let token = req.query["hub.verify_token"];
            if (token == verify_token) {
                response.send(req.query["hub.challenge"]);
            }
            else {
                response.send("");
            }
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        bot_push(req, response) {
            let token = plugins_config.facebook.token;
            let receivedMessage = (event) => {
                let sendGenericMessage = (recipientId, messageText) => {
                    // To be expanded in later sections
                };
                let sendTextMessage = (recipientId, messageText) => {
                    let callSendAPI = (messageData) => {
                        request({
                            uri: 'https://graph.facebook.com/v2.7/me/messages',
                            qs: { access_token: token },
                            method: 'POST',
                            json: {
                                recipient: { id: recipientId },
                                message: messageData,
                            }
                        }, (error, response, body) => {
                            if (!error && response.statusCode == 200) {
                                var recipientId = body.recipient_id;
                                var messageId = body.message_id;
                                console.log("Successfully sent generic message with id %s to recipient %s", messageId, recipientId);
                            }
                            else {
                                console.error("Unable to send message.");
                                console.error(response);
                                console.error(error);
                            }
                        });
                    };
                    let messageData = {
                        recipient: {
                            id: recipientId
                        },
                        message: {
                            text: messageText
                        }
                    };
                    callSendAPI(messageData);
                };
                let senderID = event.sender.id;
                let recipientID = event.recipient.id;
                let timeOfMessage = event.timestamp;
                let message = event.message;
                console.log("Received message for user %d and page %d at %d with message:", senderID, recipientID, timeOfMessage);
                console.log(JSON.stringify(message));
                let messageId = message.mid;
                let messageText = message.text;
                let messageAttachments = message.attachments;
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
            let data = req.body;
            if (data.object === 'page') {
                data.entry.forEach(function (entry) {
                    let pageID = entry.id;
                    let timeOfEvent = entry.time;
                    entry.messaging.forEach(function (event) {
                        if (event.message) {
                            receivedMessage(event);
                        }
                        else {
                            console.log("Webhook received unknown event: ", event);
                        }
                    });
                });
                response.sendStatus(200);
            }
        }
    }
    FacebookModule.Facebook = Facebook;
})(FacebookModule = exports.FacebookModule || (exports.FacebookModule = {}));
module.exports = FacebookModule;
//# sourceMappingURL=facebook_controller.js.map