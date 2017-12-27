/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var Install;
(function (Install) {
    var InstallServices = angular.module('InstallServices', []);
    InstallServices.factory('InstallSetting', ['$resource',
        function ($resource) {
            return $resource('/install', {}, {
                get: { method: 'GET' },
                put: { method: 'PUT' }
            });
        }]);
    InstallServices.service('InstallService', ['$location', 'InstallSetting',
        function ($location, InstallSetting) {
            this.Get = function (callback, error) {
                InstallSetting.get({}, function (result) {
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
                var data = new InstallSetting();
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
})(Install || (Install = {}));
//# sourceMappingURL=install_services.js.map