/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
let ResourcePlayerControllers = angular.module('ResourcePlayerControllers', []);
ResourcePlayerControllers.controller('ResourcePlayerController', ["$scope", "$document", "$log", "$compile", "$uibModal", "ResourcePlayerService", "ArticleService",
    function ($scope, $document, $log, $compile, $uibModal, HtmlPlayerService, ArticleService) {
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
        let page_no = 0;
        let pages = [
            {
                contents: []
            }
        ];
        let current_id = null;
        let Init = () => {
            $scope.opened = false;
            page_no = 0;
            pages = [{ contents: [] }];
        };
        let Open = () => {
            Init();
            let modalRegist = $uibModal.open({
                controller: 'ResourcePlayerOpenDialogController',
                templateUrl: '/resources/dialogs/open_dialog',
                resolve: {
                    items: () => {
                    }
                }
            });
            modalRegist.result.then((layout) => {
                $scope.name = layout.name;
                HtmlPlayerService.current_page = layout.content;
                HtmlPlayerService.Draw();
                $scope.opened = true;
            }, () => {
            });
        };
        let Draw = () => {
            HtmlPlayerService.current_page = pages[page_no].contents;
            HtmlPlayerService.Draw();
        };
        let Clear = () => {
            let page = HtmlPlayerService.current_page;
            _.forEach(page, (control) => {
                _.forEach(control.elements, (element) => {
                    let attributes = element.attributes;
                    if (attributes["ng-model"]) {
                        let name = attributes["ng-model"];
                        $scope[name] = "";
                    }
                });
            });
            Draw();
        };
        let Map = (result) => {
            let page = HtmlPlayerService.current_page;
            _.forEach(page, (control) => {
                _.forEach(control.elements, (element) => {
                    let attributes = element.attributes;
                    if (attributes["ng-model"]) {
                        let name = attributes["ng-model"];
                        $scope[name] = result[element.label];
                    }
                });
            });
            Draw();
        };
        let Reduce = (result) => {
            let page = HtmlPlayerService.current_page;
            _.forEach(page, (control) => {
                _.forEach(control.elements, (element) => {
                    let attributes = element.attributes;
                    if (attributes["ng-model"]) {
                        let name = attributes["ng-model"];
                        if ($scope[name]) {
                            result[element.label] = $scope[name];
                        }
                    }
                });
            });
            return result;
        };
        let CreateArticle = () => {
            let modalRegist = $uibModal.open({
                controller: 'ResourcePlayerCreateDialogController',
                templateUrl: '/resources/dialogs/create_dialog',
                resolve: {
                    items: null
                }
            });
            modalRegist.result.then((dialog_scope) => {
                progress(true);
                let name = dialog_scope.title;
                ArticleService.Create(name, {}, (result) => {
                    current_id = result._id;
                    progress(false);
                }, error_handler);
            }, () => {
            });
        };
        let LoadArticle = (id) => {
            progress(true);
            ArticleService.Get(id, (result) => {
                $scope.current_article = result;
                current_id = id;
                if (result.content) {
                    Map(result.content);
                }
                $scope.opened = true;
                progress(false);
            }, error_handler);
        };
        let SaveArticle = () => {
            progress(true);
            let new_record = Reduce({});
            ArticleService.Put(current_id, new_record, (result) => {
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
    ($scope, $uibModalInstance, items) => {
        $scope.hide = () => {
            $uibModalInstance.close();
        };
        $scope.cancel = () => {
            $uibModalInstance.dismiss();
        };
        $scope.answer = () => {
            $uibModalInstance.close($scope);
        };
    }]);
ResourcePlayerControllers.controller('ResourcePlayerOpenDialogController', ['$scope', '$log', '$uibModalInstance', '$uibModal', 'items', 'ResourcePlayerService',
    ($scope, $log, $uibModalInstance, $uibModal, items, HtmlPlayerService) => {
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
        let Query = () => {
            progress(true);
            HtmlPlayerService.query = {};
            HtmlPlayerService.Query((value) => {
                $scope.pages = value;
                HtmlPlayerService.Over((hasnext) => { $scope.over = !hasnext; });
                HtmlPlayerService.Under((hasprev) => { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        let Find = (name) => {
            progress(true);
            HtmlPlayerService.query = {};
            if (name) {
                HtmlPlayerService.query = { name: name };
            }
            HtmlPlayerService.Query((result) => {
                if (result) {
                    $scope.pages = result;
                }
                HtmlPlayerService.Over((hasnext) => { $scope.over = !hasnext; });
                HtmlPlayerService.Under((hasprev) => { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        let Next = () => {
            progress(true);
            HtmlPlayerService.Next((result) => {
                if (result) {
                    $scope.pages = result;
                }
                HtmlPlayerService.Over((hasnext) => { $scope.over = !hasnext; });
                HtmlPlayerService.Under((hasprev) => { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        let Prev = () => {
            progress(true);
            HtmlPlayerService.Prev((result) => {
                if (result) {
                    $scope.pages = result;
                }
                HtmlPlayerService.Over((hasnext) => { $scope.over = !hasnext; });
                HtmlPlayerService.Under((hasprev) => { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        let Get = (layout) => {
            progress(true);
            HtmlPlayerService.Get(layout._id, (result) => {
                progress(false);
                $uibModalInstance.close(layout);
            }, error_handler);
        };
        let hide = () => {
            $uibModalInstance.close();
        };
        let cancel = () => {
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