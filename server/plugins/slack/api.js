/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SlackApiRouter;
(function (SlackApiRouter) {
    var express = require("express");
    SlackApiRouter.router = express.Router();
    var core = require(process.cwd() + "/gs");
    var share = core.share;
    var plugins_config = share.plugins_config;
    if (plugins_config.slack) {
        var SlackModule = require(share.Server("plugins/slack/controllers/slack_controller"));
        var slack = new SlackModule.Slack();
    }
})(SlackApiRouter = exports.SlackApiRouter || (exports.SlackApiRouter = {}));
module.exports = SlackApiRouter.router;
//# sourceMappingURL=api.js.map