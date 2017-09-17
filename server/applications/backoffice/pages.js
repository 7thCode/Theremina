/**!
 Copyright (c) 2016 7thCode.
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BackofficePageRouter;
(function (BackofficePageRouter) {
    const express = require('express');
    BackofficePageRouter.router = express.Router();
    const core = require(process.cwd() + '/gs');
    const share = core.share;
    const auth = core.auth;
    const exception = core.exception;
    const config = share.config;
    const services_config = share.services_config;
    const webfonts = services_config.webfonts;
    let message = config.message;
    BackofficePageRouter.router.get("/", [exception.page_guard, auth.page_valid, auth.page_is_system, (request, response) => {
            response.render("services/backoffice/index", { config: config, user: request.user, message: message, status: 200, fonts: webfonts });
        }]);
})(BackofficePageRouter = exports.BackofficePageRouter || (exports.BackofficePageRouter = {}));
module.exports = BackofficePageRouter.router;
//# sourceMappingURL=pages.js.map