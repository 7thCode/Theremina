"use strict";

let Application: any = angular.module('Application', [
    'ngMessages', "ngResource", 'ngAnimate','ngSanitize',
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

