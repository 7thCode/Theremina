/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var Install;
(function (Install) {
    var InstallControllers = angular.module('InstallControllers', ["ngResource"]);
    InstallControllers.controller('InstallController', ['$scope', '$log', 'InstallService',
        function ($scope, $log, InstallService) {
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
            var Draw = function () {
                progress(true);
                InstallService.Get(function (system_data) {
                    $scope.setting = system_data;
                    progress(false);
                }, error_handler);
            };
            var Write = function () {
                progress(true);
                InstallService.Put($scope.setting, function (system_data) {
                    $scope.setting = system_data;
                    progress(false);
                });
            };
            $scope.Write = Write;
            Draw();
        }]);
})(Install || (Install = {}));
//# sourceMappingURL=install_controllers.js.map