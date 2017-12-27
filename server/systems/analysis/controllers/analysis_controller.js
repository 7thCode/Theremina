/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AnalysisModule;
(function (AnalysisModule) {
    var _ = require("lodash");
    var share = require(process.cwd() + '/server/systems/common/share');
    var config = share.config;
    var Wrapper = share.Wrapper;
    var Memory = share.Memory;
    var QueueModel = require(share.Models("systems/queues/queue"));
    var Analysis = (function () {
        function Analysis() {
        }
        Analysis.process_queue = function (queue, callback) {
            var promises = [];
            var write = function (data) {
                return function () {
                    return new Promise(function (resolve, reject) {
                        var element = new QueueModel();
                        element.content = data;
                        element.save(function (error) {
                            if (!error) {
                                resolve(null);
                            }
                            else {
                                reject(error);
                            }
                        });
                    });
                };
            };
            _.forEach(queue, function (data) {
                promises.push(write(data));
            });
            promises.reduce(function (prev, current) {
                return prev.then(current);
            }, Promise.resolve()).then(function () {
                callback(null);
            }).catch(function (error) {
                callback(error);
            });
        };
        /**
         * @param data
         * @returns none
         */
        Analysis.prototype.event = function (data) {
            Memory.push(data);
            if (Memory.length > config.analysis.count) {
                Analysis.process_queue(Memory, function () {
                    Memory.splice(0, Memory.length);
                });
            }
        };
        /**
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        Analysis.prototype.page_view = function (request, response, next) {
            var data = {
                type: "pv",
                time: new Date(),
                address: request.connection.remoteAddress,
                headers: request.headers['user-agent'],
                referer: request.headers.referer
            };
            Memory.push(data);
            if (Memory.length > config.analysis.count) {
                Analysis.process_queue(Memory, function () {
                    Memory.splice(0, Memory.length);
                });
            }
            next();
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Analysis.prototype.get_queue = function (request, response) {
            var number = 1300;
            var id = request.params.id;
            Wrapper.FindOne(response, number, QueueModel, { _id: id }, function (response, page) {
                if (page) {
                    Wrapper.SendSuccess(response, page);
                }
                else {
                    Wrapper.SendWarn(response, 2, "not found", { code: 2, message: "not found" });
                }
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Analysis.prototype.get_queue_query = function (request, response) {
            var number = 1400;
            //    let query: any = JSON.parse(decodeURIComponent(request.params.query));
            //    let option: any = JSON.parse(decodeURIComponent(request.params.option));
            var query = Wrapper.Decode(request.params.query);
            var option = Wrapper.Decode(request.params.option);
            Wrapper.Find(response, number, QueueModel, query, {}, option, function (response, pages) {
                Wrapper.SendSuccess(response, pages);
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Analysis.prototype.get_queue_count = function (request, response) {
            var number = 2800;
            //    let query: any = JSON.parse(decodeURIComponent(request.params.query));
            var query = Wrapper.Decode(request.params.query);
            Wrapper.Count(response, number, QueueModel, query, function (response, count) {
                Wrapper.SendSuccess(response, count);
            });
        };
        return Analysis;
    }());
    AnalysisModule.Analysis = Analysis;
})(AnalysisModule = exports.AnalysisModule || (exports.AnalysisModule = {}));
module.exports = AnalysisModule;
//# sourceMappingURL=analysis_controller.js.map