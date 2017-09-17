/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CoreModule;
(function (CoreModule) {
    const root_path = process.cwd();
    CoreModule.share = require(root_path + "/server/systems/common/share");
    const AuthController = require(CoreModule.share.Server("systems/auth/controllers/auth_controller"));
    CoreModule.auth = new AuthController.Auth();
    const ExceptionController = require(CoreModule.share.Server("systems/common/controllers/exception_controller"));
    CoreModule.exception = new ExceptionController.Exception();
    const AccountController = require(CoreModule.share.Server("systems/accounts/controllers/account_controller"));
    CoreModule.account = new AccountController.Accounts();
    const FileController = require(CoreModule.share.Server("systems/files/controllers/file_controller"));
    CoreModule.file = new FileController.Files();
    const ResourceController = require(CoreModule.share.Server("systems/resources/controllers/resource_controller"));
    CoreModule.resource = new ResourceController.Resource();
    const AnalysisController = require(CoreModule.share.Server("systems/analysis/controllers/analysis_controller"));
    CoreModule.analysis = new AnalysisController.Analysis();
    CoreModule.LocalAccount = require(CoreModule.share.Models("/systems/accounts/account"));
    CoreModule.ShapeEditModule = require(CoreModule.share.Server("systems/common/shape_edit/shape_edit"));
    CoreModule.ServerModule = require(CoreModule.share.Server("systems/common/shape_edit/server_canvas"));
    CoreModule.AdaptorModule = require(CoreModule.share.Server("systems/common/shape_edit/adaptor"));
    class Core {
    }
    CoreModule.Core = Core;
})(CoreModule = exports.CoreModule || (exports.CoreModule = {}));
module.exports = CoreModule;
//# sourceMappingURL=gs.js.map