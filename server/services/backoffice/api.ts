/**!
 Copyright (c) 2016 7thCode.
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

export namespace BackofficeApiRouter {

    const express: any = require('express');
    export const router: IRouter = express.Router();

}

module.exports = BackofficeApiRouter.router;