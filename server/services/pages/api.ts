/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace PagesApiRouter {

    const express: any = require("express");
    export const router = express.Router();

    const core = require(process.cwd() + '/gs');
    const auth: any = core.auth;
    const share: any = core.share;
    const exception: any = core.exception;

    const PagesModule: any = require(share.Server("services/pages/controllers/pages_controller"));
    const pages: any = new PagesModule.Pages;

    //router.get("/api/getall", [pages.get_all]);
    router.get("/api/getall/:namespace", [exception.exception, exception.guard, exception.authenticate, auth.is_user, pages.get_all]);
}

module.exports = PagesApiRouter.router;