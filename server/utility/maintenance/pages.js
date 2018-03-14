/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MaintenancePageRouter;
(function (MaintenancePageRouter) {
    var express = require('express');
    MaintenancePageRouter.router = express.Router();
    var share = require(process.cwd() + '/server/systems/common/share');
    var config = share.config;
    var services_config = share.services_config;
    var webfonts = services_config.webfonts || [];
    var message = config.message;
    MaintenancePageRouter.router.get("/", [function (request, response) {
            response.render("utility/maintenance/index", { user: null, message: message, status: 503, fonts: webfonts });
        }]);
})(MaintenancePageRouter = exports.MaintenancePageRouter || (exports.MaintenancePageRouter = {}));
module.exports = MaintenancePageRouter.router;
//# sourceMappingURL=pages.js.map