/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

export namespace RobotApiRouter {

    const express = require('express');
    export const router: IRouter = express.Router();

    const core = require(process.cwd() + '/gs');
    const share: any = core.share;
    const exception: any = core.exception;

    const RobotModule: any = require(share.Server("plugins/robot/controllers/robot_controller"));
    const robot: any = new RobotModule.Robot();

    router.get("/api/xpath/:url/:path", [exception.exception, exception.guard, exception.authenticate, robot.get]);

}

module.exports = RobotApiRouter.router;

