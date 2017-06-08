/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace SettingApiRouter {

    const express = require('express');
    export const router = express.Router();

    const share = require(process.cwd() + '/server/systems/common/share');

    const ExceptionController: any = require("../common/controllers/exception_controller");
    const exception: any = new ExceptionController.Exception();

    const AuthController: any = require(share.Server("systems/auth/controllers/auth_controller"));
    const auth: any = new AuthController.Auth;

    const SettingModule: any = require("./controllers/setting_controller");
    const setting: any = new SettingModule.Setting();

    router.put('/command/backup', [exception.exception, exception.guard, exception.authenticate, auth.is_system, setting.backup]);
    router.put('/command/restore', [exception.exception, exception.guard, exception.authenticate, auth.is_system, setting.restore]);

    router.get('/setting/application', [exception.exception, exception.guard, exception.authenticate, setting.read_application]);
    router.put('/setting/application', [exception.exception, exception.guard, exception.authenticate, setting.write_application]);

    router.get('/setting/plugins', [exception.exception, exception.guard, exception.authenticate, setting.read_plugins]);
    router.put('/setting/plugins', [exception.exception, exception.guard, exception.authenticate, setting.write_plugins]);

    router.get('/setting/services', [exception.exception, exception.guard, exception.authenticate, auth.is_system, setting.read_services]);
    router.put('/setting/services', [exception.exception, exception.guard, exception.authenticate, auth.is_system, setting.write_services]);

    router.get('/setting/system', [exception.exception, exception.guard, exception.authenticate, auth.is_system, setting.read_system]);
    router.put('/setting/system', [exception.exception, exception.guard, exception.authenticate, auth.is_system, setting.write_system]);

    router.get('/setting/modules', [exception.exception, exception.guard, exception.authenticate, setting.read_modules]);


}

module.exports = SettingApiRouter.router;

