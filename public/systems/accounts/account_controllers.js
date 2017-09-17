/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
/// <reference path="../../../node_modules/@types/angular/index.d.ts" />
"use strict";
let AccountControllers = angular.module('AccountControllers', ["ngResource"]);
AccountControllers.controller('AccountController', ['$scope', '$document', '$log', '$uibModal', 'AccountService',
    ($scope, $document, $log, $uibModal, AccountService) => {
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
        let Draw = () => {
            AccountService.Query((result) => {
                if (result) {
                    $scope.accounts = result;
                    AccountService.Over((hasnext) => { $scope.over = !hasnext; });
                    AccountService.Under((hasprev) => { $scope.under = !hasprev; });
                }
            }, error_handler);
        };
        let Count = () => {
            AccountService.Count((result) => {
                if (result) {
                    $scope.count = result;
                }
            }, error_handler);
        };
        let Next = () => {
            progress(true);
            AccountService.Next((result) => {
                if (result) {
                    $scope.accounts = result;
                }
                AccountService.Over((hasnext) => { $scope.over = !hasnext; });
                AccountService.Under((hasprev) => { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        let Prev = () => {
            progress(true);
            AccountService.Prev((result) => {
                if (result) {
                    $scope.accounts = result;
                }
                AccountService.Over((hasnext) => { $scope.over = !hasnext; });
                AccountService.Under((hasprev) => { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        let Find = (name) => {
            if (name) {
                AccountService.query = { username: { $regex: name } };
            }
            Draw();
            Count();
        };
        let Open = (acount) => {
            let modalRegist = $uibModal.open({
                controller: 'AccountOpenDialogController',
                templateUrl: '/accounts/dialogs/open_dialog',
                resolve: {
                    items: acount
                }
            });
            modalRegist.result.then((group) => {
                $scope.layout = group;
                $scope.name = group.name;
                $scope.opened = true;
            }, () => {
            });
        };
        $scope.Next = Next;
        $scope.Prev = Prev;
        $scope.Count = Count;
        $scope.Find = Find;
        $scope.Open = Open;
        Find(null);
    }]);
AccountControllers.controller('AccountOpenDialogController', ['$scope', '$uibModalInstance', 'items',
    ($scope, $uibModalInstance, items) => {
        $scope.items = items;
        $scope.hide = () => {
            $uibModalInstance.close();
        };
        $scope.cancel = () => {
            $uibModalInstance.dismiss();
        };
    }]);
//# sourceMappingURL=account_controllers.js.map