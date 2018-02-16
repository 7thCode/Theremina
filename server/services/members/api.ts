/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

export namespace MembersApiRouter {

    const express: any = require("express");
    export const router: IRouter = express.Router();

    const core: any = require(process.cwd() + '/gs');
    const share: any = core.share;

    const ExceptionController: any = require(share.Server("systems/common/controllers/exception_controller"));
    const exception: any = new ExceptionController.Exception();

    const MembersModule: any = require(share.Server("services/members/controllers/members_controller"));
    const members: any = new MembersModule.Members;

    router.get("/api/:username", [exception.exception, exception.guard, exception.authenticate, members.get_member]);
    router.put("/api/:username", [exception.exception, exception.guard, exception.authenticate, members.put_member]);
    router.get('/api/query/:query/:option', [exception.exception, exception.guard, exception.authenticate, members.get_member_query_query]);
    router.get('/api/count/:query', [exception.exception, exception.guard, exception.authenticate, members.get_member_count]);
    router.delete('/api/own', [exception.exception, exception.guard, exception.authenticate, members.delete_own]);

}

module.exports = MembersApiRouter.router;