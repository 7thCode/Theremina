/**!
 Copyright (c) 2016 7thCode.
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace NamespacePageRouter {

    const express = require('express');
    export const router = express.Router();

    const core = require(process.cwd() + '/gs');
    const share: any = core.share;
    const config: any = share.config;
    const auth: any = core.auth;
    const exception: any = core.exception;
    const analysis: any = core.analysis;

    let message = config.message;

    router.get('/dialogs/set_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('services/namespace/dialogs/set_dialog', {message: message});
    }]);

}

module.exports = NamespacePageRouter.router;