/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AccountApiRouter;
(function (AccountApiRouter) {
    var express = require('express');
    AccountApiRouter.router = express.Router();
    var share = require(process.cwd() + '/server/systems/common/share');
    var AuthController = require(share.Server("systems/auth/controllers/auth_controller"));
    AccountApiRouter.auth = new AuthController.Auth();
    var AccountModule = require(share.Server("systems/accounts/controllers/account_controller"));
    var accounts = new AccountModule.Accounts;
    var ExceptionController = require(share.Server("systems/common/controllers/exception_controller"));
    var exception = new ExceptionController.Exception;
    AccountApiRouter.router.get("/api/:username", [exception.exception, exception.guard, exception.authenticate, AccountApiRouter.auth.is_system, accounts.get_account]);
    AccountApiRouter.router.put("/api/:username", [exception.exception, exception.guard, exception.authenticate, AccountApiRouter.auth.is_system, accounts.put_account]);
    AccountApiRouter.router.get('/api/query/:query/:option', [exception.exception, exception.guard, exception.authenticate, accounts.get_account_query_query]);
    AccountApiRouter.router.get('/api/count/:query', [exception.exception, exception.guard, exception.authenticate, accounts.get_account_count]);
    AccountApiRouter.router.delete('/api/own', [exception.exception, exception.guard, exception.authenticate, AccountApiRouter.auth.is_system, accounts.delete_own]);
})(AccountApiRouter = exports.AccountApiRouter || (exports.AccountApiRouter = {}));
module.exports = AccountApiRouter.router;
//# sourceMappingURL=api.js.map