/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FilePageRouter;
(function (FilePageRouter) {
    const express = require('express');
    FilePageRouter.router = express.Router();
    const share = require(process.cwd() + '/server/systems/common/share');
    const config = share.config;
    const services_config = share.services_config;
    const webfonts = services_config.webfonts;
    let message = config.message;
    const AuthController = require(share.Server("systems/auth/controllers/auth_controller"));
    const auth = new AuthController.Auth();
    const AnalysisController = require(share.Server("systems/analysis/controllers/analysis_controller"));
    const analysis = new AnalysisController.Analysis();
    const ExceptionController = require(share.Server("systems/common/controllers/exception_controller"));
    const exception = new ExceptionController.Exception();
    FilePageRouter.router.get("/", [exception.page_guard, auth.page_valid, (request, response) => {
            response.render("systems/files/index", { config: config, user: request.user, message: message, fonts: webfonts });
        }]);
    FilePageRouter.router.get('/dialogs/file_delete_dialog', [exception.page_guard, auth.page_valid, (req, res, next) => {
            res.render('systems/files/dialogs/file_delete_dialog', { message: message });
        }]);
})(FilePageRouter = exports.FilePageRouter || (exports.FilePageRouter = {}));
module.exports = FilePageRouter.router;
//# sourceMappingURL=pages.js.map