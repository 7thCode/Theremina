/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace GoogleApiRouter {

    const express: any = require("express");
    export const router = express.Router();

    const core = require(process.cwd() + "/core");
    const share: any = core.share;
    const plugins_config = share.plugins_config;

}

module.exports = GoogleApiRouter.router;
