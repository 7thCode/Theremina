/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var InterceptorModule;
(function (InterceptorModule) {
    const _ = require("lodash");
    const share = require(process.cwd() + '/server/systems/common/share');
    const AnalysisModule = require(share.Server("systems/analysis/controllers/analysis_controller"));
    const analysis = new AnalysisModule.Analysis;
    InterceptorModule.Handler = (request, response, next) => {
        return {
            isInterceptable: () => {
                let result = false;
                let type = response.get('Content-Type');
                if (type) {
                    result = /text\/html/.test(type);
                }
                return result;
            },
            intercept: (html, send) => {
                analysis.page_view(request, response, next);
            }
        };
    };
})(InterceptorModule = exports.InterceptorModule || (exports.InterceptorModule = {}));
module.exports = InterceptorModule;
//# sourceMappingURL=interceptor.js.map