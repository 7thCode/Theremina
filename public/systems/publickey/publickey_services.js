/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var PublicKeyServicesModule;
(function (PublicKeyServicesModule) {
    let PublicKeyServices = angular.module('PublicKeyServices', []);
    PublicKeyServices.factory('FixedPublicKey', ['$resource',
        ($resource) => {
            return $resource('/publickey/fixed', {}, {
                get: { method: 'GET' }
            });
        }]);
    PublicKeyServices.factory('DynamicPublicKey', ['$resource',
        ($resource) => {
            return $resource('/publickey/dynamic', {}, {
                get: { method: 'GET' }
            });
        }]);
    PublicKeyServices.factory('Token', ['$resource',
        ($resource) => {
            return $resource('/publickey/token', {}, {
                get: { method: 'GET' }
            });
        }]);
    PublicKeyServices.service('PublicKeyService', ["FixedPublicKey", "DynamicPublicKey", "Token",
        function (FixedPublicKey, DynamicPublicKey, Token) {
            this.Fixed = (callback, error) => {
                FixedPublicKey.get({}, (result) => {
                    if (result) {
                        switch (result.code) {
                            case 0:
                                callback(result.value);
                                break;
                            case 1:
                                callback(null);
                                break;
                            default:
                                error(result.code, result.message);
                        }
                    }
                    else {
                        error(10000, "network error");
                    }
                });
            };
            this.Dynamic = (callback, error) => {
                DynamicPublicKey.get({}, (result) => {
                    if (result) {
                        switch (result.code) {
                            case 0:
                                callback(result.value);
                                break;
                            case 1:
                                callback(null);
                                break;
                            default:
                                error(result.code, result.message);
                        }
                    }
                    else {
                        error(10000, "network error");
                    }
                });
            };
            this.Token = (callback, error) => {
                Token.get({}, (result) => {
                    if (result) {
                        switch (result.code) {
                            case 0:
                                callback(result.value);
                                break;
                            case 1:
                                callback(null);
                                break;
                            default:
                                error(result.code, result.message);
                        }
                    }
                    else {
                        error(10000, "network error");
                    }
                });
            };
        }]);
})(PublicKeyServicesModule || (PublicKeyServicesModule = {}));
//# sourceMappingURL=publickey_services.js.map