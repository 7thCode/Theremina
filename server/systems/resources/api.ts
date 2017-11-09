/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace ResourceApiRouter {

    const express = require('express');
    export const router = express.Router();

    const core = require(process.cwd() + '/gs');
    const share: any = core.share;
    const exception: any = core.exception;

    const AuthController: any = require(share.Server("systems/auth/controllers/auth_controller"));
    const auth: any = new AuthController.Auth;

    const ResourcesModule = require(share.Server("systems/resources/controllers/resource_controller"));
    const resource = new ResourcesModule.Resource;

    router.delete('/api/own', [exception.exception, exception.guard, exception.authenticate, resource.delete_own]);

    router.get("/api/mime/types", [resource.get_all_mimetypes]);

    router.post("/api/create", [exception.exception, exception.guard, exception.authenticate, resource.create_resource]);
    router.get("/api/query/:query/:option", [resource.get_resource_query]);
    router.get('/api/count/:query', [resource.get_resource_count]);

    router.get("/api/:id", [resource.get_resource]);
    router.put("/api/:id", [exception.exception, exception.guard, exception.authenticate, resource.put_resource]);
    router.delete("/api/:id", [exception.exception, exception.guard, exception.authenticate, resource.delete_resource]);


}

module.exports = ResourceApiRouter.router;

