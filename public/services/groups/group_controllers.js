/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
let GroupControllers = angular.module('GroupControllers', ["ngResource"]);
GroupControllers.controller('GroupController', ['$scope', '$document', '$log', "$uibModal", 'GroupService',
    ($scope, $document, $log, $uibModal, GroupService) => {
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
        $document.on('drop dragover', (e) => {
            e.stopPropagation();
            e.preventDefault();
        });
        let Draw = () => {
            GroupService.Query((data) => {
                $scope.groups = data;
                GroupService.Over((hasnext) => { $scope.over = !hasnext; });
                GroupService.Under((hasprev) => { $scope.under = !hasprev; });
            }, error_handler);
        };
        let Count = () => {
            GroupService.Count((result) => {
                if (result) {
                    $scope.count = result;
                }
            }, error_handler);
        };
        let Own = () => {
            let modalRegist = $uibModal.open({
                controller: 'GroupOwnDialogController',
                templateUrl: '/groups/dialogs/create_dialog',
                resolve: {
                    items: $scope
                }
            });
            modalRegist.result.then((group) => {
                $scope.layout = group;
                $scope.name = group.name;
                $scope.opened = true;
                Draw();
            }, () => {
            });
        };
        let Create = () => {
            let modalRegist = $uibModal.open({
                controller: 'GroupCreateDialogController',
                templateUrl: '/groups/dialogs/create_dialog',
                resolve: {
                    items: $scope
                }
            });
            modalRegist.result.then((group) => {
                $scope.layout = group;
                $scope.name = group.name;
                $scope.opened = true;
                Draw();
            }, () => {
            });
        };
        let Open = (group) => {
            let modalRegist = $uibModal.open({
                controller: 'GroupOpenDialogController',
                templateUrl: '/groups/dialogs/open_dialog',
                resolve: {
                    items: group
                }
            });
            modalRegist.result.then((group) => {
                $scope.layout = group;
                $scope.name = group.name;
                $scope.opened = true;
            }, () => {
            });
        };
        let Delete = (group) => {
            let modalRegist = $uibModal.open({
                controller: 'GroupDeleteConfirmController',
                templateUrl: '/groups/dialogs/delete_confirm_dialog',
                resolve: {
                    items: group
                }
            });
            modalRegist.result.then((content) => {
                $scope.name = "";
                $scope.opened = false;
                Draw();
            }, () => {
            });
        };
        let Next = () => {
            progress(true);
            GroupService.Next((result) => {
                if (result) {
                    $scope.groups = result;
                }
                GroupService.Over((hasnext) => { $scope.over = !hasnext; });
                GroupService.Under((hasprev) => { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        let Prev = () => {
            progress(true);
            GroupService.Prev((result) => {
                if (result) {
                    $scope.groups = result;
                }
                GroupService.Over((hasnext) => { $scope.over = !hasnext; });
                GroupService.Under((hasprev) => { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        let Find = (name) => {
            GroupService.query = {};
            if (name) {
                GroupService.query = { name: { $regex: name } };
            }
            GroupService.Over((hasnext) => { $scope.over = !hasnext; });
            GroupService.Under((hasprev) => { $scope.under = !hasprev; });
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
    ($scope, $log, $uibModalInstance, GroupService, items) => {
        let progress = (value) => {
            $scope.$emit('progress', value);
        };
        $scope.$on('progress', (event, value) => {
            items.progress = value;
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
            GroupService.Own($scope.title, $scope.content, (result) => {
                progress(false);
                $scope.title = result.name;
                $scope.message = "";
                $uibModalInstance.close(result);
            }, error_handler);
        };
    }]);
GroupControllers.controller('GroupCreateDialogController', ['$scope', '$log', '$uibModalInstance', 'GroupService', 'items',
    ($scope, $log, $uibModalInstance, GroupService, items) => {
        let progress = (value) => {
            $scope.$emit('progress', value);
        };
        $scope.$on('progress', (event, value) => {
            items.progress = value;
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
            GroupService.Create($scope.title, $scope.content, (result) => {
                progress(false);
                $scope.title = result.name;
                $scope.message = "";
                $uibModalInstance.close(result);
            }, error_handler);
        };
    }]);
GroupControllers.controller('GroupOpenDialogController', ['$scope', '$log', '$uibModalInstance', 'GroupService', 'items',
    ($scope, $log, $uibModalInstance, GroupService, items) => {
        let progress = (value) => {
            $scope.$emit('progress', value);
        };
        $scope.$on('progress', (event, value) => {
            //      items.progress = value;
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
        progress(true);
        GroupService.Get(items._id, (result) => {
            $scope.message = "";
            progress(false);
            $scope.title = result.name;
        }, error_handler);
        $scope.answer = () => {
            progress(true);
            GroupService.Put(items._id, {}, (result) => {
                $scope.message = "";
                progress(false);
                $uibModalInstance.close(result);
            }, error_handler);
        };
    }]);
GroupControllers.controller('GroupDeleteConfirmController', ['$scope', '$log', '$uibModalInstance', 'GroupService', 'items',
    ($scope, $log, $uibModalInstance, GroupService, items) => {
        let progress = (value) => {
            $scope.$emit('progress', value);
        };
        $scope.$on('progress', (event, value) => {
            //      items.progress = value;
        });
        let error_handler = (code, message) => {
            progress(false);
            $scope.message = message;
            $log.error(message);
        };
        $scope.title = items.name;
        $scope.hide = () => {
            $uibModalInstance.close();
        };
        $scope.cancel = () => {
            $uibModalInstance.dismiss();
        };
        $scope.answer = () => {
            progress(true);
            GroupService.Delete(items._id, (result) => {
                progress(false);
                $uibModalInstance.close({});
            }, error_handler);
        };
    }]);
//# sourceMappingURL=group_controllers.js.map