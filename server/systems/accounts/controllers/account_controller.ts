/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace AccountModule {

    const _ = require('lodash');

    const mongoose: any = require('mongoose');
    mongoose.Promise = global.Promise;

    const share = require(process.cwd() + '/server/systems/common/share');
    const Wrapper = share.Wrapper;

    const LocalAccount: any = require(share.Models("systems/accounts/account"));

    export class Accounts {

        static userid(request: any): string {
            return request.user.userid;
        }

        public get_account(request: any, response: any): void {
            const number: number = 1300;
            Wrapper.FindOne(response, number, LocalAccount, {username: request.params.username}, (response: any, account: any): void => {
                if (account) {
                    Wrapper.SendSuccess(response, account.local);
                } else {
                    Wrapper.SendWarn(response, 2, "not found", {code: 2, message: "not found"});
                }
            });
        }

        public put_account(request: any, response: any): void {
            const number: number = 1100;
            Wrapper.FindOne(response, number, LocalAccount, {username: request.params.username}, (response: any, account: any): void => {
                if (account) {
                    account.local = request.body.local;
                    account.open = true;
                    Wrapper.Save(response, number, account, (response: any, object: any): void => {
                        Wrapper.SendSuccess(response, object.local);
                    });
                } else {
                    Wrapper.SendWarn(response, 2, "not found", {code: 2, message: "not found"});
                }
            });
        }

        /**
         * アカウント検索
         * @param request
         * @param response
         * @returns none
         */
        public get_account_query_query(request: any, response: any): void {
            let self: any = request.user;

            //     let query: any = JSON.parse(decodeURIComponent(request.params.query));
            //     let option: any = JSON.parse(decodeURIComponent(request.params.option));

            let query: any = Wrapper.Decode(request.params.query);
            let option: any = Wrapper.Decode(request.params.option);

            Wrapper.Find(response, 5000, LocalAccount, query, {}, option, (response: any, accounts: any): any => {
                Wrapper.SendSuccess(response, accounts);
            });

        }

        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        public get_account_count(request: any, response: any): void {
            //       let query: any = JSON.parse(decodeURIComponent(request.params.query));
            let query: any = Wrapper.Decode(request.params.query);

            Wrapper.Count(response, 2800, LocalAccount, query, (response: any, count: any): any => {
                Wrapper.SendSuccess(response, count);
            });
        }

        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        public delete_own(request: any, response: any): void {
            let userid = Accounts.userid(request);
            Wrapper.FindOne(response, 5100, LocalAccount, {userid: userid}, (response: any, page: any): void => {
                if (page) {
                    Wrapper.Remove(response, 5100, page, (response: any): void => {
                        Wrapper.SendSuccess(response, {});
                    });
                } else {
                    Wrapper.SendWarn(response, 2, "not found", {code: 2, message: "not found"});
                }
            });
        }

    }
}

module.exports = AccountModule;
