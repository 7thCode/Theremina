/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SettingApiRouter;
(function (SettingApiRouter) {
    const express = require('express');
    SettingApiRouter.router = express.Router();
    const share = require(process.cwd() + '/server/systems/common/share');
    const ExceptionController = require("../common/controllers/exception_controller");
    const exception = new ExceptionController.Exception();
    const AuthController = require(share.Server("systems/auth/controllers/auth_controller"));
    const auth = new AuthController.Auth;
    const SettingModule = require("./controllers/setting_controller");
    const setting = new SettingModule.Setting();
    SettingApiRouter.router.put('/command/backup', [exception.exception, exception.guard, exception.authenticate, auth.is_system, setting.backup]);
    SettingApiRouter.router.put('/command/restore', [exception.exception, setting.restore]);
    SettingApiRouter.router.get('/setting/application', [exception.exception, exception.guard, exception.authenticate, auth.is_system, setting.read_application]);
    SettingApiRouter.router.put('/setting/application', [exception.exception, exception.guard, exception.authenticate, auth.is_system, setting.write_application]);
    SettingApiRouter.router.get('/setting/plugins', [exception.exception, exception.guard, exception.authenticate, auth.is_system, setting.read_plugins]);
    SettingApiRouter.router.put('/setting/plugins', [exception.exception, exception.guard, exception.authenticate, auth.is_system, setting.write_plugins]);
    SettingApiRouter.router.get('/setting/services', [exception.exception, exception.guard, exception.authenticate, auth.is_system, setting.read_services]);
    SettingApiRouter.router.put('/setting/services', [exception.exception, exception.guard, exception.authenticate, auth.is_system, setting.write_services]);
    SettingApiRouter.router.get('/setting/system', [exception.exception, exception.guard, exception.authenticate, auth.is_system, setting.read_system]);
    SettingApiRouter.router.put('/setting/system', [exception.exception, exception.guard, exception.authenticate, auth.is_system, setting.write_system]);
    SettingApiRouter.router.get('/setting/modules', [exception.exception, exception.guard, exception.authenticate, auth.is_system, setting.read_modules]);
})(SettingApiRouter = exports.SettingApiRouter || (exports.SettingApiRouter = {}));
module.exports = SettingApiRouter.router;
//# sourceMappingURL=api.js.map