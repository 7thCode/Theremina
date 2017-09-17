/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AnalysisApiRouter;
(function (AnalysisApiRouter) {
    const express = require('express');
    AnalysisApiRouter.router = express.Router();
    const share = require(process.cwd() + '/server/systems/common/share');
    const ExceptionController = require(share.Server("systems/common/controllers/exception_controller"));
    const exception = new ExceptionController.Exception;
    const AuthController = require(share.Server("systems/auth/controllers/auth_controller"));
    const auth = new AuthController.Auth;
    const AnalysisModule = require(share.Server("systems/analysis/controllers/analysis_controller"));
    const analysis = new AnalysisModule.Analysis;
    AnalysisApiRouter.router.get('/api/:id', [exception.exception, exception.guard, exception.authenticate, auth.is_system, analysis.get_queue]);
    AnalysisApiRouter.router.get('/api/query/:query/:option', [exception.exception, exception.guard, exception.authenticate, auth.is_system, analysis.get_queue_query]);
    AnalysisApiRouter.router.get('/api/count/:query', [exception.exception, exception.guard, exception.authenticate, auth.is_system, analysis.get_queue_count]);
})(AnalysisApiRouter = exports.AnalysisApiRouter || (exports.AnalysisApiRouter = {}));
module.exports = AnalysisApiRouter.router;
//# sourceMappingURL=api.js.map