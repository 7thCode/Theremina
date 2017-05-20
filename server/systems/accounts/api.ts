/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace AccountApiRouter {

    const express = require('express');
    export const router = express.Router();

    const share = require(process.cwd() + '/server/systems/common/share');

    const AuthController: any = require(share.Server("systems/auth/controllers/auth_controller"));
    export const auth: any = new AuthController.Auth();

    const AccountModule: any = require(share.Server("systems/accounts/controllers/account_controller"));
    const accounts: any = new AccountModule.Accounts;
    const ExceptionController: any = require(share.Server("systems/common/controllers/exception_controller"));
    const exception: any = new ExceptionController.Exception;

    router.get("/api/:username", [exception.exception, exception.guard, exception.authenticate,auth.is_system, accounts.get_account]);
    router.put("/api/:username", [exception.exception, exception.guard, exception.authenticate,auth.is_system, accounts.put_account]);

    router.get('/api/query/:query/:option', [exception.exception, exception.guard, exception.authenticate, accounts.get_account_query_query]);
    router.get('/api/count/:query', [exception.exception, exception.guard, exception.authenticate, accounts.get_account_count]);
    router.delete('/api/own', [exception.exception, exception.guard, exception.authenticate,auth.is_system, accounts.delete_own]);
}

module.exports = AccountApiRouter.router;

