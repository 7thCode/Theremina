/**!
 Copyright (c) 2016 7thCode.(https://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var AccountControllersModule;
(function (AccountControllersModule) {
    var AccountControllers = angular.module('AccountControllers', ["ngResource"]);
    AccountControllers.controller('AccountController', ['$scope', '$document', '$log', '$uibModal', 'AccountService',
        function ($scope, $document, $log, $uibModal, AccountService) {
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
            var Draw = function () {
                AccountService.Query(function (result) {
                    if (result) {
                        $scope.accounts = result;
                        AccountService.Over(function (hasnext) {
                            $scope.over = !hasnext;
                        });
                        AccountService.Under(function (hasprev) {
                            $scope.under = !hasprev;
                        });
                    }
                }, error_handler);
            };
            var Count = function () {
                AccountService.Count(function (result) {
                    if (result) {
                        $scope.count = result;
                    }
                }, error_handler);
            };
            var Next = function () {
                progress(true);
                AccountService.Next(function (result) {
                    if (result) {
                        $scope.accounts = result;
                    }
                    AccountService.Over(function (hasnext) {
                        $scope.over = !hasnext;
                    });
                    AccountService.Under(function (hasprev) {
                        $scope.under = !hasprev;
                    });
                    progress(false);
                }, error_handler);
            };
            var Prev = function () {
                progress(true);
                AccountService.Prev(function (result) {
                    if (result) {
                        $scope.accounts = result;
                    }
                    AccountService.Over(function (hasnext) {
                        $scope.over = !hasnext;
                    });
                    AccountService.Under(function (hasprev) {
                        $scope.under = !hasprev;
                    });
                    progress(false);
                }, error_handler);
            };
            var Find = function (name) {
                if (name) {
                    AccountService.query = { username: { $regex: name } };
                }
                Draw();
                Count();
            };
            var Open = function (acount) {
                var modalRegist = $uibModal.open({
                    controller: 'AccountOpenDialogController',
                    templateUrl: '/accounts/dialogs/open_dialog',
                    resolve: {
                        items: acount
                    }
                });
                modalRegist.result.then(function (group) {
                    $scope.layout = group;
                    $scope.name = group.name;
                    $scope.opened = true;
                }, function () {
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
        function ($scope, $uibModalInstance, items) {
            $scope.items = items;
            $scope.hide = function () {
                $uibModalInstance.close();
            };
            $scope.cancel = function () {
                $uibModalInstance.dismiss();
            };
        }]);
})(AccountControllersModule || (AccountControllersModule = {}));
//# sourceMappingURL=account_controllers.js.map