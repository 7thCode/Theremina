/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var GroupControllersModule;
(function (GroupControllersModule) {
    var GroupControllers = angular.module('GroupControllers', ["ngResource"]);
    GroupControllers.controller('GroupController', ['$scope', '$document', '$log', "$uibModal", 'GroupService',
        function ($scope, $document, $log, $uibModal, GroupService) {
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
            $document.on('drop dragover', function (e) {
                e.stopPropagation();
                e.preventDefault();
            });
            var Draw = function () {
                GroupService.Query(function (data) {
                    $scope.groups = data;
                    GroupService.Over(function (hasnext) {
                        $scope.over = !hasnext;
                    });
                    GroupService.Under(function (hasprev) {
                        $scope.under = !hasprev;
                    });
                }, error_handler);
            };
            var Count = function () {
                GroupService.Count(function (result) {
                    if (result) {
                        $scope.count = result;
                    }
                }, error_handler);
            };
            var Own = function () {
                var modalRegist = $uibModal.open({
                    controller: 'GroupOwnDialogController',
                    templateUrl: '/groups/dialogs/create_dialog',
                    resolve: {
                        items: $scope
                    }
                });
                modalRegist.result.then(function (group) {
                    $scope.layout = group;
                    $scope.name = group.name;
                    $scope.opened = true;
                    Draw();
                }, function () {
                });
            };
            var Create = function () {
                var modalRegist = $uibModal.open({
                    controller: 'GroupCreateDialogController',
                    templateUrl: '/groups/dialogs/create_dialog',
                    resolve: {
                        items: $scope
                    }
                });
                modalRegist.result.then(function (group) {
                    $scope.layout = group;
                    $scope.name = group.name;
                    $scope.opened = true;
                    Draw();
                }, function () {
                });
            };
            var Open = function (group) {
                var modalRegist = $uibModal.open({
                    controller: 'GroupOpenDialogController',
                    templateUrl: '/groups/dialogs/open_dialog',
                    resolve: {
                        items: group
                    }
                });
                modalRegist.result.then(function (group) {
                    $scope.layout = group;
                    $scope.name = group.name;
                    $scope.opened = true;
                }, function () {
                });
            };
            var Delete = function (group) {
                var modalRegist = $uibModal.open({
                    controller: 'GroupDeleteConfirmController',
                    templateUrl: '/groups/dialogs/delete_confirm_dialog',
                    resolve: {
                        items: group
                    }
                });
                modalRegist.result.then(function (content) {
                    $scope.name = "";
                    $scope.opened = false;
                    Draw();
                }, function () {
                });
            };
            var Next = function () {
                progress(true);
                GroupService.Next(function (result) {
                    if (result) {
                        $scope.groups = result;
                    }
                    GroupService.Over(function (hasnext) {
                        $scope.over = !hasnext;
                    });
                    GroupService.Under(function (hasprev) {
                        $scope.under = !hasprev;
                    });
                    progress(false);
                }, error_handler);
            };
            var Prev = function () {
                progress(true);
                GroupService.Prev(function (result) {
                    if (result) {
                        $scope.groups = result;
                    }
                    GroupService.Over(function (hasnext) {
                        $scope.over = !hasnext;
                    });
                    GroupService.Under(function (hasprev) {
                        $scope.under = !hasprev;
                    });
                    progress(false);
                }, error_handler);
            };
            var Find = function (name) {
                GroupService.query = {};
                if (name) {
                    GroupService.query = { name: { $regex: name } };
                }
                GroupService.Over(function (hasnext) {
                    $scope.over = !hasnext;
                });
                GroupService.Under(function (hasprev) {
                    $scope.under = !hasprev;
                });
                Draw();
            };
            $scope.Own = Own;
            $scope.Create = Create;
            $scope.Open = Open;
            $scope.Delete = Delete;
            $scope.Next = Next;
            $scope.Prev = Prev;
            $scope.Find = Find;
            Draw();
        }]);
    GroupControllers.controller('GroupOwnDialogController', ['$scope', '$log', '$uibModalInstance', 'GroupService', 'items',
        function ($scope, $log, $uibModalInstance, GroupService, items) {
            var progress = function (value) {
                $scope.$emit('progress', value);
            };
            $scope.$on('progress', function (event, value) {
                items.progress = value;
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
                GroupService.Own($scope.title, $scope.content, function (result) {
                    progress(false);
                    $scope.title = result.name;
                    $scope.message = "";
                    $uibModalInstance.close(result);
                }, error_handler);
            };
        }]);
    GroupControllers.controller('GroupCreateDialogController', ['$scope', '$log', '$uibModalInstance', 'GroupService', 'items',
        function ($scope, $log, $uibModalInstance, GroupService, items) {
            var progress = function (value) {
                $scope.$emit('progress', value);
            };
            $scope.$on('progress', function (event, value) {
                items.progress = value;
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
                GroupService.Create($scope.title, $scope.content, function (result) {
                    progress(false);
                    $scope.title = result.name;
                    $scope.message = "";
                    $uibModalInstance.close(result);
                }, error_handler);
            };
        }]);
    GroupControllers.controller('GroupOpenDialogController', ['$scope', '$log', '$uibModalInstance', 'GroupService', 'items',
        function ($scope, $log, $uibModalInstance, GroupService, items) {
            var progress = function (value) {
                $scope.$emit('progress', value);
            };
            $scope.$on('progress', function (event, value) {
                //      items.progress = value;
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
            progress(true);
            GroupService.Get(items._id, function (result) {
                $scope.message = "";
                progress(false);
                $scope.title = result.name;
            }, error_handler);
            $scope.answer = function () {
                progress(true);
                GroupService.Put(items._id, {}, function (result) {
                    $scope.message = "";
                    progress(false);
                    $uibModalInstance.close(result);
                }, error_handler);
            };
        }]);
    GroupControllers.controller('GroupDeleteConfirmController', ['$scope', '$log', '$uibModalInstance', 'GroupService', 'items',
        function ($scope, $log, $uibModalInstance, GroupService, items) {
            var progress = function (value) {
                $scope.$emit('progress', value);
            };
            $scope.$on('progress', function (event, value) {
                //      items.progress = value;
            });
            var error_handler = function (code, message) {
                progress(false);
                $scope.message = message;
                $log.error(message);
            };
            $scope.title = items.name;
            $scope.hide = function () {
                $uibModalInstance.close();
            };
            $scope.cancel = function () {
                $uibModalInstance.dismiss();
            };
            $scope.answer = function () {
                progress(true);
                GroupService.Delete(items._id, function (result) {
                    progress(false);
                    $uibModalInstance.close({});
                }, error_handler);
            };
        }]);
})(GroupControllersModule || (GroupControllersModule = {}));
//# sourceMappingURL=group_controllers.js.map