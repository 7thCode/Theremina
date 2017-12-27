/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var ArticleControllers = angular.module('ArticleControllers', ["ngResource"]);
ArticleControllers.controller('ArticleController', ['$scope', '$document', '$log', '$compile', '$uibModal', "FormPlayerService", "ArticleService", 'Socket',
    function ($scope, $document, $log, $compile, $uibModal, FormPlayerService, ArticleService, Socket) {
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
        window.addEventListener('beforeunload', function (e) {
            if ($scope.opened) {
                //          e.returnValue = '';
            }
        }, false);
        Socket.on("client", function (data) {
            var notifier = new NotifierModule.Notifier();
            notifier.Pass(data);
        });
        var Notify = function (message) {
            Socket.emit("server", { value: message }, function () {
                //          let hoge = 1;
            });
        };
        ArticleService.option.skip = 0;
        //      ArticleService.option.limit = 40;//{sort: {create: -1}, limit: this.pagesize, skip: 0};
        FormPlayerService.$scope = $scope;
        FormPlayerService.$compile = $compile;
        var current_id = null;
        var page_name = ""; //a1
        var direction = -1;
        var Clear = function () {
            var page = FormPlayerService.current_page;
            _.forEach(page, function (control) {
                _.forEach(control.elements, function (element) {
                    var attributes = element.attributes;
                    if (attributes) {
                        var name_1 = attributes["ng-model"];
                        if (name_1) {
                            $scope[name_1] = "";
                        }
                    }
                });
            });
            Draw(function () {
            });
        };
        /*
         resultで与えられたObjectのelementのlabelで示される値を取り出す。
         ng-modelの"名前"を取り出し、$scopeからその名前に対応する値を設定する。
         */
        var Map = function (present) {
            function unescapeHTML(value) {
                var result = value;
                if (typeof value == "string") {
                    var div = document.createElement("div");
                    div.innerHTML = value.replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/ /g, "&nbsp;")
                        .replace(/\r/g, "&#13;")
                        .replace(/\n/g, "&#10;");
                    result = div.textContent || div.innerText;
                }
                return result;
            }
            var page = FormPlayerService.current_page;
            _.forEach(page, function (control) {
                _.forEach(control.elements, function (element) {
                    var attributes = element.attributes;
                    if (attributes) {
                        var name_2 = attributes["ng-model"];
                        if (name_2) {
                            var value = "";
                            if (present) {
                                if (present[element.label]) {
                                    value = present[element.label].value;
                                }
                            }
                            $scope[name_2] = unescapeHTML(value); //todo
                        }
                    }
                });
            });
        };
        /*
         ng-modelの"名前"を取り出し、$scopeからその名前に対応する値を取り出す。
         elementのlabelを名前として、その値をresultに。
         */
        var Reduce = function () {
            var result = {}; // ArticleService.current_article.content;
            if (!result) {
                result = {};
            }
            var page = FormPlayerService.current_page;
            _.forEach(page, function (control) {
                _.forEach(control.elements, function (element) {
                    var attributes = element.attributes;
                    if (attributes) {
                        var name_3 = attributes["ng-model"];
                        if (name_3) {
                            if ($scope[name_3]) {
                                var type = "";
                                var value = $scope[name_3];
                                switch (element.type) {
                                    case "field":
                                        switch (control.type) {
                                            case "html":
                                                type = "html";
                                                break;
                                            case "date":
                                                type = "date";
                                                break;
                                            default:
                                                type = "quoted";
                                        }
                                        break;
                                    case "select":
                                        type = "quoted";
                                        break;
                                    case "textarea":
                                        switch (control.type) {
                                            case "html":
                                                type = "html";
                                                break;
                                            case "date":
                                                type = "date";
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
        var Selected = function () {
            return current_id;
        };
        var CreateArticle = function () {
            var modalRegist = $uibModal.open({
                controller: 'ArticleCreateDialogController',
                templateUrl: '/articles/dialogs/create_dialog',
                resolve: {
                    items: null
                }
            });
            modalRegist.result.then(function (dialog_scope) {
                progress(true);
                var name = dialog_scope.name;
                ArticleService.Create(name, {}, function (result) {
                    current_id = result._id;
                    //     ArticleService.option = {sort: {create: -1}, limit: this.pagesize, skip: 0};
                    DrawArticles(function () {
                        progress(false);
                        $scope.opened = true;
                    });
                    Clear();
                }, error_handler);
            }, function () {
            });
        };
        var DeleteArticle = function () {
            if (current_id) {
                var modalRegist = $uibModal.open({
                    controller: 'ArticleDeleteConfirmController',
                    templateUrl: '/articles/dialogs/delete_confirm_dialog',
                    resolve: {
                        items: function () {
                        }
                    }
                });
                modalRegist.result.then(function (content) {
                    progress(true);
                    ArticleService.Delete(current_id, function (result) {
                        current_id = null;
                        DrawArticles(function () {
                            $scope.opened = false;
                            progress(false);
                        });
                    }, error_handler);
                }, function () {
                });
            }
        };
        var SelectPage = function (name) {
            progress(true);
            page_name = name;
            if (current_id) {
                ArticleService.Get(current_id, function (result) {
                    $scope.current_article = result;
                    $scope.opened = true;
                    DrawPage(page_name, function () {
                        Map(result.content);
                        progress(false);
                    });
                }, error_handler);
            }
            else {
                DrawPage(page_name, function () {
                    progress(false);
                });
            }
        };
        var PageSelected = function (name) {
            return (page_name == name);
        };
        var SelectArticle = function (id) {
            progress(true);
            current_id = id;
            ArticleService.Get(current_id, function (result) {
                $scope.current_article = result;
                $scope.opened = true;
                DrawPage(page_name, function () {
                    Map(result.content);
                    progress(false);
                });
            }, error_handler);
        };
        var SelectArticle = function (id) {
            progress(true);
            current_id = id;
            page_name = "";
            ArticleService.Get(current_id, function (result) {
                $scope.current_article = result;
                $scope.opened = true;
                if (result.content.type) {
                    DrawPage(result.content.type.value, function () {
                        Map(result.content);
                        progress(false);
                    });
                }
            }, error_handler);
        };
        var ArticleSelected = function (id) {
            return (current_id == id);
        };
        var SaveArticle = function () {
            progress(true);
            var new_record = Reduce();
            ArticleService.Put(current_id, new_record, function (result) {
                progress(false);
            }, error_handler);
        };
        var Find = function (newValue) {
            ArticleService.SetQuery(null);
            if (newValue) {
                ArticleService.SetQuery({ name: { $regex: newValue } });
            }
            Draw(function () {
            });
        };
        var Count = function () {
            ArticleService.Count(function (result) {
                if (result) {
                    $scope.count = result;
                }
            }, error_handler);
        };
        var Sort = function (name) {
            if (name) {
                direction = -direction;
                ArticleService.option.sort[name] = direction;
            }
            Draw(function () {
            });
        };
        var Next = function () {
            progress(true);
            ArticleService.Next(function (result) {
                if (result) {
                    $scope.articles = result;
                }
                ArticleService.Over(function (hasnext) { $scope.over = !hasnext; });
                ArticleService.Under(function (hasprev) { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        var Prev = function () {
            progress(true);
            ArticleService.Prev(function (result) {
                if (result) {
                    $scope.articles = result;
                }
                ArticleService.Over(function (hasnext) { $scope.over = !hasnext; });
                ArticleService.Under(function (hasprev) { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        var onDrop = function (data, evt, id) {
            $scope[id] = evt.element[0].src;
        };
        var DrawPage = function (name, callback) {
            FormPlayerService.query = { name: name };
            FormPlayerService.Query(function (value) {
                if (value.length > 0) {
                    FormPlayerService.Get(value[0]._id, function (result) {
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
        var DrawPages = function (callback) {
            FormPlayerService.query = {};
            FormPlayerService.Query(function (value) {
                $scope.pages = value;
                callback();
            }, error_handler);
        };
        var DrawArticles = function (callback) {
            ArticleService.Query(function (value) {
                $scope.articles = value;
                callback();
                ArticleService.Over(function (hasnext) { $scope.over = !hasnext; });
                ArticleService.Under(function (hasprev) { $scope.under = !hasprev; });
            }, error_handler);
        };
        var Draw = function (callback) {
            DrawPage(page_name, function () {
                DrawPages(function () {
                    DrawArticles(callback);
                });
            });
        };
        //tinymce
        $scope.tinymceOptions = {
            onChange: function (e) {
                // put logic here for keypress and cut/paste changes
            },
            inline: false,
            plugins: 'advlist autolink link image lists charmap print preview',
            skin: 'lightgray',
            theme: 'modern'
        };
        //froala
        //      $scope.froalaOptions = {
        //         toolbarButtons : ["bold", "italic", "underline", "|", "align", "formatOL", "formatUL"]
        //     };
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
        Draw(function () {
        });
    }]);
ArticleControllers.controller('ArticleCreateDialogController', ['$scope', '$uibModalInstance', 'items',
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
ArticleControllers.controller('ArticleDeleteConfirmController', ['$scope', '$uibModalInstance', 'items',
    function ($scope, $uibModalInstance, items) {
        $scope.hide = function () {
            $uibModalInstance.close();
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
        $scope.answer = function () {
            $uibModalInstance.close({});
        };
    }]);
//# sourceMappingURL=article_controllers.js.map