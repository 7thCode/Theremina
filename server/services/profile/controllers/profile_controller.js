/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ProfileModule;
(function (ProfileModule) {
    var fs = require('graceful-fs');
    var Validator = require('jsonschema').Validator;
    var validator = new Validator();
    var _ = require('lodash');
    var mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    var core = require(process.cwd() + '/gs');
    var share = core.share;
    var Wrapper = share.Wrapper;
    var LocalAccount = require(share.Models("systems/accounts/account"));
    var account_local_schema = {};
    fs.open(share.Models('applications/accounts/schema.json'), 'ax+', 384, function (error, fd) {
        if (!error) {
            fs.close(fd, function (error) {
                account_local_schema = JSON.parse(fs.readFileSync(share.Models('applications/accounts/schema.json'), 'utf-8'));
            });
        }
    });
    var Profile = /** @class */ (function () {
        function Profile() {
        }
        /**
         * @param request
         * @returns userid
         */
        Profile.userid = function (request) {
            return request.user.userid;
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Profile.prototype.put_profile = function (request, response) {
            var number = 110000;
            Wrapper.FindOne(response, number, LocalAccount, { username: request.user.username }, function (response, self) {
                if (self) {
                    var validate_result = validator.validate(request.body.local, account_local_schema);
                    if (validate_result.errors.length === 0) {
                        self.local = request.body.local;
                        self.open = true;
                        Wrapper.Save(response, number, self, function (response, object) {
                            Wrapper.SendSuccess(response, object.local);
                        });
                    }
                    else {
                        Wrapper.SendError(response, 3, "not valid", validate_result);
                    }
                }
                else {
                    Wrapper.SendWarn(response, 2, "not found", { code: 2, message: "not found" });
                }
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Profile.prototype.get_profile = function (request, response) {
            var number = 111000;
            Wrapper.FindOne(response, number, LocalAccount, { username: request.user.username }, function (response, self) {
                if (self) {
                    Wrapper.SendSuccess(response, {
                        provider: self.provider,
                        type: self.type,
                        username: self.username,
                        userid: self.userid,
                        local: self.local
                    });
                }
                else {
                    Wrapper.SendWarn(response, 2, "not found", { code: 2, message: "not found" });
                }
            });
        };
        return Profile;
    }());
    ProfileModule.Profile = Profile;
})(ProfileModule = exports.ProfileModule || (exports.ProfileModule = {}));
module.exports = ProfileModule;
//# sourceMappingURL=profile_controller.js.map