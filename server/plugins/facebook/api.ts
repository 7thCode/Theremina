/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

export namespace FacebookApiRouter {

    const express: any = require('express');
    export const router: IRouter = express.Router();

    const bodyParser: any = require('body-parser');
    const jsonParser: any = bodyParser.json();

    const core: any = require(process.cwd() + '/gs');
    const share: any = core.share;
    const plugins_config: any = share.plugins_config;
    if (plugins_config.facebook) {
        const exception: any = core.exception;

        const FacebookModule: any = require(share.Server("plugins/facebook/controllers/facebook_controller"));
        const facebook: any = new FacebookModule.Facebook;

        router.get("/webhook/", [exception.exception, facebook.bot_hook]);
        router.post("/webhook/", [exception.exception, jsonParser, facebook.bot_push]);
    }
}

module.exports = FacebookApiRouter.router;
