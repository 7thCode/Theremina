/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace AuthPageRouter {

    const express = require('express');
    export const router = express.Router();

    const share = require('../common/share');
    const config = share.config;

    const applications_config = share.applications_config;

    let message = config.message;

    const AuthController: any = require(share.Server("systems/auth/controllers/auth_controller"));
    const auth: any = new AuthController.Auth;

    const ExceptionController: any = require(share.Server("systems/common/controllers/exception_controller"));
    const exception: any = new ExceptionController.Exception;

    router.get('/dialogs/registerdialog', [exception.page_catch, (request: any, response: any): void => {
        response.render('systems/auth/dialogs/registerdialog', {config: config, message: message});
    }]);

    router.get("/dialogs/registerconfirmdialog", [exception.page_catch, (request: any, response: any): void => {
        response.render("systems/auth/dialogs/registerconfirmdialog", {config: config, message: message});
    }]);

    router.get('/dialogs/memberdialog', [exception.page_guard, (request: any, response: any): void => {
        response.render('systems/auth/dialogs/memberdialog', {config: config, message: message});
    }]);

    router.get("/dialogs/memberconfirmdialog", [exception.page_guard, (request: any, response: any): void => {
        response.render("systems/auth/dialogs/memberconfirmdialog", {config: config, message: message});
    }]);

    router.get("/dialogs/logindialog", [exception.page_catch, (request: any, response: any): void => {
        response.render("systems/auth/dialogs/logindialog", {config: config, message: message});
    }]);

    router.get("/dialogs/passworddialog", [exception.page_catch, (request: any, response: any): void => {
        response.render("systems/auth/dialogs/passworddialog", {user: request.user, message: message});
    }]);

    router.get("/dialogs/passwordconfirmdialog", [exception.page_catch, (request: any, response: any): void => {
        response.render("systems/auth/dialogs/passwordconfirmdialog", {config: config, message: message});
    }]);

}

module.exports = AuthPageRouter.router;