/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

export namespace LayoutsApiRouter {

    const express: any = require('express');
    export const router: IRouter = express.Router();

    const core: any = require(process.cwd() + '/gs');
    const share: any = core.share;
    const exception: any = core.exception;

    const AuthController: any = require(share.Server("systems/auth/controllers/auth_controller"));
    export const auth: any = new AuthController.Auth();

    const LayoutsModule: any = require(share.Server("services/layouts/controllers/layouts_controller"));
    const layout: any = new LayoutsModule.Layout();

    // for template
    router.get("/template/svg/:name", [exception.exception, layout.get_template_svg]);

    router.post("/template/create", [exception.exception, exception.guard, exception.authenticate, auth.is_system, layout.create_template]);
    router.get("/template/query/:query/:option", [exception.exception, layout.get_template_query]);
    router.get("/template/count/:query", [exception.exception, layout.get_template_count]);
    router.post("/template/svg", [exception.exception, layout.layout_svg]);
    router.post("/template/pdf", [exception.exception, layout.layout_pdf]);

    router.get("/template/:id", [exception.exception, layout.get_template]);
    router.put("/template/:id", [exception.exception, exception.guard, exception.authenticate, auth.is_system, layout.put_template]);
    router.delete("/template/:id", [exception.exception, exception.guard, exception.authenticate, auth.is_system, layout.delete_template]);

    // for layout
    //router.get("/layout/svg/:name", [layout.get_layout_svg]);

    router.post("/layout/create", [exception.exception, exception.guard, exception.authenticate, layout.create_layout]);
    router.get("/layout/query/:query/:option", [exception.exception, layout.get_layout_query]);
    router.get("/layout/count/:query", [exception.exception, layout.get_layout_count]);
    router.post("/layout/svg", [exception.exception, layout.layout_svg]);
    router.post("/layout/pdf", [exception.exception, layout.layout_pdf]);

    router.get("/layout/:id", [layout.get_layout]);
    router.put("/layout/:id", [exception.exception, exception.guard, exception.authenticate, layout.put_layout]);
    router.delete("/layout/:id", [exception.exception, exception.guard, exception.authenticate, layout.delete_layout]);

    router.get("/download/pdf", [exception.exception, layout.download_pdf]);
    router.get("/download/svg", [exception.exception, layout.download_svg]);

    router.delete('/api/own', [exception.exception, exception.guard, exception.authenticate, layout.delete_own]);

}

module.exports = LayoutsApiRouter.router;


