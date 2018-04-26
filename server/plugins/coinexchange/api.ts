/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

export namespace CoinExchangeApiRouter {

    const express: any = require('express');
    export const router: IRouter = express.Router();

    const core: any = require(process.cwd() + '/gs');
    const share: any = core.share;
    const exception: any = core.exception;

    const CoinExchangeModule: any = require(share.Server("plugins/coinexchange/controllers/coinexchange_controller"));
    const CoinExchange: any = new CoinExchangeModule.CoinExchange;

    router.get("/api/getmarkets", [exception.exception, CoinExchange.getmarkets]);
    router.get("/api/getmarketsummaries", [exception.exception, CoinExchange.getmarketsummaries]);
    router.get("/api/getmarketsummary/:id", [exception.exception, CoinExchange.getmarketsummary]);
    router.get("/api/getorderbook/:id", [exception.exception, CoinExchange.getorderbook]);
    router.get("/api/getcurrencies", [exception.exception, CoinExchange.getcurrencies]);
    router.get("/api/getcurrency/:code", [exception.exception, CoinExchange.getcurrency]);
    router.get("/api/getmarkets2/:code", [exception.exception, CoinExchange.getmarkets2]);
}

module.exports = CoinExchangeApiRouter.router;

