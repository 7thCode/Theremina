/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SettingModule;
(function (SettingModule) {
    //const fs: any = require('graceful-fs');
    //const _ = require('lodash');
    var share = require(process.cwd() + '/server/systems/common/share');
    //   const logger: any = share.logger;
    var Persistent = share.Persistent;
    var Wrapper = share.Wrapper;
    var config = share.config;
    var Cipher = share.Cipher;
    var file_utility = share.Utility;
    var Setting = (function () {
        function Setting() {
        }
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        Setting.prototype.backup = function (request, response) {
            if (config.db) {
                var result = share.Command.Backup(config.db);
                Wrapper.SendSuccess(response, result);
            }
            else {
                Wrapper.SendError(response, 2, "not found", {});
            }
        };
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        Setting.prototype.restore = function (request, response) {
            if (request.body.password) {
                if (request.body.password == config.db.password) {
                    if (config.db) {
                        var result = share.Command.Restore(config.db);
                        Wrapper.SendSuccess(response, result);
                    }
                    else {
                        Wrapper.SendError(response, 2, "not found", {});
                    }
                }
            }
        };
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        Setting.prototype.read_application = function (request, response) {
            var self = request.user;
            Wrapper.If(response, 1000, (self.type == "System"), function (response) {
                var string = file_utility.readfileSync(share.Config("applications/config.json"));
                var setting = JSON.parse(string);
                Wrapper.SendSuccess(response, setting);
            });
        };
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        Setting.prototype.write_application = function (request, response) {
            var self = request.user;
            Wrapper.If(response, 1000, (self.type == "System"), function (response) {
                var data = JSON.stringify(request.body.setting, null, 1);
                if (file_utility.writefileSync(share.Config("applications/config.json"), data)) {
                    Wrapper.SendSuccess(response, request.body.setting);
                }
            });
        };
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        Setting.prototype.read_plugins = function (request, response) {
            var self = request.user;
            Wrapper.If(response, 1000, (self.type == "System"), function (response) {
                var string = file_utility.readfileSync(share.Config("plugins/config.json"));
                var setting = JSON.parse(string);
                Wrapper.SendSuccess(response, setting);
            });
        };
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        Setting.prototype.write_plugins = function (request, response) {
            var self = request.user;
            Wrapper.If(response, 1000, (self.type == "System"), function (response) {
                var data = JSON.stringify(request.body.setting, null, 1);
                if (file_utility.writefileSync(share.Config("plugins/config.json"), data)) {
                    Wrapper.SendSuccess(response, request.body.setting);
                }
            });
        };
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        Setting.prototype.read_services = function (request, response) {
            var self = request.user;
            Wrapper.If(response, 1000, (self.type == "System"), function (response) {
                var string = file_utility.readfileSync(share.Config("services/config.json"));
                var setting = JSON.parse(string);
                Wrapper.SendSuccess(response, setting);
            });
        };
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        Setting.prototype.write_services = function (request, response) {
            var self = request.user;
            Wrapper.If(response, 1000, (self.type == "System"), function (response) {
                var data = JSON.stringify(request.body.setting, null, 1);
                if (file_utility.writefileSync(share.Config("services/config.json"), data)) {
                    Wrapper.SendSuccess(response, request.body.setting);
                }
            });
        };
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        Setting.prototype.read_system = function (request, response) {
            var self = request.user;
            Wrapper.If(response, 1000, (self.type == "System"), function (response) {
                var string = file_utility.readfileSync(share.Config("systems/config.json"));
                var setting = JSON.parse(string);
                Wrapper.SendSuccess(response, setting);
            });
        };
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        Setting.prototype.write_system = function (request, response) {
            var self = request.user;
            Wrapper.If(response, 1000, (self.type == "System"), function (response) {
                var data = JSON.stringify(request.body.setting, null, 1);
                if (file_utility.writefileSync(share.Config("systems/config.json"), data)) {
                    Wrapper.SendSuccess(response, request.body.setting);
                }
            });
        };
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        Setting.prototype.read_modules = function (request, response) {
            var string = file_utility.readfileSync(share.Config("systems/config.json"));
            var setting = JSON.parse(string);
            Wrapper.If(response, 1000, setting.modules, function (response) {
                Wrapper.SendSuccess(response, setting.modules);
            });
        };
        ;
        return Setting;
    }());
    SettingModule.Setting = Setting;
})(SettingModule = exports.SettingModule || (exports.SettingModule = {}));
module.exports = SettingModule;
//# sourceMappingURL=setting_controller.js.map