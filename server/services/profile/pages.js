/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ProfilePageRouter;
(function (ProfilePageRouter) {
    var express = require('express');
    ProfilePageRouter.router = express.Router();
    var core = require(process.cwd() + '/gs');
    var share = core.share;
    var auth = core.auth;
    var exception = core.exception;
    var analysis = core.analysis;
    var config = share.config;
    var services_config = share.services_config;
    var webfonts = services_config.webfonts || [];
    var message = config.message;
    ProfilePageRouter.router.get("/", [exception.page_guard, auth.page_valid, analysis.page_view, function (request, response) {
            response.render("services/profile/index", {
                config: config,
                user: request.user,
                role: auth.role(request.user),
                message: message,
                status: 200,
                fonts: webfonts
            });
        }]);
})(ProfilePageRouter = exports.ProfilePageRouter || (exports.ProfilePageRouter = {}));
module.exports = ProfilePageRouter.router;
//# sourceMappingURL=pages.js.map