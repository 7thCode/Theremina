/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GroupApiRouter;
(function (GroupApiRouter) {
    const express = require('express');
    GroupApiRouter.router = express.Router();
    const core = require(process.cwd() + '/gs');
    const share = core.share;
    const exception = core.exception;
    const GroupModule = require(share.Server("services/groups/controllers/group_controller"));
    const group = new GroupModule.Group;
    GroupApiRouter.router.post("/api/own", [exception.exception, exception.guard, exception.authenticate, group.own_group]);
    GroupApiRouter.router.post("/api/create", [exception.exception, exception.guard, exception.authenticate, group.create_group]);
    GroupApiRouter.router.get("/api/:id", [group.get_group]);
    GroupApiRouter.router.put("/api/:id", [exception.exception, exception.guard, exception.authenticate, group.put_group]);
    GroupApiRouter.router.delete("/api/:id", [exception.exception, exception.guard, exception.authenticate, group.delete_group]);
    GroupApiRouter.router.get('/api/query/:query/:option', [group.get_group_query_query]);
    GroupApiRouter.router.get("/api/count/:query", [group.get_group_count]);
    GroupApiRouter.router.delete('/api/own', [exception.exception, exception.guard, exception.authenticate, group.delete_own]);
})(GroupApiRouter = exports.GroupApiRouter || (exports.GroupApiRouter = {}));
module.exports = GroupApiRouter.router;
//# sourceMappingURL=api.js.map