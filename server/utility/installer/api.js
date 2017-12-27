/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InstallerApiRouter;
(function (InstallerApiRouter) {
    var express = require('express');
    InstallerApiRouter.router = express.Router();
    var InstallerModule = require("./controllers/installer_controller");
    var installer = new InstallerModule.Installer();
    InstallerApiRouter.router.get('/install', [installer.read]);
    InstallerApiRouter.router.put('/install', [installer.write]);
})(InstallerApiRouter = exports.InstallerApiRouter || (exports.InstallerApiRouter = {}));
module.exports = InstallerApiRouter.router;
//# sourceMappingURL=api.js.map