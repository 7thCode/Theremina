/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
let RobotControllers = angular.module('RobotControllers', ["ngResource"]);
RobotControllers.controller('RobotController', ['$scope', '$log', 'RobotService',
    ($scope, $log, RobotService) => {
        let progress = (value) => {
            $scope.$emit('progress', value);
        };
        $scope.$on('progress', (event, value) => {
            $scope.progress = value;
        });
        let error_handler = (code, message) => {
            progress(false);
            $scope.message = message;
            $log.error(message);
        };
        //   let url = "https://www.npmjs.com/package/wgxpath";
        //    let path = '/html/body//a/@href';
        $scope.Get = () => {
            let url = $scope.url;
            let path = $scope.path;
            RobotService.Get(url, path, (links) => {
                if (links) {
                    $scope.links = links;
                }
            }, error_handler);
        };
    }]);
//# sourceMappingURL=robot_controllers.js.map