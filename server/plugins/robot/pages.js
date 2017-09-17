/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RobotPageRouter;
(function (RobotPageRouter) {
    const express = require('express');
    RobotPageRouter.router = express.Router();
    const core = require(process.cwd() + '/gs');
    const auth = core.auth;
    const share = core.share;
    const exception = core.exception;
    const config = share.config;
    const services_config = share.services_config;
    const webfonts = services_config.webfonts;
    let message = config.message;
    RobotPageRouter.router.get("/", [exception.page_guard, auth.page_valid, (request, response) => {
            response.render("plugins/robot/index", {
                config: config,
                user: request.user,
                message: message,
                status: 200,
                fonts: webfonts
            });
        }]);
})(RobotPageRouter = exports.RobotPageRouter || (exports.RobotPageRouter = {}));
module.exports = RobotPageRouter.router;
//# sourceMappingURL=pages.js.map