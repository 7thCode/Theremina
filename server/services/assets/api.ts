/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

export namespace AssetsApiRouter {

    const express: any = require("express");
    export const router: IRouter = express.Router();

    const core: any = require(process.cwd() + "/gs");
    const share: any = core.share;

    const ExceptionController: any = require(share.Server("systems/common/controllers/exception_controller"));
    const exception: any = new ExceptionController.Exception();

    const AssetsModule: any = require(share.Server("services/assets/controllers/assets_controller"));
    const asset: any = new AssetsModule.Asset;

    router.post('/api/createasset', [exception.exception, asset.create]);

}

module.exports = AssetsApiRouter.router;