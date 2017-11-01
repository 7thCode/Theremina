/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace LineApiRouter {

    const express = require('express');
    export const router = express.Router();

    const line = require('@line/bot-sdk');

    const core = require(process.cwd() + '/gs');
    const share: any = core.share;
    const plugins_config = share.plugins_config;

    if (plugins_config.line) {
        const exception: any = core.exception;

        const LineModule: any = require(share.Server("plugins/line/controllers/line_controller"));
        const _line: any = new LineModule.Line;
/*
        const bodyParser = require('body-parser');

        router.use(bodyParser.json({
            verify(req, res, buf) {
                req.rawBody = buf
            }
        }));
*/
        line.middleware(plugins_config.line.token);

        router.post("/api/webhook", [_line.bot_hook]);

        //http://localhost:8000/line/api/webhook

        
     //   router.get("/push/:message", [exception.exception, line.bot_push]);
    }
}

module.exports = LineApiRouter.router;
