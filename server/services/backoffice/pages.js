/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BackOfficePageRouter;
(function (BackOfficePageRouter) {
    const express = require('express');
    BackOfficePageRouter.router = express.Router();
    const core = require(process.cwd() + '/gs');
    const share = core.share;
    const auth = core.auth;
    const exception = core.exception;
    const analysis = core.analysis;
    const config = share.config;
    let message = config.message;
    const services_config = share.services_config;
    const webfonts = services_config.webfonts;
    BackOfficePageRouter.router.get("/", [exception.page_guard, auth.page_valid, analysis.page_view, auth.page_is_system, (request, response) => {
            response.render("services/backoffice/index", {
                config: config,
                user: request.user,
                message: message,
                status: 200,
                fonts: webfonts
            });
        }]);
})(BackOfficePageRouter = exports.BackOfficePageRouter || (exports.BackOfficePageRouter = {}));
module.exports = BackOfficePageRouter.router;
//# sourceMappingURL=pages.js.map