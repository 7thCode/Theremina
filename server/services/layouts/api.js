/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LayoutsApiRouter;
(function (LayoutsApiRouter) {
    const express = require('express');
    LayoutsApiRouter.router = express.Router();
    const core = require(process.cwd() + '/gs');
    const share = core.share;
    const exception = core.exception;
    const AuthController = require(share.Server("systems/auth/controllers/auth_controller"));
    LayoutsApiRouter.auth = new AuthController.Auth();
    const LayoutsModule = require(share.Server("services/layouts/controllers/layouts_controller"));
    const layout = new LayoutsModule.Layout();
    // for template
    LayoutsApiRouter.router.get("/template/svg/:name", [layout.get_template_svg]);
    LayoutsApiRouter.router.post("/template/create", [exception.exception, exception.guard, exception.authenticate, LayoutsApiRouter.auth.is_system, layout.create_template]);
    LayoutsApiRouter.router.get("/template/query/:query/:option", [layout.get_template_query]);
    LayoutsApiRouter.router.get("/template/count/:query", [layout.get_template_count]);
    LayoutsApiRouter.router.post("/template/svg", [layout.layout_svg]);
    LayoutsApiRouter.router.post("/template/pdf", [layout.layout_pdf]);
    LayoutsApiRouter.router.get("/template/:id", [layout.get_template]);
    LayoutsApiRouter.router.put("/template/:id", [exception.exception, exception.guard, exception.authenticate, LayoutsApiRouter.auth.is_system, layout.put_template]);
    LayoutsApiRouter.router.delete("/template/:id", [exception.exception, exception.guard, exception.authenticate, LayoutsApiRouter.auth.is_system, layout.delete_template]);
    // for layout
    LayoutsApiRouter.router.get("/layout/svg/:name", [layout.get_layout_svg]);
    LayoutsApiRouter.router.post("/layout/create", [exception.exception, exception.guard, exception.authenticate, layout.create_layout]);
    LayoutsApiRouter.router.get("/layout/query/:query/:option", [layout.get_layout_query]);
    LayoutsApiRouter.router.get("/layout/count/:query", [layout.get_layout_count]);
    LayoutsApiRouter.router.post("/layout/svg", [layout.layout_svg]);
    LayoutsApiRouter.router.post("/layout/pdf", [layout.layout_pdf]);
    LayoutsApiRouter.router.get("/layout/:id", [layout.get_layout]);
    LayoutsApiRouter.router.put("/layout/:id", [exception.exception, exception.guard, exception.authenticate, layout.put_layout]);
    LayoutsApiRouter.router.delete("/layout/:id", [exception.exception, exception.guard, exception.authenticate, layout.delete_layout]);
    LayoutsApiRouter.router.get("/download/pdf", [layout.download_pdf]);
    LayoutsApiRouter.router.get("/download/svg", [layout.download_svg]);
    LayoutsApiRouter.router.delete('/api/own', [exception.exception, exception.guard, exception.authenticate, layout.delete_own]);
})(LayoutsApiRouter = exports.LayoutsApiRouter || (exports.LayoutsApiRouter = {}));
module.exports = LayoutsApiRouter.router;
//# sourceMappingURL=api.js.map