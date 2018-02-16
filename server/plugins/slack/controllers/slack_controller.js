/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SlackModule;
(function (SlackModule) {
    var _ = require('lodash');
    var Botkit = require('botkit');
    var core = require(process.cwd() + '/gs');
    var share = core.share;
    var plugins_config = share.plugins_config;
    var controller = null;
    var Slack = /** @class */ (function () {
        function Slack() {
            controller = Botkit.slackbot({
                debug: false
            });
            controller.spawn({
                token: plugins_config.slack.token
            }).startRTM(function (err) {
                if (err) {
                }
            });
            controller.hears('', ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
                bot.startConversation(message, function (err, convo) {
                    convo.say('やあ!');
                    convo.say('おしゃべりしよ!');
                    convo.ask('元気?', function (response, convo) {
                        convo.say(response.text + "なのね!");
                        convo.next();
                    });
                });
            });
        }
        return Slack;
    }());
    SlackModule.Slack = Slack;
})(SlackModule = exports.SlackModule || (exports.SlackModule = {}));
module.exports = SlackModule;
//# sourceMappingURL=slack_controller.js.map