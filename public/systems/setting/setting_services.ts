/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace Setting {

    let SettingServices: angular.IModule = angular.module('SettingServices', []);

    SettingServices.factory('Backup', ['$resource',
        ($resource): angular.resource.IResource<any> => {
            return $resource('/setting/command/backup', {}, {
                put: {method: 'PUT'}
            });
        }]);

    SettingServices.factory('Restore', ['$resource',
        ($resource): angular.resource.IResource<any> => {
            return $resource('/setting/command/restore', {}, {
                put: {method: 'PUT'}
            });
        }]);

    SettingServices.factory('ApplicationSetting', ['$resource',
        ($resource): angular.resource.IResource<any> => {
            return $resource('/setting/setting/application', {}, {
                get: {method: 'GET'},
                put: {method: 'PUT'}
            });
        }]);

    SettingServices.factory('PluginsSetting', ['$resource',
        ($resource): angular.resource.IResource<any> => {
            return $resource('/setting/setting/plugins', {}, {
                get: {method: 'GET'},
                put: {method: 'PUT'}
            });
        }]);

    SettingServices.factory('ServicesSetting', ['$resource',
        ($resource): angular.resource.IResource<any> => {
            return $resource('/setting/setting/services', {}, {
                get: {method: 'GET'},
                put: {method: 'PUT'}
            });
        }]);

    SettingServices.factory('SystemSetting', ['$resource',
        ($resource): angular.resource.IResource<any> => {
            return $resource('/setting/setting/system', {}, {
                get: {method: 'GET'},
                put: {method: 'PUT'}
            });
        }]);

    SettingServices.service('BackupService', ['Backup',
        function (Backup): void {

            this.Put = ( callback: (result: any) => void, error: (code: number, message: string) => void): void => {
                let data = new Backup();
                data.$put({}, (result: any): void => {
                    if (result) {
                        if (result.code === 0) {
                            callback(result.value);
                        } else {
                            error(result.code, result.message);
                        }
                    } else {
                        error(10000, "network error");
                    }
                });
            };

        }]);

    SettingServices.service('RestoreService', ['Restore',
        function (Restore): void {

            this.Put = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
                let data = new Restore();
                data.$put({}, (result: any): void => {
                    if (result) {
                        if (result.code === 0) {
                            callback(result.value);
                        } else {
                            error(result.code, result.message);
                        }
                    } else {
                        error(10000, "network error");
                    }
                });
            };

        }]);

    SettingServices.service('ApplicationSettingService', ['ApplicationSetting',
        function (ApplicationSetting: any): void {

            this.Get = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
                ApplicationSetting.get({}, (result: any): void => {
                    if (result) {
                        if (result.code === 0) {
                            callback(result.value);
                        } else {
                            error(result.code, result.message);
                        }
                    } else {
                        error(10000, "network error");
                    }
                });
            };

            this.Put = (setting: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
                let data = new ApplicationSetting();
                data.setting = setting;
                data.$put({}, (result: any): void => {
                    if (result) {
                        if (result.code === 0) {
                            callback(result.value);
                        } else {
                            error(result.code, result.message);
                        }
                    } else {
                        error(10000, "network error");
                    }
                });
            };

        }]);

    SettingServices.service('PluginsSettingService', ['PluginsSetting',
        function (PluginsSetting: any): void {

            this.Get = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
                PluginsSetting.get({}, (result: any): void => {
                    if (result) {
                        if (result.code === 0) {
                            callback(result.value);
                        } else {
                            error(result.code, result.message);
                        }
                    } else {
                        error(10000, "network error");
                    }
                });
            };

            this.Put = (setting: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
                let data = new PluginsSetting();
                data.setting = setting;
                data.$put({}, (result: any): void => {
                    if (result) {
                        if (result.code === 0) {
                            callback(result.value);
                        } else {
                            error(result.code, result.message);
                        }
                    } else {
                        error(10000, "network error");
                    }
                });
            };

        }]);

    SettingServices.service('ServicesSettingService', ['ServicesSetting',
        function (ServicesSetting: any): void {

            this.Get = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
                ServicesSetting.get({}, (result: any): void => {
                    if (result) {
                        if (result.code === 0) {
                            callback(result.value);
                        } else {
                            error(result.code, result.message);
                        }
                    } else {
                        error(10000, "network error");
                    }
                });
            };

            this.Put = (setting: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
                let data = new ServicesSetting();
                data.setting = setting;
                data.$put({}, (result: any): void => {
                    if (result) {
                        if (result.code === 0) {
                            callback(result.value);
                        } else {
                            error(result.code, result.message);
                        }
                    } else {
                        error(10000, "network error");
                    }
                });
            };

        }]);

    SettingServices.service('SystemSettingService', ['SystemSetting',
        function (SystemSetting: any): void {

            this.Get = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
                SystemSetting.get({}, (result: any): void => {
                    if (result) {
                        if (result.code === 0) {
                            callback(result.value);
                        } else {
                            error(result.code, result.message);
                        }
                    } else {
                        error(10000, "network error");
                    }
                });
            };

            this.Put = (setting: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
                let data = new SystemSetting();
                data.setting = setting;
                data.$put({}, (result: any): void => {
                    if (result) {
                        if (result.code === 0) {
                            callback(result.value);
                        } else {
                            error(result.code, result.message);
                        }
                    } else {
                        error(10000, "network error");
                    }
                });
            };

        }]);
}