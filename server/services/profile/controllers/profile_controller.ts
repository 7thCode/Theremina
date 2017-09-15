/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace ProfileModule {

    const fs = require('graceful-fs');

    const Validator = require('jsonschema').Validator;
    const validator = new Validator();

    const _ = require('lodash');

    const mongoose: any = require('mongoose');
    mongoose.Promise = global.Promise;

    const core = require(process.cwd() + '/gs');
    const share: any = core.share;
    const Wrapper = share.Wrapper;

    const applications_config = share.applications_config;

    const LocalAccount: any = require(share.Models("systems/accounts/account"));

    let account_local_schema = {};
    fs.open(share.Models('applications/accounts/schema.json'), 'ax+', 384, (error, fd) => {
        if (!error) {
            fs.close(fd, (error) => {
                account_local_schema = JSON.parse(fs.readFileSync(share.Models('applications/accounts/schema.json'), 'utf-8'));
            });
        }
    });

    export class Profile {

        /**
         * @param request
         * @returns userid
         */
        static userid(request): string {
            return request.user.userid;
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public put_profile(request: any, response: any): void {
            const number: number = 110000;
            Wrapper.FindOne(response, number, LocalAccount, {username: request.user.username}, (response: any, self: any): void => {
                if (self) {
                    let validate_result = validator.validate(request.body.local, account_local_schema);
                    if (validate_result.errors.length === 0) {
                        self.local = request.body.local;
                        self.open = true;
                        Wrapper.Save(response, number, self, (response: any, object: any): void => {
                            Wrapper.SendSuccess(response, object.local);
                        });
                    } else {
                        Wrapper.SendError(response, 3, "not valid", validate_result);
                    }
                } else {
                    Wrapper.SendWarn(response, 2, "not found", {code:2, message:"not found"});
                }
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_profile(request: any, response: any): void {
            const number: number = 111000;
            Wrapper.FindOne(response, number, LocalAccount, {username: request.user.username}, (response: any, self: any): void => {
                if (self) {
                    Wrapper.SendSuccess(response, {
                        provider: self.provider,
                        type: self.type,
                        username: self.username,
                        userid: self.userid,
                        local: self.local
                    });
                } else {
                    Wrapper.SendWarn(response, 2, "not found", {code:2, message:"not found"});
                }
            });
        }
    }
}

module.exports = ProfileModule;
