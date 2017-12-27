/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace MembersModule {

    const _ = require('lodash');
    const fs: any = require('graceful-fs');

    const mongodb: any = require('mongodb');
    const mongoose: any = require('mongoose');
    mongoose.Promise = global.Promise;

   // const archiver: any = require('archiver');

    const sharp = require("sharp");

    const core: any = require(process.cwd() + '/gs');
    const share: any = core.share;
  //  const applications_config: any = share.applications_config;
    const Wrapper: any = share.Wrapper;

    const LocalAccount: any = require(share.Models("systems/accounts/account"));

    const validator: any = require('validator');

    export class Members {

        static userid(request: any): string {
            return request.user.userid;
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_member(request: any, response: any): void {
            let userid = Members.userid(request);
            let query: any = {username: request.params.username};
            let query2 = {$and: [query, {userid: userid}]};

            Wrapper.FindOne(response, 1000, LocalAccount, query2, (response: any, account: any): void => {
                if (account) {
                    Wrapper.SendSuccess(response, account.local);
                } else {
                    Wrapper.SendWarn(response, 2, "not found", {});
                }
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public put_member(request: any, response: any): void {
            let userid = Members.userid(request);
            let query: any = {username: request.params.username};
            let query2 = {$and: [query, {userid: userid}]};

            Wrapper.FindOne(response, 1100, LocalAccount, query2, (response: any, account: any): void => {
                if (account) {
                    account.local = request.body.local;
                    account.open = true;
                    Wrapper.Save(response, 1200, account, (response: any, object: any): void => {
                        Wrapper.SendSuccess(response, object.local);
                    });
                } else {
                    Wrapper.SendWarn(response, 2, "not found", {});
                }
            });
        }

        /**
         * アカウント検索
         * @param request
         * @param response
         * @returns none
         */
        public get_member_query_query(request: any, response: any): void {
            let userid = Members.userid(request);
            let query: any = JSON.parse(decodeURIComponent(request.params.query));
            let option: any = JSON.parse(decodeURIComponent(request.params.option));
            let query2 = {$and: [query, {userid: userid}]};

            Wrapper.Find(response, 5000, LocalAccount, query2, {}, option, (response: any, accounts: any): any => {
                Wrapper.SendSuccess(response, accounts);
            });

        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_member_count(request: any, response: any): void {
            let userid = Members.userid(request);
            let query: any = JSON.parse(decodeURIComponent(request.params.query));

            Wrapper.Count(response, 2800, LocalAccount, {$and: [query, {userid: userid}]}, (response: any, count: any): any => {
                Wrapper.SendSuccess(response, count);
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public delete_own(request: any, response: any): void {
            let userid = Members.userid(request);
            let query: any = {userid: userid};

            Wrapper.FindOne(response, 5100, LocalAccount, query, (response: any, page: any): void => {
                if (page) {
                    Wrapper.Remove(response, 5100, page, (response: any): void => {
                        Wrapper.SendSuccess(response, {});
                    });
                } else {
                    Wrapper.SendWarn(response, 2, "not found", {});
                }
            });
        }

    }

}

module.exports = MembersModule;
