/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace ProfilePageRouter {

    const express: any = require('express');
    export const router: any = express.Router();

    const core: any = require(process.cwd() + '/gs');
    const share: any = core.share;
    const auth: any = core.auth;
    const exception: any = core.exception;
    const analysis: any = core.analysis;

    const config: any = share.config;
    const services_config: any = share.services_config;
    const webfonts: any[] = services_config.webfonts;

    let message = config.message;

    router.get("/", [exception.page_guard, auth.page_valid, analysis.page_view, (request: any, response: any): void => {
        response.render("services/profile/index", {
            config: config,
            user: request.user,
            role: auth.role(request.user),
            message: message,
            status: 200,
            fonts: webfonts
        });
    }]);

}

module.exports = ProfilePageRouter.router;