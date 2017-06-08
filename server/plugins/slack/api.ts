/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace SlackApiRouter {

    const express: any = require("express");
    export const router = express.Router();

    const core = require(process.cwd() + "/core");
    const share: any = core.share;
    const plugins_config = share.plugins_config;
    if (plugins_config.slack) {
        const SlackModule: any = require(share.Server("plugins/slack/controllers/slack_controller"));
        const slack: any = new SlackModule.Slack();
    }

}

module.exports = SlackApiRouter.router;
