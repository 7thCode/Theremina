/**!
 Copyright (c) 2016 7thCode.
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

export namespace MembersPageRouter {

    const express = require('express');
    export const router: IRouter = express.Router();

    const core: any = require(process.cwd() + '/gs');
    const share: any = core.share;
    const auth: any = core.auth;

    const config: any = share.config;

    const ExceptionController: any = require(share.Server("systems/common/controllers/exception_controller"));
    const exception: any = new ExceptionController.Exception();

    const services_config: any = share.services_config;
    const webfonts: any[] = services_config.webfonts || [];

    const message: any = config.message;

    // Members
    router.get("/", [exception.page_guard, auth.page_valid, (request: any, response: any): void => {
        response.render("services/members/index", {
            config: config,
            user: request.user,
            role: auth.role(request.user),
            message: message,
            status: 200,
            fonts: webfonts
        });
    }]);

    router.get('/dialogs/open_dialog', [exception.page_guard, auth.page_valid, (request: any, response: any, next: any) => {
        response.render("services/members/dialogs/open_dialog", {message: message});
    }]);

}

module.exports = MembersPageRouter.router;