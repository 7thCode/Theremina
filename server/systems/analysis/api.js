/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AnalysisApiRouter;
(function (AnalysisApiRouter) {
    var express = require('express');
    AnalysisApiRouter.router = express.Router();
    var share = require(process.cwd() + '/server/systems/common/share');
    var ExceptionController = require(share.Server("systems/common/controllers/exception_controller"));
    var exception = new ExceptionController.Exception;
    var AuthController = require(share.Server("systems/auth/controllers/auth_controller"));
    var auth = new AuthController.Auth;
    var AnalysisModule = require(share.Server("systems/analysis/controllers/analysis_controller"));
    var analysis = new AnalysisModule.Analysis;
    AnalysisApiRouter.router.get('/api/:id', [exception.exception, exception.guard, exception.authenticate, auth.is_system, analysis.get_queue]);
    AnalysisApiRouter.router.get('/api/query/:query/:option', [exception.exception, exception.guard, exception.authenticate, auth.is_system, analysis.get_queue_query]);
    AnalysisApiRouter.router.get('/api/count/:query', [exception.exception, exception.guard, exception.authenticate, auth.is_system, analysis.get_queue_count]);
})(AnalysisApiRouter = exports.AnalysisApiRouter || (exports.AnalysisApiRouter = {}));
module.exports = AnalysisApiRouter.router;
//# sourceMappingURL=api.js.map