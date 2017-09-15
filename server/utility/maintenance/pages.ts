/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace MaintenancePageRouter {

    const express = require('express');
    export const router = express.Router();

    const share = require(process.cwd() + '/server/systems/common/share');

    const config: any = share.config;
    const services_config = share.services_config;
    const webfonts:any[] = services_config.webfonts;

    let message = config.message;

    router.get("/", [(request: any, response: any): void => {
        response.render("utility/maintenance/index", {user: null, message: message, status: 503, fonts:webfonts});
    }]);
}

module.exports = MaintenancePageRouter.router;