/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace LineApiRouter {

    const express = require('express');
    export const router = express.Router();

    const core = require(process.cwd() + '/core');
    const share: any = core.share;
    const exception: any = core.exception;

    const LineModule: any = require(share.Server("plugins/line/controllers/line_controller"));
    const line: any = new LineModule.Line;

    const bodyParser = require('body-parser');

    router.use(bodyParser.json({
        verify(req,res,buf) {
            req.rawBody = buf
        }
    }));

    router.post("/webhook/", [exception.exception, line.bot_hook]);

    router.get("/push/:message", [exception.exception, line.bot_push]);

}

module.exports = LineApiRouter.router;
