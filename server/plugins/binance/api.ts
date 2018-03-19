/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

export namespace BinanceApiRouter {

    const express: any = require('express');
    export const router: IRouter = express.Router();

    const core: any = require(process.cwd() + '/gs');
    const share: any = core.share;
    const exception: any = core.exception;

    const BinanceModule: any = require(share.Server("plugins/binance/controllers/binance_controller"));
    const binance: any = new BinanceModule.Binance;

    router.get("/api/prices", [exception.exception, binance.get_prices]);
}

module.exports = BinanceApiRouter.router;

