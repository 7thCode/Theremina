/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace FrontServicesModule {

    let FrontServices: angular.IModule = angular.module('FrontServices', []);

    FrontServices.factory('UploadData', ['$resource',
        ($resource: any): any => {
            return $resource('/api/upload/:name', {name: '@name'}, {
                put: {method: 'PUT'}
            });
        }]);

    FrontServices.factory('BuildSite', ['$resource',
        ($resource: any): any => {
            return $resource('/api/buildsite/:name/:namespace', {name: "@name", namespace: "@namespace"}, {});
        }]);

    FrontServices.service('SiteService', ['BuildSite',
        function (BuildSite: any): void {

            this.Build = (name: string, namespace: string, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
                let site = new BuildSite();
                site.name = name;
                site.namespace = namespace;
                site.$save({}, (result: any): void => {
                    if (result) {
                        if (result.code === 0) {
                            callback(null);
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