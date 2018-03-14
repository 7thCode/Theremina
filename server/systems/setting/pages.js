/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SettingPageRouter;
(function (SettingPageRouter) {
    var express = require('express');
    SettingPageRouter.router = express.Router();
    var share = require(process.cwd() + '/server/systems/common/share');
    var config = share.config;
    var services_config = share.services_config;
    var webfonts = services_config.webfonts || [];
    var message = config.message;
    var AuthController = require(share.Server("systems/auth/controllers/auth_controller"));
    var auth = new AuthController.Auth();
    var ExceptionController = require(share.Server("systems/common/controllers/exception_controller"));
    var exception = new ExceptionController.Exception();
    SettingPageRouter.router.get("/", [exception.page_guard, auth.page_valid, auth.page_is_system, function (request, response) {
            response.render("systems/setting/index", {
                config: config, user: request.user,
                role: auth.role(request.user), message: message, status: 200, fonts: webfonts
            });
        }]);
    SettingPageRouter.router.get('/dialogs/backup_confirm_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, function (req, result, next) {
            result.render('systems/setting/dialogs/backup_confirm_dialog', { message: message });
        }]);
    SettingPageRouter.router.get('/dialogs/restore_confirm_dialog', [function (req, result, next) {
            result.render('systems/setting/dialogs/restore_confirm_dialog', { message: message });
        }]);
})(SettingPageRouter = exports.SettingPageRouter || (exports.SettingPageRouter = {}));
module.exports = SettingPageRouter.router;
//# sourceMappingURL=pages.js.map