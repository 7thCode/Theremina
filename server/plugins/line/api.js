/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LineApiRouter;
(function (LineApiRouter) {
    const express = require('express');
    LineApiRouter.router = express.Router();
    const core = require(process.cwd() + '/gs');
    const share = core.share;
    const plugins_config = share.plugins_config;
    if (plugins_config.line) {
        const exception = core.exception;
        const LineModule = require(share.Server("plugins/line/controllers/line_controller"));
        const line = new LineModule.Line;
        const bodyParser = require('body-parser');
        LineApiRouter.router.use(bodyParser.json({
            verify(req, res, buf) {
                req.rawBody = buf;
            }
        }));
        LineApiRouter.router.post("/webhook/", [exception.exception, line.bot_hook]);
        LineApiRouter.router.get("/push/:message", [exception.exception, line.bot_push]);
    }
})(LineApiRouter = exports.LineApiRouter || (exports.LineApiRouter = {}));
module.exports = LineApiRouter.router;
//# sourceMappingURL=api.js.map