/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
/// <reference path="../common/notify/notify.ts" />
"use strict";
let AuthControllers = angular.module('AuthControllers', ["ngResource", 'ngMessages', 'ngAnimate']);
AuthControllers.controller('LoginController', ["$scope", "$rootScope", "$document", "$window", "$uibModal", '$log', 'AuthService', 'ProfileService', 'PublicKeyService',
    ($scope, $rootScope, $document, $window, $uibModal, $log, AuthService, ProfileService, PublicKeyService) => {
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
        //  $document.on('drop dragover', (e: any): void => {
        //      e.stopPropagation();
        //      e.preventDefault();
        //  });
        let confirmAccount = () => {
            let modalRegistConfirm = $uibModal.open({
                controller: 'RegisterConfirmDialogController',
                templateUrl: '/auth/dialogs/registerconfirmdialog',
                backdrop: "static",
                targetEvent: null
            });
            modalRegistConfirm.result.then(() => {
            }, () => {
            });
        };
        let confirmMember = () => {
            let modalRegistConfirm = $uibModal.open({
                controller: 'MemberConfirmDialogController',
                templateUrl: '/auth/dialogs/memberconfirmdialog',
                backdrop: "static",
                targetEvent: null
            });
            modalRegistConfirm.result.then(() => {
            }, () => {
            });
        };
        $scope.about = true;
        ProfileService.Get((self) => {
            if (self) {
                $scope.userid = self.userid;
            }
        }, error_handler);
        $scope.showRegisterDialog = (items) => {
            let modalRegist = $uibModal.open({
                controller: 'RegisterDialogController',
                templateUrl: '/auth/dialogs/registerdialog',
                backdrop: "static",
                resolve: {
                    items: () => {
                        return items;
                    }
                }
            });
            modalRegist.result.then(() => {
                confirmAccount();
            }, () => {
            });
        };
        $scope.Regist = (items) => {
            $scope.message = "";
            progress(true);
            AuthService.Regist($scope.items.username, $scope.items.password, $scope.items.displayName, items, (account) => {
                confirmAccount();
                progress(false);
            }, (error, message) => {
                $scope.message = message;
                progress(false);
            });
        };
        $scope.showMemberDialog = () => {
            let modalRegist = $uibModal.open({
                controller: 'MemberDialogController',
                templateUrl: '/auth/dialogs/memberdialog',
                backdrop: "static",
                resolve: {
                    items: () => {
                        return $scope.items;
                    }
                }
            });
            modalRegist.result.then(() => {
                confirmMember();
            }, () => {
            });
        };
        $scope.showLoginDialog = () => {
            let modalInstance = $uibModal.open({
                controller: 'LoginDialogController',
                templateUrl: '/auth/dialogs/logindialog',
                backdrop: "static",
                targetEvent: null
            });
            modalInstance.result.then((member) => {
                $rootScope.$broadcast('Login');
            }, () => {
            });
        };
        $scope.showPasswordDialog = () => {
            let modalInstance = $uibModal.open({
                controller: 'PasswordDialogController',
                templateUrl: '/auth/dialogs/passworddialog',
                backdrop: false,
                targetEvent: null
            });
            modalInstance.result.then(() => {
                let modalRegistConfirm = $uibModal.open({
                    controller: 'PasswordConfirmDialogController',
                    templateUrl: '/auth/dialogs/passwordconfirmdialog',
                    backdrop: "static",
                    targetEvent: null
                });
                modalRegistConfirm.result.then(() => {
                }, () => {
                });
            }, () => {
            });
        };
        $scope.Logout = () => {
            AuthService.Logout((account) => {
                $rootScope.$broadcast('Logout');
            });
        };
        $scope.go = (ref) => {
            $window.location.href = ref;
        };
        $scope.$on('Login', () => {
            $window.location.href = "//" + $window.location.host + "/pages";
        });
        $scope.$on('Logout', () => {
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
    ($scope, $window, $uibModalInstance, AuthService) => {
        let progress = (value) => {
            $scope.$emit('progress', value);
        };
        $scope.$on('progress', (event, value) => {
            $scope.progress = value;
        });
        $scope.hide = () => {
            $uibModalInstance.close();
        };
        $scope.cancel = () => {
            $uibModalInstance.dismiss();
        };
        $scope.go = (ref) => {
            $window.location.href = ref;
        };
        $scope.answer = (items) => {
            $scope.message = "";
            progress(true);
            AuthService.Login($scope.items.username, $scope.items.password, (account) => {
                $uibModalInstance.close(account);
                progress(false);
            }, (error, message) => {
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
    ($scope, $uibModalInstance, AuthService, items) => {
        let progress = (value) => {
            $scope.$emit('progress', value);
        };
        $scope.$on('progress', (event, value) => {
            $scope.progress = value;
        });
        $scope.hide = () => {
            $uibModalInstance.close();
        };
        $scope.cancel = () => {
            $uibModalInstance.dismiss();
        };
        $scope.answer = (scope) => {
            $scope.message = "";
            progress(true);
            AuthService.Regist($scope.items.username, $scope.items.password, $scope.items.displayName, items, (account) => {
                $uibModalInstance.close(account);
                progress(false);
            }, (error, message) => {
                $scope.message = message;
                progress(false);
            });
        };
    }]);
AuthControllers.controller('RegisterConfirmDialogController', ['$scope', '$uibModalInstance',
    ($scope, $uibModalInstance) => {
        $scope.hide = () => {
            $uibModalInstance.close();
        };
        $scope.cancel = () => {
            $uibModalInstance.dismiss();
        };
        $scope.answer = (answer) => {
            $uibModalInstance.close($scope);
        };
    }]);
AuthControllers.controller('MemberDialogController', ['$scope', '$uibModalInstance', 'AuthService',
    ($scope, $uibModalInstance, AuthService) => {
        let progress = (value) => {
            $scope.$emit('progress', value);
        };
        $scope.$on('progress', (event, value) => {
            $scope.progress = value;
        });
        $scope.hide = () => {
            $uibModalInstance.close();
        };
        $scope.cancel = () => {
            $uibModalInstance.dismiss();
        };
        $scope.answer = (items) => {
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
    ($scope, $uibModalInstance) => {
        $scope.hide = () => {
            $uibModalInstance.close();
        };
        $scope.cancel = () => {
            $uibModalInstance.dismiss();
        };
        $scope.answer = (answer) => {
            $uibModalInstance.close($scope);
        };
    }]);
/**
 * パスワード変更ダイアログ
 * @param target  Comment for parameter ´target´.
 * @returns       Comment for return value.
 */
AuthControllers.controller('PasswordDialogController', ['$scope', '$uibModalInstance', 'AuthService',
    ($scope, $uibModalInstance, AuthService) => {
        let progress = (value) => {
            $scope.$emit('progress', value);
        };
        $scope.hide = () => {
            $uibModalInstance.close();
        };
        $scope.cancel = () => {
            $uibModalInstance.dismiss();
        };
        $scope.answer = (answer) => {
            AuthService.Password($scope.items.username, $scope.items.password, (account) => {
                $uibModalInstance.close(account);
                progress(false);
            }, (error, message) => {
                $scope.message = message;
                progress(false);
            });
        };
    }]);
AuthControllers.controller('PasswordConfirmDialogController', ['$scope', '$uibModalInstance',
    ($scope, $uibModalInstance) => {
        $scope.hide = () => {
            $uibModalInstance.close();
        };
        $scope.cancel = () => {
            $uibModalInstance.dismiss();
        };
        $scope.answer = (answer) => {
            $uibModalInstance.close($scope);
        };
    }]);
//# sourceMappingURL=auth_controllers.js.map