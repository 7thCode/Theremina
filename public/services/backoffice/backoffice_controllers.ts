/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

let BackOfficeControllers: angular.IModule = angular.module('BackOfficeControllers', []);

BackOfficeControllers.controller('BackOfficeController', ['$scope', '$document','$log','LocationService','PluginsSettingService','Socket',
    ($scope: any, $document: any,$log:any, LocationService:any,PluginsSettingService:any, Socket:any): void => {

        let map;

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
        };

        $scope.Notify = (message: any): void => {
            Socket.emit("server", {value: message}, (): void => {
                let hoge = 1;
            });
        };

        Socket.on("client", (data: any): void => {
            let notifier = new NotifierModule.Notifier();
            notifier.Pass(data);
        });

        $scope.update_site = (message: string): void => {
            Socket.emit("server", {value: message}, (): void => {

            });
        };


    }]);