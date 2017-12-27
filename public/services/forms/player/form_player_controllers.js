/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var FormPlayerControllers = angular.module('FormPlayerControllers', []);
FormPlayerControllers.controller('FormPlayerController', ["$scope", "$document", "$log", "$compile", "$uibModal", "FormPlayerService", "ArticleService",
    function ($scope, $document, $log, $compile, $uibModal, FormPlayerService, ArticleService) {
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
                controller: 'FormPlayerOpenDialogController',
                templateUrl: '/forms/dialogs/open_dialog',
                resolve: {
                    items: function () {
                    }
                }
            });
            modalRegist.result.then(function (layout) {
                $scope.name = layout.name;
                FormPlayerService.current_page = layout.content;
                FormPlayerService.Draw();
                $scope.opened = true;
            }, function () {
            });
        };
        var Draw = function () {
            FormPlayerService.current_page = pages[page_no].contents;
            FormPlayerService.Draw();
        };
        var Clear = function () {
            var page = FormPlayerService.current_page;
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
            var page = FormPlayerService.current_page;
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
            var page = FormPlayerService.current_page;
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
                controller: 'FormPlayerCreateDialogController',
                templateUrl: '/forms/dialogs/create_dialog',
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
        FormPlayerService.$scope = $scope;
        FormPlayerService.$compile = $compile;
        //     Draw();
    }]);
FormPlayerControllers.controller('FormPlayerCreateDialogController', ['$scope', '$uibModalInstance', 'items',
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
FormPlayerControllers.controller('FormPlayerOpenDialogController', ['$scope', '$log', '$uibModalInstance', '$uibModal', 'items', 'FormPlayerService',
    function ($scope, $log, $uibModalInstance, $uibModal, items, FormPlayerService) {
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
        var Query = function () {
            progress(true);
            FormPlayerService.SetQuery(null);
            FormPlayerService.Query(function (value) {
                $scope.pages = value;
                FormPlayerService.Over(function (hasnext) { $scope.over = !hasnext; });
                FormPlayerService.Under(function (hasprev) { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        var Find = function (name) {
            progress(true);
            FormPlayerService.SetQuery(null);
            if (name) {
                FormPlayerService.SetQuery({ name: name });
            }
            FormPlayerService.Query(function (result) {
                if (result) {
                    $scope.pages = result;
                }
                FormPlayerService.Over(function (hasnext) { $scope.over = !hasnext; });
                FormPlayerService.Under(function (hasprev) { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        var Next = function () {
            progress(true);
            FormPlayerService.Next(function (result) {
                if (result) {
                    $scope.pages = result;
                }
                FormPlayerService.Over(function (hasnext) { $scope.over = !hasnext; });
                FormPlayerService.Under(function (hasprev) { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        var Prev = function () {
            progress(true);
            FormPlayerService.Prev(function (result) {
                if (result) {
                    $scope.pages = result;
                }
                FormPlayerService.Over(function (hasnext) { $scope.over = !hasnext; });
                FormPlayerService.Under(function (hasprev) { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        var Get = function (layout) {
            progress(true);
            FormPlayerService.Get(layout._id, function (result) {
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
//# sourceMappingURL=form_player_controllers.js.map