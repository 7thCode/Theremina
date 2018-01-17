/**!
 Copyright (c) 2016 7thCode.(https://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

let AnalysisControllers: angular.IModule = angular.module('AnalysisControllers', ["ngResource"]);

AnalysisControllers.controller('AnalysisController', ['$scope', '$document', '$log',"$uibModal", 'AnalysisService',
    ($scope: any, $document: any, $log: any,$uibModal, AnalysisService): void => {

        let progress = (value) => {
            $scope.$emit('progress', value);
        };

        $scope.$on('progress', (event, value) => {
            $scope.progress = value;
        });

        let error_handler: (code: number, message: string) => void = (code: number, message: string): void => {
            progress(false);
            $scope.message = message;
            $log.error(message);
            alert(message);
        };

        let alert = (message): void => {
            let modalInstance: any = $uibModal.open({
                controller: 'AlertDialogController',
                templateUrl: '/common/dialogs/alert_dialog',
                resolve: {
                    items: (): any => {
                        return message;
                    }
                }
            });
            modalInstance.result.then((answer: any): void => {
            }, (): void => {
            });
        };

        $document.on('drop dragover', (e: any): void => {
            e.stopPropagation();
            e.preventDefault();
        });

        let Draw = () => {
            AnalysisService.Query((data: any): void => {
                $scope.logs = data;
                AnalysisService.Over((hasnext) => {$scope.over = !hasnext;});
                AnalysisService.Under((hasprev) => {$scope.under = !hasprev;});
            }, error_handler);
        };

        let AccessLogs = () => {
            AnalysisService.Query((data: any): void => {
                $scope.logs = data;
            }, error_handler);
        };

        $scope.Next = () => {
            AnalysisService.Next((data) => {
                $scope.logs = data;
                AnalysisService.Over((hasnext) => {$scope.over = !hasnext;});
                AnalysisService.Under((hasprev) => {$scope.under = !hasprev;});
            }, error_handler);
        };

        $scope.Prev = () => {
            AnalysisService.Prev((data) => {
                $scope.logs = data;
                AnalysisService.Over((hasnext) => {$scope.over = !hasnext;});
                AnalysisService.Under((hasprev) => {$scope.under = !hasprev;});
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