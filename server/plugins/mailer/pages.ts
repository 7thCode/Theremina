/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace MailerPageRouter {

    const express = require('express');
    export const router = express.Router();

    const core = require(process.cwd() + '/gs');
    const auth: any = core.auth;
    const share: any = core.share;
    const exception: any = core.exception;

    const config: any = share.config;
    const services_config = share.services_config;
    const webfonts:any[] = services_config.webfonts;

    let message = config.message;

    router.get('/', [exception.page_guard, auth.page_valid, auth.page_is_system, (request: any, result: any, next: any) => {
        result.render('plugins/mailer/index', {config:config, user: request.user, message: message, status: 200, fonts:webfonts});
    }]);

    router.get('/dialogs/send_mail_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, (req: any, result: any, next: any) => {
        result.render('plugins/mailer/dialogs/send_mail_dialog', {message: message});
    }]);

    router.get('/dialogs/open_mail_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, (req: any, result: any, next: any) => {
        result.render('plugins/mailer/dialogs/open_mail_dialog', {message: message});
    }]);

    router.get('/dialogs/send_mail_confirm_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, (req: any, result: any, next: any) => {
        result.render('plugins/mailer/dialogs/send_mail_confirm_dialog', {message: message});
    }]);

    router.get('/dialogs/delete_mail_confirm_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, (req: any, result: any, next: any) => {
        result.render('plugins/mailer/dialogs/delete_mail_confirm_dialog', {message: message});
    }]);

}

module.exports = MailerPageRouter.router;