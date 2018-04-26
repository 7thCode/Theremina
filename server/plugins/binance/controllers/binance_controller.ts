/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace BinanceModule {

    const _: any = require('lodash');

    const mongodb: any = require('mongodb');
    const MongoClient: any = require('mongodb').MongoClient;

    const core: any = require(process.cwd() + '/gs');
    const share: any = core.share;

    const config: any = share.config;
    const Cipher: any = share.Cipher;

    const binance = require('node-binance-api');
    binance.options({
        APIKEY: 'qSrS1tbbyVeNl6XkWiqMO0xf06HKq7KTet5wDLWtMLUKtvwHJRE6oKPIorp2G7dC',
        APISECRET: '3MPMrhFvP3XdQPXPLWwUXIxbNChXzP0LgEUtbWRVlSwr9f99rRqkzhrYbYQspHx1',
        useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
        test: true // If you want to use sandbox mode where orders are simulated
    });

    export class Binance {

        constructor() {

        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_prices(request: any, response: any, next: any): void {
            try {
                binance.bookTickers((error, ticker) => {
      //              console.log("bookTickers()", ticker);
                });
            } catch (e) {
                next();
            }
        }
    }
}

module.exports = BinanceModule;
