/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var BackOfficeControllers = angular.module('BackOfficeControllers', []);
//Front
BackOfficeControllers.controller('EventController', ['$scope',
    function ($scope) {
        //     $scope.$on('change_controller', (event, value) => {
        //         $scope.controller_name = value;
        //     });
    }]);
BackOfficeControllers.controller('BackOfficeController', ['$scope',
    function ($scope) {
        /*
                $scope.Notify = (message:any):void => {
                    Socket.emit("server", {value: message}, ():void => {
                        let hoge = 1;
                    });
                };

                Socket.on("client", (data:any):void => {
                    let notifier = new NotifierModule.Notifier();
                    notifier.Pass(data);
                });

                $scope.update_site = (message:string):void => {
                    Socket.emit("server", {value: message}, ():void => {
                        let hoge = 1;
                    });
                };
        */
        var progress = function (value) {
            $scope.$emit('progress', value);
        };
        $scope.$on('progress', function (event, value) {
            $scope.progress = value;
        });
    }]);
//# sourceMappingURL=backoffice_controllers.js.map