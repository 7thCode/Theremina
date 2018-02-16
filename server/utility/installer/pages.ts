/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

export namespace InstallerPageRouter {

    const express:any = require('express');
    export const router: IRouter = express.Router();

    const share:any = require(process.cwd() + '/server/systems/common/share');

    const config:any = share.config;
    const services_config:any = share.services_config;
    const webfonts:any[] = services_config.webfonts;

    const message:any = config.message;

    router.get("/", [(request: any, response: any): void => {
        response.render("utility/installer/index", {user: null, message: message, status: 200, fonts:webfonts});
    }]);
}

module.exports = InstallerPageRouter.router;