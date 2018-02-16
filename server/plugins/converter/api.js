/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ConverterApiRouter;
(function (ConverterApiRouter) {
    var express = require('express');
    ConverterApiRouter.router = express.Router();
    var core = require(process.cwd() + '/gs');
    var share = core.share;
    var ConverterModule = require(share.Server("plugins/converter/controllers/converter_controller"));
    var excel = new ConverterModule.Excel();
    var downloader = new ConverterModule.Downloader();
    ConverterApiRouter.router.get("/api/account/excel/:filename", [excel.account]);
    ConverterApiRouter.router.get("/api/download/:filename", [downloader.download]);
})(ConverterApiRouter = exports.ConverterApiRouter || (exports.ConverterApiRouter = {}));
module.exports = ConverterApiRouter.router;
//# sourceMappingURL=api.js.map