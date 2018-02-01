/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var GoogleControllersModule;
(function (GoogleControllersModule) {
    var GoogleControllers = angular.module('GoogleControllers', ["ngResource"]);
    GoogleControllers.controller('AnalyticsController', ['$scope', '$window', '$document', '$log', '$uibModal', "AnalyticsService",
        function ($scope, $window, $document, $log, $uibModal, AnalyticsService) {
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
            window.addEventListener('beforeunload', function (e) {
                if ($scope.opened) {
                }
            }, false);
            $document.on('drop dragover', function (e) {
                e.stopPropagation();
                e.preventDefault();
            });
            var Draw = function () {
                var dimensions = {
                    dimensions: 'ga:sourceMedium,ga:date',
                    metrics: 'ga:bounceRate,ga:sessions,ga:users,ga:pageviews,ga:pageviewsPerSession,ga:avgSessionDuration,ga:goal7Completions,ga:goal8Completions',
                    startDate: '2017-06-30',
                    endDate: '2017-07-18',
                    sort: 'ga:sourceMedium'
                };
                var dictionary = {
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
                var reference = function (data, dictionary) {
                    var result = [];
                    data.forEach(function (item, index) {
                        var name = dictionary[item.name];
                        if (!name) {
                            name = index;
                        }
                        result.push(name);
                    });
                    return result;
                };
                AnalyticsService.Get(dimensions, function (result) {
                    if (result) {
                        $scope.rows = result.rows;
                        $scope.columnHeaders = reference(result.columnHeaders, dictionary);
                    }
                }, error_handler);
            };
            Draw();
        }]);
})(GoogleControllersModule || (GoogleControllersModule = {}));
//# sourceMappingURL=google_controllers.js.map