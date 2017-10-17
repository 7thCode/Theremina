/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace AssetsApiRouter {

    const express: any = require("express");
    export const router = express.Router();

    const core = require(process.cwd() + "/gs");
    const share: any = core.share;

    const ExceptionController: any = require(share.Server("systems/common/controllers/exception_controller"));
    const exception: any = new ExceptionController.Exception();

    const AssetsModule: any = require(share.Server("services/assets/controllers/assets_controller"));
    const asset: any = new AssetsModule.Asset;

    router.post('/api/createasset', asset.create);

}

module.exports = AssetsApiRouter.router;