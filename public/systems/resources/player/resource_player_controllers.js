/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var ResourcePlayerControllers = angular.module('ResourcePlayerControllers', []);
ResourcePlayerControllers.controller('ResourcePlayerController', ["$scope", "$document", "$log", "$compile", "$uibModal", "ResourcePlayerService", "ArticleService",
    function ($scope, $document, $log, $compile, $uibModal, HtmlPlayerService, ArticleService) {
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
        var page_no = 0;
        var pages = [
            {
                contents: []
            }
        ];
        var current_id = null;
        var Init = function () {
            $scope.opened = false;
            page_no = 0;
            pages = [{ contents: [] }];
        };
        var Open = function () {
            Init();
            var modalRegist = $uibModal.open({
                controller: 'ResourcePlayerOpenDialogController',
                templateUrl: '/resources/dialogs/open_dialog',
                resolve: {
                    items: function () {
                    }
                }
            });
            modalRegist.result.then(function (layout) {
                $scope.name = layout.name;
                HtmlPlayerService.current_page = layout.content;
                HtmlPlayerService.Draw();
                $scope.opened = true;
            }, function () {
            });
        };
        var Draw = function () {
            HtmlPlayerService.current_page = pages[page_no].contents;
            HtmlPlayerService.Draw();
        };
        var Clear = function () {
            var page = HtmlPlayerService.current_page;
            _.forEach(page, function (control) {
                _.forEach(control.elements, function (element) {
                    var attributes = element.attributes;
                    if (attributes["ng-model"]) {
                        var name_1 = attributes["ng-model"];
                        $scope[name_1] = "";
                    }
                });
            });
            Draw();
        };
        var Map = function (result) {
            var page = HtmlPlayerService.current_page;
            _.forEach(page, function (control) {
                _.forEach(control.elements, function (element) {
                    var attributes = element.attributes;
                    if (attributes["ng-model"]) {
                        var name_2 = attributes["ng-model"];
                        $scope[name_2] = result[element.label];
                    }
                });
            });
            Draw();
        };
        var Reduce = function (result) {
            var page = HtmlPlayerService.current_page;
            _.forEach(page, function (control) {
                _.forEach(control.elements, function (element) {
                    var attributes = element.attributes;
                    if (attributes["ng-model"]) {
                        var name_3 = attributes["ng-model"];
                        if ($scope[name_3]) {
                            result[element.label] = $scope[name_3];
                        }
                    }
                });
            });
            return result;
        };
        var CreateArticle = function () {
            var modalRegist = $uibModal.open({
                controller: 'ResourcePlayerCreateDialogController',
                templateUrl: '/resources/dialogs/create_dialog',
                resolve: {
                    items: null
                }
            });
            modalRegist.result.then(function (dialog_scope) {
                progress(true);
                var name = dialog_scope.title;
                ArticleService.Create(name, {}, function (result) {
                    current_id = result._id;
                    progress(false);
                }, error_handler);
            }, function () {
            });
        };
        var LoadArticle = function (id) {
            progress(true);
            ArticleService.Get(id, function (result) {
                $scope.current_article = result;
                current_id = id;
                if (result.content) {
                    Map(result.content);
                }
                $scope.opened = true;
                progress(false);
            }, error_handler);
        };
        var SaveArticle = function () {
            progress(true);
            var new_record = Reduce({});
            ArticleService.Put(current_id, new_record, function (result) {
                progress(false);
            }, error_handler);
        };
        $scope.opened = false;
        $scope.Open = Open;
        $scope.CreateArticle = CreateArticle;
        $scope.LoadArticle = LoadArticle;
        $scope.SaveArticle = SaveArticle;
        HtmlPlayerService.$scope = $scope;
        HtmlPlayerService.$compile = $compile;
        //     Draw();
    }]);
ResourcePlayerControllers.controller('ResourcePlayerCreateDialogController', ['$scope', '$uibModalInstance', 'items',
    function ($scope, $uibModalInstance, items) {
        $scope.hide = function () {
            $uibModalInstance.close();
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
        $scope.answer = function () {
            $uibModalInstance.close($scope);
        };
    }]);
ResourcePlayerControllers.controller('ResourcePlayerOpenDialogController', ['$scope', '$log', '$uibModalInstance', '$uibModal', 'items', 'ResourcePlayerService',
    function ($scope, $log, $uibModalInstance, $uibModal, items, HtmlPlayerService) {
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
        var Query = function () {
            progress(true);
            HtmlPlayerService.query = {};
            HtmlPlayerService.Query(function (value) {
                $scope.pages = value;
                HtmlPlayerService.Over(function (hasnext) { $scope.over = !hasnext; });
                HtmlPlayerService.Under(function (hasprev) { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        var Find = function (name) {
            progress(true);
            HtmlPlayerService.query = {};
            if (name) {
                HtmlPlayerService.query = { name: name };
            }
            HtmlPlayerService.Query(function (result) {
                if (result) {
                    $scope.pages = result;
                }
                HtmlPlayerService.Over(function (hasnext) { $scope.over = !hasnext; });
                HtmlPlayerService.Under(function (hasprev) { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        var Next = function () {
            progress(true);
            HtmlPlayerService.Next(function (result) {
                if (result) {
                    $scope.pages = result;
                }
                HtmlPlayerService.Over(function (hasnext) { $scope.over = !hasnext; });
                HtmlPlayerService.Under(function (hasprev) { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        var Prev = function () {
            progress(true);
            HtmlPlayerService.Prev(function (result) {
                if (result) {
                    $scope.pages = result;
                }
                HtmlPlayerService.Over(function (hasnext) { $scope.over = !hasnext; });
                HtmlPlayerService.Under(function (hasprev) { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        var Get = function (layout) {
            progress(true);
            HtmlPlayerService.Get(layout._id, function (result) {
                progress(false);
                $uibModalInstance.close(layout);
            }, error_handler);
        };
        var hide = function () {
            $uibModalInstance.close();
        };
        var cancel = function () {
            $uibModalInstance.dismiss();
        };
        $scope.Next = Next;
        $scope.Prev = Prev;
        $scope.Find = Find;
        $scope.Get = Get;
        $scope.hide = hide;
        $scope.cancel = cancel;
        Query();
    }]);
//# sourceMappingURL=resource_player_controllers.js.map