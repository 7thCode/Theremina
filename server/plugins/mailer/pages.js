/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MailerPageRouter;
(function (MailerPageRouter) {
    const express = require('express');
    MailerPageRouter.router = express.Router();
    const core = require(process.cwd() + '/gs');
    const auth = core.auth;
    const share = core.share;
    const exception = core.exception;
    const config = share.config;
    const services_config = share.services_config;
    const webfonts = services_config.webfonts;
    let message = config.message;
    MailerPageRouter.router.get('/', [exception.page_guard, auth.page_valid, auth.page_is_system, (request, result, next) => {
            result.render('plugins/mailer/index', { config: config, user: request.user, message: message, status: 200, fonts: webfonts });
        }]);
    MailerPageRouter.router.get('/dialogs/send_mail_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, (req, result, next) => {
            result.render('plugins/mailer/dialogs/send_mail_dialog', { message: message });
        }]);
    MailerPageRouter.router.get('/dialogs/open_mail_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, (req, result, next) => {
            result.render('plugins/mailer/dialogs/open_mail_dialog', { message: message });
        }]);
    MailerPageRouter.router.get('/dialogs/send_mail_confirm_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, (req, result, next) => {
            result.render('plugins/mailer/dialogs/send_mail_confirm_dialog', { message: message });
        }]);
    MailerPageRouter.router.get('/dialogs/delete_mail_confirm_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, (req, result, next) => {
            result.render('plugins/mailer/dialogs/delete_mail_confirm_dialog', { message: message });
        }]);
})(MailerPageRouter = exports.MailerPageRouter || (exports.MailerPageRouter = {}));
module.exports = MailerPageRouter.router;
//# sourceMappingURL=pages.js.map