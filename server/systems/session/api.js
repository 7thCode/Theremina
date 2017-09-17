/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SessionApiRouter;
(function (SessionApiRouter) {
    const express = require('express');
    SessionApiRouter.router = express.Router();
    const core = require(process.cwd() + '/gs');
    const share = core.share;
    const exception = core.exception;
    const SessionModule = require(share.Server("systems/session/controllers/session_controller"));
    const session = new SessionModule.Session;
    SessionApiRouter.router.get("/api", [exception.exception, exception.guard, exception.authenticate, session.get]);
    SessionApiRouter.router.put("/api", [exception.exception, exception.guard, exception.authenticate, session.put]);
})(SessionApiRouter = exports.SessionApiRouter || (exports.SessionApiRouter = {}));
module.exports = SessionApiRouter.router;
//# sourceMappingURL=api.js.map