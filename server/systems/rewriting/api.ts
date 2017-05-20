/**!
 Copyright (c) 2016 Naoma Matsumoto.
 */

"use strict";

export namespace RewritingApiRouter {

    const express = require('express');
    export const router = express.Router();

    const share = require(process.cwd() + '/server/systems/common/share');

    const ExceptionController: any = require("../common/controllers/exception_controller");
    const exception: any = new ExceptionController.Exception();

    const AuthController: any = require(share.Server("systems/auth/controllers/auth_controller"));
    const auth: any = new AuthController.Auth;

    const RewritingModule: any = require("./controllers/rewriting_controller");
    const Rewriting: any = new RewritingModule.Rewriting();

    router.put('/update', [Rewriting.writing]);

    router.get('/query/:path', [exception.exception, exception.guard, exception.authenticate,auth.is_system, Rewriting.rewritingQuery]);
    //router.get('/jsonQuery/:path',[Rewriting.read_dir]);

    //router.get('/DirectoryQuery',[exception.exception, exception.guard, exception.authenticate, Rewriting.DirectoryQuery]);
    router.get('/DirectoryQuery/:path', [Rewriting.read_dir]);
    router.get('/init', [exception.exception, exception.guard, exception.authenticate, Rewriting.rewritingInit]);

}

module.exports = RewritingApiRouter.router;

