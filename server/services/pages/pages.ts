/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace PagesPageRouter {

    const express = require('express');
    export const router = express.Router();

    const _ = require('lodash');
    const minify = require('html-minifier').minify;

    const core = require(process.cwd() + '/gs');
    const share: any = core.share;
    const config: any = share.config;
    const auth: any = core.auth;
    const exception: any = core.exception;
    const analysis: any = core.analysis;

    const services_config = share.services_config;
    const webfonts: any[] = services_config.webfonts;

    const PagesModule: any = require(share.Server("services/pages/controllers/pages_controller"));
    const pages: any = new PagesModule.Pages;

    let message = config.message;

    //pages
    router.get("/", [exception.page_guard, auth.page_valid, auth.page_is_user, analysis.page_view, (request: any, response: any): void => {
        response.render("services/pages/index", {
            config: config,
            user: request.user,
            role: auth.role(request.user),
            message: message,
            status: 200,
            fonts: webfonts
        });
    }]);

    router.get("/getall/:namespace", [exception.page_guard, auth.page_valid,auth.page_is_user, pages.get_all]);

    router.get('/dialogs/create_dialog', [exception.page_guard, auth.page_valid,auth.page_is_user, (req: any, result: any, next: any) => {
        result.render('services/pages/dialogs/create_dialog', {message: message});
    }]);

    router.get('/dialogs/open_dialog', [exception.page_guard, auth.page_valid,auth.page_is_user, (req: any, result: any, next: any) => {
        result.render('services/pages/dialogs/open_dialog', {message: message});
    }]);

    router.get('/dialogs/delete_confirm_dialog', [exception.page_guard, auth.page_valid,auth.page_is_user, (req: any, result: any, next: any) => {
        result.render('services/pages/dialogs/delete_confirm_dialog', {message: message});
    }]);

}

module.exports = PagesPageRouter.router;