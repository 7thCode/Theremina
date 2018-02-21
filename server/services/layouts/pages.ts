/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

export namespace LayoutsPageRouter {

    const express: any = require('express');
    export const router: IRouter = express.Router();

    const core: any = require(process.cwd() + '/gs');
    const share: any = core.share;
    const auth: any = core.auth;
    const exception: any = core.exception;

    const config: any = share.config;
    const services_config: any = share.services_config;
    const webfonts: any[] = services_config.webfonts || [];

    const LayoutsModule: any = require(share.Server("services/layouts/controllers/layouts_controller"));

    const message: any = config.message;

    /* GET home page. */
    router.get('/', [exception.page_guard, auth.page_valid, auth.page_is_system, (request: any, result: any, next: any): void => {
        result.render('services/layouts/player/index', {
            config: config,
            user: request.user,
            role: auth.role(request.user),
            message: message,
            status: 200,
            fonts: webfonts
        });
    }]);

    router.get('/builder', [exception.page_guard, auth.page_valid, auth.page_is_system, (request: any, result: any, next: any): void => {
        result.render('services/layouts/builder/index', {
            config: config,
            user: request.user,
            role: auth.role(request.user),
            message: message,
            status: 200,
            fonts: webfonts
        });
    }]);

    router.get('/player/dialogs/create_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, (req: any, result: any, next: any) => {
        result.render('services/layouts/player/dialogs/create_dialog', {message: message});
    }]);

    router.get('/player/dialogs/open_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, (req: any, result: any, next: any) => {
        result.render('services/layouts/player/dialogs/open_dialog', {message: message});
    }]);

    router.get('/player/dialogs/saveas_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, (req: any, result: any, next: any) => {
        result.render('services/layouts/player/dialogs/saveas_dialog', {message: message});
    }]);

    router.get('/player/dialogs/delete_confirm_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, (req: any, result: any, next: any) => {
        result.render('services/layouts/player/dialogs/delete_confirm_dialog', {message: message});
    }]);

    router.get('/builder/dialogs/create_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, (req: any, result: any, next: any) => {
        result.render('services/layouts/builder/dialogs/create_dialog', {message: message});
    }]);

    router.get('/builder/dialogs/open_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, (req: any, result: any, next: any) => {
        result.render('services/layouts/builder/dialogs/open_dialog', {message: message});
    }]);

    router.get('/builder/dialogs/saveas_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, (req: any, result: any, next: any) => {
        result.render('services/layouts/builder/dialogs/saveas_dialog', {message: message});
    }]);

    router.get('/builder/dialogs/delete_confirm_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, (req: any, result: any, next: any) => {
        result.render('services/layouts/builder/dialogs/delete_confirm_dialog', {message: message});
    }]);

    router.get("/render/:userid/:name", [exception.page_catch, (request: any, response: any): void => {
        LayoutsModule.Layout.get_svg(request, response, 2);
    }]);

}

module.exports = LayoutsPageRouter.router;