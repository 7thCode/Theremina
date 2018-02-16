/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LayoutsApiRouter;
(function (LayoutsApiRouter) {
    var express = require('express');
    LayoutsApiRouter.router = express.Router();
    var core = require(process.cwd() + '/gs');
    var share = core.share;
    var exception = core.exception;
    var AuthController = require(share.Server("systems/auth/controllers/auth_controller"));
    LayoutsApiRouter.auth = new AuthController.Auth();
    var LayoutsModule = require(share.Server("services/layouts/controllers/layouts_controller"));
    var layout = new LayoutsModule.Layout();
    // for template
    LayoutsApiRouter.router.get("/template/svg/:name", [exception.exception, layout.get_template_svg]);
    LayoutsApiRouter.router.post("/template/create", [exception.exception, exception.guard, exception.authenticate, LayoutsApiRouter.auth.is_system, layout.create_template]);
    LayoutsApiRouter.router.get("/template/query/:query/:option", [exception.exception, layout.get_template_query]);
    LayoutsApiRouter.router.get("/template/count/:query", [exception.exception, layout.get_template_count]);
    LayoutsApiRouter.router.post("/template/svg", [exception.exception, layout.layout_svg]);
    LayoutsApiRouter.router.post("/template/pdf", [exception.exception, layout.layout_pdf]);
    LayoutsApiRouter.router.get("/template/:id", [exception.exception, layout.get_template]);
    LayoutsApiRouter.router.put("/template/:id", [exception.exception, exception.guard, exception.authenticate, LayoutsApiRouter.auth.is_system, layout.put_template]);
    LayoutsApiRouter.router.delete("/template/:id", [exception.exception, exception.guard, exception.authenticate, LayoutsApiRouter.auth.is_system, layout.delete_template]);
    // for layout
    //router.get("/layout/svg/:name", [layout.get_layout_svg]);
    LayoutsApiRouter.router.post("/layout/create", [exception.exception, exception.guard, exception.authenticate, layout.create_layout]);
    LayoutsApiRouter.router.get("/layout/query/:query/:option", [exception.exception, layout.get_layout_query]);
    LayoutsApiRouter.router.get("/layout/count/:query", [exception.exception, layout.get_layout_count]);
    LayoutsApiRouter.router.post("/layout/svg", [exception.exception, layout.layout_svg]);
    LayoutsApiRouter.router.post("/layout/pdf", [exception.exception, layout.layout_pdf]);
    LayoutsApiRouter.router.get("/layout/:id", [layout.get_layout]);
    LayoutsApiRouter.router.put("/layout/:id", [exception.exception, exception.guard, exception.authenticate, layout.put_layout]);
    LayoutsApiRouter.router.delete("/layout/:id", [exception.exception, exception.guard, exception.authenticate, layout.delete_layout]);
    LayoutsApiRouter.router.get("/download/pdf", [exception.exception, layout.download_pdf]);
    LayoutsApiRouter.router.get("/download/svg", [exception.exception, layout.download_svg]);
    LayoutsApiRouter.router.delete('/api/own', [exception.exception, exception.guard, exception.authenticate, layout.delete_own]);
})(LayoutsApiRouter = exports.LayoutsApiRouter || (exports.LayoutsApiRouter = {}));
module.exports = LayoutsApiRouter.router;
//# sourceMappingURL=api.js.map