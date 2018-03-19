/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

export namespace DataPageRouter {

    const express: any = require('express');
    export const router: IRouter = express.Router();

    const _ = require('lodash');
    const minify: any = require('html-minifier').minify;

    const core: any = require(process.cwd() + '/gs');
    const share: any = core.share;
    const config: any = share.config;
    const auth: any = core.auth;
    const exception: any = core.exception;

    const services_config: any = share.services_config;
    const webfonts: any[] = services_config.webfonts || [];

    const applications_config: any = share.applications_config;

    const message: any = config.message;

    //data
    router.get("/", [exception.page_guard, auth.page_valid, (request: any, response: any): void => {
        response.render("services/data/index", {
            config: config,
            user: request.user,
            role: auth.role(request.user),
            message: message,
            status: 200,
            fonts: webfonts
        });
    }]);

    router.get("/2", [exception.page_guard, auth.page_valid, (request: any, response: any): void => {
        response.render("services/data2/index", {
            config: config,
            user: request.user,
            role: auth.role(request.user),
            message: message,
            status: 200,
            fonts: webfonts
        });
    }]);

    router.get('/dialogs/create_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('services/data/dialogs/create_dialog', {message: message});
    }]);

    router.get('/dialogs/operation_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('services/data/dialogs/operation_dialog', {message: message});
    }]);

    router.get('/dialogs/delete_confirm_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('services/data/dialogs/delete_confirm_dialog', {message: message});
    }]);

}

module.exports = DataPageRouter.router;