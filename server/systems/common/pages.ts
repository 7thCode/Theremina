/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace CommonPageRouter {

    const express = require('express');
    export let router = express.Router();

    const core = require(process.cwd() + '/gs');
    const share: any = core.share;
    const exception: any = core.exception;

    const config: any = share.config;
    let message = config.message;

    const AuthController: any = require(share.Server("systems/auth/controllers/auth_controller"));
    export const auth: any = new AuthController.Auth();

    router.get('/dialogs/alert_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('systems/common/alert_dialog', {message: message});
    }]);

    router.get('/test', [ (request: any, result: any, next: any) => {
        result.render('systems/test/index', {message: message,config: config, user: request.user});
    }]);

}

module.exports = CommonPageRouter.router;