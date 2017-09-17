/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
let ArticleControllers = angular.module('ArticleControllers', ["ngResource"]);
ArticleControllers.controller('ArticleController', ['$scope', '$document', '$log', '$compile', '$uibModal', "FormPlayerService", "ArticleService", 'Socket',
    ($scope, $document, $log, $compile, $uibModal, FormPlayerService, ArticleService, Socket) => {
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
        window.addEventListener('beforeunload', (e) => {
            if ($scope.opened) {
                //          e.returnValue = '';
            }
        }, false);
        Socket.on("client", (data) => {
            let notifier = new NotifierModule.Notifier();
            notifier.Pass(data);
        });
        let Notify = (message) => {
            Socket.emit("server", { value: message }, () => {
                //          let hoge = 1;
            });
        };
        ArticleService.option.skip = 0;
        //      ArticleService.option.limit = 40;//{sort: {create: -1}, limit: this.pagesize, skip: 0};
        FormPlayerService.$scope = $scope;
        FormPlayerService.$compile = $compile;
        let current_id = null;
        let page_name = ""; //a1
        let direction = -1;
        let Clear = () => {
            let page = FormPlayerService.current_page;
            _.forEach(page, (control) => {
                _.forEach(control.elements, (element) => {
                    let attributes = element.attributes;
                    if (attributes) {
                        let name = attributes["ng-model"];
                        if (name) {
                            $scope[name] = "";
                        }
                    }
                });
            });
            Draw(() => {
            });
        };
        /*
         resultで与えられたObjectのelementのlabelで示される値を取り出す。
         ng-modelの"名前"を取り出し、$scopeからその名前に対応する値を設定する。
         */
        let Map = (present) => {
            function unescapeHTML(value) {
                let result = value;
                if (typeof value == "string") {
                    let div = document.createElement("div");
                    div.innerHTML = value.replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/ /g, "&nbsp;")
                        .replace(/\r/g, "&#13;")
                        .replace(/\n/g, "&#10;");
                    result = div.textContent || div.innerText;
                }
                return result;
            }
            let page = FormPlayerService.current_page;
            _.forEach(page, (control) => {
                _.forEach(control.elements, (element) => {
                    let attributes = element.attributes;
                    if (attributes) {
                        let name = attributes["ng-model"];
                        if (name) {
                            let value = "";
                            if (present) {
                                if (present[element.label]) {
                                    value = present[element.label].value;
                                }
                            }
                            $scope[name] = unescapeHTML(value); //todo
                        }
                    }
                });
            });
        };
        /*
         ng-modelの"名前"を取り出し、$scopeからその名前に対応する値を取り出す。
         elementのlabelを名前として、その値をresultに。
         */
        let Reduce = () => {
            let result = {}; // ArticleService.current_article.content;
            if (!result) {
                result = {};
            }
            let page = FormPlayerService.current_page;
            _.forEach(page, (control) => {
                _.forEach(control.elements, (element) => {
                    let attributes = element.attributes;
                    if (attributes) {
                        let name = attributes["ng-model"];
                        if (name) {
                            if ($scope[name]) {
                                let type = "";
                                let value = $scope[name];
                                switch (element.type) {
                                    case "field":
                                    case "select":
                                        type = "quoted";
                                        break;
                                    case "textarea":
                                        switch (control.type) {
                                            case "html":
                                                type = "html";
                                                break;
                                            default:
                                                type = "quoted";
                                        }
                                        break;
                                    case "img":
                                        type = "url";
                                        break;
                                    case "chips":
                                        type = "array";
                                        break;
                                    default:
                                        type = "quoted";
                                        if (Array.isArray(value)) {
                                            type = "array";
                                        }
                                }
                                result[element.label] = { type: type, value: value }; // todo
                            }
                        }
                    }
                });
            });
            return result;
        };
        let Selected = () => {
            return current_id;
        };
        let CreateArticle = () => {
            let modalRegist = $uibModal.open({
                controller: 'ArticleCreateDialogController',
                templateUrl: '/articles/dialogs/create_dialog',
                resolve: {
                    items: null
                }
            });
            modalRegist.result.then((dialog_scope) => {
                progress(true);
                let name = dialog_scope.name;
                ArticleService.Create(name, {}, (result) => {
                    current_id = result._id;
                    //     ArticleService.option = {sort: {create: -1}, limit: this.pagesize, skip: 0};
                    DrawArticles(() => {
                        progress(false);
                        $scope.opened = true;
                    });
                    Clear();
                }, error_handler);
            }, () => {
            });
        };
        let DeleteArticle = () => {
            if (current_id) {
                let modalRegist = $uibModal.open({
                    controller: 'ArticleDeleteConfirmController',
                    templateUrl: '/articles/dialogs/delete_confirm_dialog',
                    resolve: {
                        items: () => {
                        }
                    }
                });
                modalRegist.result.then((content) => {
                    progress(true);
                    ArticleService.Delete(current_id, (result) => {
                        current_id = null;
                        DrawArticles(() => {
                            $scope.opened = false;
                            progress(false);
                        });
                    }, error_handler);
                }, () => {
                });
            }
        };
        let SelectPage = (name) => {
            progress(true);
            page_name = name;
            if (current_id) {
                ArticleService.Get(current_id, (result) => {
                    $scope.current_article = result;
                    $scope.opened = true;
                    DrawPage(page_name, () => {
                        Map(result.content);
                        progress(false);
                    });
                }, error_handler);
            }
            else {
                DrawPage(page_name, () => {
                    progress(false);
                });
            }
        };
        let PageSelected = (name) => {
            return (page_name == name);
        };
        let SelectArticle = (id) => {
            progress(true);
            current_id = id;
            ArticleService.Get(current_id, (result) => {
                $scope.current_article = result;
                $scope.opened = true;
                DrawPage(page_name, () => {
                    Map(result.content);
                    progress(false);
                });
            }, error_handler);
        };
        let ArticleSelected = (id) => {
            return (current_id == id);
        };
        let SaveArticle = () => {
            progress(true);
            let new_record = Reduce();
            ArticleService.Put(current_id, new_record, (result) => {
                progress(false);
            }, error_handler);
        };
        let Find = (newValue) => {
            ArticleService.SetQuery(null);
            if (newValue) {
                ArticleService.SetQuery({ name: { $regex: newValue } });
            }
            Draw(() => {
            });
        };
        let Count = () => {
            ArticleService.Count((result) => {
                if (result) {
                    $scope.count = result;
                }
            }, error_handler);
        };
        let Sort = (name) => {
            if (name) {
                direction = -direction;
                ArticleService.option.sort[name] = direction;
            }
            Draw(() => {
            });
        };
        let Next = () => {
            progress(true);
            ArticleService.Next((result) => {
                if (result) {
                    $scope.articles = result;
                }
                ArticleService.Over((hasnext) => { $scope.over = !hasnext; });
                ArticleService.Under((hasprev) => { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        let Prev = () => {
            progress(true);
            ArticleService.Prev((result) => {
                if (result) {
                    $scope.articles = result;
                }
                ArticleService.Over((hasnext) => { $scope.over = !hasnext; });
                ArticleService.Under((hasprev) => { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        let onDrop = (data, evt, id) => {
            $scope[id] = evt.element[0].src;
        };
        let DrawPage = (name, callback) => {
            FormPlayerService.query = { name: name };
            FormPlayerService.Query((value) => {
                if (value.length > 0) {
                    FormPlayerService.Get(value[0]._id, (result) => {
                        FormPlayerService.current_page = result.content;
                        $scope.current_page = result;
                        FormPlayerService.Draw();
                        callback();
                    });
                }
                else {
                    callback();
                }
            }, error_handler);
        };
        let DrawPages = (callback) => {
            FormPlayerService.query = {};
            FormPlayerService.Query((value) => {
                $scope.pages = value;
                callback();
            }, error_handler);
        };
        let DrawArticles = (callback) => {
            ArticleService.Query((value) => {
                $scope.articles = value;
                callback();
                ArticleService.Over((hasnext) => { $scope.over = !hasnext; });
                ArticleService.Under((hasprev) => { $scope.under = !hasprev; });
            }, error_handler);
        };
        let Draw = (callback) => {
            DrawPage(page_name, () => {
                DrawPages(() => {
                    DrawArticles(callback);
                });
            });
        };
        $scope.opened = false;
        //    $scope.Notify = Notify;
        $scope.Selected = Selected;
        $scope.CreateArticle = CreateArticle;
        $scope.SelectPage = SelectPage;
        $scope.PageSelected = PageSelected;
        $scope.SelectArticle = SelectArticle;
        $scope.ArticleSelected = ArticleSelected;
        $scope.SaveArticle = SaveArticle;
        $scope.DeleteArticle = DeleteArticle;
        $scope.Find = Find;
        $scope.Count = Count;
        $scope.Sort = Sort;
        $scope.Next = Next;
        $scope.Prev = Prev;
        $scope.onDrop = onDrop;
        Draw(() => {
        });
    }]);
ArticleControllers.controller('ArticleCreateDialogController', ['$scope', '$uibModalInstance', 'items',
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
ArticleControllers.controller('ArticleDeleteConfirmController', ['$scope', '$uibModalInstance', 'items',
    ($scope, $uibModalInstance, items) => {
        $scope.hide = () => {
            $uibModalInstance.close();
        };
        $scope.cancel = () => {
            $uibModalInstance.dismiss();
        };
        $scope.answer = () => {
            $uibModalInstance.close({});
        };
    }]);
//# sourceMappingURL=article_controllers.js.map