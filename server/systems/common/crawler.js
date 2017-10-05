/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
//wgxpath.XPathResultType.STRING_TYPE
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CrawlerModule;
(function (CrawlerModule) {
    const wgxpath = require('wgxpath');
    const jsdom = require("jsdom");
    const { JSDOM } = jsdom;
    const request = require('request');
    class Crawler {
        constractor() {
        }
        Crawl(url, path, type, callback) {
            //        request.get({url: url, encoding: null},
            //            (error:any, response:any, body:any): void => {
            //                if (!error) {
            //                    if (response) {
            //                        let html = new Buffer(body).toString('utf8');
            //                        jsdom.env(
            //                            html,
            //                            [],
            //                            (errors:any, window:any):void => {
            //                                wgxpath.install(window);
            //                                let expression = window.document.createExpression(path);
            //                                let node = expression.evaluate(window.document, type);
            //                                callback(null, node);
            //                            }
            //                        );
            //                    } else {
            //                        callback({code: 1, message: "no response"}, null);
            //                    }
            //                } else {
            //                    callback(error, null);
            //                }
            //            });
            //    }
        }
    }
    CrawlerModule.Crawler = Crawler;
    module.exports = CrawlerModule;
})(CrawlerModule = exports.CrawlerModule || (exports.CrawlerModule = {}));
//# sourceMappingURL=crawler.js.map