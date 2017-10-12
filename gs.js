/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ReferencePointModule;
(function (ReferencePointModule) {
    const root_path = process.cwd();
    ReferencePointModule.share = require(root_path + "/server/systems/common/share");
    const ExceptionController = require(ReferencePointModule.share.Server("systems/common/controllers/exception_controller"));
    ReferencePointModule.exception = new ExceptionController.Exception();
    const AccountController = require(ReferencePointModule.share.Server("systems/accounts/controllers/account_controller"));
    ReferencePointModule.account = new AccountController.Accounts();
    const AnalysisController = require(ReferencePointModule.share.Server("systems/analysis/controllers/analysis_controller"));
    ReferencePointModule.analysis = new AnalysisController.Analysis();
    const AuthController = require(ReferencePointModule.share.Server("systems/auth/controllers/auth_controller"));
    ReferencePointModule.auth = new AuthController.Auth();
    const FileController = require(ReferencePointModule.share.Server("systems/files/controllers/file_controller"));
    ReferencePointModule.file = new FileController.Files();
    const ResourceController = require(ReferencePointModule.share.Server("systems/resources/controllers/resource_controller"));
    ReferencePointModule.resource = new ResourceController.Resource();
    ReferencePointModule.LocalAccount = require(ReferencePointModule.share.Models("/systems/accounts/account"));
    ReferencePointModule.ShapeEditModule = require(ReferencePointModule.share.Server("systems/common/shape_edit/shape_edit"));
    ReferencePointModule.ServerModule = require(ReferencePointModule.share.Server("systems/common/shape_edit/server_canvas"));
    ReferencePointModule.AdaptorModule = require(ReferencePointModule.share.Server("systems/common/shape_edit/adaptor"));
    class ReferencePoint {
    }
    ReferencePointModule.ReferencePoint = ReferencePoint;
})(ReferencePointModule = exports.ReferencePointModule || (exports.ReferencePointModule = {}));
module.exports = ReferencePointModule;
//# sourceMappingURL=gs.js.map