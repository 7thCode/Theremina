/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var Setting;
(function (Setting) {
    let SettingControllers = angular.module('SettingControllers', ["ngResource"]);
    SettingControllers.controller('SettingController', ['$scope', '$document', '$log', '$uibModal', 'ApplicationSettingService', 'PluginsSettingService', 'ServicesSettingService', 'SystemSettingService', 'BackupService', 'RestoreService',
        ($scope, $document, $log, $uibModal, ApplicationSettingService, PluginsSettingService, ServicesSettingService, SystemSettingService, BackupService, RestoreService) => {
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
                alert(message);
            };
            let alert = (message) => {
                let modalInstance = $uibModal.open({
                    controller: 'AlertDialogController',
                    templateUrl: '/common/dialogs/alert_dialog',
                    resolve: {
                        items: () => {
                            return message;
                        }
                    }
                });
                modalInstance.result.then((answer) => {
                }, () => {
                });
            };
            $document.on('drop dragover', (e) => {
                e.stopPropagation();
                e.preventDefault();
            });
            let Backup = () => {
                let modalRegist = $uibModal.open({
                    controller: 'BackupConfirmController',
                    templateUrl: '/setting/dialogs/backup_confirm_dialog',
                    resolve: {
                        items: () => {
                            return null;
                        }
                    }
                });
                modalRegist.result.then((content) => {
                }, () => {
                });
            };
            let Restore = () => {
                let modalRegist = $uibModal.open({
                    controller: 'RestoreConfirmController',
                    templateUrl: '/setting/dialogs/restore_confirm_dialog',
                    resolve: {
                        items: () => {
                            return null;
                        }
                    }
                });
                modalRegist.result.then((content) => {
                }, () => {
                });
            };
            let Draw = () => {
                ApplicationSettingService.Get((application_data) => {
                    $scope.application_setting = application_data;
                }, error_handler);
                PluginsSettingService.Get((plugins_data) => {
                    $scope.plugins_setting = plugins_data;
                }, error_handler);
                ServicesSettingService.Get((services_data) => {
                    $scope.services_setting = services_data;
                }, error_handler);
                SystemSettingService.Get((system_data) => {
                    $scope.system_setting = system_data;
                }, error_handler);
            };
            let Maintenance = () => {
                $scope.system_setting.mode = 2;
            };
            let Write = () => {
                ApplicationSettingService.Put($scope.application_setting, (application_data) => {
                    $scope.application_setting = application_data;
                });
                PluginsSettingService.Put($scope.plugins_setting, (plugins_data) => {
                    $scope.plugins_setting = plugins_data;
                });
                ServicesSettingService.Put($scope.services_setting, (services_data) => {
                    $scope.services_setting = services_data;
                });
                SystemSettingService.Put($scope.system_setting, (system_data) => {
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
        ($scope, $log, $uibModalInstance, items, BackupService) => {
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
            $scope.hide = () => {
                $uibModalInstance.close();
            };
            $scope.cancel = () => {
                $uibModalInstance.dismiss();
            };
            $scope.answer = () => {
                progress(true);
                BackupService.Put((result) => {
                    progress(false);
                    $uibModalInstance.close({});
                }, error_handler);
            };
        }]);
    SettingControllers.controller('RestoreConfirmController', ['$scope', '$log', '$uibModalInstance', 'items', 'RestoreService',
        ($scope, $log, $uibModalInstance, items, RestoreService) => {
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
                window.alert(message);
            };
            $scope.hide = () => {
                $uibModalInstance.close();
            };
            $scope.cancel = () => {
                $uibModalInstance.dismiss();
            };
            $scope.answer = () => {
                progress(true);
                RestoreService.Put($scope.password, (result) => {
                    progress(false);
                    $uibModalInstance.close({});
                }, error_handler);
            };
        }]);
})(Setting || (Setting = {}));
//# sourceMappingURL=setting_controllers.js.map