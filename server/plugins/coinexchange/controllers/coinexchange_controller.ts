/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {router} from "../api";

export namespace CoinExchangeModule {

    const _: any = require('lodash');

    const mongodb: any = require('mongodb');
    const MongoClient: any = require('mongodb').MongoClient;

    var _request = require('request');


    const core: any = require(process.cwd() + '/gs');
    const share: any = core.share;

    const config: any = share.config;
    const Cipher: any = share.Cipher;


    export class CoinExchange {

        constructor() {

        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public getmarkets(request: any, response: any, next: any): void {
            try {
                var options = {
                    url: 'https://www.coinexchange.io/api/v1/getmarkets',
                    json: true
                };
                _request.get(options, function (error, _response, body) {
                    if (!error && _response.statusCode == 200) {
                        response.send(JSON.stringify(body));
                    } else {
                        console.log('error: '+ response.statusCode);
                    }
                });
            } catch (e) {
                next();
            }
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public getmarketsummaries(request: any, response: any, next: any): void {
            try {
                var options = {
                    url: 'https://www.coinexchange.io/api/v1/getmarkets',
                    json: true
                };
                _request.get(options, function (error, _response, body) {
                    if (!error && _response.statusCode == 200) {
                        response.send(JSON.stringify(body));
                    } else {
                        console.log('error: '+ response.statusCode);
                    }
                });
            } catch (e) {
                next();
            }
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public getmarketsummary(request: any, response: any, next: any): void {
            try {
                var options = {
                    url: 'https://www.coinexchange.io/api/v1/getmarketsummary?market_id='+ request.params.id,
                    json: true
                };
                _request.get(options, function (error, _response, body) {
                    if (!error && _response.statusCode == 200) {
                        response.send(JSON.stringify(body));
                    } else {
                        console.log('error: '+ response.statusCode);
                    }
                });
            } catch (e) {
                next();
            }
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public getorderbook(request: any, response: any, next: any): void {
            try {
                var options = {
                    url: 'https://www.coinexchange.io/api/v1/getorderbook?market_id=' + request.params.id,
                    json: true
                };
                _request.get(options, function (error, _response, body) {
                    if (!error && _response.statusCode == 200) {
                        response.send(JSON.stringify(body));
                    } else {
                        console.log('error: '+ response.statusCode);
                    }
                });
            } catch (e) {
                next();
            }
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public getcurrencies(request: any, response: any, next: any): void {
            try {
                var options = {
                    url: 'https://www.coinexchange.io/api/v1/getcurrencies',
                    json: true
                };
                _request.get(options, function (error, _response, body) {
                    if (!error && _response.statusCode == 200) {
                        response.send(JSON.stringify(body));
                    } else {
                        console.log('error: '+ response.statusCode);
                    }
                });
            } catch (e) {
                next();
            }
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public getcurrency(request: any, response: any, next: any): void {
            try {
                var options = {
                    url: 'https://www.coinexchange.io/api/v1/getcurrency?ticker_code=' + request.params.code,
                    json: true
                };

                _request.get(options, function (error, _response, body) {
                    if (!error && _response.statusCode == 200) {
                        response.send(JSON.stringify(body));
                    } else {
                        console.log('error: '+ response.statusCode);
                    }
                });
            } catch (e) {
                next();
            }
        }


        /**
         * @param request
         * @param response
         * @returns none
         */
        public getmarkets2(request: any, response: any, next: any): void {
            try {
                var options = {
                    url: 'https://www.coinexchange.io/api/v1/getmarkets',
                    json: true
                };
                _request.get(options, function (error, _response1, body) {
                    if (!error && _response1.statusCode == 200) {
                       let MarketID = null;
                        body.result.some((result) => {
                            if (result.MarketAssetCode == request.params.code) {
                                MarketID =  result.MarketID;
                                return true;
                            }
                        });
                        if (MarketID) {
                            var options = {
                                url: 'https://www.coinexchange.io/api/v1/getmarketsummary?market_id='+  MarketID,
                                json: true
                            };
                            _request.get(options, function (error, _response2, body) {
                                if (!error && _response2.statusCode == 200) {
                                    response.render('plugins/coinexchange/index', {data:body.result});
                                }
                            });
                        } else {
                            response.render('plugins/coinexchange/error');
                        }
                    }
                });
            } catch (e) {
                next();
            }
        }

    }
}

module.exports = CoinExchangeModule;
