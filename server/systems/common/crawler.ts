/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

//wgxpath.XPathResultType.STRING_TYPE

"use strict";

export namespace CrawlerModule {

    const wgxpath = require('wgxpath');
    const jsdom = require("node-jsdom");
    const request = require('request');

    export class Crawler {

        constractor() {

        }

        public Crawl(url: string, path: string, type: number, callback: (error: any, result: string) => void): void {
            request.get({url: url, encoding: null},
                (error:any, response:any, body:any): void => {
                    if (!error) {
                        if (response) {
                            let html = new Buffer(body).toString('utf8');
                            jsdom.env(
                                html,
                                [],
                                (errors:any, window:any):void => {
                                    wgxpath.install(window);
                                    let expression = window.document.createExpression(path);
                                    let node = expression.evaluate(window.document, type);
                                    callback(null, node);
                                }
                            );
                        } else {
                            callback({code: 1, message: "no response"}, null);
                        }
                    } else {
                        callback(error, null);
                    }
                });
        }

    }
}

module.exports = CrawlerModule;
