/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace PicturesPageRouter {

    const express: any = require('express');
    export const router: any = express.Router();

    const _: any = require('lodash');
    const minify: any = require('html-minifier').minify;

    const core: any = require(process.cwd() + '/gs');
    const share: any = core.share;
    const config: any = share.config;
    const auth: any = core.auth;
    const exception: any = core.exception;
    const analysis: any = core.analysis;

    const services_config: any = share.services_config;
    const webfonts: any[] = services_config.webfonts;

    let message: any = config.message;

    router.get("/", [exception.page_guard, auth.page_valid, analysis.page_view, (request: any, response: any): void => {
        response.render("services/pictures/index", {
            config: config,
            user: request.user,
            role: auth.role(request.user),
            message: message,
            status: 200,
            fonts: webfonts
        });
    }]);

}

module.exports = PicturesPageRouter.router;