/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
let Application = angular.module('Application', [
    'ngMessages', "ngResource", 'ngAnimate', 'ngSanitize', 'ui.bootstrap',
    'Services',
    "Controllers"
]);
Application.run(['$rootScope',
    function ($rootScope) {
        $rootScope.$on("$routeChangeSuccess", (event, current, previous, rejection) => {
        });
    }
]);
Application.config(['$sceDelegateProvider', function ($sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist(['**']);
    }]);
//# sourceMappingURL=application.js.map