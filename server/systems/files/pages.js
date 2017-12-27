/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FilePageRouter;
(function (FilePageRouter) {
    var express = require('express');
    FilePageRouter.router = express.Router();
    var share = require(process.cwd() + '/server/systems/common/share');
    var config = share.config;
    var services_config = share.services_config;
    var webfonts = services_config.webfonts;
    var message = config.message;
    var AuthController = require(share.Server("systems/auth/controllers/auth_controller"));
    var auth = new AuthController.Auth();
    var AnalysisController = require(share.Server("systems/analysis/controllers/analysis_controller"));
    var analysis = new AnalysisController.Analysis();
    var ExceptionController = require(share.Server("systems/common/controllers/exception_controller"));
    var exception = new ExceptionController.Exception();
    FilePageRouter.router.get("/", [exception.page_guard, auth.page_valid, function (request, response) {
            response.render("systems/files/index", { config: config, user: request.user, message: message, fonts: webfonts });
        }]);
    FilePageRouter.router.get('/dialogs/file_delete_dialog', [exception.page_guard, auth.page_valid, function (req, res, next) {
            res.render('systems/files/dialogs/file_delete_dialog', { message: message });
        }]);
})(FilePageRouter = exports.FilePageRouter || (exports.FilePageRouter = {}));
module.exports = FilePageRouter.router;
//# sourceMappingURL=pages.js.map