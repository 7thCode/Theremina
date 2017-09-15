/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace ImagePageRouter {

    const express = require('express');
    export const router = express.Router();

    const core = require(process.cwd() + '/gs');
    const share: any = core.share;
    const auth: any = core.auth;
    const exception: any = core.exception;

    const config: any = share.config;
    const services_config = share.services_config;
    const webfonts: any[] = services_config.webfonts;

    let message = config.message;

    router.get("/", [exception.page_guard, auth.page_valid, auth.page_is_system, (request: any, response: any): void => {
        response.render("services/images/index", {
            config: config,
            user: request.user,
            message: message,
            status: 200,
            fonts: webfonts
        });
    }]);

    router.get('/dialogs/image_create_dialog', [exception.page_guard, auth.page_valid, (request: any, response: any, next: any) => {
        response.render('services/images/dialogs/image_create_dialog', {message: message});
    }]);

    router.get('/dialogs/image_show_dialog', [exception.page_guard, auth.page_valid, (request: any, response: any, next: any) => {
        response.render('services/images/dialogs/image_show_dialog', {message: message});
    }]);

    router.get('/dialogs/image_delete_dialog', [exception.page_guard, auth.page_valid, (request: any, response: any, next: any) => {
        response.render('services/images/dialogs/image_delete_dialog', {message: message});
    }]);

    router.get('/dialogs/image_resize_dialog', [exception.page_guard, auth.page_valid, (request: any, response: any, next: any) => {
        response.render('services/images/dialogs/image_resize_dialog', {message: message});
    }]);

}

module.exports = ImagePageRouter.router;