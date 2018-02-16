/**!
 Copyright (c) 2016 7thCode.
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

export namespace BackofficePageRouter {

    const express: any = require('express');
    export const router: IRouter = express.Router();

    const core: any = require(process.cwd() + '/gs');
    const share: any = core.share;
    const auth: any = core.auth;
    const exception: any = core.exception;

    const config: any = share.config;
    const services_config: any = share.services_config;
    const webfonts: any[] = services_config.webfonts;

    const message: any = config.message;

    router.get("/", [exception.page_guard, auth.page_valid, auth.page_is_system, (request: any, response: any): void => {
        response.render("services/backoffice/index", {
            config: config, user: request.user,
            role: auth.role(request.user), message: message, status: 200, fonts: webfonts
        });
    }]);
}

module.exports = BackofficePageRouter.router;