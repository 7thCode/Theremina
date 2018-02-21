/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

export namespace GroupPageRouter {

    const express: any = require('express');
    export const router: IRouter = express.Router();

    const core: any = require(process.cwd() + '/gs');
    const auth: any = core.auth;
    const share: any = core.share;
    const exception: any = core.exception;

    const config: any = share.config;
    const services_config: any = share.services_config;
    const webfonts: any[] = services_config.webfonts || [];

    const message: any = config.message;

    router.get("/", [exception.page_guard, auth.page_valid, (request: any, response: any): void => {
        response.render("services/groups/index", {
            config: config,
            user: request.user,
            role: auth.role(request.user),
            message: message,
            status: 200,
            fonts: webfonts
        });
    }]);

    router.get('/dialogs/create_dialog', [exception.page_guard, auth.page_valid, (request: any, response: any, next: any) => {
        response.render("services/groups/dialogs/create_dialog", {message: message});
    }]);

    router.get('/dialogs/open_dialog', [exception.page_guard, auth.page_valid, (request: any, response: any, next: any) => {
        response.render("services/groups/dialogs/open_dialog", {message: message});
    }]);

    router.get('/dialogs/delete_confirm_dialog', [exception.page_guard, auth.page_valid, (request: any, response: any, next: any) => {
        response.render('services/groups/dialogs/delete_confirm_dialog', {message: message});
    }]);
}

module.exports = GroupPageRouter.router;