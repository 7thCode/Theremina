/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace MaintenanceApiRouter {

    const express = require('express');
    export const router = express.Router();

    const MaintenanceModule: any = require("./controllers/maintenance_controller");
    const Maintenance: any = new MaintenanceModule.Installer();

//    router.get('/install', [installer.read]);
//    router.put('/install', [installer.write]);

}

module.exports = MaintenanceApiRouter.router;

