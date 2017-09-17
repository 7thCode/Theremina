/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RobotApiRouter;
(function (RobotApiRouter) {
    const express = require('express');
    RobotApiRouter.router = express.Router();
    const core = require(process.cwd() + '/gs');
    const share = core.share;
    const exception = core.exception;
    const RobotModule = require(share.Server("plugins/robot/controllers/robot_controller"));
    const robot = new RobotModule.Robot();
    RobotApiRouter.router.get("/api/xpath/:url/:path", [exception.exception, exception.guard, exception.authenticate, robot.get]);
})(RobotApiRouter = exports.RobotApiRouter || (exports.RobotApiRouter = {}));
module.exports = RobotApiRouter.router;
//# sourceMappingURL=api.js.map