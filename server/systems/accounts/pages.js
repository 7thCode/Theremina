/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AccountPageRouter;
(function (AccountPageRouter) {
    var express = require('express');
    AccountPageRouter.router = express.Router();
    var share = require(process.cwd() + '/server/systems/common/share');
    var AuthController = require(share.Server("systems/auth/controllers/auth_controller"));
    var auth = new AuthController.Auth;
    var ExceptionController = require(share.Server("systems/common/controllers/exception_controller"));
    var exception = new ExceptionController.Exception;
    var config = share.config;
    var services_config = share.services_config;
    var webfonts = services_config.webfonts;
    var message = config.message;
    AccountPageRouter.router.get("/", [exception.page_guard, auth.page_valid, auth.page_is_system, function (request, response) {
            response.render("systems/accounts/index", {
                config: config,
                user: request.user,
                role: auth.role(request.user),
                message: message,
                status: 200,
                fonts: webfonts
            });
        }]);
    AccountPageRouter.router.get('/dialogs/open_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, function (request, response, next) {
            response.render("systems/accounts/dialogs/open_dialog", { message: message });
        }]);
})(AccountPageRouter = exports.AccountPageRouter || (exports.AccountPageRouter = {}));
module.exports = AccountPageRouter.router;
//# sourceMappingURL=pages.js.map