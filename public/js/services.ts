/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

let Services: angular.IModule = angular.module('Services', []);

Services.factory('MailSend', ['$resource',
    ($resource: any): any => {
        return $resource('/mailer/api/mailsend', {}, {});
    }]);

Services.factory('AssetCreate', ['$resource',
    ($resource: any): any => {
        return $resource('/assets/api/createasset', {}, {});
    }]);

Services.service('MailerService', ["MailSend",
    function (MailSend: any): void {
        this.Send = (content: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            let mail = new MailSend();
            mail.content = content;
            mail.$save({}, (result: any): void => {
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

Services.service('AssetService', ["AssetCreate",
    function (AssetCreate: any): void {
        this.Create = (content: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            let article = new AssetCreate();
            article.content = content;
            article.$save({}, (result: any): void => {
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
    function ($http): void {
        this.Zip = (zip_code, callback: (error: any, result: any) => void): void => {
            $http.jsonp('https://map.yahooapis.jp/search/zip/V1/zipCodeSearch?detail=full&output=json&query=' + zip_code + '&appid=dj0zaiZpPURPNXRydGRpZFZhaSZzPWNvbnN1bWVyc2VjcmV0Jng9ZGU-', {callback: 'JSONP_CALLBACK'}).then(function (response) {
                callback(null, response.data);
            }).catch(function (data) {
                callback(data, null);
            });
        };
    }]);


Services.factory('ArticleQuery', ['$resource',
    ($resource: any): any => {
        return $resource("/articles/api/query/:query", {query: '@query'}, {
            query: {method: 'GET'}
        });
    }]);

Services.service('ArticleService', ["ArticleQuery",
    function (ArticleQuery: any): void {

        this.Query = (query_formula, callback: (result: any) => void, error: (code: number, message: string) => void) => {
            ArticleQuery.query({
                query: query_formula
            }, (result: any): void => {
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


