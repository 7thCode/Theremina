/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MailerPageRouter;
(function (MailerPageRouter) {
    var express = require('express');
    MailerPageRouter.router = express.Router();
    var core = require(process.cwd() + '/gs');
    var auth = core.auth;
    var share = core.share;
    var exception = core.exception;
    var config = share.config;
    var services_config = share.services_config;
    var webfonts = services_config.webfonts;
    var message = config.message;
    MailerPageRouter.router.get('/', [exception.page_guard, auth.page_valid, auth.page_is_system, function (request, result, next) {
            result.render('plugins/mailer/index', { config: config, user: request.user, message: message, status: 200, fonts: webfonts });
        }]);
    MailerPageRouter.router.get('/dialogs/send_mail_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, function (req, result, next) {
            result.render('plugins/mailer/dialogs/send_mail_dialog', { message: message });
        }]);
    MailerPageRouter.router.get('/dialogs/open_mail_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, function (req, result, next) {
            result.render('plugins/mailer/dialogs/open_mail_dialog', { message: message });
        }]);
    MailerPageRouter.router.get('/dialogs/send_mail_confirm_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, function (req, result, next) {
            result.render('plugins/mailer/dialogs/send_mail_confirm_dialog', { message: message });
        }]);
    MailerPageRouter.router.get('/dialogs/delete_mail_confirm_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, function (req, result, next) {
            result.render('plugins/mailer/dialogs/delete_mail_confirm_dialog', { message: message });
        }]);
})(MailerPageRouter = exports.MailerPageRouter || (exports.MailerPageRouter = {}));
module.exports = MailerPageRouter.router;
//# sourceMappingURL=pages.js.map