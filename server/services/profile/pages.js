/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ProfilePageRouter;
(function (ProfilePageRouter) {
    const express = require('express');
    ProfilePageRouter.router = express.Router();
    const core = require(process.cwd() + '/gs');
    const share = core.share;
    const auth = core.auth;
    const exception = core.exception;
    const analysis = core.analysis;
    const config = share.config;
    const services_config = share.services_config;
    const webfonts = services_config.webfonts;
    let message = config.message;
    ProfilePageRouter.router.get("/", [exception.page_guard, auth.page_valid, analysis.page_view, (request, response) => {
            response.render("services/profile/index", {
                config: config,
                user: request.user,
                message: message,
                status: 200,
                fonts: webfonts
            });
        }]);
})(ProfilePageRouter = exports.ProfilePageRouter || (exports.ProfilePageRouter = {}));
module.exports = ProfilePageRouter.router;
//# sourceMappingURL=pages.js.map