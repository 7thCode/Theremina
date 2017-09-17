/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
let BackOfficeControllers = angular.module('BackOfficeControllers', []);
BackOfficeControllers.controller('BackOfficeController', ['$scope', '$document', '$log', 'LocationService', 'PluginsSettingService', 'Socket',
    ($scope, $document, $log, LocationService, PluginsSettingService, Socket) => {
        let map;
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
        };
        $scope.Notify = (message) => {
            Socket.emit("server", { value: message }, () => {
                let hoge = 1;
            });
        };
        Socket.on("client", (data) => {
            let notifier = new NotifierModule.Notifier();
            notifier.Pass(data);
        });
        $scope.update_site = (message) => {
            Socket.emit("server", { value: message }, () => {
            });
        };
    }]);
//# sourceMappingURL=backoffice_controllers.js.map