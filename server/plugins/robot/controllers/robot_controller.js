/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RobotModule;
(function (RobotModule) {
    var _ = require('lodash');
    var core = require(process.cwd() + '/gs');
    var share = core.share;
    var Wrapper = share.Wrapper;
    var CrawlerModule = require('../../../systems/common/crawler');
    var crawler = new CrawlerModule.Crawler();
    var validator = require('validator');
    var Robot = /** @class */ (function () {
        function Robot() {
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
        Robot.prototype.get = function (request, response) {
            var number = 1300;
            var url = decodeURIComponent(request.params.url);
            var path = decodeURIComponent(request.params.path);
            crawler.Crawl(url, "", [], []).then(function (result) {
                var nodes = result._value.nodes;
                var urls = [];
                nodes.forEach(function (node) {
                    if (node._nodeValue) {
                        urls.push(node._nodeValue);
                    }
                    else if (node._data) {
                        urls.push(node._data);
                    }
                });
                var unique_urls = _.uniq(urls);
                Wrapper.SendSuccess(response, unique_urls);
            }).catch(function (error) {
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
        };
        // public Crawl(url: string, path: string, type: any, callback: () => void) {
        //     crawler.Crawl(url, path, type, callback);
        // }
        Robot.prototype.LinkUrls = function (url, callback) {
            var path = '/html/body//a/@href';
            crawler.Crawl(url, "", [], []).then(function (result) {
                var nodes = result._value.nodes;
                var urls = [];
                nodes.forEach(function (node) {
                    urls.push(node._nodeValue);
                });
                callback(null, urls);
            });
        };
        return Robot;
    }());
    RobotModule.Robot = Robot;
})(RobotModule = exports.RobotModule || (exports.RobotModule = {}));
module.exports = RobotModule;
//# sourceMappingURL=robot_controller.js.map