/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace SlackModule {

    const _ = require('lodash');

    const Botkit = require('botkit');

    const core = require(process.cwd() + '/gs');
    const share: any = core.share;

    const plugins_config = share.plugins_config;

    let controller = null;

    export class Slack {

        constructor() {

            controller = Botkit.slackbot({
                debug: false
            });

            controller.spawn({
                token: plugins_config.slack.token
            }).startRTM((err) => {
                if (err) {

                }
            });

            controller.hears('', ['direct_message', 'direct_mention', 'mention'], (bot, message) => {
                bot.startConversation(
                    message,
                    function (err, convo) {
                        convo.say('やあ!');
                        convo.say('おしゃべりしよ!');

                        convo.ask(
                            '元気?',
                            function (response, convo) {
                                convo.say(response.text + "なのね!");
                                convo.next();
                            });
                    });
            });
        }
    }
}

module.exports = SlackModule;
