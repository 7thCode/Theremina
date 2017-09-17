/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AuthPageRouter;
(function (AuthPageRouter) {
    const express = require('express');
    AuthPageRouter.router = express.Router();
    const share = require('../common/share');
    const config = share.config;
    const applications_config = share.applications_config;
    let message = config.message;
    const AuthController = require(share.Server("systems/auth/controllers/auth_controller"));
    const auth = new AuthController.Auth;
    const ExceptionController = require(share.Server("systems/common/controllers/exception_controller"));
    const exception = new ExceptionController.Exception;
    AuthPageRouter.router.get('/dialogs/registerdialog', [exception.page_catch, (request, response) => {
            response.render('systems/auth/dialogs/registerdialog', { config: config, message: message });
        }]);
    AuthPageRouter.router.get("/dialogs/registerconfirmdialog", [exception.page_catch, (request, response) => {
            response.render("systems/auth/dialogs/registerconfirmdialog", { config: config, message: message });
        }]);
    AuthPageRouter.router.get('/dialogs/memberdialog', [exception.page_guard, (request, response) => {
            response.render('systems/auth/dialogs/memberdialog', { config: config, message: message });
        }]);
    AuthPageRouter.router.get("/dialogs/memberconfirmdialog", [exception.page_guard, (request, response) => {
            response.render("systems/auth/dialogs/memberconfirmdialog", { config: config, message: message });
        }]);
    AuthPageRouter.router.get("/dialogs/logindialog", [exception.page_catch, (request, response) => {
            response.render("systems/auth/dialogs/logindialog", { config: config, message: message });
        }]);
    AuthPageRouter.router.get("/dialogs/passworddialog", [exception.page_catch, (request, response) => {
            response.render("systems/auth/dialogs/passworddialog", { user: request.user, message: message });
        }]);
    AuthPageRouter.router.get("/dialogs/passwordconfirmdialog", [exception.page_catch, (request, response) => {
            response.render("systems/auth/dialogs/passwordconfirmdialog", { config: config, message: message });
        }]);
})(AuthPageRouter = exports.AuthPageRouter || (exports.AuthPageRouter = {}));
module.exports = AuthPageRouter.router;
//# sourceMappingURL=pages.js.map