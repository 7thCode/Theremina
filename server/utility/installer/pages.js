/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InstallerPageRouter;
(function (InstallerPageRouter) {
    var express = require('express');
    InstallerPageRouter.router = express.Router();
    var share = require(process.cwd() + '/server/systems/common/share');
    var config = share.config;
    var services_config = share.services_config;
    var webfonts = services_config.webfonts || [];
    var message = config.message;
    InstallerPageRouter.router.get("/", [function (request, response) {
            response.render("utility/installer/index", { user: null, message: message, status: 200, fonts: webfonts });
        }]);
})(InstallerPageRouter = exports.InstallerPageRouter || (exports.InstallerPageRouter = {}));
module.exports = InstallerPageRouter.router;
//# sourceMappingURL=pages.js.map