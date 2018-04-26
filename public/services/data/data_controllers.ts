/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace DataControllersModule {

    let DataControllers: angular.IModule = angular.module('DataControllers', ['ui.bootstrap', 'ngAnimate', 'flow', 'ui.ace']);

    DataControllers.controller('DataController', ['$scope', '$rootScope', '$log', '$document', '$q', '$compile', '$uibModal', "FormPlayerService", "ArticleService", 'SessionService',
        ($scope: any, $rootScope: any, $log: any, $document: any, $q: any, $compile: any, $uibModal: any, FormPlayerService: any, ArticleService: any, SessionService: any): void => {

            let pagesize:number = 40;

            let progress = (value:any):void => {
                $scope.$emit('progress', value);
            };

            $scope.$on('progress', (event:any, value:any):void => {
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

            $document.on('drop dragover', (e: any): void => {
                e.stopPropagation();
                e.preventDefault();
            });

            $scope.opened = false;

            ArticleService.option.limit = pagesize;

            let current_id: any = null;
            let page_type: string = "";
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

            $scope.Close = (): void => {
                $scope.opened = false;
            };
            /*
             resultで与えられたObjectのelementのlabelで示される値を取り出す。
             ng-modelの"名前"を取り出し、$scopeからその名前に対応する値を設定する。
             */
            let Map: (present: any) => void = (present: any): void => {

                function unescapeHTML(value: any): any {
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
                                    let type: string = "quoted";
                                    let value = $scope[name];
                                    switch (element.type) {
                                        case "img":
                                            type = "url";
                                            break;
                                        default:
                                            if (Array.isArray(value)) {
                                                type = "array";
                                            } else {
                                                switch (control.type) {
                                                    case "html" :
                                                        type = "html";
                                                        break;
                                                    case "date" :
                                                        type = "date";
                                                        break;
                                                    default:
                                                }
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

            $scope.Selected = (): any => {
                return current_id;
            };

            $scope.CreateArticle = (): void => {

                let modalRegist: any = $uibModal.open({
                    controller: 'DataCreateDialogController',
                    templateUrl: '/data/dialogs/create_dialog',
                    resolve: {
                        items: $scope
                    }
                });

                modalRegist.result.then((dialog_scope: any): void => {
                    progress(true);
                    let name: string = dialog_scope.title;
                    ArticleService.Create(name, {
                        type: {
                            "type": "quoted",
                            "value": dialog_scope.type
                        }
                    }, (result: any): void => {
                        current_id = result._id;
                        ArticleService.option.skip = 0;

                        if (current_id) {
                            ArticleService.Get(current_id, (result: any): void => {
                                if (result) {
                                    ArticleService.current_article = result;
                                    $scope.current_article = result;
                                    $scope.opened = true;
                                    if (result.content) {
                                        if (result.content.type) {
                                            if (result.content.type.value) {
                                                page_type = result.content.type.value;  //!! content依存
                                                DrawPage(page_type, () => {
                                                    Map(result.content);
                                                    progress(false);
                                                });
                                            } else {
                                                error_handler(4, "type value");
                                            }
                                        } else {
                                            error_handler(3, "no type");
                                        }
                                    } else {
                                        error_handler(2, "no content");
                                    }
                                } else {
                                    error_handler(1, "network error");
                                }
                            }, error_handler);
                        } else {
                            DrawPage(page_type, (): void => {
                                progress(false);
                            });
                        }

                        Clear();
                    }, error_handler);
                }, (): void => {
                });
            };

            $scope.UploadArticles = (files: any): void => {
                progress(true);
                let promises:any[] = [];
                _.forEach(files, (local_file) => {
                    let deferred = $q.defer();
                    let fileReader: any = new FileReader();
                    fileReader.onload = (event: any): void => {
                        ArticleService.CreateMany(event.target.result, (result: any) => {
                            deferred.resolve(true);
                        }, (code: number, message: string) => {
                            deferred.reject(false);
                        });
                    };
                    fileReader.readAsText(local_file.file);
                    promises.push(deferred.promise);
                });

                $q.all(promises).then(function (result) {
                    DrawPage(page_type, (): void => {
                        files.forEach((file) => {
                            file.cancel();
                        });

                        DrawArticles(() => {
                            progress(false);
                        });

                    });
                });
            };

            $scope.SelectPage = (type: string): void => {
                progress(true);
                page_type = type;
                if (current_id) {
                    ArticleService.Get(current_id, (result: any): void => {
                        if (result) {
                            ArticleService.current_article = result;
                            $scope.current_article = result;
                            $scope.opened = true;
                            DrawPage(page_type, () => {
                                Map(result.content);
                                progress(false);
                            });
                        } else {
                            error_handler(1, "");
                        }
                    }, error_handler);

                } else {
                    DrawPage(page_type, (): void => {
                        progress(false);
                    });
                }
            };

            $scope.PageSelected = (type: string): boolean => {
                return (page_type == type);
            };

            $scope.SelectArticle = (id: string): void => {
                progress(true);
                current_id = id;
                ArticleService.Get(current_id, (result: any): void => {
                    if (result) {
                        ArticleService.current_article = result;
                        $scope.current_article = result;
                        $scope.opened = true;
                        if (result.content) {
                            if (result.content.type) {
                                if (result.content.type.value) {
                                    page_type = result.content.type.value;  //!! content依存
                                    DrawPage(page_type, () => {
                                        Map(result.content);
                                        progress(false);
                                    });
                                } else {
                                    error_handler(4, "type value");
                                }
                            } else {
                                error_handler(3, "no type");
                            }
                        } else {
                            error_handler(2, "no content");
                        }
                    } else {
                        error_handler(1, "network error");
                    }
                }, error_handler);
            };

            $scope.ArticleSelected = (id: string): boolean => {
                return (current_id == id);
            };

            $scope.SaveArticle = (): void => {
                progress(true);
                let new_record: any = Reduce();
                ArticleService.Put(current_id, new_record, (result: any): void => {
                    progress(false);
                    //        $scope.opened = false;
                }, error_handler);
            };

            $scope.DeleteArticle = (): void => {
                if (current_id) {
                    let modalRegist: any = $uibModal.open({
                        controller: 'DataDeleteConfirmController',
                        templateUrl: '/data/dialogs/delete_confirm_dialog',
                        resolve: {
                            items: (): any => {
                            }
                        }
                    });

                    modalRegist.result.then((content: any): void => {
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

            $scope.FindArticles = (field: string, value: any): void => {

                ArticleService.SetQuery(null);
                if (field) {
                    if (value) {
                        let query = {};
                        query[field] = {$regex: value};
                        ArticleService.SetQuery(query);
                    }
                }

                Draw(() => {
                });
            };

            $scope.operationArticle = (from_name) => {

                $scope.from_name = from_name;

                let modalRegist: any = $uibModal.open({
                    controller: 'DataOperetionDialogController',
                    templateUrl: '/data/dialogs/operation_dialog',
                    resolve: {
                        items: $scope
                    }
                });

                modalRegist.result.then((dialog_scope: any): void => {
                    progress(true);
                    let to_name: string = dialog_scope.title;
                    ArticleService.Copy(from_name, to_name, (result: any) => {
                        Draw(() => {
                        });
                    }, error_handler);
                }, (): void => {
                });

            };

            $scope.Find = (newValue: any): void => {

                ArticleService.SetQuery(null);
                if (newValue) {
                    ArticleService.SetQuery({name: {$regex: newValue}});
                }

                Draw(() => {
                });
            };

            $scope.Sort = (name: string): void => {
                if (name) {
                    direction = -direction;
                    ArticleService.option.sort[name] = direction;
                }
                Draw(() => {
                });
            };

            $scope.Next = (): void => {
                progress(true);
                ArticleService.Next((result: any): void => {
                    if (result) {
                        $scope.articles = result;
                    }
                    ArticleService.Over((hasnext) => {
                        $scope.over = !hasnext;
                    });
                    ArticleService.Under((hasprev) => {
                        $scope.under = !hasprev;
                    });
                    progress(false);
                }, error_handler);
            };

            $scope.Prev = (): void => {
                progress(true);
                ArticleService.Prev((result: any): void => {
                    if (result) {
                        $scope.articles = result;
                    }
                    ArticleService.Over((hasnext) => {
                        $scope.over = !hasnext;
                    });
                    ArticleService.Under((hasprev) => {
                        $scope.under = !hasprev;
                    });
                    progress(false);
                }, error_handler);
            };

            $scope.onDrop = (data: any, evt: any, id: any): void => {
                $scope[id] = evt.element[0].src;
            };

            FormPlayerService.$scope = $scope;
            FormPlayerService.$compile = $compile;

            let DrawPage: (name: string, callback: () => void) => void = (name: string, callback: () => void): void => {
                FormPlayerService.query = {name: name};
                FormPlayerService.Query((value: any): void => {
                    if (value.length > 0) {
                        FormPlayerService.Get(value[0]._id, (result: any) => {
                            FormPlayerService.current_page = result.content;
                            $scope.current_page = result;
                            FormPlayerService.Draw();
                            callback();
                        }, error_handler);
                    } else {
                        callback();
                    }
                }, error_handler);
            };

            let DrawPages: (callback: () => void) => void = (callback: () => void): void => {
                FormPlayerService.query = {type: 1};
                FormPlayerService.Query((value: any): void => {
                    $scope.pages = value;
                    callback();
                }, error_handler);
            };

            let DrawArticles: (callback: () => void) => void = (callback: () => void): void => {
                ArticleService.Query((data: any): void => {
                    $scope.articles = data;
                    callback();
                    ArticleService.Over((hasnext) => {
                        $scope.over = !hasnext;
                    });
                    ArticleService.Under((hasprev) => {
                        $scope.under = !hasprev;
                    });
                }, error_handler);
            };

            let Draw: (callback: () => void) => void = (callback: () => void): void => {
                DrawPage(page_type, (): void => {
                    DrawPages(() => {
                        DrawArticles(callback);
                    });
                });
            };

            Draw(() => {
            });

            $rootScope.$on('change_namespace', (event, value): void => {
                $scope.namespace = value;
                Draw(() => {
                });
            });

        }]);

    DataControllers.controller('DataCreateDialogController', ['$scope', '$uibModalInstance', 'items',
        ($scope: any, $uibModalInstance: any, items: any): void => {

            $scope.pages = items.pages;

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

    DataControllers.controller('DataOperetionDialogController', ['$scope', '$uibModalInstance', 'items',
        ($scope: any, $uibModalInstance: any, items: any): void => {

            let from_name = items.from_name;
            $scope.title = from_name + "(1)";

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

    DataControllers.controller('DataDeleteConfirmController', ['$scope', '$uibModalInstance', 'items', 'ArticleService',
        ($scope: any, $uibModalInstance: any, items: any, ArticleService: any): void => {

            $scope.name = ArticleService.current_article.name;

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

}
/*! Controllers  */