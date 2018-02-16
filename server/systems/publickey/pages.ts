/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

export namespace PublicKeyPageRouter {

    const express: any = require('express');
    export const router: IRouter = express.Router();

    //const core = require(process.cwd() + '/gs');
    //const share: any = core.share;
    //const auth: any = core.auth;
    //const exception: any = core.exception;
    //const analysis: any = core.analysis;

}

module.exports = PublicKeyPageRouter.router;