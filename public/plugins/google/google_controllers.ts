/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */



"use strict";

let GoogleControllers: angular.IModule = angular.module('GoogleControllers', ["ngResource"]);

GoogleControllers.controller('AnalyticsController', ['$scope', '$window', '$document', '$log', '$uibModal', "AnalyticsService",
    ($scope: any, $window: any, $document: any, $log: any, $uibModal: any, AnalyticsService: any): void => {

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

        window.addEventListener('beforeunload', (e) => {
            if ($scope.opened) {

            }
        }, false);

        $document.on('drop dragover', (e: any): void => {
            e.stopPropagation();
            e.preventDefault();
        });

        let Draw = (): void => {

            let dimensions = {
                dimensions: 'ga:sourceMedium,ga:date',
                metrics: 'ga:bounceRate,ga:sessions,ga:users,ga:pageviews,ga:pageviewsPerSession,ga:avgSessionDuration,ga:goal7Completions,ga:goal8Completions',
                startDate: '2017-06-30',
                endDate: '2017-07-18',
                sort: 'ga:sourceMedium'
            };

            let dictionary = {
                "ga:sourceMedium": "メディア",
                "ga:date": "日付",
                "ga:bounceRate": "直帰率",
                "ga:sessions": "セッション",
                "ga:users": "ユーザー",
                "ga:pageviews": "ページビュー",
                "ga:pageviewsPerSession": "ページ/セッション",
                "ga:avgSessionDuration": "平均セッション時間",
                "ga:goal7Completions": "B-Cコンタクトフォーム",
                "ga:goal8Completions": "B-CコンタクトフォームSP"
            };

            let reference = (data, dictionary) => {
                let result = [];
                data.forEach((item, index) => {
                    let name = dictionary[item.name];
                    if (!name) {
                        name = index;
                    }
                    result.push(name);
                });
                return result;
            };

            AnalyticsService.Get(dimensions, (result: any): void => {
                if (result) {
                    $scope.rows = result.rows;
                    $scope.columnHeaders = reference(result.columnHeaders, dictionary);
                }
            }, error_handler);
        };

        Draw();

    }]);
