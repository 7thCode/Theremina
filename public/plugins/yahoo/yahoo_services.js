/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
let YahooServices = angular.module('YahooServices', []);
YahooServices.service('ZipService', ["$http",
    function ($http) {
        this.Zip = (zip_code, callback) => {
            $http.jsonp('http://zipcloud.ibsnet.co.jp/api/search?zipcode=' + zip_code, { callback: 'JSONP_CALLBACK' }).then(function (response) {
                callback(null, response.data);
            }).catch(function (data) {
                callback(data, null);
            });
        };
    }]);
YahooServices.service('ZipService2', ["$http",
    function ($http) {
        this.Zip = (zip_code, callback) => {
            $http.jsonp('https://map.yahooapis.jp/search/zip/V1/zipCodeSearch?output=json&query=' + zip_code + '&appid=dj0zaiZpPURPNXRydGRpZFZhaSZzPWNvbnN1bWVyc2VjcmV0Jng9ZGU-', { callback: 'JSONP_CALLBACK' }).then(function (response) {
                callback(null, response.data);
            }).catch(function (data) {
                callback(data, null);
            });
        };
    }]);
//# sourceMappingURL=yahoo_services.js.map