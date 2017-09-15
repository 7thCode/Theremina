/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace GoogleApiRouter {

    const express = require('express');
    export const router = express.Router();

    const core = require(process.cwd() + '/gs');
    const share: any = core.share;
    const exception: any = core.exception;
    const plugins_config = share.plugins_config;

    if (plugins_config.google_api) {
        const GoogleModule: any = require(share.Server("plugins/google/controllers/google_controller"));
        const analytics: any = new GoogleModule.Analytics(plugins_config.google_api.analytics);

        router.get('/api/ga/:dimensions',[exception.exception, analytics.get]);
    }

}

module.exports = GoogleApiRouter.router;

