/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace ConverterApiRouter {

    const express = require('express');
    export const router = express.Router();

    const core = require(process.cwd() + '/gs');
    const share: any = core.share;

    const AuthController: any = require(share.Server("systems/auth/controllers/auth_controller"));
    const auth: any = new AuthController.Auth();

    const ConverterModule: any = require(share.Server("plugins/converter/controllers/converter_controller"));
    const excel: any = new ConverterModule.Excel();
    const downloader: any = new ConverterModule.Downloader();

    router.get("/api/account/excel/:filename", [excel.account]);

    router.get("/api/download/:filename", [downloader.download]);

}

module.exports = ConverterApiRouter.router;

