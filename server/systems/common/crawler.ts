/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

//wgxpath.XPathResultType.STRING_TYPE

"use strict";

export namespace CrawlerModule {

    const wgxpath: any = require('wgxpath');
    const jsdom: any = require("jsdom");
    const {JSDOM} = jsdom;

    const request: any = require('request');

    export class Crawler {

        private count = 0;
        private jar;

        constractor() {

        }

        public Crawl(url: string, param: object, cookies, expressions: object): any {
            //this.count++;

            let jar = request.jar();
            cookies.forEach((entry) => {
                let cookie = request.cookie(entry.cookie);
                jar.setCookie(cookie, entry.domain);
            });

            return new Promise((resolve: any, reject: any): void => {
                //    setTimeout(() => {
                request({
                    uri: url,
                    method: 'GET',
                    jar: jar
                }, (error: any, response: any, body: string): void => {
                    if (!error) {
                        let dom = new JSDOM(body);
                        if (dom) {
                            let window = dom.window;
                            if (window) {
                                wgxpath.install(window);
                                let result = {};
                                let keys = Object.keys(expressions);
                                keys.forEach((key: string): void => {
                                    let expression_for_key = window.document.createExpression(expressions[key]);
                                    result[key] = expression_for_key.evaluate(window.document, wgxpath.XPathResultType.STRING_TYPE).stringValue;
                                });
                                resolve({param: param, result: result});
                            } else {
                                reject({code: 1, message: "html error"});
                            }
                        }
                    }
                });
                //      }, 10000 * this.count);
            });
        }
    }
}

module.exports = CrawlerModule;










