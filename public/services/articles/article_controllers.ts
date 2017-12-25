/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

let ArticleControllers: angular.IModule = angular.module('ArticleControllers', ["ngResource"]);

ArticleControllers.controller('ArticleController', ['$scope', '$document', '$log', '$compile', '$uibModal', "FormPlayerService", "ArticleService", 'Socket',
    ($scope: any, $document: any, $log: any, $compile: any, $uibModal: any, FormPlayerService: any, ArticleService: any, Socket): void => {

        let progress = (value) => {
            $scope.$emit('progress', value);
        };

        $scope.$on('progress', (event, value) => {
            $scope.progress = value;
        });

        let error_handler: (code: number, message: string) => void = (code: number, message: string): void => {
            progress(false);
            $scope.message = message;
            $log.error(message);
            alert(message);
        };

        let alert = (message): void => {
            let modalInstance: any = $uibModal.open({
                controller: 'AlertDialogController',
                templateUrl: '/common/dialogs/alert_dialog',
                resolve: {
                    items: (): any => {
                        return message;
                    }
                }
            });
            modalInstance.result.then((answer: any): void => {
            }, (): void => {
            });
        };

        window.addEventListener('beforeunload', (e) => {
            if ($scope.opened) {
                //          e.returnValue = '';
            }
        }, false);

        Socket.on("client", (data: any): void => {
            let notifier: any = new NotifierModule.Notifier();
            notifier.Pass(data);
        });

        let Notify = (message: string): void => {
            Socket.emit("server", {value: message}, () => {
      //          let hoge = 1;
            });
        };

        ArticleService.option.skip = 0;
  //      ArticleService.option.limit = 40;//{sort: {create: -1}, limit: this.pagesize, skip: 0};

        FormPlayerService.$scope = $scope;
        FormPlayerService.$compile = $compile;

        let current_id: any = null;
        let page_name: string = ""; //a1
        let direction: number = -1;

        let Clear = (): void => {
            let page: any = FormPlayerService.current_page;
            _.forEach(page, (control): void => {
                _.forEach(control.elements, (element: any): void => {
                    let attributes: any = element.attributes;
                    if (attributes) {
                        let name: string = attributes["ng-model"];
                        if (name) {
                            $scope[name] = "";
                        }
                    }
                })
            });
            Draw(() => {
            });
        };

        /*
         resultで与えられたObjectのelementのlabelで示される値を取り出す。
         ng-modelの"名前"を取り出し、$scopeからその名前に対応する値を設定する。
         */
        let Map: (present: any) => void = (present: any): void => {

            function unescapeHTML(value:any):any {
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
            _.forEach(page, (control): void => {
                _.forEach(control.elements, (element: any): void => {
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
                })
            });
        };

        /*
         ng-modelの"名前"を取り出し、$scopeからその名前に対応する値を取り出す。
         elementのlabelを名前として、その値をresultに。
         */
        let Reduce: () => void = (): any => {
            let result = {};// ArticleService.current_article.content;
            if (!result) {
                result = {};
            }
            let page = FormPlayerService.current_page;
            _.forEach(page, (control): void => {
                _.forEach(control.elements, (element: any): void => {
                    let attributes = element.attributes;
                    if (attributes) {
                        let name = attributes["ng-model"];
                        if (name) {
                            if ($scope[name]) {
                                let type: string = "";
                                let value = $scope[name];
                                switch (element.type) {
                                    case "field":
                                        switch (control.type) {
                                            case "html" :
                                                type = "html";
                                                break;
                                            case "date" :
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
                                            case "html" :
                                                type = "html";
                                                break;
                                            case "date" :
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
                                result[element.label] = {type: type, value: value}; // todo
                            }
                        }
                    }
                })
            });
            return result;
        };

        let Selected = (): any => {
            return current_id;
        };

        let CreateArticle = (): void => {

            let modalRegist: any = $uibModal.open({
                controller: 'ArticleCreateDialogController',
                templateUrl: '/articles/dialogs/create_dialog',
                resolve: {
                    items: null
                }
            });

            modalRegist.result.then((dialog_scope: any): void => {
                progress(true);
                let name = dialog_scope.name;
                ArticleService.Create(name, {}, (result: any): void => {
                    current_id = result._id;
                    //     ArticleService.option = {sort: {create: -1}, limit: this.pagesize, skip: 0};
                    DrawArticles(() => {
                        progress(false);
                        $scope.opened = true;
                    });
                    Clear();
                }, error_handler);
            }, (): void => {
            });
        };

        let DeleteArticle = (): void => {
            if (current_id) {
                let modalRegist: any = $uibModal.open({
                    controller: 'ArticleDeleteConfirmController',
                    templateUrl: '/articles/dialogs/delete_confirm_dialog',
                    resolve: {
                        items: (): any => {
                        }
                    }
                });

                modalRegist.result.then((content): void => {
                    progress(true);
                    ArticleService.Delete(current_id, (result: any): void => {
                        current_id = null;
                        DrawArticles(() => {
                            $scope.opened = false;
                            progress(false);
                        });
                    }, error_handler);
                }, (): void => {
                });
            }
        };

        let SelectPage = (name: string): void => {
            progress(true);
            page_name = name;
            if (current_id) {
                ArticleService.Get(current_id, (result: any): void => {
                    $scope.current_article = result;
                    $scope.opened = true;
                    DrawPage(page_name, () => {
                        Map(result.content);
                        progress(false);
                    });
                }, error_handler);
            } else {
                DrawPage(page_name, () => {
                    progress(false);
                });
            }
        };

        let PageSelected = (name: string): boolean => {
            return (page_name == name);
        };

        let SelectArticle = (id: string): void => {
            progress(true);
            current_id = id;
            ArticleService.Get(current_id, (result: any): void => {
                $scope.current_article = result;
                $scope.opened = true;
                DrawPage(page_name, () => {
                    Map(result.content);
                    progress(false);
                });
            }, error_handler);
        };

        let SelectArticle = (id: string): void => {
            progress(true);
            current_id = id;
            page_name = "";
            ArticleService.Get(current_id, (result: any): void => {
                $scope.current_article = result;
                $scope.opened = true;
                if (result.content.type) {
                    DrawPage(result.content.type.value, () => {
                        Map(result.content);
                        progress(false);
                    });
                }
            }, error_handler);
        };


        let ArticleSelected = (id: string): boolean => {
            return (current_id == id);
        };

        let SaveArticle = (): void => {
            progress(true);
            let new_record: any = Reduce();
            ArticleService.Put(current_id, new_record, (result: any): void => {
                progress(false);
            }, error_handler);
        };

        let Find = (newValue: string): void => {
            ArticleService.SetQuery(null);
            if (newValue) {
                ArticleService.SetQuery({name: {$regex: newValue}});
            }

            Draw(() => {
            });
        };

        let Count: () => void = (): void => {
            ArticleService.Count((result: any): void => {
                if (result) {
                    $scope.count = result;
                }
            }, error_handler);
        };

        let Sort = (name: string): void => {
            if (name) {
                direction = -direction;
                ArticleService.option.sort[name] = direction;
            }
            Draw(() => {
            });
        };

        let Next = (): void => {
            progress(true);
            ArticleService.Next((result) => {
                if (result) {
                    $scope.articles = result;
                }
                ArticleService.Over((hasnext) => {$scope.over = !hasnext;});
                ArticleService.Under((hasprev) => {$scope.under = !hasprev;});
                progress(false);
            }, error_handler);
        };

        let Prev = (): void => {
            progress(true);
            ArticleService.Prev((result) => {
                if (result) {
                    $scope.articles = result;
                }
                ArticleService.Over((hasnext) => {$scope.over = !hasnext;});
                ArticleService.Under((hasprev) => {$scope.under = !hasprev;});
                progress(false);
            }, error_handler);
        };

        let onDrop = (data, evt, id): void => {
            $scope[id] = evt.element[0].src;
        };

        let DrawPage: (name: string, callback: () => void) => void = (name: string, callback: () => void): void => {
            FormPlayerService.query = {name: name};
            FormPlayerService.Query((value: any): void => {
                if (value.length > 0) {
                    FormPlayerService.Get(value[0]._id, (result: any) => {
                        FormPlayerService.current_page = result.content;
                        $scope.current_page = result;
                        FormPlayerService.Draw();
                        callback();
                    });
                } else {
                    callback();
                }
            }, error_handler);
        };

        let DrawPages: (callback: () => void) => void = (callback: () => void): void => {
            FormPlayerService.query = {};
            FormPlayerService.Query((value: any): void => {
                $scope.pages = value;
                callback();
            }, error_handler);
        };

        let DrawArticles: (callback: () => void) => void = (callback: () => void): void => {
            ArticleService.Query((value: any): void => {
                $scope.articles = value;
                callback();
                ArticleService.Over((hasnext) => {$scope.over = !hasnext;});
                ArticleService.Under((hasprev) => {$scope.under = !hasprev;});
            }, error_handler);
        };

        let Draw: (callback: () => void) => void = (callback: () => void): void => {
            DrawPage(page_name, (): void => {
                DrawPages((): void => {
                    DrawArticles(callback);
                });
            });
        };

        //tinymce
        $scope.tinymceOptions = {
            onChange: function(e) {
                // put logic here for keypress and cut/paste changes
            },
            inline: false,
            plugins : 'advlist autolink link image lists charmap print preview',
            skin: 'lightgray',
            theme : 'modern'
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

        Draw(() => {
        });

    }]);

ArticleControllers.controller('ArticleCreateDialogController', ['$scope', '$uibModalInstance', 'items',
    ($scope: any, $uibModalInstance: any, items: any): void => {

        $scope.hide = (): void => {
            $uibModalInstance.close();
        };

        $scope.cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        $scope.answer = (): void => {
            $uibModalInstance.close($scope);
        };

    }]);

ArticleControllers.controller('ArticleDeleteConfirmController', ['$scope', '$uibModalInstance', 'items',
    ($scope: any, $uibModalInstance: any, items: any): void => {

        $scope.hide = (): void => {
            $uibModalInstance.close();
        };

        $scope.cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        $scope.answer = (): void => {
            $uibModalInstance.close({});
        };

    }]);