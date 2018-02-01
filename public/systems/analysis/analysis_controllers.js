/**!
 Copyright (c) 2016 7thCode.(https://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var AnalysisControllersModule;
(function (AnalysisControllersModule) {
    var AnalysisControllers = angular.module('AnalysisControllers', ["ngResource"]);
    AnalysisControllers.controller('AnalysisController', ['$scope', '$document', '$log', "$uibModal", 'AnalysisService',
        function ($scope, $document, $log, $uibModal, AnalysisService) {
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
                alert(message);
            };
            var alert = function (message) {
                var modalInstance = $uibModal.open({
                    controller: 'AlertDialogController',
                    templateUrl: '/common/dialogs/alert_dialog',
                    resolve: {
                        items: function () {
                            return message;
                        }
                    }
                });
                modalInstance.result.then(function (answer) {
                }, function () {
                });
            };
            $document.on('drop dragover', function (e) {
                e.stopPropagation();
                e.preventDefault();
            });
            var Draw = function () {
                AnalysisService.Query(function (data) {
                    $scope.logs = data;
                    AnalysisService.Over(function (hasnext) {
                        $scope.over = !hasnext;
                    });
                    AnalysisService.Under(function (hasprev) {
                        $scope.under = !hasprev;
                    });
                }, error_handler);
            };
            var AccessLogs = function () {
                AnalysisService.Query(function (data) {
                    $scope.logs = data;
                }, error_handler);
            };
            $scope.Next = function () {
                AnalysisService.Next(function (data) {
                    $scope.logs = data;
                    AnalysisService.Over(function (hasnext) {
                        $scope.over = !hasnext;
                    });
                    AnalysisService.Under(function (hasprev) {
                        $scope.under = !hasprev;
                    });
                }, error_handler);
            };
            $scope.Prev = function () {
                AnalysisService.Prev(function (data) {
                    $scope.logs = data;
                    AnalysisService.Over(function (hasnext) {
                        $scope.over = !hasnext;
                    });
                    AnalysisService.Under(function (hasprev) {
                        $scope.under = !hasprev;
                    });
                }, error_handler);
            };
            $scope.Find = function (name) {
                if (!name) {
                    AnalysisService.query.key = name;
                }
                Draw();
            };
            AccessLogs();
            Draw();
        }]);
})(AnalysisControllersModule || (AnalysisControllersModule = {}));
//# sourceMappingURL=analysis_controllers.js.map