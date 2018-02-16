/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace InterceptorModule {

    const _: any = require("lodash");

    const share = require(process.cwd() + '/server/systems/common/share');

    const AnalysisModule: any = require(share.Server("systems/analysis/controllers/analysis_controller"));
    const analysis: any = new AnalysisModule.Analysis;

    export const Handler = (request: any, response: any, next: any): any => {
        return {
            isInterceptable: (): boolean => {
                let result: boolean = false;
                let type: string = response.get('Content-Type');
                if (type) {
                    result = /text\/html/.test(type);
                }
                return result;
            },
            intercept: (html: string, send: any): void => {
                analysis.page_view(request, response, next);
            }
        };
    };
}

module.exports = InterceptorModule;