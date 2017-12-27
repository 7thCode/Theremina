/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var Setting;
(function (Setting) {
    var SettingControllers = angular.module('SettingControllers', ["ngResource"]);
    SettingControllers.controller('SettingController', ['$scope', '$document', '$log', '$uibModal', 'ApplicationSettingService', 'PluginsSettingService', 'ServicesSettingService', 'SystemSettingService', 'BackupService', 'RestoreService',
        function ($scope, $document, $log, $uibModal, ApplicationSettingService, PluginsSettingService, ServicesSettingService, SystemSettingService, BackupService, RestoreService) {
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
            $document.on('drop dragover', function (e) {
                e.stopPropagation();
                e.preventDefault();
            });
            var Backup = function () {
                var modalRegist = $uibModal.open({
                    controller: 'BackupConfirmController',
                    templateUrl: '/setting/dialogs/backup_confirm_dialog',
                    resolve: {
                        items: function () {
                            return null;
                        }
                    }
                });
                modalRegist.result.then(function (content) {
                }, function () {
                });
            };
            var Restore = function () {
                var modalRegist = $uibModal.open({
                    controller: 'RestoreConfirmController',
                    templateUrl: '/setting/dialogs/restore_confirm_dialog',
                    resolve: {
                        items: function () {
                            return null;
                        }
                    }
                });
                modalRegist.result.then(function (content) {
                }, function () {
                });
            };
            var Draw = function () {
                ApplicationSettingService.Get(function (application_data) {
                    $scope.application_setting = application_data;
                }, error_handler);
                PluginsSettingService.Get(function (plugins_data) {
                    $scope.plugins_setting = plugins_data;
                }, error_handler);
                ServicesSettingService.Get(function (services_data) {
                    $scope.services_setting = services_data;
                }, error_handler);
                SystemSettingService.Get(function (system_data) {
                    $scope.system_setting = system_data;
                }, error_handler);
            };
            var Maintenance = function () {
                $scope.system_setting.mode = 2;
            };
            var Write = function () {
                ApplicationSettingService.Put($scope.application_setting, function (application_data) {
                    $scope.application_setting = application_data;
                });
                PluginsSettingService.Put($scope.plugins_setting, function (plugins_data) {
                    $scope.plugins_setting = plugins_data;
                });
                ServicesSettingService.Put($scope.services_setting, function (services_data) {
                    $scope.services_setting = services_data;
                });
                SystemSettingService.Put($scope.system_setting, function (system_data) {
                    $scope.system_setting = system_data;
                });
            };
            $scope.Maintenance = Maintenance;
            $scope.Backup = Backup;
            $scope.Restore = Restore;
            $scope.Write = Write;
            Draw();
        }]);
    SettingControllers.controller('BackupConfirmController', ['$scope', '$log', '$uibModalInstance', 'items', 'BackupService',
        function ($scope, $log, $uibModalInstance, items, BackupService) {
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
            };
            $scope.hide = function () {
                $uibModalInstance.close();
            };
            $scope.cancel = function () {
                $uibModalInstance.dismiss();
            };
            $scope.answer = function () {
                progress(true);
                BackupService.Put(function (result) {
                    progress(false);
                    $uibModalInstance.close({});
                }, error_handler);
            };
        }]);
    SettingControllers.controller('RestoreConfirmController', ['$scope', '$log', '$uibModalInstance', 'items', 'RestoreService',
        function ($scope, $log, $uibModalInstance, items, RestoreService) {
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
                window.alert(message);
            };
            $scope.hide = function () {
                $uibModalInstance.close();
            };
            $scope.cancel = function () {
                $uibModalInstance.dismiss();
            };
            $scope.answer = function () {
                progress(true);
                RestoreService.Put($scope.password, function (result) {
                    progress(false);
                    $uibModalInstance.close({});
                }, error_handler);
            };
        }]);
})(Setting || (Setting = {}));
//# sourceMappingURL=setting_controllers.js.map