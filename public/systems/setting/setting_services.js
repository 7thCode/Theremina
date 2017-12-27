/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var Setting;
(function (Setting) {
    var SettingServices = angular.module('SettingServices', []);
    SettingServices.factory('Backup', ['$resource',
        function ($resource) {
            return $resource('/setting/command/backup', {}, {
                put: { method: 'PUT' }
            });
        }]);
    SettingServices.factory('Restore', ['$resource',
        function ($resource) {
            return $resource('/setting/command/restore', {}, {
                put: { method: 'PUT' }
            });
        }]);
    SettingServices.factory('ApplicationSetting', ['$resource',
        function ($resource) {
            return $resource('/setting/setting/application', {}, {
                get: { method: 'GET' },
                put: { method: 'PUT' }
            });
        }]);
    SettingServices.factory('PluginsSetting', ['$resource',
        function ($resource) {
            return $resource('/setting/setting/plugins', {}, {
                get: { method: 'GET' },
                put: { method: 'PUT' }
            });
        }]);
    SettingServices.factory('ServicesSetting', ['$resource',
        function ($resource) {
            return $resource('/setting/setting/services', {}, {
                get: { method: 'GET' },
                put: { method: 'PUT' }
            });
        }]);
    SettingServices.factory('SystemSetting', ['$resource',
        function ($resource) {
            return $resource('/setting/setting/system', {}, {
                get: { method: 'GET' },
                put: { method: 'PUT' }
            });
        }]);
    SettingServices.factory('ModulesSetting', ['$resource',
        function ($resource) {
            return $resource('/setting/setting/modules', {}, {
                get: { method: 'GET' }
            });
        }]);
    SettingServices.service('BackupService', ['Backup',
        function (Backup) {
            this.Put = function (callback, error) {
                var data = new Backup();
                data.$put({}, function (result) {
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
            this.Put = function (password, callback, error) {
                var data = new Restore();
                data.password = password;
                data.$put({}, function (result) {
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
            this.Get = function (callback, error) {
                ApplicationSetting.get({}, function (result) {
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
            this.Put = function (setting, callback, error) {
                var data = new ApplicationSetting();
                data.setting = setting;
                data.$put({}, function (result) {
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
            this.Get = function (callback, error) {
                PluginsSetting.get({}, function (result) {
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
            this.Put = function (setting, callback, error) {
                var data = new PluginsSetting();
                data.setting = setting;
                data.$put({}, function (result) {
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
            this.Get = function (callback, error) {
                ServicesSetting.get({}, function (result) {
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
            this.Put = function (setting, callback, error) {
                var data = new ServicesSetting();
                data.setting = setting;
                data.$put({}, function (result) {
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
            this.Get = function (callback, error) {
                SystemSetting.get({}, function (result) {
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
            this.Put = function (setting, callback, error) {
                var data = new SystemSetting();
                data.setting = setting;
                data.$put({}, function (result) {
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
            this.Modules = function (callback, error) {
                ModulesSetting.get({}, function (result) {
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