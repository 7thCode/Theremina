/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InstallerPageRouter;
(function (InstallerPageRouter) {
    const express = require('express');
    InstallerPageRouter.router = express.Router();
    const share = require(process.cwd() + '/server/systems/common/share');
    const config = share.config;
    const services_config = share.services_config;
    const webfonts = services_config.webfonts;
    let message = config.message;
    InstallerPageRouter.router.get("/", [(request, response) => {
            response.render("utility/installer/index", { user: null, message: message, status: 200, fonts: webfonts });
        }]);
})(InstallerPageRouter = exports.InstallerPageRouter || (exports.InstallerPageRouter = {}));
module.exports = InstallerPageRouter.router;
//# sourceMappingURL=pages.js.map