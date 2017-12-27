/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FacebookApiRouter;
(function (FacebookApiRouter) {
    var express = require('express');
    FacebookApiRouter.router = express.Router();
    var bodyParser = require('body-parser');
    var jsonParser = bodyParser.json();
    var core = require(process.cwd() + '/gs');
    var share = core.share;
    var plugins_config = share.plugins_config;
    if (plugins_config.facebook) {
        var exception = core.exception;
        var FacebookModule = require(share.Server("plugins/facebook/controllers/facebook_controller"));
        var facebook = new FacebookModule.Facebook;
        FacebookApiRouter.router.get("/webhook/", [exception.exception, facebook.bot_hook]);
        FacebookApiRouter.router.post("/webhook/", [exception.exception, jsonParser, facebook.bot_push]);
    }
})(FacebookApiRouter = exports.FacebookApiRouter || (exports.FacebookApiRouter = {}));
module.exports = FacebookApiRouter.router;
//# sourceMappingURL=api.js.map