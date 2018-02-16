/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

export namespace AccountPageRouter {

    const express: any = require('express');
    export const router: IRouter = express.Router();

    const share: any = require(process.cwd() + '/server/systems/common/share');
    const AuthController: any = require(share.Server("systems/auth/controllers/auth_controller"));
    const auth: any = new AuthController.Auth;
    const ExceptionController: any = require(share.Server("systems/common/controllers/exception_controller"));
    const exception: any = new ExceptionController.Exception;

    const config: any = share.config;
    const services_config: any = share.services_config;
    const webfonts: any[] = services_config.webfonts;

    const message: any = config.message;

    router.get("/", [exception.page_guard, auth.page_valid, auth.page_is_system, (request: any, response: any): void => {
        response.render("systems/accounts/index", {
            config: config,
            user: request.user,
            role: auth.role(request.user),
            message: message,
            status: 200,
            fonts: webfonts
        });
    }]);

    router.get('/dialogs/open_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, (request: any, response: any, next: any) => {
        response.render("systems/accounts/dialogs/open_dialog", {message: message});
    }]);

}

module.exports = AccountPageRouter.router;