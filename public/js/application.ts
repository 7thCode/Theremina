/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

let Application: any = angular.module('Application', [
    'ngMessages', "ngResource", 'ngAnimate','ngSanitize','ui.bootstrap',
    'Services',
    "Controllers"
]);

Application.run(['$rootScope',
    function ($rootScope:any):void {
        $rootScope.$on("$routeChangeSuccess", (event: any, current: any, previous: any, rejection: any): void => {
        });
    }
]);

Application.config(['$sceDelegateProvider',function($sceDelegateProvider:any):void {
    $sceDelegateProvider.resourceUrlWhitelist(['**']);
}]);