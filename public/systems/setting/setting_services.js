/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var Setting;
(function (Setting) {
    let SettingServices = angular.module('SettingServices', []);
    SettingServices.factory('Backup', ['$resource',
        ($resource) => {
            return $resource('/setting/command/backup', {}, {
                put: { method: 'PUT' }
            });
        }]);
    SettingServices.factory('Restore', ['$resource',
        ($resource) => {
            return $resource('/setting/command/restore', {}, {
                put: { method: 'PUT' }
            });
        }]);
    SettingServices.factory('ApplicationSetting', ['$resource',
        ($resource) => {
            return $resource('/setting/setting/application', {}, {
                get: { method: 'GET' },
                put: { method: 'PUT' }
            });
        }]);
    SettingServices.factory('PluginsSetting', ['$resource',
        ($resource) => {
            return $resource('/setting/setting/plugins', {}, {
                get: { method: 'GET' },
                put: { method: 'PUT' }
            });
        }]);
    SettingServices.factory('ServicesSetting', ['$resource',
        ($resource) => {
            return $resource('/setting/setting/services', {}, {
                get: { method: 'GET' },
                put: { method: 'PUT' }
            });
        }]);
    SettingServices.factory('SystemSetting', ['$resource',
        ($resource) => {
            return $resource('/setting/setting/system', {}, {
                get: { method: 'GET' },
                put: { method: 'PUT' }
            });
        }]);
    SettingServices.factory('ModulesSetting', ['$resource',
        ($resource) => {
            return $resource('/setting/setting/modules', {}, {
                get: { method: 'GET' }
            });
        }]);
    SettingServices.service('BackupService', ['Backup',
        function (Backup) {
            this.Put = (callback, error) => {
                let data = new Backup();
                data.$put({}, (result) => {
                    if (result) {
                        if (result.code === 0) {
                            callback(result.value);
                        }
                        else {
                            error(result.code, result.message);
                        }
                    }
                    else {
                        error(10000, "network error");
                    }
                });
            };
        }]);
    SettingServices.service('RestoreService', ['Restore',
        function (Restore) {
            this.Put = (password, callback, error) => {
                let data = new Restore();
                data.password = password;
                data.$put({}, (result) => {
                    if (result) {
                        if (result.code === 0) {
                            callback(result.value);
                        }
                        else {
                            error(result.code, result.message);
                        }
                    }
                    else {
                        error(10000, "network error");
                    }
                });
            };
        }]);
    SettingServices.service('ApplicationSettingService', ['ApplicationSetting',
        function (ApplicationSetting) {
            this.Get = (callback, error) => {
                ApplicationSetting.get({}, (result) => {
                    if (result) {
                        if (result.code === 0) {
                            callback(result.value);
                        }
                        else {
                            error(result.code, result.message);
                        }
                    }
                    else {
                        error(10000, "network error");
                    }
                });
            };
            this.Put = (setting, callback, error) => {
                let data = new ApplicationSetting();
                data.setting = setting;
                data.$put({}, (result) => {
                    if (result) {
                        if (result.code === 0) {
                            callback(result.value);
                        }
                        else {
                            error(result.code, result.message);
                        }
                    }
                    else {
                        error(10000, "network error");
                    }
                });
            };
        }]);
    SettingServices.service('PluginsSettingService', ['PluginsSetting',
        function (PluginsSetting) {
            this.Get = (callback, error) => {
                PluginsSetting.get({}, (result) => {
                    if (result) {
                        if (result.code === 0) {
                            callback(result.value);
                        }
                        else {
                            error(result.code, result.message);
                        }
                    }
                    else {
                        error(10000, "network error");
                    }
                });
            };
            this.Put = (setting, callback, error) => {
                let data = new PluginsSetting();
                data.setting = setting;
                data.$put({}, (result) => {
                    if (result) {
                        if (result.code === 0) {
                            callback(result.value);
                        }
                        else {
                            error(result.code, result.message);
                        }
                    }
                    else {
                        error(10000, "network error");
                    }
                });
            };
        }]);
    SettingServices.service('ServicesSettingService', ['ServicesSetting',
        function (ServicesSetting) {
            this.Get = (callback, error) => {
                ServicesSetting.get({}, (result) => {
                    if (result) {
                        if (result.code === 0) {
                            callback(result.value);
                        }
                        else {
                            error(result.code, result.message);
                        }
                    }
                    else {
                        error(10000, "network error");
                    }
                });
            };
            this.Put = (setting, callback, error) => {
                let data = new ServicesSetting();
                data.setting = setting;
                data.$put({}, (result) => {
                    if (result) {
                        if (result.code === 0) {
                            callback(result.value);
                        }
                        else {
                            error(result.code, result.message);
                        }
                    }
                    else {
                        error(10000, "network error");
                    }
                });
            };
        }]);
    SettingServices.service('SystemSettingService', ['SystemSetting', 'ModulesSetting',
        function (SystemSetting, ModulesSetting) {
            this.Get = (callback, error) => {
                SystemSetting.get({}, (result) => {
                    if (result) {
                        if (result.code === 0) {
                            callback(result.value);
                        }
                        else {
                            error(result.code, result.message);
                        }
                    }
                    else {
                        error(10000, "network error");
                    }
                });
            };
            this.Put = (setting, callback, error) => {
                let data = new SystemSetting();
                data.setting = setting;
                data.$put({}, (result) => {
                    if (result) {
                        if (result.code === 0) {
                            callback(result.value);
                        }
                        else {
                            error(result.code, result.message);
                        }
                    }
                    else {
                        error(10000, "network error");
                    }
                });
            };
            this.Modules = (callback, error) => {
                ModulesSetting.get({}, (result) => {
                    if (result) {
                        if (result.code === 0) {
                            callback(result.value);
                        }
                        else {
                            error(result.code, result.message);
                        }
                    }
                    else {
                        error(10000, "network error");
                    }
                });
            };
        }]);
})(Setting || (Setting = {}));
//# sourceMappingURL=setting_services.js.map