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
    var wgxpath = require('wgxpath');
    var jsdom = require("jsdom");
    var JSDOM = jsdom.JSDOM;
    var request = require('request');
    var Crawler = /** @class */ (function () {
        function Crawler() {
            this.count = 0;
        }
        Crawler.prototype.constractor = function () {
        };
        Crawler.prototype.Crawl = function (url, param, cookies, expressions) {
            //this.count++;
            var jar = request.jar();
            cookies.forEach(function (entry) {
                var cookie = request.cookie(entry.cookie);
                jar.setCookie(cookie, entry.domain);
            });
            return new Promise(function (resolve, reject) {
                //    setTimeout(() => {
                request({
                    uri: url,
                    method: 'GET',
                    jar: jar
                }, function (error, response, body) {
                    if (!error) {
                        var dom = new JSDOM(body);
                        if (dom) {
                            var window_1 = dom.window;
                            if (window_1) {
                                wgxpath.install(window_1);
                                var result_1 = {};
                                var keys = Object.keys(expressions);
                                keys.forEach(function (key) {
                                    var expression_for_key = window_1.document.createExpression(expressions[key]);
                                    result_1[key] = expression_for_key.evaluate(window_1.document, wgxpath.XPathResultType.STRING_TYPE).stringValue;
                                });
                                resolve({ param: param, result: result_1 });
                            }
                            else {
                                reject({ code: 1, message: "html error" });
                            }
                        }
                    }
                });
                //      }, 10000 * this.count);
            });
        };
        return Crawler;
    }());
    CrawlerModule.Crawler = Crawler;
})(CrawlerModule = exports.CrawlerModule || (exports.CrawlerModule = {}));
module.exports = CrawlerModule;
//# sourceMappingURL=crawler.js.map