/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CommonPageRouter;
(function (CommonPageRouter) {
    var express = require('express');
    CommonPageRouter.router = express.Router();
    var core = require(process.cwd() + '/gs');
    var share = core.share;
    var exception = core.exception;
    var config = share.config;
    var message = config.message;
    var AuthController = require(share.Server("systems/auth/controllers/auth_controller"));
    CommonPageRouter.auth = new AuthController.Auth();
    CommonPageRouter.router.get('/dialogs/alert_dialog', [exception.page_guard, CommonPageRouter.auth.page_valid, function (req, result, next) {
            result.render('systems/common/alert_dialog', { message: message });
        }]);
    CommonPageRouter.router.get('/test', [function (request, result, next) {
            result.render('systems/test/index', { message: message, config: config, user: request.user });
        }]);
})(CommonPageRouter = exports.CommonPageRouter || (exports.CommonPageRouter = {}));
module.exports = CommonPageRouter.router;
//# sourceMappingURL=pages.js.map