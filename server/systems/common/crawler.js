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
    const jsdom = require("node-jsdom");
    const request = require('request');
    class Crawler {
        constractor() {
        }
        Crawl(url, path, type, callback) {
            request.get({ url: url, encoding: null }, (error, response, body) => {
                if (!error) {
                    if (response) {
                        let html = new Buffer(body).toString('utf8');
                        jsdom.env(html, [], (errors, window) => {
                            wgxpath.install(window);
                            let expression = window.document.createExpression(path);
                            let node = expression.evaluate(window.document, type);
                            callback(null, node);
                        });
                    }
                    else {
                        callback({ code: 1, message: "no response" }, null);
                    }
                }
                else {
                    callback(error, null);
                }
            });
        }
    }
    CrawlerModule.Crawler = Crawler;
})(CrawlerModule = exports.CrawlerModule || (exports.CrawlerModule = {}));
module.exports = CrawlerModule;
//# sourceMappingURL=crawler.js.map