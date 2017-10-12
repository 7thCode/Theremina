/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
let Services = angular.module('Services', []);
Services.factory('MailSend', ['$resource',
    ($resource) => {
        return $resource('/mailer/api/mailsend', {}, {});
    }]);
Services.factory('AssetCreate', ['$resource',
    ($resource) => {
        return $resource('/assets/api/createasset', {}, {});
    }]);
Services.service('MailerService', ["MailSend",
    function (MailSend) {
        this.Send = (content, callback, error) => {
            let mail = new MailSend();
            mail.content = content;
            mail.$save({}, (result) => {
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
Services.service('AssetService', ["AssetCreate",
    function (AssetCreate) {
        this.Create = (content, callback, error) => {
            let article = new AssetCreate();
            article.content = content;
            article.$save({}, (result) => {
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
/*
Services.service('ZipService', ["$http",
    function ($http): void {
        this.Zip = (zip_code, callback: (error: any, result: any) => void): void => {
            $http.jsonp('//zipcloud.ibsnet.co.jp/api/search?zipcode=' + zip_code, {callback: 'JSONP_CALLBACK'}).then(function (response) {
                callback(null, response.data);
            }).catch(function (data) {
                callback(data, null);
            });
        };
    }]);
*/
Services.service('ZipService', ["$http",
    function ($http) {
        this.Zip = (zip_code, callback) => {
            $http.jsonp('https://map.yahooapis.jp/search/zip/V1/zipCodeSearch?detail=full&output=json&query=' + zip_code + '&appid=dj0zaiZpPURPNXRydGRpZFZhaSZzPWNvbnN1bWVyc2VjcmV0Jng9ZGU-', { callback: 'JSONP_CALLBACK' }).then(function (response) {
                callback(null, response.data);
            }).catch(function (data) {
                callback(data, null);
            });
        };
    }]);
//# sourceMappingURL=services.js.map