/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var RobotControllers = angular.module('RobotControllers', ["ngResource"]);
RobotControllers.controller('RobotController', ['$scope', '$log', 'RobotService',
    function ($scope, $log, RobotService) {
        var progress = function (value) {
            $scope.$emit('progress', value);
        };
        $scope.$on('progress', function (event, value) {
            $scope.progress = value;
        });
        var error_handler = function (code, message) {
            progress(false);
            $scope.message = message;
            $log.error(message);
        };
        //   let url = "https://www.npmjs.com/package/wgxpath";
        //    let path = '/html/body//a/@href';
        $scope.Get = function () {
            var url = $scope.url;
            var path = $scope.path;
            RobotService.Get(url, path, function (links) {
                if (links) {
                    $scope.links = links;
                }
            }, error_handler);
        };
    }]);
//# sourceMappingURL=robot_controllers.js.map