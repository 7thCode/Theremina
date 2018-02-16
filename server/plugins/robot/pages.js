/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RobotPageRouter;
(function (RobotPageRouter) {
    var express = require('express');
    RobotPageRouter.router = express.Router();
    var core = require(process.cwd() + '/gs');
    var auth = core.auth;
    var share = core.share;
    var exception = core.exception;
    var config = share.config;
    var services_config = share.services_config;
    var webfonts = services_config.webfonts;
    var message = config.message;
    RobotPageRouter.router.get("/", [exception.page_guard, auth.page_valid, function (request, response) {
            response.render("plugins/robot/index", {
                config: config,
                user: request.user,
                role: auth.role(request.user),
                message: message,
                status: 200,
                fonts: webfonts
            });
        }]);
})(RobotPageRouter = exports.RobotPageRouter || (exports.RobotPageRouter = {}));
module.exports = RobotPageRouter.router;
//# sourceMappingURL=pages.js.map