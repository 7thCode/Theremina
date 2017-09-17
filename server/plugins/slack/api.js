/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SlackApiRouter;
(function (SlackApiRouter) {
    const express = require("express");
    SlackApiRouter.router = express.Router();
    const core = require(process.cwd() + "/gs");
    const share = core.share;
    const plugins_config = share.plugins_config;
    if (plugins_config.slack) {
        const SlackModule = require(share.Server("plugins/slack/controllers/slack_controller"));
        const slack = new SlackModule.Slack();
    }
})(SlackApiRouter = exports.SlackApiRouter || (exports.SlackApiRouter = {}));
module.exports = SlackApiRouter.router;
//# sourceMappingURL=api.js.map