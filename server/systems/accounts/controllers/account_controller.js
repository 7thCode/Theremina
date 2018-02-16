/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AccountModule;
(function (AccountModule) {
    var _ = require('lodash');
    var mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    var share = require(process.cwd() + '/server/systems/common/share');
    var Wrapper = share.Wrapper;
    var LocalAccount = require(share.Models("systems/accounts/account"));
    var Accounts = /** @class */ (function () {
        function Accounts() {
        }
        Accounts.userid = function (request) {
            return request.user.userid;
        };
        Accounts.prototype.get_account = function (request, response) {
            var number = 1300;
            Wrapper.FindOne(response, number, LocalAccount, { username: request.params.username }, function (response, account) {
                if (account) {
                    Wrapper.SendSuccess(response, account.local);
                }
                else {
                    Wrapper.SendWarn(response, 2, "not found", { code: 2, message: "not found" });
                }
            });
        };
        Accounts.prototype.put_account = function (request, response) {
            var number = 1100;
            Wrapper.FindOne(response, number, LocalAccount, { username: request.params.username }, function (response, account) {
                if (account) {
                    account.local = request.body.local;
                    account.open = true;
                    Wrapper.Save(response, number, account, function (response, object) {
                        Wrapper.SendSuccess(response, object.local);
                    });
                }
                else {
                    Wrapper.SendWarn(response, 2, "not found", { code: 2, message: "not found" });
                }
            });
        };
        /**
         * アカウント検索
         * @param request
         * @param response
         * @returns none
         */
        Accounts.prototype.get_account_query_query = function (request, response) {
            //      let self: any = request.user;
            var query = Wrapper.Decode(request.params.query);
            var option = Wrapper.Decode(request.params.option);
            Wrapper.Find(response, 5000, LocalAccount, query, {}, option, function (response, accounts) {
                Wrapper.SendSuccess(response, accounts);
            });
        };
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        Accounts.prototype.get_account_count = function (request, response) {
            var query = Wrapper.Decode(request.params.query);
            Wrapper.Count(response, 2800, LocalAccount, query, function (response, count) {
                Wrapper.SendSuccess(response, count);
            });
        };
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        Accounts.prototype.delete_own = function (request, response) {
            var userid = Accounts.userid(request);
            var namespace = "";
            Wrapper.FindOne(response, 5100, LocalAccount, { $and: [{ namespace: namespace }, { userid: userid }] }, function (response, page) {
                if (page) {
                    Wrapper.Remove(response, 5100, page, function (response) {
                        Wrapper.SendSuccess(response, {});
                    });
                }
                else {
                    Wrapper.SendWarn(response, 2, "not found", { code: 2, message: "not found" });
                }
            });
        };
        return Accounts;
    }());
    AccountModule.Accounts = Accounts;
})(AccountModule = exports.AccountModule || (exports.AccountModule = {}));
module.exports = AccountModule;
//# sourceMappingURL=account_controller.js.map