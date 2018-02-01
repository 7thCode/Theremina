/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace RobotServicesModule {

    let RobotServices = angular.module('RobotServices', []);

    RobotServices.factory('Robot', ['$resource',
        ($resource: any): any => {
            return $resource('/robot/api/xpath/:url/:path', {url: "@url", path: "@path"}, {});
        }]);

    RobotServices.service("RobotService", ["Robot", function (Robot) {
        this.Get = (url: string, path: string, callback: (results: any) => void, error: (error) => void): void => {
            Robot.get({url: encodeURIComponent(url), path: encodeURIComponent(path)}, (result: any): void => {
                if (result) {
                    if (result.code === 0) {
                        callback(result.value);
                    } else {
                        error({code: result.code, message: result.message});
                    }
                } else {
                    error({code: 10000, message: "network error"});
                }
            });
        }
    }]);

}