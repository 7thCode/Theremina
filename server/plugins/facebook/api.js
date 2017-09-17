/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FacebookApiRouter;
(function (FacebookApiRouter) {
    const express = require('express');
    FacebookApiRouter.router = express.Router();
    const bodyParser = require('body-parser');
    const jsonParser = bodyParser.json();
    const core = require(process.cwd() + '/gs');
    const share = core.share;
    const plugins_config = share.plugins_config;
    if (plugins_config.facebook) {
        const exception = core.exception;
        const FacebookModule = require(share.Server("plugins/facebook/controllers/facebook_controller"));
        const facebook = new FacebookModule.Facebook;
        FacebookApiRouter.router.get("/webhook/", [exception.exception, facebook.bot_hook]);
        FacebookApiRouter.router.post("/webhook/", [exception.exception, jsonParser, facebook.bot_push]);
        //router.get("/push/:message", [exception.exception, line.bot_push]);
    }
})(FacebookApiRouter = exports.FacebookApiRouter || (exports.FacebookApiRouter = {}));
module.exports = FacebookApiRouter.router;
//# sourceMappingURL=api.js.map