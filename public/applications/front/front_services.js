/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
let FrontServices = angular.module('FrontServices', []);
FrontServices.factory('UploadData', ['$resource',
    ($resource) => {
        return $resource('/api/upload/:name', { name: '@name' }, {
            put: { method: 'PUT' }
        });
    }]);
FrontServices.factory('BuildSite', ['$resource',
    ($resource) => {
        return $resource('/api/buildsite/:name/:namespace', { name: "@name", namespace: "@namespace" }, {});
    }]);
FrontServices.service('SiteService', ['BuildSite',
    function (BuildSite) {
        this.Build = (name, namespace, callback, error) => {
            let site = new BuildSite();
            site.name = name;
            site.namespace = namespace;
            site.$save({}, (result) => {
                if (result) {
                    if (result.code === 0) {
                        callback(null);
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
//# sourceMappingURL=front_services.js.map