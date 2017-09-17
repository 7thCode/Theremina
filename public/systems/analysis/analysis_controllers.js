/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
let AnalysisControllers = angular.module('AnalysisControllers', ["ngResource"]);
AnalysisControllers.controller('AnalysisController', ['$scope', '$document', '$log', "$uibModal", 'AnalysisService',
    ($scope, $document, $log, $uibModal, AnalysisService) => {
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
            alert(message);
        };
        let alert = (message) => {
            let modalInstance = $uibModal.open({
                controller: 'AlertDialogController',
                templateUrl: '/common/dialogs/alert_dialog',
                resolve: {
                    items: () => {
                        return message;
                    }
                }
            });
            modalInstance.result.then((answer) => {
            }, () => {
            });
        };
        $document.on('drop dragover', (e) => {
            e.stopPropagation();
            e.preventDefault();
        });
        let Draw = () => {
            AnalysisService.Query((data) => {
                $scope.logs = data;
                AnalysisService.Over((hasnext) => { $scope.over = !hasnext; });
                AnalysisService.Under((hasprev) => { $scope.under = !hasprev; });
            }, error_handler);
        };
        let AccessLogs = () => {
            AnalysisService.Query((data) => {
                $scope.logs = data;
            }, error_handler);
        };
        $scope.Next = () => {
            AnalysisService.Next((data) => {
                $scope.logs = data;
                AnalysisService.Over((hasnext) => { $scope.over = !hasnext; });
                AnalysisService.Under((hasprev) => { $scope.under = !hasprev; });
            }, error_handler);
        };
        $scope.Prev = () => {
            AnalysisService.Prev((data) => {
                $scope.logs = data;
                AnalysisService.Over((hasnext) => { $scope.over = !hasnext; });
                AnalysisService.Under((hasprev) => { $scope.under = !hasprev; });
            }, error_handler);
        };
        $scope.Find = (name) => {
            if (!name) {
                AnalysisService.query.key = name;
            }
            Draw();
        };
        AccessLogs();
        Draw();
    }]);
//# sourceMappingURL=analysis_controllers.js.map