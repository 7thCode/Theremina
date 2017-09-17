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
    const share = require(process.cwd() + '/server/systems/common/share');
    const logger = share.logger;
    const Persistent = share.Persistent;
    const Wrapper = share.Wrapper;
    const config = share.config;
    const Cipher = share.Cipher;
    const file_utility = share.Utility;
    class Setting {
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        backup(request, response) {
            if (config.db) {
                let result = share.Command.Backup(config.db);
                Wrapper.SendSuccess(response, result);
            }
            else {
                Wrapper.SendError(response, 2, "not found", {});
            }
        }
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        restore(request, response) {
            if (request.body.password) {
                if (request.body.password == config.db.password) {
                    if (config.db) {
                        let result = share.Command.Restore(config.db);
                        Wrapper.SendSuccess(response, result);
                    }
                    else {
                        Wrapper.SendError(response, 2, "not found", {});
                    }
                }
            }
        }
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        read_application(request, response) {
            let self = request.user;
            Wrapper.If(response, 1000, (self.type == "System"), (response) => {
                let string = file_utility.readfileSync(share.Config("applications/config.json"));
                let setting = JSON.parse(string);
                Wrapper.SendSuccess(response, setting);
            });
        }
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        write_application(request, response) {
            let self = request.user;
            Wrapper.If(response, 1000, (self.type == "System"), (response) => {
                let data = JSON.stringify(request.body.setting, null, 1);
                if (file_utility.writefileSync(share.Config("applications/config.json"), data)) {
                    Wrapper.SendSuccess(response, request.body.setting);
                }
            });
        }
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        read_plugins(request, response) {
            let self = request.user;
            Wrapper.If(response, 1000, (self.type == "System"), (response) => {
                let string = file_utility.readfileSync(share.Config("plugins/config.json"));
                let setting = JSON.parse(string);
                Wrapper.SendSuccess(response, setting);
            });
        }
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        write_plugins(request, response) {
            let self = request.user;
            Wrapper.If(response, 1000, (self.type == "System"), (response) => {
                let data = JSON.stringify(request.body.setting, null, 1);
                if (file_utility.writefileSync(share.Config("plugins/config.json"), data)) {
                    Wrapper.SendSuccess(response, request.body.setting);
                }
            });
        }
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        read_services(request, response) {
            let self = request.user;
            Wrapper.If(response, 1000, (self.type == "System"), (response) => {
                let string = file_utility.readfileSync(share.Config("services/config.json"));
                let setting = JSON.parse(string);
                Wrapper.SendSuccess(response, setting);
            });
        }
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        write_services(request, response) {
            let self = request.user;
            Wrapper.If(response, 1000, (self.type == "System"), (response) => {
                let data = JSON.stringify(request.body.setting, null, 1);
                if (file_utility.writefileSync(share.Config("services/config.json"), data)) {
                    Wrapper.SendSuccess(response, request.body.setting);
                }
            });
        }
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        read_system(request, response) {
            let self = request.user;
            Wrapper.If(response, 1000, (self.type == "System"), (response) => {
                let string = file_utility.readfileSync(share.Config("systems/config.json"));
                let setting = JSON.parse(string);
                Wrapper.SendSuccess(response, setting);
            });
        }
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        write_system(request, response) {
            let self = request.user;
            Wrapper.If(response, 1000, (self.type == "System"), (response) => {
                let data = JSON.stringify(request.body.setting, null, 1);
                if (file_utility.writefileSync(share.Config("systems/config.json"), data)) {
                    Wrapper.SendSuccess(response, request.body.setting);
                }
            });
        }
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        read_modules(request, response) {
            let string = file_utility.readfileSync(share.Config("systems/config.json"));
            let setting = JSON.parse(string);
            Wrapper.If(response, 1000, setting.modules, (response) => {
                Wrapper.SendSuccess(response, setting.modules);
            });
        }
        ;
    }
    SettingModule.Setting = Setting;
})(SettingModule = exports.SettingModule || (exports.SettingModule = {}));
module.exports = SettingModule;
//# sourceMappingURL=setting_controller.js.map