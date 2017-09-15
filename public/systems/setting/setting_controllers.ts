/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace Setting {

    let SettingControllers: angular.IModule = angular.module('SettingControllers', ["ngResource"]);

    SettingControllers.controller('SettingController', ['$scope', '$document', '$log', '$uibModal', 'ApplicationSettingService', 'PluginsSettingService', 'ServicesSettingService', 'SystemSettingService', 'BackupService', 'RestoreService',
        ($scope: any, $document: any, $log: any, $uibModal: any, ApplicationSettingService: any, PluginsSettingService: any, ServicesSettingService: any, SystemSettingService: any, BackupService: any, RestoreService: any): void => {

            let progress = (value: any): void => {
                $scope.$emit('progress', value);
            };

            $scope.$on('progress', (event: any, value: any): void => {
                $scope.progress = value;
            });

            let error_handler: (code: number, message: string) => void = (code: number, message: string): void => {
                progress(false);
                $scope.message = message;
                $log.error(message);
                alert(message);
            };

            let alert = (message): void => {
                let modalInstance: any = $uibModal.open({
                    controller: 'AlertDialogController',
                    templateUrl: '/common/dialogs/alert_dialog',
                    resolve: {
                        items: (): any => {
                            return message;
                        }
                    }
                });
                modalInstance.result.then((answer: any): void => {
                }, (): void => {
                });
            };

            $document.on('drop dragover', (e: any): void => {
                e.stopPropagation();
                e.preventDefault();
            });

            let Backup = (): void => {
                let modalRegist: any = $uibModal.open({
                    controller: 'BackupConfirmController',
                    templateUrl: '/setting/dialogs/backup_confirm_dialog',
                    resolve: {
                        items: (): any => {
                            return null;
                        }
                    }
                });

                modalRegist.result.then((content): void => {
                }, (): void => {
                });
            };

            let Restore = (): void => {
                let modalRegist: any = $uibModal.open({
                    controller: 'RestoreConfirmController',
                    templateUrl: '/setting/dialogs/restore_confirm_dialog',
                    resolve: {
                        items: (): any => {
                            return null;
                        }
                    }
                });

                modalRegist.result.then((content): void => {
                }, (): void => {
                });

            };

            let Draw = (): void => {

                ApplicationSettingService.Get((application_data: any): void => {
                    $scope.application_setting = application_data;
                }, error_handler);

                PluginsSettingService.Get((plugins_data: any): void => {
                    $scope.plugins_setting = plugins_data;
                }, error_handler);

                ServicesSettingService.Get((services_data: any): void => {
                    $scope.services_setting = services_data;
                }, error_handler);

                SystemSettingService.Get((system_data: any): void => {
                    $scope.system_setting = system_data;
                }, error_handler);

            };

            let Maintenance = () => {
                $scope.system_setting.mode = 2;
            };

            let Write = (): void => {

                ApplicationSettingService.Put($scope.application_setting, (application_data: any): void => {
                    $scope.application_setting = application_data;
                });

                PluginsSettingService.Put($scope.plugins_setting, (plugins_data: any): void => {
                    $scope.plugins_setting = plugins_data;
                });

                ServicesSettingService.Put($scope.services_setting, (services_data: any): void => {
                    $scope.services_setting = services_data;
                });

                SystemSettingService.Put($scope.system_setting, (system_data: any): void => {
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
        ($scope: any, $log: any, $uibModalInstance: any, items: any, BackupService: any): void => {

            let progress = (value: any): void => {
                $scope.$emit('progress', value);
            };

            $scope.$on('progress', (event: any, value: any): void => {
                $scope.progress = value;
            });

            let error_handler: (code: number, message: string) => void = (code: number, message: string): void => {
                progress(false);
                $scope.message = message;
                $log.error(message);
            };

            $scope.hide = (): void => {
                $uibModalInstance.close();
            };

            $scope.cancel = (): void => {
                $uibModalInstance.dismiss();
            };

            $scope.answer = (): void => {
                progress(true);
                BackupService.Put((result): void => {
                    progress(false);
                    $uibModalInstance.close({});
                }, error_handler);
            };

        }]);

    SettingControllers.controller('RestoreConfirmController', ['$scope', '$log', '$uibModalInstance', 'items', 'RestoreService',
        ($scope: any, $log: any, $uibModalInstance: any, items: any, RestoreService: any): void => {

            let progress = (value: any): void => {
                $scope.$emit('progress', value);
            };

            $scope.$on('progress', (event: any, value: any): void => {
                $scope.progress = value;
            });

            let error_handler: (code: number, message: string) => void = (code: number, message: string): void => {
                progress(false);
                $scope.message = message;
                $log.error(message);
                window.alert(message);
            };

            $scope.hide = (): void => {
                $uibModalInstance.close();
            };

            $scope.cancel = (): void => {
                $uibModalInstance.dismiss();
            };

            $scope.answer = (): void => {
                progress(true);
                RestoreService.Put($scope.password,(result): void => {
                    progress(false);
                    $uibModalInstance.close({});
                }, error_handler);
            };

        }]);
}


