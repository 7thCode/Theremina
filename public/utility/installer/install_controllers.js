/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var Install;
(function (Install) {
    let InstallControllers = angular.module('InstallControllers', ["ngResource"]);
    InstallControllers.controller('InstallController', ['$scope', '$log', 'InstallService',
        ($scope, $log, InstallService) => {
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
            let Draw = () => {
                progress(true);
                InstallService.Get((system_data) => {
                    $scope.setting = system_data;
                    progress(false);
                }, error_handler);
            };
            let Write = () => {
                progress(true);
                InstallService.Put($scope.setting, (system_data) => {
                    $scope.setting = system_data;
                    progress(false);
                });
            };
            $scope.Write = Write;
            Draw();
        }]);
})(Install || (Install = {}));
//# sourceMappingURL=install_controllers.js.map