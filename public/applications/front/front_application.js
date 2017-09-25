/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
let FrontApplication = angular.module('FrontApplication', [
    'ngMessages', "ngResource", 'ngAnimate', 'ui.bootstrap', 'angular.chips', 'ui.ace', 'ngDraggable', 'angular-loading-bar',
    'ngSanitize',
    'textAngular',
    "Services",
    "AuthServices",
    "AuthControllers",
    "LayoutServices",
    'LayoutsProviders',
    'FileServices',
    "ResourceBuilderServices",
    "FormPlayerServices",
    "FormPlayerControllers",
    "FormsProviders",
    "ArticleServices",
    "FrontControllers",
    "FrontServices",
    "ImageControllers",
    "ImageServices",
    "GoogleServices",
    "YahooServices",
    "PublicKeyServices",
    "MailerControllers",
    "MailerServices",
    "GoogleServices",
    "GoogleControllers"
]);
FrontApplication.run(['$rootScope',
    function ($rootScope) {
        $rootScope.$on("$routeChangeSuccess", (event, current, previous, rejection) => {
        });
    }
]);
FrontApplication.config(['$compileProvider', '$httpProvider',
    ($compileProvider, $httpProvider) => {
        $compileProvider.debugInfoEnabled(false);
        $httpProvider.defaults.headers.common = { 'x-requested-with': 'XMLHttpRequest' };
        $httpProvider.defaults.headers.common['If-Modified-Since'] = 'Thu, 01 Jun 1970 00:00:00 GMT'; //マイクロソフトのバグ対応！！！
    }]);
FrontApplication.config(['$sceDelegateProvider', function ($sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist(['**']);
    }]);
FrontApplication.config(['ShapeEditProvider', function (ShapeEditProvider) {
        ShapeEditProvider.configure({
            wrapper: 'wrapper',
            canvas: 'canvas',
            width: 600,
            height: 600
        });
    }]);
FrontApplication.config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
        cfpLoadingBarProvider.parentSelector = '#body';
        cfpLoadingBarProvider.spinnerTemplate = '<div style="z-index:20000;position:fixed;top:50%;left:50%;margin-top:-70px;margin-left:-75px;"><div id="progress"><div id="rond"><div id="test"></div></div><div id="load"></div></div></div>';
        cfpLoadingBarProvider.latencyThreshold = 500;
    }]);
FrontApplication.filter('limit', [() => {
        return (text, limit) => {
            let result = "";
            if (text) {
                result = text;
                if (text.length > limit) {
                    result = text.slice(0, limit) + "...";
                }
            }
            return result;
        };
    }]);
FrontApplication.filter('round', [() => {
        return (value) => {
            let result = value;
            if (!isNaN(value)) {
                result = Math.round(value);
            }
            return result;
        };
    }]);
FrontApplication.controller('AlertDialogController', ['$scope', '$uibModalInstance', 'items',
    ($scope, $uibModalInstance, items) => {
        $scope.message = items;
        $scope.cancel = () => {
            $uibModalInstance.dismiss();
        };
    }]);
//# sourceMappingURL=front_application.js.map