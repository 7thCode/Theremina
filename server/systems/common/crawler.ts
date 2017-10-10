/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

//wgxpath.XPathResultType.STRING_TYPE

"use strict";

export namespace CrawlerModule {

    const wgxpath = require('wgxpath');
    const jsdom = require("jsdom");
    const {JSDOM} = jsdom;

    const request = require('request');

    export class Crawler {

        constractor() {

        }

        public Crawl(url_: string, path: string, type: number, callback: (error: any, result: string) => void): void {

            let url = 'https://shopping.yahoo.co.jp/search;_ylt=A7dPI1TT7dVZOD8AVHOkKdhE?p=' +
                encodeURIComponent("RJ45") +
                '&aq=&oq=&ei=UTF-8&first=1&ss_first=1&tab_ex=commerce&uIv=on&X=2&mcr=af1d4481817ea02898809ce62a384f03&ts=1507192276&di=&cid=&uIv=on&used=0&pf=&pt=&seller=0&mm_Check=&sc_i=shp_pc_search_searchBox';

            let expressionString_for_name = '//div[@class="elList"]/ul/li[@data-item-pos="1"]/div/div/div/dl/dd/h3/a/span';

            let expressionString = '//div[@class="elList"]/ul/li[@data-item-pos="1"]/div/div/div/dl/dd[@class="elPrice"]/p/span';

            JSDOM.fromURL(url, {
                userAgent: ""
            }).then((dom) => {
                let window = dom.window;
                if (window) {
                    wgxpath.install(window);
                    let expression = window.document.createExpression(expressionString);
                    let result = expression.evaluate(window.document, wgxpath.XPathResultType.STRING_TYPE);
                    if (result.stringValue.length > 0) {
                        let a = result.stringValue;
                    } else {
                        let b = 1;
                    }
                }

            });

        }
    }
}

module.exports = CrawlerModule;










