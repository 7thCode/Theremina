/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
let RobotServices = angular.module('RobotServices', []);
RobotServices.factory('Robot', ['$resource',
    ($resource) => {
        return $resource('/robot/api/xpath/:url/:path', { url: "@url", path: "@path" }, {});
    }]);
RobotServices.service("RobotService", ["Robot", function (Robot) {
        this.Get = (url, path, callback, error) => {
            Robot.get({ url: encodeURIComponent(url), path: encodeURIComponent(path) }, (result) => {
                if (result) {
                    if (result.code === 0) {
                        callback(result.value);
                    }
                    else {
                        error({ code: result.code, message: result.message });
                    }
                }
                else {
                    error({ code: 10000, message: "network error" });
                }
            });
        };
    }]);
//# sourceMappingURL=robot_services.js.map