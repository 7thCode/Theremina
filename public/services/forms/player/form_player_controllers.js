/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
let FormPlayerControllers = angular.module('FormPlayerControllers', []);
FormPlayerControllers.controller('FormPlayerController', ["$scope", "$document", "$log", "$compile", "$uibModal", "FormPlayerService", "ArticleService",
    function ($scope, $document, $log, $compile, $uibModal, FormPlayerService, ArticleService) {
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
                controller: 'FormPlayerOpenDialogController',
                templateUrl: '/forms/dialogs/open_dialog',
                resolve: {
                    items: () => {
                    }
                }
            });
            modalRegist.result.then((layout) => {
                $scope.name = layout.name;
                FormPlayerService.current_page = layout.content;
                FormPlayerService.Draw();
                $scope.opened = true;
            }, () => {
            });
        };
        let Draw = () => {
            FormPlayerService.current_page = pages[page_no].contents;
            FormPlayerService.Draw();
        };
        let Clear = () => {
            let page = FormPlayerService.current_page;
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
            let page = FormPlayerService.current_page;
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
            let page = FormPlayerService.current_page;
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
                controller: 'FormPlayerCreateDialogController',
                templateUrl: '/forms/dialogs/create_dialog',
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
        FormPlayerService.$scope = $scope;
        FormPlayerService.$compile = $compile;
        //     Draw();
    }]);
FormPlayerControllers.controller('FormPlayerCreateDialogController', ['$scope', '$uibModalInstance', 'items',
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
FormPlayerControllers.controller('FormPlayerOpenDialogController', ['$scope', '$log', '$uibModalInstance', '$uibModal', 'items', 'FormPlayerService',
    ($scope, $log, $uibModalInstance, $uibModal, items, FormPlayerService) => {
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
        let Query = () => {
            progress(true);
            FormPlayerService.SetQuery(null);
            FormPlayerService.Query((value) => {
                $scope.pages = value;
                FormPlayerService.Over((hasnext) => { $scope.over = !hasnext; });
                FormPlayerService.Under((hasprev) => { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        let Find = (name) => {
            progress(true);
            FormPlayerService.SetQuery(null);
            if (name) {
                FormPlayerService.SetQuery({ name: name });
            }
            FormPlayerService.Query((result) => {
                if (result) {
                    $scope.pages = result;
                }
                FormPlayerService.Over((hasnext) => { $scope.over = !hasnext; });
                FormPlayerService.Under((hasprev) => { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        let Next = () => {
            progress(true);
            FormPlayerService.Next((result) => {
                if (result) {
                    $scope.pages = result;
                }
                FormPlayerService.Over((hasnext) => { $scope.over = !hasnext; });
                FormPlayerService.Under((hasprev) => { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        let Prev = () => {
            progress(true);
            FormPlayerService.Prev((result) => {
                if (result) {
                    $scope.pages = result;
                }
                FormPlayerService.Over((hasnext) => { $scope.over = !hasnext; });
                FormPlayerService.Under((hasprev) => { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        let Get = (layout) => {
            progress(true);
            FormPlayerService.Get(layout._id, (result) => {
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
//# sourceMappingURL=form_player_controllers.js.map