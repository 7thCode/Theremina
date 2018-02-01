/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace NamespaceServicesModule {

    let NamespaceServices: angular.IModule = angular.module('NamespaceServices', []);

    NamespaceServices.factory('Namespaces', ['$resource',
        ($resource: any): any => {
            return $resource('/namespace/api/namespaces', {}, {});
        }]);

    NamespaceServices.service('NamespaceService', ['Namespaces',
        function (Namespaces: any): void {

            this.Get = (callback: (result: any) => void, error: (code: number, message: string) => void) => {
                Namespaces.get({}, (result: any): void => {
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