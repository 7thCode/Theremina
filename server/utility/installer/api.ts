/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

export namespace InstallerApiRouter {

    const express = require('express');
    export const router: IRouter = express.Router();

    const InstallerModule: any = require("./controllers/installer_controller");
    const installer: any = new InstallerModule.Installer();

    router.get('/install', [installer.read]);
    router.put('/install', [installer.write]);

}

module.exports = InstallerApiRouter.router;

