/**!
 Copyright (c) 2016 7thCode.(https://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
/// <reference path="../common/notify/notify.ts" />
"use strict";
var AuthControllersModule;
(function (AuthControllersModule) {
    var AuthControllers = angular.module('AuthControllers', ["ngResource", 'ngMessages', 'ngAnimate']);
    AuthControllers.controller('LoginController', ["$scope", "$rootScope", "$document", "$window", "$uibModal", '$log', 'AuthService', 'ProfileService', 'PublicKeyService',
        function ($scope, $rootScope, $document, $window, $uibModal, $log, AuthService, ProfileService, PublicKeyService) {
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
            //  $document.on('drop dragover', (e: any): void => {
            //      e.stopPropagation();
            //      e.preventDefault();
            //  });
            var confirmAccount = function () {
                var modalRegistConfirm = $uibModal.open({
                    controller: 'RegisterConfirmDialogController',
                    templateUrl: '/auth/dialogs/registerconfirmdialog',
                    backdrop: "static",
                    targetEvent: null
                });
                modalRegistConfirm.result.then(function () {
                }, function () {
                });
            };
            /*
                        let confirmMember = () => {
                            let modalRegistConfirm = $uibModal.open({
                                controller: 'MemberConfirmDialogController',
                                templateUrl: '/auth/dialogs/memberconfirmdialog',
                                backdrop: "static",
                                targetEvent: null
                            });
            
                            modalRegistConfirm.result.then((): void => {
                            }, (): void => {
                            });
                        };
            */
            $scope.about = true;
            ProfileService.Get(function (self) {
                if (self) {
                    $scope.userid = self.userid;
                }
            }, error_handler);
            $scope.showRegisterDialog = function (items) {
                var modalRegist = $uibModal.open({
                    controller: 'RegisterDialogController',
                    templateUrl: '/auth/dialogs/registerdialog',
                    backdrop: "static",
                    resolve: {
                        items: function () {
                            return items;
                        }
                    }
                });
                modalRegist.result.then(function () {
                    confirmAccount();
                }, function () {
                });
            };
            $scope.Regist = function (items) {
                $scope.message = "";
                progress(true);
                AuthService.Regist($scope.items.username, $scope.items.password, $scope.items.displayName, items, function (account) {
                    confirmAccount();
                    progress(false);
                }, function (error, message) {
                    $scope.message = message;
                    progress(false);
                });
            };
            /*
                        $scope.showMemberDialog = (): void => {
                            let modalRegist = $uibModal.open({
                                controller: 'MemberDialogController',
                                templateUrl: '/auth/dialogs/memberdialog',
                                backdrop: "static",
                                resolve: {
                                    items: (): any => {
                                        return $scope.items;
                                    }
                                }
                            });
            
                            modalRegist.result.then((): void => {
                                confirmMember();
                            }, (): void => {
                            });
                        };
            */
            $scope.showLoginDialog = function () {
                var modalInstance = $uibModal.open({
                    controller: 'LoginDialogController',
                    templateUrl: '/auth/dialogs/logindialog',
                    backdrop: "static",
                    targetEvent: null
                });
                modalInstance.result.then(function (member) {
                    $rootScope.$broadcast('Login');
                }, function () {
                });
            };
            $scope.showPasswordDialog = function () {
                var modalInstance = $uibModal.open({
                    controller: 'PasswordDialogController',
                    templateUrl: '/auth/dialogs/passworddialog',
                    backdrop: false,
                    targetEvent: null
                });
                modalInstance.result.then(function () {
                    var modalRegistConfirm = $uibModal.open({
                        controller: 'PasswordConfirmDialogController',
                        templateUrl: '/auth/dialogs/passwordconfirmdialog',
                        backdrop: "static",
                        targetEvent: null
                    });
                    modalRegistConfirm.result.then(function () {
                    }, function () {
                    });
                }, function () {
                });
            };
            $scope.Logout = function () {
                AuthService.Logout(function (account) {
                    $rootScope.$broadcast('Logout');
                });
            };
            $scope.go = function (ref) {
                $window.location.href = ref;
            };
            $scope.$on('Login', function () {
                $window.location.href = "//" + $window.location.host + "/front";
            });
            $scope.$on('Logout', function () {
                $window.location.href = "//" + $window.location.host + "/";
            });
        }]);
    //! dialogs
    /**
     * ログインダイアログ
     * @param target  Comment for parameter ´target´.
     * @returns       Comment for return value.
     */
    AuthControllers.controller('LoginDialogController', ['$scope', '$window', '$uibModalInstance', 'AuthService',
        function ($scope, $window, $uibModalInstance, AuthService) {
            var progress = function (value) {
                $scope.$emit('progress', value);
            };
            $scope.$on('progress', function (event, value) {
                $scope.progress = value;
            });
            $scope.hide = function () {
                $uibModalInstance.close();
            };
            $scope.cancel = function () {
                $uibModalInstance.dismiss();
            };
            $scope.go = function (ref) {
                $window.location.href = ref;
            };
            $scope.answer = function (items) {
                $scope.message = "";
                progress(true);
                AuthService.Login($scope.items.username, $scope.items.password, function (account) {
                    $uibModalInstance.close(account);
                    progress(false);
                }, function (error, message) {
                    $scope.message = message;
                    progress(false);
                });
            };
        }]);
    /**
     * レジスターダイアログ
     * @param target  Comment for parameter ´target´.
     * @returns       Comment for return value.
     */
    AuthControllers.controller('RegisterDialogController', ['$scope', '$uibModalInstance', 'AuthService', 'items',
        function ($scope, $uibModalInstance, AuthService, items) {
            var progress = function (value) {
                $scope.$emit('progress', value);
            };
            $scope.$on('progress', function (event, value) {
                $scope.progress = value;
            });
            $scope.hide = function () {
                $uibModalInstance.close();
            };
            $scope.cancel = function () {
                $uibModalInstance.dismiss();
            };
            $scope.answer = function (scope) {
                $scope.message = "";
                progress(true);
                AuthService.Regist($scope.items.username, $scope.items.password, $scope.items.displayName, items, function (account) {
                    $uibModalInstance.close(account);
                    progress(false);
                }, function (error, message) {
                    $scope.message = message;
                    progress(false);
                });
            };
        }]);
    AuthControllers.controller('RegisterConfirmDialogController', ['$scope', '$uibModalInstance',
        function ($scope, $uibModalInstance) {
            $scope.hide = function () {
                $uibModalInstance.close();
            };
            $scope.cancel = function () {
                $uibModalInstance.dismiss();
            };
            $scope.answer = function (answer) {
                $uibModalInstance.close($scope);
            };
        }]);
    /*
        AuthControllers.controller('MemberDialogController', ['$scope', '$uibModalInstance', 'AuthService',
            ($scope: any, $uibModalInstance: any, AuthService: any): void => {
    
                let progress = (value) => {
                    $scope.$emit('progress', value);
                };
    
                $scope.$on('progress', (event, value) => {
                    $scope.progress = value;
                });
    
                $scope.hide = (): void => {
                    $uibModalInstance.close();
                };
    
                $scope.cancel = (): void => {
                    $uibModalInstance.dismiss();
                };
    
                $scope.answer = (items: any): void => {
                    $scope.message = "";
                    progress(true);
                    AuthService.Member($scope.items.username, $scope.items.password, $scope.items.displayName, items, (account) => {
                        $uibModalInstance.close(account);
                        progress(false);
                    }, (error, message) => {
                        $scope.message = message;
                        progress(false);
                    });
    
                };
            }]);
    
        AuthControllers.controller('MemberConfirmDialogController', ['$scope', '$uibModalInstance',
            ($scope: any, $uibModalInstance: any): void => {
    
                $scope.hide = (): void => {
                    $uibModalInstance.close();
                };
    
                $scope.cancel = (): void => {
                    $uibModalInstance.dismiss();
                };
    
                $scope.answer = (answer): void => {
                    $uibModalInstance.close($scope);
                };
    
            }]);
    */
    /**
     * パスワード変更ダイアログ
     * @param target  Comment for parameter ´target´.
     * @returns       Comment for return value.
     */
    AuthControllers.controller('PasswordDialogController', ['$scope', '$uibModalInstance', 'AuthService',
        function ($scope, $uibModalInstance, AuthService) {
            var progress = function (value) {
                $scope.$emit('progress', value);
            };
            $scope.hide = function () {
                $uibModalInstance.close();
            };
            $scope.cancel = function () {
                $uibModalInstance.dismiss();
            };
            $scope.answer = function (answer) {
                AuthService.Password($scope.items.username, $scope.items.password, function (account) {
                    $uibModalInstance.close(account);
                    progress(false);
                }, function (error, message) {
                    $scope.message = message;
                    progress(false);
                });
            };
        }]);
    AuthControllers.controller('PasswordConfirmDialogController', ['$scope', '$uibModalInstance',
        function ($scope, $uibModalInstance) {
            $scope.hide = function () {
                $uibModalInstance.close();
            };
            $scope.cancel = function () {
                $uibModalInstance.dismiss();
            };
            $scope.answer = function (answer) {
                $uibModalInstance.close($scope);
            };
        }]);
})(AuthControllersModule || (AuthControllersModule = {}));
//# sourceMappingURL=auth_controllers.js.map