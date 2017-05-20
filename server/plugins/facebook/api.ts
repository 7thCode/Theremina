/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace FacebookApiRouter {

    const express = require('express');
    export const router = express.Router();

    const bodyParser = require('body-parser');
    const jsonParser = bodyParser.json();

    const core = require(process.cwd() + '/core');
    const share: any = core.share;
    const exception: any = core.exception;

    const FacebookModule: any = require(share.Server("plugins/facebook/controllers/facebook_controller"));
    const facebook: any = new FacebookModule.Facebook;

    router.get("/webhook/", [exception.exception, facebook.bot_hook]);
    router.post("/webhook/", [exception.exception,jsonParser, facebook.bot_push]);

    //router.get("/push/:message", [exception.exception, line.bot_push]);

}

module.exports = FacebookApiRouter.router;
