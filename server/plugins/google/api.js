/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GoogleApiRouter;
(function (GoogleApiRouter) {
    var express = require('express');
    GoogleApiRouter.router = express.Router();
    var core = require(process.cwd() + '/gs');
    var share = core.share;
    var exception = core.exception;
    var plugins_config = share.plugins_config;
    if (plugins_config.google_api) {
        var GoogleModule = require(share.Server("plugins/google/controllers/google_controller"));
        var analytics = new GoogleModule.Analytics(plugins_config.google_api.analytics);
        GoogleApiRouter.router.get('/api/ga/:dimensions', [exception.exception, analytics.get]);
    }
})(GoogleApiRouter = exports.GoogleApiRouter || (exports.GoogleApiRouter = {}));
module.exports = GoogleApiRouter.router;
//# sourceMappingURL=api.js.map