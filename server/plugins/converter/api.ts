/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

export namespace ConverterApiRouter {

    const express: any = require('express');
    export const router: IRouter = express.Router();

    const core = require(process.cwd() + '/gs');
    const share: any = core.share;

    const ConverterModule: any = require(share.Server("plugins/converter/controllers/converter_controller"));
    const excel: any = new ConverterModule.Excel();
    const downloader: any = new ConverterModule.Downloader();

    router.get("/api/account/excel/:filename", [excel.account]);

    router.get("/api/download/:filename", [downloader.download]);

}

module.exports = ConverterApiRouter.router;

