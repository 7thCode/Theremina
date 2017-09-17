/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AnalysisModule;
(function (AnalysisModule) {
    const _ = require("lodash");
    const share = require(process.cwd() + '/server/systems/common/share');
    const config = share.config;
    const Wrapper = share.Wrapper;
    const Memory = share.Memory;
    const QueueModel = require(share.Models("systems/queues/queue"));
    class Analysis {
        constructor() {
        }
        static process_queue(queue, callback) {
            let promises = [];
            let write = (data) => {
                return () => {
                    return new Promise((resolve, reject) => {
                        let element = new QueueModel();
                        element.content = data;
                        element.save((error) => {
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
            _.forEach(queue, (data) => {
                promises.push(write(data));
            });
            promises.reduce((prev, current) => {
                return prev.then(current);
            }, Promise.resolve()).then(() => {
                callback(null);
            }).catch((error) => {
                callback(error);
            });
        }
        /**
         * @param data
         * @returns none
         */
        event(data) {
            Memory.push(data);
            if (Memory.length > config.analysis.count) {
                Analysis.process_queue(Memory, () => {
                    Memory.splice(0, Memory.length);
                });
            }
        }
        /**
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        page_view(request, response, next) {
            let data = {
                type: "pv",
                time: new Date(),
                address: request.connection.remoteAddress,
                headers: request.headers['user-agent'],
                referer: request.headers.referer
            };
            Memory.push(data);
            if (Memory.length > config.analysis.count) {
                Analysis.process_queue(Memory, () => {
                    Memory.splice(0, Memory.length);
                });
            }
            next();
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        get_queue(request, response) {
            const number = 1300;
            let id = request.params.id;
            Wrapper.FindOne(response, number, QueueModel, { _id: id }, (response, page) => {
                if (page) {
                    Wrapper.SendSuccess(response, page);
                }
                else {
                    Wrapper.SendWarn(response, 2, "not found", { code: 2, message: "not found" });
                }
            });
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        get_queue_query(request, response) {
            const number = 1400;
            //    let query: any = JSON.parse(decodeURIComponent(request.params.query));
            //    let option: any = JSON.parse(decodeURIComponent(request.params.option));
            let query = Wrapper.Decode(request.params.query);
            let option = Wrapper.Decode(request.params.option);
            Wrapper.Find(response, number, QueueModel, query, {}, option, (response, pages) => {
                Wrapper.SendSuccess(response, pages);
            });
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        get_queue_count(request, response) {
            const number = 2800;
            //    let query: any = JSON.parse(decodeURIComponent(request.params.query));
            let query = Wrapper.Decode(request.params.query);
            Wrapper.Count(response, number, QueueModel, query, (response, count) => {
                Wrapper.SendSuccess(response, count);
            });
        }
    }
    AnalysisModule.Analysis = Analysis;
})(AnalysisModule = exports.AnalysisModule || (exports.AnalysisModule = {}));
module.exports = AnalysisModule;
//# sourceMappingURL=analysis_controller.js.map