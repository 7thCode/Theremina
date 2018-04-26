/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace FacebookModule {

    const core: any = require(process.cwd() + '/gs');
    const share: any = core.share;

    const plugins_config: any = share.plugins_config;

    const request: any = require('request');

    export class Facebook {

        constructor() {

        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public bot_hook(request: any, response: any): void {
            let verify_token = plugins_config.facebook.token;
            let token = request.query["hub.verify_token"];
            if (token == verify_token) {
                response.send(request.query["hub.challenge"]);
            } else {
                response.send("");
            }
        }

        /**
         * @param req
         * @param response
         * @returns none
         */
        public bot_push(req: any, response: any): void {

            let token = plugins_config.facebook.token;

            let receivedMessage = (event) => {

                let sendGenericMessage = (recipientId:any, messageText:any):void => {
                    // To be expanded in later sections
                };

                let sendTextMessage = (recipientId: any, messageText: string): void => {

                    let callSendAPI:any = (messageData): void => {
                        request({
                            uri: 'https://graph.facebook.com/v2.7/me/messages',
                            qs: {access_token: token},
                            method: 'POST',
                            json: {
                                recipient: {id: recipientId},
                                message: messageData,
                            }
                        }, (error, response, body): void => {
                            if (!error && response.statusCode == 200) {
                                let recipientId = body.recipient_id;
                                let messageId = body.message_id;

                  //              console.log("Successfully sent generic message with id %s to recipient %s", messageId, recipientId);
                            } else {
                   //             console.error("Unable to send message.");
                    //            console.error(response);
                    //            console.error(error);
                            }
                        });
                    };

                    let messageData:any = {
                        recipient: {
                            id: recipientId
                        },
                        message: {
                            text: messageText
                        }
                    };

                    callSendAPI(messageData);
                };

                let senderID:any = event.sender.id;
                let recipientID:any = event.recipient.id;
                let timeOfMessage:any = event.timestamp;
                let message:any = event.message;

         //       console.log("Received message for user %d and page %d at %d with message:", senderID, recipientID, timeOfMessage);
       //         console.log(JSON.stringify(message));

        //        let messageId:any = message.mid;

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
                } else if (messageAttachments) {
                    sendTextMessage(senderID, "Message with attachment received");
                }
            };

            let data = req.body;
            if (data.object === 'page') {
                data.entry.forEach(function (entry) {
               //     let pageID:any = entry.id;
               //     let timeOfEvent:any = entry.time;
                    entry.messaging.forEach(function (event) {
                        if (event.message) {
                            receivedMessage(event);
                        } else {
              //              console.log("Webhook received unknown event: ", event);
                        }
                    });
                });
                response.sendStatus(200);
            }
        }
    }
}

module.exports = FacebookModule;