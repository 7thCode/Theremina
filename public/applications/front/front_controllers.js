/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
let FrontControllers = angular.module('FrontControllers', ['ui.bootstrap', 'ngAnimate', 'flow', 'ui.ace']);
FrontControllers.controller('EventController', ['$scope',
    ($scope) => {
        //    $scope.$on('change_controller', (event, value) => {
        //        $scope.controller_name = value;
        //    });
    }]);
FrontControllers.controller('FrontController', ['$scope', '$rootScope', '$log', '$compile', '$uibModal', 'ProfileService',
    ($scope, $rootScope, $log, $compile, $uibModal, ProfileService) => {
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
        $scope.BuildSite = () => {
            let modalRegist = $uibModal.open({
                controller: 'BuildSiteDialogController',
                templateUrl: '/front/dialogs/build_site_dialog',
                resolve: {
                    items: $scope
                }
            });
            modalRegist.result.then((resource) => {
                $rootScope.$emit('change_files', {});
                //  Query();
            }, () => {
            });
        };
        ProfileService.Get((self) => {
            if (self) {
                if (!self.local.address) {
                    //         SelfInit(self);
                }
            }
        }, error_handler);
        /*
                let SelfInit: (self: any) => void = (self: any): void => {
        
                    let modalRegist: any = $uibModal.open({
                        controller: 'SelfUpdateDialogController',
                        templateUrl: '/dialogs/self_update_dialog',
                        backdrop: false,
                        resolve: {
                            items: null
                        }
                    });
        
                    modalRegist.result.then((dialog_scope: any): void => {
                        let mails = [];
                        if (dialog_scope.mails) {
                            mails = dialog_scope.mails;
                        }
                        ProfileService.Put({
                            nickname: dialog_scope.nickname,
                            mails: mails
                        }, (result: any): void => {
        
                        }, error_handler);
                    }, (): void => {
                    });
                };
        +/
                /*
                $scope.Notify = (message: any): void => {
                    Socket.emit("server", {value: message}, (): void => {
                        let hoge = 1;
                    });
                };
        
                Socket.on("client", (data: any): void => {
                    let notifier = new NotifierModule.Notifier();
                    notifier.Pass(data);
                });
        */
    }]);
FrontControllers.controller('UserSettingController', ['$scope', '$rootScope', '$q', '$document', '$uibModal', '$log', 'ProfileService', "SessionService", 'DataService',
    ($scope, $rootScope, $q, $document, $uibModal, $log, ProfileService, SessionService, DataService) => {
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
        ProfileService.Get((self) => {
            if (self) {
                $scope.userid = self.username;
            }
        }, error_handler);
        $document.on('drop dragover', (e) => {
            e.stopPropagation();
            e.preventDefault();
        });
        //$rootScope.$on('get_namespaces', (event, value): void => {
        //         $scope.namespaces = value;
        //});
        $rootScope.$on('change_namespace', (event, value) => {
            $scope.namespace = value;
        });
        $scope.UploadBackup = (file) => {
            progress(true);
            let fileReader = new FileReader();
            fileReader.onload = (event) => {
                DataService.Upload(event.target.result, file[0].name, (result) => {
                }, (code, message) => {
                });
            };
            fileReader.readAsDataURL(file[0].file);
        };
    }]);
FrontControllers.controller('BuildSiteDialogController', ['$scope', '$log', '$uibModalInstance', 'SiteService', 'items',
    ($scope, $log, $uibModalInstance, SiteService, items) => {
        let file = items.file;
        let target = items.target;
        let parent_scope = items;
        $scope.name = "sample";
        if (file) {
            $scope.title = file.name;
            $scope.mimetype = file.type;
        }
        let progress = (value) => {
            $scope.$emit('progress', value);
        };
        $scope.$on('progress', (event, value) => {
            parent_scope.progress = value;
        });
        let error_handler = (code, message) => {
            progress(false);
            $scope.message = message;
            $log.error(message);
        };
        $scope.type = 20;
        $scope.hide = () => {
            $uibModalInstance.close();
        };
        $scope.cancel = () => {
            $uibModalInstance.dismiss();
        };
        $scope.answer = (name) => {
            progress(true);
            let namespace = $scope.namespace;
            SiteService.Build(name, namespace, (result) => {
                progress(false);
                $scope.message = "";
                $uibModalInstance.close(result);
            }, error_handler);
        };
    }]);
//# sourceMappingURL=front_controllers.js.map