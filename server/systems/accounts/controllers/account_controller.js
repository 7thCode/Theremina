/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AccountModule;
(function (AccountModule) {
    const _ = require('lodash');
    const mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    const share = require(process.cwd() + '/server/systems/common/share');
    const Wrapper = share.Wrapper;
    const LocalAccount = require(share.Models("systems/accounts/account"));
    class Accounts {
        static userid(request) {
            return request.user.userid;
        }
        get_account(request, response) {
            const number = 1300;
            Wrapper.FindOne(response, number, LocalAccount, { username: request.params.username }, (response, account) => {
                if (account) {
                    Wrapper.SendSuccess(response, account.local);
                }
                else {
                    Wrapper.SendWarn(response, 2, "not found", { code: 2, message: "not found" });
                }
            });
        }
        put_account(request, response) {
            const number = 1100;
            Wrapper.FindOne(response, number, LocalAccount, { username: request.params.username }, (response, account) => {
                if (account) {
                    account.local = request.body.local;
                    account.open = true;
                    Wrapper.Save(response, number, account, (response, object) => {
                        Wrapper.SendSuccess(response, object.local);
                    });
                }
                else {
                    Wrapper.SendWarn(response, 2, "not found", { code: 2, message: "not found" });
                }
            });
        }
        /**
         * アカウント検索
         * @param request
         * @param response
         * @returns none
         */
        get_account_query_query(request, response) {
            let self = request.user;
            //     let query: any = JSON.parse(decodeURIComponent(request.params.query));
            //     let option: any = JSON.parse(decodeURIComponent(request.params.option));
            let query = Wrapper.Decode(request.params.query);
            let option = Wrapper.Decode(request.params.option);
            Wrapper.Find(response, 5000, LocalAccount, query, {}, option, (response, accounts) => {
                Wrapper.SendSuccess(response, accounts);
            });
        }
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        get_account_count(request, response) {
            //       let query: any = JSON.parse(decodeURIComponent(request.params.query));
            let query = Wrapper.Decode(request.params.query);
            Wrapper.Count(response, 2800, LocalAccount, query, (response, count) => {
                Wrapper.SendSuccess(response, count);
            });
        }
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        delete_own(request, response) {
            let userid = Accounts.userid(request);
            let namespace = "";
            Wrapper.FindOne(response, 5100, LocalAccount, { $and: [{ namespace: namespace }, { userid: userid }] }, (response, page) => {
                if (page) {
                    Wrapper.Remove(response, 5100, page, (response) => {
                        Wrapper.SendSuccess(response, {});
                    });
                }
                else {
                    Wrapper.SendWarn(response, 2, "not found", { code: 2, message: "not found" });
                }
            });
        }
    }
    AccountModule.Accounts = Accounts;
})(AccountModule = exports.AccountModule || (exports.AccountModule = {}));
module.exports = AccountModule;
//# sourceMappingURL=account_controller.js.map