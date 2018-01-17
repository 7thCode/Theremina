/**!
 * Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 * This software is released under the MIT License.
 * //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace ReferencePointModule {

    const root_path = process.cwd();

    export const share = require(root_path + "/server/systems/common/share");

    const ExceptionController: any = require(share.Server("systems/common/controllers/exception_controller"));
    export const exception: any = new ExceptionController.Exception();

    const AccountController: any = require(share.Server("systems/accounts/controllers/account_controller"));
    export const account: any = new AccountController.Accounts();

    const AnalysisController: any = require(share.Server("systems/analysis/controllers/analysis_controller"));
    export const analysis: any = new AnalysisController.Analysis();

    const AuthController: any = require(share.Server("systems/auth/controllers/auth_controller"));
    export const auth: any = new AuthController.Auth();

    const FileController: any = require(share.Server("systems/files/controllers/file_controller"));
    export const file: any = new FileController.Files();

    const ResourceController: any = require(share.Server("systems/resources/controllers/resource_controller"));
    export const resource: any = new ResourceController.Resource();

    export const LocalAccount: any = require(share.Models("/systems/accounts/account"));

    export const ShapeEditModule: any = require(share.Server("systems/common/shape_edit/shape_edit"));
    export const ServerModule: any = require(share.Server("systems/common/shape_edit/server_canvas"));
    export const AdaptorModule: any = require(share.Server("systems/common/shape_edit/adaptor"));

    export class ReferencePoint {

    }
}

module.exports = ReferencePointModule;
