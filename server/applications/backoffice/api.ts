/**!
 Copyright (c) 2016 7thCode.
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */


"use strict";

export namespace BackofficeApiRouter {

    const express: any = require('express');
    export const router: any = express.Router();

    const core: any = require(process.cwd() + '/core');
    const share: any = core.share;
}

module.exports = BackofficeApiRouter.router;