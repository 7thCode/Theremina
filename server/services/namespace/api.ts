/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace NamespaceApiRouter {

    const express: any = require("express");
    export const router = express.Router();

    const core: any = require(process.cwd() + '/gs');
    const share: any = core.share;

    const ExceptionController: any = require(share.Server("systems/common/controllers/exception_controller"));
    const exception: any = new ExceptionController.Exception();

    const NamespsceModule: any = require(share.Server("services/namespace/controllers/namespace_controller"));
    const namespaces: any = new NamespsceModule.Namespsces;

    router.get('/api/namespaces', [exception.exception, exception.authenticate,namespaces.namespaces]);

}

module.exports = NamespaceApiRouter.router;