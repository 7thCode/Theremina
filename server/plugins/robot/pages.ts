/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

export namespace RobotPageRouter {

    const express = require('express');
    export const router: IRouter = express.Router();

    const core = require(process.cwd() + '/gs');
    const auth: any = core.auth;
    const share: any = core.share;
    const exception: any = core.exception;

    const config: any = share.config;
    const services_config = share.services_config;
    const webfonts: any[] = services_config.webfonts;

    const message:any = config.message;

    router.get("/", [exception.page_guard, auth.page_valid, (request: any, response: any): void => {
        response.render("plugins/robot/index", {
            config: config,
            user: request.user,
            role: auth.role(request.user),
            message: message,
            status: 200,
            fonts: webfonts
        });
    }]);

}

module.exports = RobotPageRouter.router;