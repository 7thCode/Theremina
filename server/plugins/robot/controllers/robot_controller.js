/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RobotModule;
(function (RobotModule) {
    const _ = require('lodash');
    const core = require(process.cwd() + '/gs');
    const share = core.share;
    const Wrapper = share.Wrapper;
    const CrawlerModule = require('../../../systems/common/crawler');
    const crawler = new CrawlerModule.Crawler();
    const validator = require('validator');
    class Robot {
        constructor() {
            this.type = {
                "ANY_TYPE": 0,
                "NUMBER_TYPE": 1,
                "STRING_TYPE": 2,
                "BOOLEAN_TYPE": 3,
                "UNORDERED_NODE_ITERATOR_TYPE": 4,
                "ORDERED_NODE_ITERATOR_TYPE": 5,
                "UNORDERED_NODE_SNAPSHOT_TYPE": 6,
                "ORDERED_NODE_SNAPSHOT_TYPE": 7,
                "ANY_UNORDERED_NODE_TYPE": 8,
                "FIRST_ORDERED_NODE_TYPE": 9
            };
        }
        get(request, response) {
            const number = 1300;
            let url = decodeURIComponent(request.params.url);
            let path = decodeURIComponent(request.params.path);
            crawler.Crawl(url, "", [], []).then((result) => {
                let nodes = result._value.nodes;
                let urls = [];
                nodes.forEach((node) => {
                    if (node._nodeValue) {
                        urls.push(node._nodeValue);
                    }
                    else if (node._data) {
                        urls.push(node._data);
                    }
                });
                let unique_urls = _.uniq(urls);
                Wrapper.SendSuccess(response, unique_urls);
            }).catch((error) => {
                Wrapper.SendError(response, error.code, error.message, error);
            });
            /*
            crawler.Crawl(url, path, 0, (error: any, result: any): void => {
                if (!error) {
                    let nodes = result._value.nodes;
                    let urls: any[] = [];
                    nodes.forEach((node) => {
                        if (node._nodeValue) {
                            urls.push(node._nodeValue);
                        } else if (node._data) {
                            urls.push(node._data);
                        }
                    });
                    let unique_urls = _.uniq(urls);
                    Wrapper.SendSuccess(response, unique_urls);
                } else {
                    Wrapper.SendError(response, error.code, error.message, error);
                }
            });
            */
        }
        // public Crawl(url: string, path: string, type: any, callback: () => void) {
        //     crawler.Crawl(url, path, type, callback);
        // }
        LinkUrls(url, callback) {
            let path = '/html/body//a/@href';
            crawler.Crawl(url, "", [], []).then((result) => {
                let nodes = result._value.nodes;
                let urls = [];
                nodes.forEach((node) => {
                    urls.push(node._nodeValue);
                });
                callback(null, urls);
            });
        }
    }
    RobotModule.Robot = Robot;
})(RobotModule = exports.RobotModule || (exports.RobotModule = {}));
module.exports = RobotModule;
//# sourceMappingURL=robot_controller.js.map