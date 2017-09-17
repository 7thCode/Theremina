/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CommonPageRouter;
(function (CommonPageRouter) {
    const express = require('express');
    CommonPageRouter.router = express.Router();
    const core = require(process.cwd() + '/gs');
    const share = core.share;
    const exception = core.exception;
    const config = share.config;
    let message = config.message;
    const AuthController = require(share.Server("systems/auth/controllers/auth_controller"));
    CommonPageRouter.auth = new AuthController.Auth();
    CommonPageRouter.router.get('/dialogs/alert_dialog', [exception.page_guard, CommonPageRouter.auth.page_valid, (req, result, next) => {
            result.render('systems/common/alert_dialog', { message: message });
        }]);
    CommonPageRouter.router.get('/test', [(request, result, next) => {
            result.render('systems/test/index', { message: message, config: config, user: request.user });
        }]);
})(CommonPageRouter = exports.CommonPageRouter || (exports.CommonPageRouter = {}));
module.exports = CommonPageRouter.router;
//# sourceMappingURL=pages.js.map