/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

export namespace SettingPageRouter {

    const express: any = require('express');
    export const router: IRouter = express.Router();

    const share: any = require(process.cwd() + '/server/systems/common/share');

    const config: any = share.config;
    const services_config: any = share.services_config;
    const webfonts: any[] = services_config.webfonts;

    const message: any = config.message;

    const AuthController: any = require(share.Server("systems/auth/controllers/auth_controller"));
    const auth: any = new AuthController.Auth();

    const ExceptionController: any = require(share.Server("systems/common/controllers/exception_controller"));
    const exception: any = new ExceptionController.Exception();

    router.get("/", [exception.page_guard, auth.page_valid, auth.page_is_system, (request: any, response: any): void => {
        response.render("systems/setting/index", {
            config: config, user: request.user,
            role: auth.role(request.user), message: message, status: 200, fonts: webfonts
        });
    }]);

    router.get('/dialogs/backup_confirm_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, (req: any, result: any, next: any) => {
        result.render('systems/setting/dialogs/backup_confirm_dialog', {message: message});
    }]);

    router.get('/dialogs/restore_confirm_dialog', [(req: any, result: any, next: any) => {
        result.render('systems/setting/dialogs/restore_confirm_dialog', {message: message});
    }]);

}

module.exports = SettingPageRouter.router;