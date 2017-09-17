/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GoogleApiRouter;
(function (GoogleApiRouter) {
    const express = require('express');
    GoogleApiRouter.router = express.Router();
    const core = require(process.cwd() + '/gs');
    const share = core.share;
    const exception = core.exception;
    const plugins_config = share.plugins_config;
    if (plugins_config.google_api) {
        const GoogleModule = require(share.Server("plugins/google/controllers/google_controller"));
        const analytics = new GoogleModule.Analytics(plugins_config.google_api.analytics);
        GoogleApiRouter.router.get('/api/ga/:dimensions', [exception.exception, analytics.get]);
    }
})(GoogleApiRouter = exports.GoogleApiRouter || (exports.GoogleApiRouter = {}));
module.exports = GoogleApiRouter.router;
//# sourceMappingURL=api.js.map