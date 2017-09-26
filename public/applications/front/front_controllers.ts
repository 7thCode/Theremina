/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

let FrontControllers: angular.IModule = angular.module('FrontControllers', ['ui.bootstrap', 'ngAnimate', 'flow', 'ui.ace']);

//Event

FrontControllers.controller('EventController', ['$scope',
    ($scope: any): void => {

        //    $scope.$on('change_controller', (event, value) => {
        //        $scope.controller_name = value;
        //    });

    }]);

//Front

FrontControllers.controller('FrontController', ['$scope', '$log', '$compile', '$uibModal', 'ProfileService',
    ($scope: any, $log: any, $compile: any, $uibModal: any, ProfileService: any): void => {

        let progress = (value) => {
            $scope.$emit('progress', value);
        };

        $scope.$on('progress', (event, value) => {
            $scope.progress = value;
        });

        //       $scope.$emit('change_controller', "front");

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

        ProfileService.Get((self: any): void => {
            if (self) {
                if (!self.local.address) {
                    //         SelfInit(self);
                }
            }
        }, error_handler);


        let SelfInit: (self: any) => void = (self: any): void => {

            let modalRegist: any = $uibModal.open({
                controller: 'SelfUpdateDialogController',
                templateUrl: '/dialogs/self_update_dialog',
                backdrop: false,
                resolve: {
                    items: null
                }
            });

            modalRegist.result.then((dialog_scope: any): void => {
                let mails = [];
                if (dialog_scope.mails) {
                    mails = dialog_scope.mails;
                }
                ProfileService.Put({
                    nickname: dialog_scope.nickname,
                    mails: mails
                }, (result: any): void => {

                }, error_handler);
            }, (): void => {
            });
        };

    }]);

//Self

FrontControllers.controller('SelfController', ['$scope', '$log', "$uibModal", "ProfileService", 'SessionService', 'ZipService',
    ($scope: any, $log: any, $uibModal: any, ProfileService: any, SessionService: any, ZipService: any): void => {

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

        $scope.opened = false;

        $scope.Zip = (zip) => {
            if (zip) {
                if (zip.length > 6) {
                    progress(true);
                    ZipService.Zip(zip, (error: any, result: any): void => {
                        if (!error) {
                            if (result) {
                                if (result.results) {
                                    if (result.results.length > 0) {
                                        let address = result.results[0];
                                        $scope.address = address.address1;
                                        $scope.city = address.address2;
                                        $scope.street = address.address3;
                                    }
                                }
                            }
                        }
                        progress(false);
                    });
                } else {
                    $scope.address = "";
                    $scope.city = "";
                    $scope.street = "";
                }
            }
        };

        ProfileService.Get((self: any): void => {
            if (self) {
                $scope.provider = self.provider;
                $scope.type = self.type;
                $scope.username = self.username;
                $scope.nickname = self.local.nickname;
                $scope.address = self.local.address;
                $scope.city = self.local.city;
                $scope.street = self.local.street;
                $scope.category = self.local.category;
                $scope.group = self.local.group;
                $scope.zip = self.local.zip;
                $scope.mails = self.local.mails;
                //         $scope.magazine = self.local.magazine.send;
                $scope.opened = true;
            }
        }, error_handler);

        $scope.Save = (): void => {
            let mails = [];
            if ($scope.mails) {
                mails = $scope.mails;
            }
            ProfileService.Put({
                nickname: $scope.nickname,
                address: $scope.address,
                city: $scope.city,
                street: $scope.street,
                category: $scope.category,
                group: $scope.group,
                zip: $scope.zip,
                mails: mails,
                magazine: {send: $scope.magazine}
            }, (result: any): void => {

            }, error_handler);

            let modalRegist: any = $uibModal.open({
                controller: 'SaveDoneController',
                templateUrl: '/dialogs/save_done_dialog',
                resolve: {
                    items: (): any => {
                    }
                }
            });

            modalRegist.result.then((content: any): void => {
            }, (): void => {
            });

        };

        // Guidance

        $scope.next = (): void => {
            $scope.step++;
            SessionService.Put({guidance: {self: {step: $scope.step}}}, (data: any): void => {
            }, error_handler);
        };

        $scope.prev = (): void => {
            $scope.step--;
            SessionService.Put({guidance: {self: {step: $scope.step}}}, (data: any): void => {
            }, error_handler);
        };

        $scope.to = (step: number): void => {
            $scope.step = step;
            SessionService.Put({guidance: {self: {step: $scope.step}}}, (data: any): void => {
            }, error_handler);
        };

        SessionService.Get((session: any): void => {
            if (session) {
                $scope.step = 0;
                let data = session.data;
                if (data) {
                    let guidance = data.guidance;
                    if (guidance) {
                        let self = guidance.self;
                        if (self) {
                            $scope.step = self.step;
                        }
                    }
                }
            }
        }, error_handler);

        $scope.scenario = [
            {
                outer: {
                    top: -210, left: 80, width: 400, height: 400,
                    background: "/applications/img/balloon/right.svg",
                    target: "profile"
                },
                inner: {
                    top: 0, left: 100, width: 300, height: 350,
                    content: "<h3>プロファイル画像</h3>" +
                    "<br>" +
                    "<p>プロファイル画像をドロップしてください</p>" +
                    "<button class='btn btn-warning' type='button' ng-click='next();' aria-label=''>次へ</button>"
                },
                _class: "tada",
                style: "animation-duration:1s;animation-delay:0.3s;"
            },
            {
                outer: {
                    top: -250, left: 360, width: 500, height: 500,
                    background: "/applications/img/balloon/right.svg",
                    target: "nickname"
                },
                inner: {
                    top: 50, left: 150, width: 300, height: 300,
                    content: "<h3>ニックネーム</h3>" +
                    "<br>" +
                    "<p>ニックネームを入力してください</p>" +
                    "<button class='btn btn-info' type='button' ng-click='next();' aria-label=''>次へ</button>"
                },
                _class: "shake",
                style: "animation-duration:1s;animation-delay:0.3s;"
            },
            {
                outer: {
                    top: -120, left: -470, width: 500, height: 500,
                    background: "/applications/img/balloon/left.svg",
                    target: "address"
                },
                inner: {
                    top: 30, left: 0, width: 300, height: 300,
                    content: "<h3>アドレス</h3>" +
                    "<br>" +
                    "<p class='text-center'>アドレスを入力してください</p>" +
                    "<img class='img-responsive center-block' src='http://localhost:8000/files/api/000000000000000000000000/profile'/>" +
                    "<div class='text-center'>" +
                    "<button class='btn btn-success' style='margin:5px' type='button' ng-click='next();' aria-label=''>次へ</button>" +
                    "</div>"
                },
                _class: "zoomIn",
                style: "animation-duration:1s;"
            },
            {
                outer: {
                    top: 40, left: 30, width: 400, height: 400,
                    background: "/applications/img/balloon/bottom.svg",
                    target: "category"
                },
                inner: {
                    top: 100, left: 10, width: 300, height: 300,
                    content: "<h3>カテゴリー</h3>" +
                    "<br>" +
                    "<p class='text-center'>カテゴリーを入力してください</p>" +
                    "<button class='btn btn-warning' type='button' ng-click='next()', aria-label=''>次へ</button>"
                },
                _class: "jello",
                style: "animation-duration:1s;"
            },
            {
                outer: {
                    top: -400, left: -160, width: 400, height: 400,
                    background: "/applications/img/balloon/top.svg",
                    target: "group"
                },
                inner: {
                    top: 20, left: 20, width: 300, height: 300,
                    content: "<h3>グループ</h3>" +
                    "<br>" +
                    "<p class='text-center'>グループを入力してください</p>" +
                    "<button class='btn btn-warning' type='button' ng-click='next();' aria-label=''>次へ</button>"
                },
                _class: "rubberBand",
                style: "animation-duration:1s;"
            },
            {
                outer: {
                    top: 10, left: 100, width: 500, height: 500,
                    background: "/applications/img/balloon/bottom.svg",
                    target: "mails"
                },
                inner: {
                    top: 150, left: 20, width: 300, height: 300,
                    content: "<h3>メール</h3>" +
                    "<br>" +
                    "<p class='text-center'>メールを入力してください</p>" +
                    "<button class='btn btn-primary' type='button' ng-click='next();' aria-label=''>次へ</button>"
                },
                _class: "shake",
                style: "animation-duration:1s;"
            },
            {
                outer: {
                    top: -170, left: 115, width: 400, height: 400,
                    background: "/applications/img/balloon/right.svg",
                    target: "save"
                },
                inner: {
                    top: 10, left: 160, width: 300, height: 300,
                    content: "<h3>保存</h3>" +
                    "<br>" +
                    "<button class='btn btn-danger' type='button' ng-click='to(-1);' aria-label=''>おわり</button>"
                },
                _class: "bounceInDown",
                style: "animation-duration:2s;"
            }
        ];

    }]);

FrontControllers.controller('SaveDoneController', ['$scope', '$uibModalInstance',
    ($scope: any, $uibModalInstance: any): void => {

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

FrontControllers.controller('SelfUpdateDialogController', ['$scope', '$uibModalInstance', 'items', 'ZipService',
    ($scope: any, $uibModalInstance: any, items: any, ZipService: any): void => {

        $scope.magazine = true;

        let progress = (value) => {
            $scope.$emit('progress', value);
        };

        $scope.$on('progress', (event, value) => {
            $scope.progress = value;
        });

        $scope.Zip = (zip) => {
            if (zip) {
                if (zip.length > 6) {
                    progress(true);
                    ZipService.Zip(zip, (error: any, result: any): void => {
                        if (!error) {
                            if (result) {
                                if (result.results) {
                                    if (result.results.length > 0) {
                                        let address = result.results[0];
                                        $scope.address = address.address1;
                                        $scope.city = address.address2;
                                        $scope.street = address.address3;
                                    }
                                }
                            }
                        }
                        progress(false);
                    });
                } else {
                    $scope.address = "";
                    $scope.city = "";
                    $scope.street = "";
                }
            }
        };

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

//Data

FrontControllers.controller('DataController', ['$scope', '$log', '$document', '$compile', '$uibModal', "FormPlayerService", "ArticleService", 'SessionService',
    ($scope: any, $log: any, $document: any, $compile: any, $uibModal: any, FormPlayerService: any, ArticleService: any, SessionService: any): void => {

        let pagesize = 100;

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
                            ArticleService.current_article = result;
                            $scope.current_article = result;
                            $scope.opened = true;
                            page_type = result.content.type.value;  //!!
                            DrawPage(page_type, () => {
                                Map(result.content);
                                progress(false);
                            });
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

        $scope.SelectPage = (type: string): void => {
            progress(true);
            page_type = type;
            if (current_id) {
                ArticleService.Get(current_id, (result: any): void => {
                    ArticleService.current_article = result;
                    $scope.current_article = result;
                    $scope.opened = true;
                    DrawPage(page_type, () => {
                        Map(result.content);
                        progress(false);
                    });
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
                ArticleService.current_article = result;
                $scope.current_article = result;
                $scope.opened = true;
                page_type = result.content.type.value;
                DrawPage(page_type, () => {
                    Map(result.content);
                    progress(false);
                });
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
            }, error_handler);
        };

        $scope.DeleteArticle = (): void => {
            if (current_id) {
                let modalRegist: any = $uibModal.open({
                    controller: 'DataDeleteConfirmController',
                    templateUrl: '/dialogs/delete_confirm_dialog',
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

        // Guidance

        $scope.next = (): void => {
            $scope.step++;
            SessionService.Put({guidance: {data: {step: $scope.step}}}, (data: any): void => {
            }, error_handler);
        };

        $scope.prev = (): void => {
            $scope.step--;
            SessionService.Put({guidance: {data: {step: $scope.step}}}, (data: any): void => {
            }, error_handler);
        };

        $scope.to = (step: number): void => {
            $scope.step = step;
            SessionService.Put({guidance: {data: {step: $scope.step}}}, (data: any): void => {
            }, error_handler);
        };

        SessionService.Get((session: any): void => {
            if (session) {
                $scope.step = 0;
                let _data = session.data;
                if (_data) {
                    let guidance = _data.guidance;
                    if (guidance) {
                        let data = guidance.data;
                        if (data) {
                            $scope.step = data.step;
                        }
                    }
                }
            }
        }, error_handler);
        /*
                $scope.scenario = [
                    {
                        outer: {
                            top: -210, left: 80, width: 400, height: 400,
                            background: "/applications/img/balloon/right.svg",
                            target: "image"
                        },
                        inner: {
                            top: 0, left: 100, width: 300, height: 350,
                            content: "<h3>プロファイル画像</h3>" +
                            "<br>" +
                            "<p>プロファイル画像をドロップしてください</p>" +
                            "<button class='btn btn-warning' type='button' ng-click='next();' aria-label=''>次へ</button>"
                        },
                        _class: "tada",
                        style: "animation-duration:1s;animation-delay:0.3s;"
                    },
                    {
                        outer: {
                            top: -250, left: 360, width: 500, height: 500,
                            background: "/applications/img/balloon/right.svg",
                            target: "image"
                        },
                        inner: {
                            top: 50, left: 150, width: 300, height: 300,
                            content: "<h3>ニックネーム</h3>" +
                            "<br>" +
                            "<p>ニックネームを入力してください</p>" +
                            "<button class='btn btn-info' type='button' ng-click='next();' aria-label=''>次へ</button>"
                        },
                        _class: "shake",
                        style: "animation-duration:1s;animation-delay:0.3s;"
                    }
                ];
                */

    }]);

FrontControllers.controller('DataCreateDialogController', ['$scope', '$uibModalInstance', 'items',
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

FrontControllers.controller('DataDeleteConfirmController', ['$scope', '$uibModalInstance', 'items', 'ArticleService',
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

//Leaflet

FrontControllers.controller('PagesController', ["$scope","$rootScope", "$q", "$document", "$log", "$uibModal", "ResourceBuilderService",
    function ($scope: any,$rootScope:any, $q: any, $document: any, $log: any, $uibModal: any, ResourceBuilderService: any): void {

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

        $document.on('drop dragover', (e: any): void => {
            e.stopPropagation();
            e.preventDefault();
        });

        window.addEventListener('beforeunload', (e) => {
            if (!editor.session.getUndoManager().isClean()) {
                e.returnValue = '';
                return '';
            }
        }, false);

        let editor = null;
        let document = null;

        let Draw = (text) => {
            switch (ResourceBuilderService.current.content.type) {
                case "text/html":
                    if (document) {
                        document.open();
                        document.write(text);
                        document.close();
                    }
                    break;
                default:
            }
        };

        let Query = (): any => {
            progress(true);
            // template query
        //    ResourceBuilderService.AddQuery({type: 21});
            ResourceBuilderService.Query((result: any): void => {
                ResourceBuilderService.InitQuery(null);
                if (result) {
                    $scope.templates = result;
                    //pages query

                    ResourceBuilderService.InitQuery(JSON.parse(localStorage.getItem("pages_query")), 20, 36);

                    ResourceBuilderService.Query((result: any): void => {
                        if (result) {
                            $scope.pages = result;
                            localStorage.setItem("pages_query", JSON.stringify(ResourceBuilderService.GetQuery()));
                        }
                        ResourceBuilderService.Over((hasnext) => {
                            $scope.over = !hasnext;
                        });
                        ResourceBuilderService.Under((hasprev) => {
                            $scope.under = !hasprev;
                        });
                        progress(false);
                    }, error_handler);
                    //pages query
                }
            }, error_handler);
            // template query
        };

        let _Find = (key: string, value: any): any => {
            progress(true);

            ResourceBuilderService.RemoveQuery(key);
            if (value) {
                let query = {};
                query[key] = value;
                ResourceBuilderService.AddQuery(query);
            } else {
                ResourceBuilderService.RemoveQuery(key);
            }

            ResourceBuilderService.Query((result: any): void => {
                if (result) {
                    $scope.pages = result;
                    localStorage.setItem("pages_query", JSON.stringify(ResourceBuilderService.GetQuery()));
                }
                ResourceBuilderService.Over((hasnext) => {
                    $scope.over = !hasnext;
                });
                ResourceBuilderService.Under((hasprev) => {
                    $scope.under = !hasprev;
                });
                progress(false);
            }, error_handler);
        };

        $scope.find_name = localStorage.getItem("pages_find_name");
        let Find = (name: string): any => {
            _Find("name", {$regex: name});
            localStorage.setItem("pages_find_name", name);
        };

        $scope.type = localStorage.getItem("pages_find_type");
        let FindType = (type: number): any => {
            _Find("type", type);
            localStorage.setItem("pages_find_type", "" + type);
        };

        $scope.mimetype = localStorage.getItem("pages_find_mime");
        let FindMime = (mime: string): any => {
            _Find("content.type", mime);
            localStorage.setItem("pages_find_mime", mime);
        };

        $scope.content = localStorage.getItem("pages_find_resource");
        let FindResource = (value: string): any => {
            _Find("content.resource", {$regex: value});
            localStorage.setItem("pages_find_resource", value);
        };

        let Count = (): void => {
            ResourceBuilderService.Count((result: any): void => {
                if (result) {
                    $scope.count = result;
                }
            }, error_handler);
        };

        let Next = (): void => {
            progress(true);
            ResourceBuilderService.Next((result: any): void => {
                if (result) {
                    $scope.pages = result;
                }
                ResourceBuilderService.Over((hasnext) => {
                    $scope.over = !hasnext;
                });
                ResourceBuilderService.Under((hasprev) => {
                    $scope.under = !hasprev;
                });
                progress(false);
            }, error_handler);
        };

        let Prev = (): void => {
            progress(true);
            ResourceBuilderService.Prev((result: any): void => {
                if (result) {
                    $scope.pages = result;
                }
                ResourceBuilderService.Over((hasnext) => {
                    $scope.over = !hasnext;
                });
                ResourceBuilderService.Under((hasprev) => {
                    $scope.under = !hasprev;
                });
                progress(false);
            }, error_handler);
        };

        let Get = (resource: any): void => {
            progress(true);
            ResourceBuilderService.Get(resource._id, (content: any): void => {
                if (content) {
                    $scope.resource = content.resource;
                    $scope.name = ResourceBuilderService.current.name;
                    $scope.userid = ResourceBuilderService.current.userid;
                    switch (ResourceBuilderService.current.content.type) {
                        case "text/html":
                            editor.getSession().setMode("ace/mode/html");
                            break;
                        case "text/css":
                            editor.getSession().setMode("ace/mode/css");
                            break;
                        case "text/javascript":
                            editor.getSession().setMode("ace/mode/javascript");
                            break;
                        default:
                    }
                } else {
                    $scope.resource = "";
                }
                editor.session.getUndoManager().markClean();
                $scope.opened = true;
                progress(false);
            }, error_handler);
        };

        let Close = (): void => {
            if (!editor.session.getUndoManager().isClean()) {
                if (window.confirm('保存されていません。閉じますか？')) {
                    $scope.opened = false;
                }
            } else {
                $scope.opened = false;
            }
        };

        $scope.aceOption = {
            theme: "chrome",
            onLoad: (_ace) => {
                editor = _ace;

                let session = _ace.getSession();

                editor.$blockScrolling = Infinity;
                editor.setOptions({
                    enableBasicAutocompletion: true,
                    enableSnippets: true,
                    enableLiveAutocompletion: true
                });

                session.setUndoManager(new ace.UndoManager());

                editor.container.addEventListener("drop", function (event) {

                });

            },
            onChange: (e) => {
                Draw($scope.resource);
            }
        };

        $scope.Undo = () => {
            let session = editor.getSession();
            let undo = session.getUndoManager();
            undo.undo(true);
        };

        $scope.Paste = (id) => {
            progress(true);
            let current = ResourceBuilderService.current;
            ResourceBuilderService.Get(id, (result: any): void => {
                progress(false);
                ResourceBuilderService.current = current;
                editor.insert(result.resource);
                Draw(result.resource);
            }, error_handler);
        };

        let OpenPreview = () => {
            //         preview_window = window.open("", "", "width=1024,height=800");
            //         document = preview_window.document;
            //         Draw(ResourceBuilderService.current.content.resource);
        };

        let ClosePreview = () => {
            //        if (preview_window) {
            //            document = preview_window.close();
            //        }
        };

        let CreatePages = (files: any): void => {
            progress(true);
            let promises = [];
            _.forEach(files, (local_file) => {
                let deferred = $q.defer();
                let fileReader: any = new FileReader();
                fileReader.onload = (event: any): void => {

                    let modalInstance: any = $uibModal.open({
                        controller: 'PagesCreateDialogController',
                        templateUrl: '/pages/dialogs/create_dialog',
                        resolve: {
                            items: {parent_scope: $scope, file: local_file.file, target: event.target}
                        }
                    });

                    modalInstance.result.then((answer: any): void => { // Answer
                        deferred.resolve(true);
                    }, (): void => { // Error
                        deferred.reject(false);
                    });

                };

                fileReader.readAsText(local_file.file);
                promises.push(deferred.promise);
            });

            $q.all(promises).then((result) => {
                progress(false);
                files.forEach((file) => {
                    file.cancel();
                });

                $rootScope.$emit('change_files', {});
                Query();
            }).finally(() => {
            });
        };

        let Create = (): void => {

            let modalRegist: any = $uibModal.open({
                controller: 'PagesCreateDialogController',
                templateUrl: '/pages/dialogs/create_dialog',
                resolve: {
                    items: {parent_scope: $scope, file: null, target: null}
                }
            });

            modalRegist.result.then((resource: any): void => {
                $scope.resource = "";
                $scope.name = ResourceBuilderService.current.name;
                $scope.userid = ResourceBuilderService.current.userid;
                switch (ResourceBuilderService.current.content.type) {
                    case "text/html":
                        editor.getSession().setMode("ace/mode/html");
                        break;
                    case "text/css":
                        editor.getSession().setMode("ace/mode/css");
                        break;
                    case "text/javascript":
                        editor.getSession().setMode("ace/mode/javascript");
                        break;
                    default:
                }

                $rootScope.$emit('change_files', {});
                Query();
                editor.session.getUndoManager().markClean();
                $scope.opened = true;
            }, (): void => {
            });
        };

        let Open = (): void => {

            let modalRegist: any = $uibModal.open({
                controller: 'PagesOpenDialogController',
                templateUrl: '/pages/dialogs/open_dialog',
                resolve: {
                    items: $scope
                }
            });

            modalRegist.result.then((content: any): void => {
                if (content.resource) {
                    $scope.resource = content.resource;
                    $scope.name = ResourceBuilderService.current.name;
                    $scope.userid = ResourceBuilderService.current.userid;
                    switch (ResourceBuilderService.current.content.type) {
                        case "text/html":
                            editor.getSession().setMode("ace/mode/html");
                            break;
                        case "text/css":
                            editor.getSession().setMode("ace/mode/css");
                            break;
                        case "text/javascript":
                            editor.getSession().setMode("ace/mode/javascript");
                            break;
                        default:
                    }

                    editor.session.getUndoManager().markClean();
                    $scope.opened = true;

                }
            }, (): void => {
            });
        };

        let Update = (): void => {
            if (ResourceBuilderService.current) {
                progress(true);
                ResourceBuilderService.current.content.resource = $scope.resource;
                ResourceBuilderService.Put((result: any): void => {
                    editor.session.getUndoManager().markClean();
                    progress(false);
                }, error_handler);
            }
        };

        let Delete = (): void => {
            if (ResourceBuilderService.current) {
                let modalRegist: any = $uibModal.open({
                    controller: 'PagesDeleteConfirmController',
                    templateUrl: '/pages/dialogs/delete_confirm_dialog',
                    resolve: {
                        items: (): any => {
                            return ResourceBuilderService.current;
                        }
                    }
                });

                modalRegist.result.then((content): void => {
                    progress(true);
                    ResourceBuilderService.Delete((result: any): void => {
                        ClosePreview();
                        $scope.$emit('change_files', {});
                        Query();
                        $scope.name = "";
                        progress(false);
                        $scope.opened = false;
                    }, error_handler);
                }, (): void => {
                });
            }
        };

        let BuildSite = (): void => {

            let modalRegist: any = $uibModal.open({
                controller: 'BiildSiteDialogController',
                templateUrl: '/pages/dialogs/build_site_dialog',
                resolve: {
                    items: $scope
                }
            });

            modalRegist.result.then((resource: any): void => {
                Query();
            }, (): void => {
            });
        };

        $scope.$on('get_namespaces', (event, value): void => {
    ///        $scope.namespaces = value;
        });

        $scope.$on('change_namespace', (event, value): void => {
            $scope.namespace = value;
            Query();
        });

        $scope.opened = false;

        $scope.Get = Get;
        $scope.Query = Query;
        $scope.Count = Count;
        $scope.Next = Next;
        $scope.Prev = Prev;
        $scope.Find = Find;
        $scope.FindType = FindType;
        $scope.FindMime = FindMime;
        $scope.FindResource = FindResource;

        $scope.Close = Close;

        $scope.CreatePages = CreatePages;
        $scope.Create = Create;
        $scope.Open = Open;
        $scope.Update = Update;
        $scope.Delete = Delete;

        $scope.BuildSite = BuildSite;



        //$scope.OpenPreview = OpenPreview;



    }]);

FrontControllers.controller('PagesCreateDialogController', ['$scope', '$log', '$uibModalInstance', 'ResourceBuilderService', 'items',
    ($scope: any, $log: any, $uibModalInstance: any, ResourceBuilderService: any, items: any): void => {

        let file = items.file;
        let target = items.target;
        let parent_scope = items.parent_scope;

        if (file) {
            $scope.title = file.name;
            $scope.mimetype = file.type;
        }

        let progress = (value) => {
            $scope.$emit('progress', value);
        };

        $scope.$on('progress', (event, value) => {
            parent_scope.progress = value;
        });

        let error_handler: (code: number, message: string) => void = (code: number, message: string): void => {
            progress(false);
            $scope.message = message;
            $log.error(message);
        };

        $scope.type = 20;

        $scope.hide = (): void => {
            $uibModalInstance.close();
        };

        $scope.cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        $scope.answer = (): void => {

            progress(true);
            ResourceBuilderService.Init();
            ResourceBuilderService.current.content.type = $scope.mimetype;
            if (target) {
                ResourceBuilderService.current.content.resource = target.result;
            }
            ResourceBuilderService.Create($scope.title, $scope.type, (result: any): void => {
                progress(false);
                $scope.message = "";
                $uibModalInstance.close(result);
            }, error_handler);

        };

    }]);

FrontControllers.controller('PagesOpenDialogController', ['$scope', '$log', '$uibModalInstance', '$uibModal', 'items', 'ResourceBuilderService',
    ($scope: any, $log: any, $uibModalInstance: any, $uibModal: any, items: any, ResourceBuilderService: any): void => {

        let progress = (value) => {
            $scope.$emit('progress', value);
        };

        $scope.$on('progress', (event, value) => {
            items.progress = value;
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

        let Query = (): any => {
            progress(true);
            ResourceBuilderService.InitQuery(null, 20);
            ResourceBuilderService.Query((result: any): void => {
                if (result) {
                    $scope.pages = result;
                }
                progress(false);
            }, error_handler);
        };

        let Find = (name: string): any => {
            progress(true);
            ResourceBuilderService.InitQuery(null, 20);
            if (name) {
                ResourceBuilderService.AddQuery({name: {$regex: name}});

                //            ResourceBuilderService.SetQuery({name: {$regex: name}}, 20);
            }
            ResourceBuilderService.Query((result: any): void => {
                if (result) {
                    $scope.pages = result;
                }
                progress(false);
            }, error_handler);
        };

        let Count = (): void => {
            ResourceBuilderService.Count((result: any): void => {
                if (result) {
                    $scope.count = result;
                }
            }, error_handler);
        };

        let Next = (): void => {
            progress(true);
            ResourceBuilderService.Next((result: any): void => {
                if (result) {
                    $scope.pages = result;
                }
                progress(false);
            }, error_handler);
        };

        let Prev = (): void => {
            progress(true);
            ResourceBuilderService.Prev((result: any): void => {
                if (result) {
                    $scope.pages = result;
                }
                progress(false);
            }, error_handler);
        };

        let Get = (resource: any): void => {
            progress(true);
            ResourceBuilderService.Get(resource._id, (result: any): void => {
                progress(false);
                $scope.message = "";
                $uibModalInstance.close(result);
            }, error_handler);
        };

        let hide = (): void => {
            $uibModalInstance.close();
        };

        let cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        let LayoutQuery = (): any => Query;

        $scope.Count = Count;
        $scope.Next = Next;
        $scope.Prev = Prev;
        $scope.Find = Find;
        $scope.Get = Get;
        $scope.hide = hide;
        $scope.cancel = cancel;
        $scope.LayoutQuery = (): any => Query;

        Query();

    }]);

FrontControllers.controller('PagesDeleteConfirmController', ['$scope', '$uibModalInstance', 'items',
    ($scope: any, $uibModalInstance: any, items: any): void => {

        $scope.title = items.name;

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

FrontControllers.controller('BiildSiteDialogController', ['$scope', '$log', '$uibModalInstance', 'SiteService', 'items',
    ($scope: any, $log: any, $uibModalInstance: any, SiteService: any, items: any): void => {

        let file = items.file;
        let target = items.target;
        let parent_scope = items.parent_scope;

        $scope.name = "sample";

        if (file) {
            $scope.title = file.name;
            $scope.mimetype = file.type;
        }

        let progress = (value) => {
            $scope.$emit('progress', value);
        };

        $scope.$on('progress', (event, value) => {
            parent_scope.progress = value;
        });

        let error_handler: (code: number, message: string) => void = (code: number, message: string): void => {
            progress(false);
            $scope.message = message;
            $log.error(message);
        };

        $scope.type = 20;

        $scope.hide = (): void => {
            $uibModalInstance.close();
        };

        $scope.cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        $scope.answer = (): void => {
            progress(true);
            SiteService.Build($scope.name, (result: any): void => {
                progress(false);
                $scope.message = "";
                $uibModalInstance.close(result);
            }, error_handler);

        };

    }]);

//Photo(resizeable/cropable)

//  2000 < key < 3999

interface IControl {
    name: string;
    label: string;
    model: string;
    type: string;
}

interface IPictureControl extends IControl {
    path: string;
    height: number;
    width: number;
}

FrontControllers.controller('PhotoController', ['$scope', '$q', '$document', '$uibModal', '$log', 'ProfileService', 'SessionService', 'FileService', 'ImageService',
    ($scope: any, $q: any, $document: any, $uibModal: any, $log: any, ProfileService: any, SessionService: any, FileService: any, ImageService: any): void => {

        FileService.option = {limit: 20, skip: 0};

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

        $document.on('drop dragover', (e: any): void => {
            e.stopPropagation();
            e.preventDefault();
        });

        let Type = (mimetype): string => {
            let result = "";
            let nameparts: string[] = mimetype.split("/");
            if (nameparts.length == 2) {
                result = nameparts[0].toLowerCase();
            }
            return result;
        };

        let Draw = () => {
            FileService.Query((result: any) => {
                if (result) {
                    $scope.randam = Math.floor(Math.random() * 100);
                    $scope.files = result;
                }
                FileService.Over((hasnext) => {
                    $scope.over = !hasnext;
                });
                FileService.Under((hasprev) => {
                    $scope.under = !hasprev;
                });
            }, error_handler);
        };

        let Exist = (query: any): void => {
            FileService.Exist(query, (result: any): void => {
                if (result) {
                    $scope.count = result;
                }
            }, error_handler);
        };

        let Count = (): void => {
            FileService.Count((result: any): void => {
                if (result) {
                    $scope.count = result;
                }
            }, error_handler);
        };

        let Next = () => {
            progress(true);
            FileService.Next((result) => {
                if (result) {
                    $scope.randam = Math.floor(Math.random() * 100);
                    $scope.files = result;
                }
                FileService.Over((hasnext) => {
                    $scope.over = !hasnext;
                });
                FileService.Under((hasprev) => {
                    $scope.under = !hasprev;
                });
                progress(false);
            }, error_handler);
        };

        let Prev = () => {
            progress(true);
            FileService.Prev((result) => {
                if (result) {
                    $scope.randam = Math.floor(Math.random() * 100);
                    $scope.files = result;
                }
                FileService.Over((hasnext) => {
                    $scope.over = !hasnext;
                });
                FileService.Under((hasprev) => {
                    $scope.under = !hasprev;
                });
                progress(false);
            }, error_handler);
        };


        let createPhoto = (files: any): void => {
            progress(true);
            let promises = [];
            _.forEach(files, (local_file) => {
                let deferred = $q.defer();
                //            FileService.Exist({"filename":local_file.name}, (exist) => {
                //               if (!exist) {

                let fileReader: any = new FileReader();
                fileReader.onload = (event: any): void => {
                    ImageService.DecodeImage(event.target.result, (image: any, type: string): void => {
                        switch (type) {
                            case "image/jpeg":
                            case "image/jpg":
                                let modalInstance: any = $uibModal.open({
                                    controller: 'PhotoResizeDialogController',
                                    templateUrl: '/images/dialogs/image_resize_dialog',
                                    resolve: {
                                        items: (): any => {
                                            return {
                                                name: local_file.name,
                                                image: event.target.result,
                                                width: image.width,
                                                height: image.height
                                            };
                                        }
                                    }
                                });

                                modalInstance.result.then((answer: any): void => { // Answer
                                    if (answer.deformation) {
                                        ImageService.ResizeImage(event.target.result, answer.width, answer.height, (resized: any): void => {
                                            ImageService.RotateImage(resized, answer.resize, answer.orientation, (rotate: any): void => {
                                                ImageService.Brightness(rotate, answer.brightness, (brightness: any): void => {
                                                    FileService.Create(brightness, local_file.name, 2000, (brightness: any) => {
                                                        deferred.resolve(true);
                                                    }, (code: number, message: string) => {
                                                        deferred.reject(false);
                                                    });
                                                });
                                            });
                                        });
                                    } else {
                                        FileService.Create(event.target.result, local_file.name, 2000, (result: any) => {
                                            deferred.resolve(true);
                                        }, (code: number, message: string) => {
                                            deferred.reject(false);
                                        });
                                    }
                                }, (): void => { // Error
                                });
                                break;
                            default:
                                FileService.Create(event.target.result, local_file.name, 2000, (result: any) => {
                                    deferred.resolve(true);
                                }, (code: number, message: string) => {
                                    deferred.reject(false);
                                });
                        }
                    });
                };
                //          } else {
                //              alert("already found.");
                //          }
                //         });
                fileReader.readAsDataURL(local_file.file);
                promises.push(deferred.promise);
            });

            $q.all(promises).then((result) => {
                files.forEach((file) => {
                    file.cancel();
                });
                progress(false);
                Draw();
            }).finally(() => {
            });
        };

        let editPhoto = (filename: string): void => {

            FileService.Get(filename, (result: any) => {

                ImageService.DecodeImage(result, (image: any, type: string): void => {
                    switch (type) {
                        case "image/jpeg":
                        case "image/jpg":
                            let modalInstance: any = $uibModal.open({
                                controller: 'PhotoResizeDialogController',
                                templateUrl: '/images/dialogs/image_resize_dialog',
                                resolve: {
                                    items: (): any => {
                                        return {
                                            name: filename,
                                            image: result,
                                            width: image.width,
                                            height: image.height
                                        };
                                    }
                                }
                            });

                            modalInstance.result.then((answer: any): void => { // Answer
                                if (answer.deformation) {
                                    ImageService.ResizeImage(result, answer.width, answer.height, (resized: any): void => {
                                        ImageService.RotateImage(resized, answer.resize, answer.orientation, (rotate: any): void => {
                                            ImageService.Brightness(rotate, answer.brightness, (brightness: any): void => {
                                                FileService.Update(brightness, filename, 2000, (brightness: any) => {
                                                    Draw();
                                                }, error_handler);
                                            });
                                        });
                                    });
                                }
                            }, (): void => { // Error
                            });
                            break;
                        default:
                    }
                });
            }, error_handler);

        };

        let showPhoto = (url: any): void => {
            let modalInstance: any = $uibModal.open({
                controller: 'ImageShowDialogController',
                templateUrl: '/images/dialogs/image_show_dialog',
                resolve: {
                    items: (): any => {
                        return url;
                    }
                }
            });

            modalInstance.result.then((answer: any): void => { // Answer
            }, (): void => { // Error
            });
        };

        let deletePhoto = (filename: any): void => {

            let modalInstance = $uibModal.open({
                controller: 'PhotoDeleteDialogController',
                templateUrl: '/files/dialogs/file_delete_dialog',
            });

            modalInstance.result.then((answer: any): void => { // Answer
                FileService.Delete(filename, 2000, (result: any) => {
                    $scope.files = [];
                    Draw();
                }, error_handler);
            }, (): void => { // Error
            });
        };

        FileService.SetQuery({"metadata.type": {$regex: "image/"}}, 2000);
        let Find = (name: string): void => {
            if (!name) {
                name = "";
            }
            FileService.SetQuery({$and: [{filename: {$regex: name}}, {"metadata.type": {$regex: "image/"}}]}, 2000);
            Draw();
        };

        let CreateProfile = (files: any): void => {
            progress(true);
            let local_file = files[0];
            let fileReader: any = new FileReader();
            let image: any = new Image();
            $scope.userid = "";     // $scope trick for redraw

            fileReader.onload = (event: any): void => {
                let uri: any = event.target.result;
                image.src = uri;
                image.onload = (): void => {
                    ProfileService.Get((self: any): void => {
                        if (self) {
                            FileService.Delete(self.username, 1999, (result: any) => {
                                    FileService.Create(event.target.result, self.username, 1999, (result: any) => {
                                        ProfileService.Get((self: any): void => {
                                            if (self) {
                                                $scope.$evalAsync(      // $apply
                                                    ($scope: any): void => {
                                                        $scope.userid = self.userid; // $scope trick for redraw
                                                        progress(false);
                                                    }
                                                );
                                            }
                                        }, error_handler);
                                    }, error_handler);
                                },
                                FileService.Create(event.target.result, self.username, 1999, (result: any) => {
                                    ProfileService.Get((self: any): void => {
                                        if (self) {
                                            $scope.$evalAsync(      // $apply
                                                ($scope: any): void => {
                                                    $scope.userid = self.userid; // $scope trick for redraw
                                                    progress(false);
                                                }
                                            );
                                        }
                                    }, error_handler);
                                }, error_handler)
                            );
                        }
                    }, error_handler);
                };
            };
            fileReader.readAsDataURL(local_file.file);
        };

        ProfileService.Get((self: any): void => {
            if (self) {
                $scope.userid = self.userid;
            }
        }, error_handler);


        $scope.$on('get_namespaces', (event, value): void => {
    //        $scope.namespaces = value;
        });

        $scope.$on('change_namespace', (event, value): void => {
            $scope.namespace = value;
            Draw();
        });


        $scope.createProfile = CreateProfile;
        $scope.Type = Type;
        $scope.Next = Next;
        $scope.Prev = Prev;
        $scope.createPhoto = createPhoto;
        $scope.editPhoto = editPhoto;
        $scope.showPhoto = showPhoto;
        $scope.deletePhoto = deletePhoto;
        $scope.Find = Find;

        // Guidance

        $scope.next = (): void => {
            $scope.step++;
            SessionService.Put({guidance: {photo: {step: $scope.step}}}, (data: any): void => {
            }, error_handler);
        };

        $scope.prev = (): void => {
            $scope.step--;
            SessionService.Put({guidance: {photo: {step: $scope.step}}}, (data: any): void => {
            }, error_handler);
        };

        $scope.to = (step: number): void => {
            $scope.step = step;
            SessionService.Put({guidance: {photo: {step: $scope.step}}}, (data: any): void => {
            }, error_handler);
        };

        SessionService.Get((session: any): void => {
            if (session) {
                $scope.step = 0;
                let _data = session.data;
                if (_data) {
                    let guidance = _data.guidance;
                    if (guidance) {
                        let photo = guidance.photo;
                        if (photo) {
                            $scope.step = photo.step;
                        }
                    }
                }
            }
        }, error_handler);

        $scope.scenario = [
            {
                outer: {
                    top: -250, left: 360, width: 500, height: 500,
                    background: "/applications/img/balloon/right.svg",
                    target: "create"
                },
                inner: {
                    top: 50, left: 150, width: 300, height: 300,
                    content: "<h3>ニックネーム</h3>" +
                    "<br>" +
                    "<p>ニックネームを入力してください</p>" +
                    "<button class='btn btn-info' type='button' ng-click='next();' aria-label=''>次へ</button>"
                },
                _class: "shake",
                style: "animation-duration:1s;animation-delay:0.3s;"
            }
        ];

    }]);

FrontControllers.controller('PhotoDeleteDialogController', ['$scope', '$uibModalInstance',
    ($scope: any, $uibModalInstance: any): void => {

        $scope.hide = (): void => {
            $uibModalInstance.close();
        };

        $scope.cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        $scope.answer = (answer: any): void => {
            $uibModalInstance.close($scope);
        };

    }]);

FrontControllers.controller('PhotoResizeDialogController', ['$scope', '$uibModalInstance', 'items', 'ImageService',
    ($scope: any, $uibModalInstance: any, items: any, ImageService): void => {

        let progress = (value) => {
            $scope.$emit('progress', value);
        };

        $scope.$on('progress', (event, value) => {
            $scope.progress = value;
        });

        let result = {width: 0, height: 0, orientation: 1, resize: false, brightness: 0, deformation: false};
        result.width = items.width;
        result.height = items.height;

        $scope.name = items.name;
        $scope.image = items.image;
        $scope.width = result.width;
        $scope.height = result.height;
        $scope.ratio = 100;
        $scope.aspect = 1;
        $scope.brightness = 0;

        // var image = document.getElementById('cropper');
        /*       var image =  $document[0].getElementById('cropper');
               var cropper = new Cropper(image, {
                   aspectRatio: 16 / 9,
                   crop: function(e) {
                       console.log(e.detail.x);
                       console.log(e.detail.y);
                       console.log(e.detail.width);
                       console.log(e.detail.height);
                       console.log(e.detail.rotate);
                       console.log(e.detail.scaleX);
                       console.log(e.detail.scaleY);
                   }
               });
        */
        /*
         ImageService.ImageExif(items.image, (exif) => {
         let exifs = [];
         Object.keys(exif).forEach((key) => {
         exifs.push(key + ":" + exif[key]);
         });
         $scope.exif = exifs;
         });
         */

        let index = 0;

        let orientations: any[] = [
            {direction: 0, resize: false},
            {direction: 0.5, resize: true},
            {direction: 1, resize: false},
            {direction: 1.5, resize: true}
        ];

        let current_size = {width: 0, height: 0, orientation: orientations[0], brightness: 0};

        let Deformation = (callback: () => void) => {
            ImageService.ResizeImage(items.image, current_size.width, current_size.height, (resized: any): void => {
                ImageService.RotateImage(resized, current_size.orientation.resize, current_size.orientation.direction, (rotate: any): void => {
                    ImageService.Brightness(rotate, current_size.brightness, (brightness: any): void => {
                        $scope.$evalAsync(      // $apply
                            ($scope: any): void => {
                                $scope.image = brightness;
                                $scope.width = current_size.width;
                                $scope.height = current_size.height;
                                result.width = current_size.width;
                                result.height = current_size.height;
                                result.orientation = current_size.orientation.direction;
                                result.resize = current_size.orientation.resize;
                                result.brightness = current_size.brightness;
                                result.deformation = true;
                                callback();
                            }
                        );
                    });
                });
            });
        };

        let SetOrientation = () => {
            let ratio = $scope.ratio;
            let aspect = $scope.aspect;
            let brightness = $scope.brightness;
            current_size.width = items.width * (ratio / 100) * aspect;
            current_size.height = items.height * (ratio / 100);
            current_size.brightness = brightness;
        };

        $scope.SizeChange = () => {
            progress(true);
            SetOrientation();
            Deformation(() => {
                progress(false)
            });
        };

        /*  $scope.RatioChange = () => {
              progress(true);
              SetOrientation();
              Deformation(() => {
                  progress(false)
              });
          };*/

        $scope.Rotate = (n: number) => {
            progress(true);
            index += 1;
            current_size.orientation = orientations[Math.abs(index % 4)];
            SetOrientation();
            Deformation(() => {
                progress(false)
            });
        };

        $scope.hide = (): void => {
            $uibModalInstance.close();
        };

        $scope.cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        $scope.answer = (answer: any): void => {
            $uibModalInstance.close(result);
        };

    }]);

//blob

//  4000 < key < 5999

FrontControllers.controller('BlobController', ['$scope', '$uibModal', '$q', '$document', '$log', 'CollectionService', 'FileService',
    function ($scope: any, $uibModal: any, $q: any, $document: any, $log: any, CollectionService, FileService): void {

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

        $document.on('drop dragover', (e: any): void => {
            e.stopPropagation();
            e.preventDefault();
        });

        let Type = (mimetype): string => {
            let result = "";
            let nameparts: string[] = mimetype.split("/");
            if (nameparts.length == 2) {
                result = nameparts[0].toLowerCase();
            }
            return result;
        };

        let Draw = () => {
            FileService.Query((result: any) => {
                if (result) {
                    $scope.files = result;
                }
                FileService.Over((hasnext) => {
                    $scope.over = !hasnext;
                });
                FileService.Under((hasprev) => {
                    $scope.under = !hasprev;
                });
            }, error_handler);
        };

        let Exist = (query: any): void => {
            FileService.Exist(query, (result: any): void => {
                if (result) {
                    $scope.count = result;
                }
            }, error_handler);
        };

        let Count = (): void => {
            FileService.Count((result: any): void => {
                if (result) {
                    $scope.count = result;
                }
            }, error_handler);
        };

        let Next = () => {
            progress(true);
            FileService.Next((result) => {
                if (result) {
                    $scope.files = result;
                }
                FileService.Over((hasnext) => {
                    $scope.over = !hasnext;
                });
                FileService.Under((hasprev) => {
                    $scope.under = !hasprev;
                });
                progress(false);
            }, error_handler);
        };

        let Prev = () => {
            progress(true);
            FileService.Prev((result) => {
                if (result) {
                    $scope.files = result;
                }
                FileService.Over((hasnext) => {
                    $scope.over = !hasnext;
                });
                FileService.Under((hasprev) => {
                    $scope.under = !hasprev;
                });
                progress(false);
            }, error_handler);
        };

        let createBlob = (files: any): void => {
            progress(true);
            let promises = [];
            _.forEach(files, (local_file) => {
                let deferred = $q.defer();
                let fileReader: any = new FileReader();
                fileReader.onload = (event: any): void => {
                    FileService.Create(event.target.result, local_file.name, 4000, (result: any) => {
                        deferred.resolve(true);
                    }, (code: number, message: string) => {
                        deferred.reject(false);
                    });
                };
                fileReader.readAsDataURL(local_file.file);
                promises.push(deferred.promise);
            });

            $q.all(promises).then(function (result) {
                progress(false);
                files.forEach((file) => {
                    file.cancel();
                });
                Draw();
            }).finally(() => {
            });
        };

        let deleteBlob = (filename: any): void => {

            let modalInstance = $uibModal.open({
                controller: 'BlobDeleteDialogController',
                templateUrl: '/blob/dialogs/delete_confirm_dialog',
            });

            modalInstance.result.then((answer: any): void => { // Answer
                FileService.Delete(filename, 4000, (result: any) => {
                    $scope.files = [];
                    Draw();
                }, error_handler);
            }, (): void => { // Error
            });
        };

        FileService.SetQuery({}, 4000);
        let Find = (name: string): void => {
            if (!name) {
                name = "";
            }
            FileService.SetQuery({filename: {$regex: name}}, 4000);
            Draw();
        };

        $scope.Type = Type;
        $scope.Count = Count;
        $scope.Next = Next;
        $scope.Prev = Prev;
        $scope.createBlob = createBlob;
        $scope.deleteBlob = deleteBlob;
        $scope.Find = Find;

        Draw();
    }]);

FrontControllers.controller('BlobDeleteDialogController', ['$scope', '$uibModalInstance',
    ($scope: any, $uibModalInstance: any): void => {

        $scope.hide = (): void => {
            $uibModalInstance.close();
        };

        $scope.cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        $scope.answer = (answer: any): void => {
            $uibModalInstance.close($scope);
        };

    }]);

//SVG

FrontControllers.controller('SVGController', ["$scope", '$document', '$log', '$window', "$compile", '$uibModal', 'ShapeEdit', 'LayoutService',
    ($scope: any, $document: any, $log: any, $window: any, $compile: any, $uibModal: any, ShapeEdit: any, TemplateService: any): void => {

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


        $document.on('drop dragover', (e: any): void => {
            e.stopPropagation();
            e.preventDefault();
        });

        window.addEventListener('beforeunload', (event: any) => {
            if ($scope.opened) {
                if (ShapeEdit.IsDirty()) {
                    event.returnValue = '';
                    return '';
                }
            }
        }, false);

        window.addEventListener("keydown", (event: any) => {
            ShapeEdit.Canvas.onKeyDown(event);
        });

        window.addEventListener("keyup", (event: any) => {
            ShapeEdit.Canvas.onKeyUp(event);
        });

        let EditClear: () => void = (): void => {
            _.each(ShapeEdit.Input, function (element: any, id: any): void {
                ShapeEdit.Wrapper.removeChild(element);
                delete ShapeEdit.Input[id];
            });
        };
        /*
         WebFont.load({
         google: {
         families: ['Pacifico::latin']
         },
         loading: function () {
         // ロードが開始されたとき
         let a = 1;
         },
         active: function () {
         // Web Fontが使用可能になったとき
         let a = 1;
         },
         inactive: function () {
         // ブラウザがサポートしていないとき
         let a = 1;
         },
         fontloading: function (fontFamily, fontDescription) {
         // fontFamilyのロードが開始されたとき
         let a = 1;
         },
         fontactive: function (fontFamily, fontDescription) {
         let a = 1;
         },
         fontinactive: function (fontFamily, fontDescription) {
         // fontFamilyをブラウザがサポートしていないとき
         let a = 1;
         }
         });
         */
        let Font_Display: () => void = (): void => {
            $scope.fontfills = ShapeEdit.CurrentFillColor().RGB();
            $scope.fontsize = ShapeEdit.CurrentFontSize();
            $scope.FontKeyword = ShapeEdit.CurrentFontKeyword();
            $scope.FontWeight = ShapeEdit.CurrentFontWeight();
            $scope.FontVariant = ShapeEdit.CurrentFontVariant();
            $scope.FontStyle = ShapeEdit.CurrentFontStyle();
            $scope.FontFamily = ShapeEdit.CurrentFontFamily()[0];
            $scope.path = ShapeEdit.CurrentPath();
        };

        let Select: (shape: any) => void = (shape: any): void => {
            let loc = shape.Location();
            $scope.x = loc.x;
            $scope.y = loc.y;

            let size = shape.Size();
            $scope.w = size.w;
            $scope.h = size.h;

            let property: any = shape.Property();
            let fields: any = property.description["field"];
            $scope.fields = fields;
            $scope.strokewidth = shape.StrokeWidth();
            $scope.fills = shape.FillColor().RGB();
            $scope.strokefills = shape.StrokeColor().RGB();
            $scope.fontsize = shape.FontSize();
            $scope.FontKeyword = shape.FontKeyword();
            $scope.FontWeight = shape.FontWeight();
            $scope.FontVariant = shape.FontVariant();
            $scope.FontStyle = shape.FontStyle();
            $scope.FontFamily = shape.FontFamily()[0];

            $scope.path = property.path;
        };

        let Deselect: () => void = (): void => {
            /*         $scope.x = 0;
             $scope.y = 0;
             $scope.w = 0;
             $scope.h = 0;

             $scope.fields = null;
             $scope.fills = null;
             $scope.strokewidth = 0;
             $scope.strokefills = null;
             $scope.fontsize = 0;
             $scope.FontKeyword = "";
             $scope.FontWeight = 0;
             $scope.FontVariant = null;
             $scope.FontStyle = 0;
             $scope.path = "";
             */
        };

        let aceOption = {
            onLoad: (_ace) => {
                _ace.setTheme("ace/theme/monokai");
                _ace.getSession().setMode("ace/mode/javascript");
            }
        };

        let changeText = (): void => {
            ShapeEdit.SetCurrentText($scope.text);
        };

        let IsOpen = (): boolean => {
            return ShapeEdit.IsOpen;
        };

        let SetScale = (scale: number): void => {
            ShapeEdit.SetScale(scale);
        };

        let ToTop = () => {
            ShapeEdit.ToTop();
        };

        let ToBottom = () => {
            ShapeEdit.ToBottom();
        };

        let Lock = () => {
            ShapeEdit.Lock();
        };

        let UnLockAll = () => {
            ShapeEdit.UnLockAll();
        };

        let Group = () => {
            ShapeEdit.Group();
        };

        let Ungroup = () => {
            ShapeEdit.Ungroup();
        };

        let Copy = () => {
            ShapeEdit.Copy();
        };

        let Paste = () => {
            ShapeEdit.Paste();
        };

        let SetAlign = (align: number) => {
            ShapeEdit.SetCurrentShapesAlign(align);
        };

        let Create = (): void => {

            let modalRegist: any = $uibModal.open({
                controller: 'SVGCreateDialogController',
                templateUrl: '/svg/dialogs/create_dialog',
                resolve: {
                    items: $scope
                }
            });

            modalRegist.result.then((layout): void => {
                $scope.name = layout.name;
                $scope.userid = layout.userid;
                $scope.opened = true;
            }, (): void => {
            });

        };

        let Open = () => {
            let modalRegist: any = $uibModal.open({
                controller: 'SVGOpenDialogController',
                templateUrl: '/svg/dialogs/open_dialog',
                resolve: {
                    items: $scope
                }
            });

            modalRegist.result.then((layout): void => {
                $scope.opened = true;
                $scope.name = layout.name;
                $scope.userid = layout.userid;

            }, (): void => {
            });

        };

        let Update = (): void => {
            if (TemplateService.current_layout) {
                progress(true);
                TemplateService.current_layout.content.text = ShapeEdit.Serialize();
                TemplateService.Put(TemplateService.current_layout, (result: any): void => {
                    progress(false);
                }, error_handler);
            }
        };

        //
        let UpdateAs = (): void => {
            let modalRegist: any = $uibModal.open({
                controller: 'SVGSaveAsDialogController',
                templateUrl: '/svg/dialogs/saveas_dialog',
                resolve: {
                    items: $scope
                }
            });

            modalRegist.result.then((layout): void => {
                $scope.name = layout.name;
                $scope.userid = layout.userid;
                $scope.opened = true;
            }, (): void => {
            });
        };

        let Delete = (): void => {
            if (TemplateService.current_layout) {
                let modalRegist: any = $uibModal.open({
                    controller: 'SVGDeleteConfirmController',
                    templateUrl: '/svg/dialogs/delete_confirm_dialog',
                    resolve: {
                        items: (): any => {
                            return TemplateService.current_layout;
                        }
                    }
                });

                modalRegist.result.then((content): void => {
                    progress(true);
                    TemplateService.Delete((result: any): void => {
                        TemplateService.current_layout = null;
                        progress(false);
                        ShapeEdit.Clear();
                        $scope.opened = false;
                    }, error_handler);
                }, (): void => {
                });
            }
        };

        let PrintPNG = (): void => {
            let width = 300;
            let height = 300;

            ShapeEdit.Snap();

            switch (TemplateService.format.layout) {
                case "portrait":
                    width = TemplateService.format.size[0];
                    height = TemplateService.format.size[1];
                    break;
                case "landscape":
                    width = TemplateService.format.size[1];
                    height = TemplateService.format.size[0];
                    break;
                default:
            }
            Canvas2Image.saveAsPNG(ShapeEdit.CanvasElement, width, height);
        };

        let PrintPDF = (): void => {
            progress(true);
            TemplateService.current_layout.content.text = ShapeEdit.Serialize();
            TemplateService.current_layout.content.format = TemplateService.format;

            TemplateService.PrintPDF(TemplateService.current_layout, (result: any): void => {
                progress(false);
                $window.location.href = "/layouts/download/pdf"
            }, error_handler);
        };

        let PrintSVG = (): void => {
            progress(true);
            TemplateService.current_layout.content.text = ShapeEdit.Serialize();
            TemplateService.PrintSVG(TemplateService.current_layout, (result: any): void => {
                progress(false);
                $window.location.href = "/layouts/download/svg"
            }, error_handler);
        };

        let ChangeEditMode = (mode: string): void => {
            switch (mode) {
                case 'move':
                    ShapeEdit.SetMode(ShapeEdit.Mode.move);
                    break;
                case 'draw':
                    ShapeEdit.SetMode(ShapeEdit.Mode.draw);
                    break;
                case 'bezierdraw':
                    ShapeEdit.SetMode(ShapeEdit.Mode.bezierdraw);
                    break;
                default:
                    break;
            }
        };

        let changeLocationX = (x: number): void => {
            let loc = ShapeEdit.CurrentLocation();
            loc.x = x;
            ShapeEdit.SetCurrentLocation(loc);
        };

        let changeLocationY = (y: number): void => {
            let loc = ShapeEdit.CurrentLocation();
            loc.y = y;
            ShapeEdit.SetCurrentLocation(loc);
        };

        let changeSizeW = (w: number): void => {
            let size = ShapeEdit.CurrentSize();
            size.w = w;
            ShapeEdit.SetCurrentSize(size);
        };

        let changeSizeH = (h: number): void => {
            let size = ShapeEdit.CurrentSize();
            size.h = h;
            ShapeEdit.SetCurrentSize(size);
        };

        let strokewidthChange = (stroke: number): void => {
            let color: ShapeEdit.RGBAColor = null;
            ShapeEdit.SetCurrentStrokeWidth(stroke);
        };

        let pathChange = (path: string): void => {
            ShapeEdit.SetCurrentPath(path);
        };

        let changeFontStyle = (fontstyle: string): void => {
            ShapeEdit.SetCurrentFontStyle(fontstyle);
            Font_Display();
        };

        // 太さ   normal、bold、lighter、bolder、または100〜900の9段階
        let changeFontWeigt = (fontweight: string): void => {
            ShapeEdit.SetCurrentFontWeight(fontweight);
            Font_Display();
        };

        // font names
        let changeFontAlign = (FontAlign: string): void => {
            ShapeEdit.SetCurrentAlign(FontAlign);
            Font_Display();
        };

        let fontsizeChange = (fontsize: number): void => {
            ShapeEdit.SetCurrentFontSize(fontsize);
            Font_Display();
        };

        let labelChange = (label: string, index: number): void => {
            if (label) {
                let shapes = ShapeEdit.Selected();
                if (shapes.length != 0) {
                    shapes[0].Property().description["field"][index].label = label;
                }
            }
        };

        let modeChange = (mode: string, index: number): void => {
            if (mode) {
                let shapes = ShapeEdit.Selected();
                if (shapes.length != 0) {
                    shapes[0].Property().description["field"][index].mode = mode;
                }
            }
        };

        let typeChange = (type: string, index: number): void => {
            if (type) {
                let shapes = ShapeEdit.Selected();
                if (shapes.length != 0) {
                    shapes[0].Property().description["field"][index].type = type;
                }
            }
        };

        let requiredChange = (required: string, index: number): void => {
            if (required) {
                let shapes = ShapeEdit.Selected();
                if (shapes.length != 0) {
                    shapes[0].Property().description["field"][index].validate.required = (required == "true");
                }
            }
        };

        let maxlengthChange = (maxlength, index: number): void => {
            if (maxlength) {
                let shapes = ShapeEdit.Selected();
                if (shapes.length != 0) {
                    shapes[0].Property().description["field"][index].validate["ng-maxlength"] = Number(maxlength);
                }
            }
        };

        let minlengthChange = (minlength, index: number): void => {
            if (minlength) {
                let shapes = ShapeEdit.Selected();
                if (shapes.length != 0) {
                    shapes[0].Property().description["field"][index].validate["ng-minlength"] = Number(minlength);
                }
            }
        };

        let optionsChange = (options, index: number): void => {
            if (options) {
                let shapes = ShapeEdit.Selected();
                if (shapes.length != 0) {
                    shapes[0].Property().description["field"][index].options = options;
                }
            }
        };

        let onChangeChange = (onChange, index: number): void => {
            if (onChange) {
                let shapes = ShapeEdit.Selected();
                if (shapes.length != 0) {
                    shapes[0].Property().description["field"][index].events = {onChange: onChange};
                }
            }
        };

        let lookupChange = (lookup, index: number): void => {
            if (lookup) {
                let shapes = ShapeEdit.Selected();
                if (shapes.length != 0) {
                    shapes[0].Property().description["field"][index].lookup = lookup;
                }
            }
        };

        let AddText = (): void => {
            let obj = {
                rectangle: new ShapeEdit.Rectangle(200, 200, 100, 30),
                property: new ShapeEdit.ShapeProperty(ShapeEdit.Canvas, 'テキスト', [], '', new ShapeEdit.RGBAColor(80, 80, 80, 1), new ShapeEdit.RGBAColor(80, 80, 80, 1), 0, new ShapeEdit.Font("normal", "normal", "normal", 24, "sans-serif", ["noto"]), "left", "miter", {
                    "category": "",
                    "type": ""
                })
            };
            let text = new ShapeEdit.Text(ShapeEdit.Canvas, obj);
            ShapeEdit.Add(text);
        };

        let AddBox = (): void => {
            let obj = {
                rectangle: new ShapeEdit.Rectangle(200, 200, 100, 100),
                property: new ShapeEdit.ShapeProperty(ShapeEdit.Canvas, '', [], '', new ShapeEdit.RGBAColor(0, 0, 0, 1), new ShapeEdit.RGBAColor(80, 80, 80, 1), 0, new ShapeEdit.Font("normal", "normal", "normal", 18, "sans-serif", []), "left", "miter", {
                    "category": "",
                    "type": ""
                })
            };
            let box = new ShapeEdit.Box(ShapeEdit.Canvas, obj);
            ShapeEdit.Add(box);
        };

        let AddOval = (): void => {
            let obj = {
                rectangle: new ShapeEdit.Rectangle(200, 200, 100, 100),
                property: new ShapeEdit.ShapeProperty(ShapeEdit.Canvas, '', [], '', new ShapeEdit.RGBAColor(0, 0, 0, 1), new ShapeEdit.RGBAColor(80, 80, 80, 1), 0, new ShapeEdit.Font("normal", "normal", "normal", 18, "sans-serif", []), "left", "miter", {
                    "category": "",
                    "type": ""
                })
            };
            let rect = new ShapeEdit.Oval(ShapeEdit.Canvas, obj);
            ShapeEdit.Add(rect);
        };

        let AddBezier = (): void => {
            let obj = {
                rectangle: new ShapeEdit.Rectangle(200, 200, 100, 100),
                property: new ShapeEdit.ShapeProperty(ShapeEdit.Canvas, '', [], '', new ShapeEdit.RGBAColor(0, 0, 0, 1), new ShapeEdit.RGBAColor(0, 0, 0, 1), 1, new ShapeEdit.Font("", "", "", 18, "sans-serif", []), "", "miter", {
                    "category": "",
                    "type": ""
                })
            };
            let context: ShapeEdit.Bezier = new ShapeEdit.Bezier(ShapeEdit.Canvas, obj);

            context.bezierCurveTo(310.17, 147.19, 310.17, 97.81, 271.5, 67.35);
            context.bezierCurveTo(232.84, 36.88, 170.16, 36.88, 131.5, 67.35);
            context.bezierCurveTo(92.83, 97.81, 92.83, 147.19, 131.5, 177.65);
            context.bezierCurveTo(170.16, 208.12, 232.84, 208.12, 271.5, 177.65);

            context.ResizeRectangle();

            ShapeEdit.Add(context);
        };

        let AddImage = (): void => {
            let obj = {
                rectangle: new ShapeEdit.Rectangle(200, 200, 200, 200),
                property: new ShapeEdit.ShapeProperty(ShapeEdit.Canvas, '', [], '/systems/files/files/blank.png', new ShapeEdit.RGBAColor(0, 0, 0, 1), new ShapeEdit.RGBAColor(80, 80, 80, 1), 1, new ShapeEdit.Font("normal", "normal", "normal", 18, "sans-serif", []), "left", "miter", {
                    "category": "",
                    "type": ""
                })
            };
            let image = new ShapeEdit.ImageRect(ShapeEdit.Canvas, obj);
            ShapeEdit.Add(image);
        };

        let DeleteSelected = (): void => {
            ShapeEdit.DeleteSelected();
        };

        let SelectedCount = (): number => {
            return ShapeEdit.SelectedCount();
        };

        ShapeEdit.onTick((shape: ShapeEdit.BaseShape, context: any): any => {
            return context;
        });

        ShapeEdit.onDraw((shape: ShapeEdit.BaseShape, context: any): void => {

        });

        ShapeEdit.onNew((shape: ShapeEdit.BaseShape): void => {
            switch (shape.type) {
                case "Text": {
                    shape.Property().description["field"] = {
                        text: {
                            label: "text",  // shape.ID(),
                            type: "text",
                            mode: "static",
                            validate: {required: true, "ng-maxlength": 50, "ng-minlength": 10},
                            options: [],
                            events: {onChange: ""},
                            lookup: ""
                        },
                        color: {
                            label: "color",
                            type: "color",
                            mode: "static",
                            validate: {required: true, "ng-maxlength": 7, "ng-minlength": 7},
                            options: [],
                            events: {onChange: ""},
                            lookup: ""
                        }
                    };
                }
                    break;
                case "Box":
                case "Oval":
                case "Polygon" :
                case "Bezier" :
                case "Shapes": {
                    shape.Property().description["field"] = {
                        color: {
                            label: "color",
                            type: "color",
                            mode: "static",
                            validate: {required: true, "ng-maxlength": 7, "ng-minlength": 7},
                            options: [],
                            events: {onChange: ""},
                            lookup: ""
                        }
                    };
                }
                    break;
                case "ImageRect": {
                    shape.Property().description["field"] = {
                        text: {
                            label: "text",  // shape.ID(),
                            type: "text",
                            mode: "static",
                            validate: {required: true, "ng-maxlength": 50, "ng-minlength": 10},
                            options: [],
                            events: {onChange: ""},
                            lookup: ""
                        }
                    };
                }
            }
        });

        ShapeEdit.onResizeWindow((wrapper, inner): void => {
        });

        ShapeEdit.onSelect((shape: ShapeEdit.BaseShape, context: any): void => {
            // for inPlace text input

            if (ShapeEdit.SelectedCount() === 1) {
                if (shape.Parent().IsRoot()) {

                    switch (shape.type) {
                        case "Text" :                                               //for inPlace Input  only Text
                            $scope.$evalAsync(   // $apply
                                function ($scope) {
                                    let id: any = shape.ID();
                                    $scope.id = id;
                                    $scope.text = shape.Property().text;
                                    Select(shape);
                                    $scope.SelectType = "Text";
                                }
                            );
                            break;
                        case "Box":
                        case "Oval":
                        case "Polygon" :
                        case "Bezier" :
                        case "Shapes": {
                            $scope.$evalAsync(   // $apply
                                function ($scope) {
                                    let id: any = shape.ID();
                                    $scope.id = id;
                                    Select(shape);
                                    $scope.SelectType = "Shape";
                                }
                            );
                        }
                            break;

                        case "ImageRect": {
                            $scope.$evalAsync(   // $apply
                                function ($scope) {
                                    let id: any = shape.ID();
                                    $scope.id = id;
                                    Select(shape);
                                    $scope.SelectType = "Image";
                                }
                            );
                        }
                            break;

                        default:
                    }
                }
            } else {
                EditClear();     // for inPlace text input
            }
        });

        ShapeEdit.onDelete((shape: ShapeEdit.BaseShape): void => {
            $scope.id = null;
            Deselect();
            $scope.SelectType = "";
            $scope.SelectImage = false;
        });

        ShapeEdit.onDeselect((shape: ShapeEdit.BaseShape, context: any): void => {
            $scope.$evalAsync(   // $apply
                function ($scope) {
                    $scope.id = null;
                    Deselect();
                    $scope.SelectType = "";
                    $scope.SelectImage = false;
                }
            );
        });

        ShapeEdit.onMove((shape: ShapeEdit.BaseShape): void => {
            $scope.$evalAsync(   // $apply
                function ($scope) {
                    let loc = shape.Location();
                    $scope.x = loc.x;
                    $scope.y = loc.y;
                }
            );
        });

        ShapeEdit.onResize((shape: ShapeEdit.BaseShape): void => {
            $scope.$evalAsync(   // $apply
                function ($scope) {
                    let size = shape.Size();
                    $scope.w = size.w;
                    $scope.h = size.h;
                }
            );
        });

        ShapeEdit.onDeformation((shape: ShapeEdit.BaseShape): void => {
            $scope.$evalAsync(   // $apply
                function ($scope) {
                    let size = shape.Size();
                    $scope.w = size.w;
                    $scope.h = size.h;
                }
            );
        });

        ShapeEdit.onChange((): void => {

        });

        ShapeEdit.onKeydown((shape: ShapeEdit.BaseShape, e: any): void => {

        });

        ShapeEdit.onDrop((shape: ShapeEdit.BaseShape, e: any): void => {
            if (e.dataTransfer.files.length == 0) {
                let url = e.dataTransfer.getData('url');
                if (url != "") {

                    // to localpath
                    //     let parser = document.createElement('a');
                    //     parser.href = url;
                    //     let localpath = parser.pathname;

                    let image = new Image();
                    image.crossOrigin = 'Anonymous';
                    // for url load error detect.
                    //image.setAttribute('crossOrigin', 'anonymous');
                    image.onload = (ex: any): void => {                            // URLがイメージとしてロード可能
                        let w = ex.target.width;
                        let h = ex.target.height;
                        let obj = {
                            rectangle: new ShapeEdit.Rectangle(e.offsetX - (w / 2), e.offsetY - (h / 2), w, h),
                            property: new ShapeEdit.ShapeProperty(ShapeEdit.Canvas, '', [], url, new ShapeEdit.RGBAColor(255, 255, 255, 1), new ShapeEdit.RGBAColor(0, 0, 0, 1), 9, new ShapeEdit.Font("normal", "normal", "normal", 18, "sans-serif", []), "", "miter", {
                                "category": "",
                                "type": "meter"
                            })
                        };

                        ShapeEdit.Add(new ShapeEdit.ImageRect(ShapeEdit.Canvas, obj));
                    };
                    image.onerror = (): void => {                           // URLがイメージとしてロード不可能
                    };
                    image.src = url;
                }
            } else {
                let file: any = e.dataTransfer.files[0];
                let reader: any = new FileReader();
                reader.onload = ((theFile) => {

                    return (ex) => {
                        let img = new Image();
                        img.crossOrigin = 'Anonymous';
                        img.onload = (): void => {
                            let w = img.width;
                            let h = img.height;
                            let url = ex.target.result;
                            let obj = {
                                rectangle: new ShapeEdit.Rectangle(e.offsetX - (w / 2), e.offsetY - (h / 2), w, h),
                                property: new ShapeEdit.ShapeProperty(ShapeEdit.Canvas, '', [], url, new ShapeEdit.RGBAColor(255, 255, 255, 1), new ShapeEdit.RGBAColor(0, 0, 0, 1), 9, new ShapeEdit.Font("normal", "normal", "normal", 18, "sans-serif", []), "", "miter", {
                                    "category": "",
                                    "type": "meter"
                                })
                            };
                            ShapeEdit.Add(new ShapeEdit.ImageRect(ShapeEdit.Canvas, obj));
                        };
                        img.src = ex.target.result;
                    };
                })(file);
                reader.readAsDataURL(file);
            }
        });


        $scope.opened = false;
        $scope.IsOpen = IsOpen;
        $scope.editmode = "move";

        $scope.changeText = changeText;
        $scope.aceOption = aceOption;

        $scope.SetScale = SetScale;

        $scope.ToTop = ToTop;
        $scope.ToBottom = ToBottom;
        $scope.Lock = Lock;
        $scope.UnLockAll = UnLockAll;
        $scope.Group = Group;
        $scope.Ungroup = Ungroup;
        $scope.Copy = Copy;
        $scope.Paste = Paste;
        $scope.SetAlign = SetAlign;

        $scope.Create = Create;
        $scope.Open = Open;
        $scope.Update = Update;
        $scope.UpdateAs = UpdateAs;
        $scope.Delete = Delete;
        $scope.PrintPNG = PrintPNG;
        $scope.PrintPDF = PrintPDF;
        $scope.PrintSVG = PrintSVG;
        $scope.ChangeEditMode = ChangeEditMode;
        $scope.strokewidthChange = strokewidthChange;
        $scope.pathChange = pathChange;
        $scope.changeLocationX = changeLocationX;
        $scope.changeLocationY = changeLocationY;
        $scope.changeSizeW = changeSizeW;
        $scope.changeSizeH = changeSizeH;
        $scope.changeFontStyle = changeFontStyle;
        $scope.changeFontWeigt = changeFontWeigt;
        $scope.changeFontAlign = changeFontAlign;
        $scope.fontsizeChange = fontsizeChange;
        $scope.labelChange = labelChange;
        $scope.modeChange = modeChange;
        $scope.typeChange = typeChange;
        $scope.requiredChange = requiredChange;
        $scope.maxlengthChange = maxlengthChange;
        $scope.minlengthChange = minlengthChange;
        $scope.optionsChange = optionsChange;
        $scope.onChangeChange = onChangeChange;
        $scope.lookupChange = lookupChange;
        $scope.AddText = AddText;
        $scope.AddBox = AddBox;
        $scope.AddOval = AddOval;
        $scope.AddBezier = AddBezier;
        $scope.AddImage = AddImage;
        $scope.DeleteSelected = DeleteSelected;
        $scope.SelectedCount = SelectedCount;

        $scope.$watch('fills', (color_string: string): void => {
            if (color_string) {
                let color: ShapeEdit.RGBAColor = new ShapeEdit.RGBAColor(0, 0, 0, 1);
                color.SetRGB(color_string);
                ShapeEdit.SetCurrentFillColor(color);
                Font_Display();
            }
        });

        $scope.$watch('strokefills', (color_string: string): void => {
            if (color_string) {
                let color: ShapeEdit.RGBAColor = new ShapeEdit.RGBAColor(0, 0, 0, 0);
                color.SetRGB(color_string);
                ShapeEdit.SetCurrentStrokeColor(color);
                Font_Display();
            }
        });

        $scope.$watch('FontVariant', (FontVariant): void => {
            if (FontVariant) {
                ShapeEdit.SetCurrentFontVariant(FontVariant);
                Font_Display();
            }
        });

        $scope.$watch('FontWeight', (fontweight: string): void => {
            if (fontweight) {
                ShapeEdit.SetCurrentFontWeight(fontweight);
                Font_Display();
            }
        });

        $scope.$watch('FontKeyword', (FontKeyword: string): void => {
            if (FontKeyword) {
                ShapeEdit.SetCurrentFontKeyword(FontKeyword);
                Font_Display();
            }
        });

        $scope.$watch('FontFamily', (FontFamily: string): void => {
            if (FontFamily) {
                ShapeEdit.SetCurrentFontFamily([FontFamily]);
                Font_Display();
            }
        });

        Font_Display();
    }]);

FrontControllers.controller('SVGCreateDialogController', ['$scope', '$log', '$uibModalInstance', 'LayoutService', 'ShapeEdit', 'items',
    ($scope: any, $log: any, $uibModalInstance: any, TemplateService: any, ShapeEdit: any, items: any): void => {

        $scope.dpi = 800;
        $scope.ratio = 1.414;
        $scope.margintop = 72;
        $scope.marginbottom = 72;
        $scope.marginleft = 72;
        $scope.marginright = 72;
        $scope.layout = "portrait";

        let error_handler: (code: number, message: string) => void = (code: number, message: string): void => {
            progress(false);
            $scope.message = message;
            $log.error(message);
        };

        let progress = (value) => {
            $scope.$emit('progress', value);
        };

        $scope.$on('progress', (event, value) => {
            items.progress = value;
        });

        $scope.hide = (): void => {
            $uibModalInstance.close();
        };

        $scope.cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        $scope.answer = (): void => {
            progress(true);

            let short = $scope.dpi;
            TemplateService.format.size = [short, short * $scope.ratio];
            TemplateService.format.margins.top = $scope.margintop;
            TemplateService.format.margins.bottom = $scope.marginbottom;
            TemplateService.format.margins.left = $scope.marginleft;
            TemplateService.format.margins.right = $scope.marginright;
            TemplateService.format.layout = $scope.layout;
            TemplateService.format.info.Title = $scope.title;
            TemplateService.format.info.Subject = $scope.subject;
            TemplateService.format.info.Author = $scope.author;

            let cover_letter: any = {
                "type": "Canvas",
                "shapes": {
                    "type": "Shapes",
                    "locked": "false",
                    "rectangle": {
                        "type": "Size",
                        "location": {"type": "Location", "x": 0, "y": 0, "miter": 0},
                        "size": {"type": "Size", "w": 0, "h": 0}
                    },
                    "property": {
                        "type": "ShapeProperty",
                        "text": "",
                        "textwidth": [],
                        "path": "",
                        "fillstyle": {"type": "RGBAColor", "r": 0, "g": 0, "b": 0, "a": 0},
                        "strokestyle": {"type": "RGBAColor", "r": 0, "g": 0, "b": 0, "a": 0},
                        "strokewidth": 0,
                        "font": {
                            "style": "",
                            "variant": "",
                            "weight": "",
                            "size": 0,
                            "keyword": "sans-serif",
                            "family": []
                        },
                        "align": "",
                        "linejoin": "miter",
                        "description": {}
                    },
                    "shapes": []
                },
                "width": 0,
                "height": 0
            };

            switch (TemplateService.format.layout) {
                case "portrait":
                    cover_letter.width = TemplateService.format.size[0];
                    cover_letter.height = TemplateService.format.size[1];
                    break;
                case "landscape":
                    cover_letter.width = TemplateService.format.size[1];
                    cover_letter.height = TemplateService.format.size[0];
                    break;
                default:
            }

            let content = {
                title: $scope.title,
                subtitle: $scope.subject,
                text: JSON.stringify(cover_letter),
                format: TemplateService.format,
            };

            TemplateService.Create($scope.title, content, (result: any): void => {
                TemplateService.current_layout = result;
                TemplateService.format = result.content.format;
                ShapeEdit.Load(result.content.text);
                progress(false);
                $uibModalInstance.close(result);
            }, error_handler);
        };

    }]);

FrontControllers.controller('SVGOpenDialogController', ['$scope', '$log', '$uibModalInstance', '$uibModal', 'items', 'ShapeEdit', 'LayoutService',
    ($scope: any, $log: any, $uibModalInstance: any, $uibModal: any, items: any, ShapeEdit: any, TemplateService: any): void => {

        let progress = (value) => {
            $scope.$emit('progress', value);
        };

        $scope.$on('progress', (event, value) => {
            items.progress = value;
        });

        let error_handler: (code: number, message: string) => void = (code: number, message: string): void => {
            progress(false);
            $scope.message = message;
            $log.error(message);
        };

        let EditClear: () => void = (): void => {
            _.each(ShapeEdit.Input, function (element: any, id: any) {
                ShapeEdit.Wrapper.removeChild(element);
                delete ShapeEdit.Input[id];
            });
        };

        let Count: () => void = (): void => {
            TemplateService.Count((result: any): void => {
                $scope.count = result;
            }, error_handler);
        };

        let Query: () => any = (): any => {
            TemplateService.Query((value: any): void => {
                $scope.layouts = value;
            }, error_handler);
        };

        let Next = (): void => {
            progress(true);
            TemplateService.Next((result: any): void => {
                if (result) {
                    $scope.layouts = result;
                }
                progress(false);
            }, error_handler);
        };

        let Prev = (): void => {
            progress(true);
            TemplateService.Prev((result: any): void => {
                if (result) {
                    $scope.layouts = result;
                }
                progress(false);
            }, error_handler);
        };

        let Get = (layout): void => {
            progress(true);
            TemplateService.Get(layout._id, (result: any): void => {
                TemplateService.current_layout = result;
                TemplateService.format = result.content.format;
                ShapeEdit.Load(result.content.text);
                //        EditClear();
                progress(false);
                $uibModalInstance.close(result);

            }, error_handler);
        };

        let hide = (): void => {
            $uibModalInstance.close();
        };

        let cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        $scope.Next = Next;
        $scope.Prev = Prev;
        $scope.Get = Get;
        $scope.hide = hide;
        $scope.cancel = cancel;
        $scope.LayoutQuery = (): any => Query;

        Count();
        Query();
    }]);

FrontControllers.controller('SVGSaveAsDialogController', ['$scope', '$log', '$uibModalInstance', 'LayoutService', 'ShapeEdit', 'items',
    ($scope: any, $log: any, $uibModalInstance: any, TemplateService: any, ShapeEdit: any, items: any): void => {

        let error_handler: (code: number, message: string) => void = (code: number, message: string): void => {
            progress(false);
            $scope.message = message;
            $log.error(message);
        };

        let progress = (value) => {
            $scope.$emit('progress', value);
        };

        $scope.$on('progress', (event, value) => {
            items.progress = value;
        });

        $scope.hide = (): void => {
            $uibModalInstance.close();
        };

        $scope.cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        $scope.answer = (): void => {
            progress(true);
            if (TemplateService.current_layout) {
                progress(true);
                TemplateService.current_layout.content.text = ShapeEdit.Serialize();
                TemplateService.PutAs($scope.title, TemplateService.current_layout, (result: any): void => {
                    progress(false);
                    $uibModalInstance.close({});
                }, error_handler);
            }
        };

    }]);

FrontControllers.controller('SVGDeleteConfirmController', ['$scope', '$uibModalInstance', 'items',
    ($scope: any, $uibModalInstance: any, items: any): void => {

        $scope.title = items.content.title;

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

//Member

FrontControllers.controller('MemberController', ['$scope', '$document', '$log', '$uibModal', 'MemberService',
    ($scope: any, $document: any, $log: any, $uibModal: any, MemberService: any): void => {

        let progress = (value) => {
            $scope.$emit('progress', value);
        };

        $scope.$on('progress', (event, value): void => {
            $scope.progress = value;
        });

        let error_handler: (code: number, message: string) => void = (code: number, message: string): void => {
            progress(false);
            $scope.message = message;
            $log.error(message);
            alert(message);
        };

        let alert = (message: string): void => {
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

        let Draw = () => {
            MemberService.Query((result: any): void => {
                if (result) {
                    $scope.accounts = result;
                }
            }, error_handler);
        };

        let Count = (): void => {
            MemberService.Count((result: any): void => {
                if (result) {
                    $scope.count = result;
                }
            }, error_handler);
        };

        let Next = () => {
            progress(true);
            MemberService.Next((result): void => {
                if (result) {
                    $scope.accounts = result;
                }
                progress(false);
            }, error_handler);
        };

        let Prev = () => {
            progress(true);
            MemberService.Prev((result): void => {
                if (result) {
                    $scope.accounts = result;
                }
                progress(false);
            }, error_handler);
        };

        let Find = (name): void => {
            if (name) {
                MemberService.query = {username: {$regex: name}};
            }
            Draw();
            Count();
        };

        let Open = (acount: any): void => {
            let modalRegist: any = $uibModal.open({
                controller: 'MemberOpenDialogController',
                templateUrl: '/members/dialogs/open_dialog',
                resolve: {
                    items: acount
                }
            });

            modalRegist.result.then((group: any): void => {
                $scope.layout = group;
                $scope.name = group.name;
                $scope.opened = true;
            }, (): void => {
            });

        };

        $scope.Next = Next;
        $scope.Prev = Prev;
        $scope.Count = Count;
        $scope.Find = Find;
        $scope.Open = Open;

        Find(null);

    }]);

FrontControllers.controller('MemberOpenDialogController', ['$scope', '$uibModalInstance', 'items',
    ($scope: any, $uibModalInstance: any, items: any): void => {

        $scope.items = items;

        $scope.hide = (): void => {
            $uibModalInstance.close();
        };

        $scope.cancel = (): void => {
            $uibModalInstance.dismiss();
        };

    }]);


FrontControllers.controller('UserSettingController', ['$scope', '$q', '$document', '$uibModal', '$log', 'ProfileService',"SessionService", 'DataService',"NamespaceService",
    ($scope: any, $q: any, $document: any, $uibModal: any, $log: any, ProfileService,SessionService, DataService: any,NamespaceService): void => {

        let progress = (value): void => {
            $scope.$emit('progress', value);
        };

        $scope.$on('progress', (event, value): void => {
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

        ProfileService.Get((self: any): void => {
            if (self) {
                $scope.userid = self.username;
            }
        }, error_handler);

        $document.on('drop dragover', (e: any): void => {
            e.stopPropagation();
            e.preventDefault();
        });

        $scope.$on('get_namespaces', (event, value): void => {
   //         $scope.namespaces = value;
        });

        $scope.$on('change_namespace', (event, value): void => {
            $scope.namespace = value;
        });

        $scope.UploadBackup = (file: any): void => {
            progress(true);
            let fileReader: any = new FileReader();
            fileReader.onload = (event: any): void => {
                DataService.Upload(event.target.result, file[0].name, (result: any) => {

                }, (code: number, message: string) => {

                });
            };

            fileReader.readAsDataURL(file[0].file);
        };

    }]);


FrontControllers.controller('NamespacesController', ['$scope',"$rootScope", "$log",'SessionService', 'NamespaceService',
    ($scope: any,$rootScope, $log, SessionService: any, NamespaceService: any): void => {

        let progress = (value): void => {
            $scope.$emit('progress', value);
        };

        let error_handler: (code: number, message: string) => void = (code: number, message: string): void => {
            progress(false);
            $scope.message = message;
            $log.error(message);
        };

        let GetNamespaces = (): void => {
            NamespaceService.Get(
                (namespaces) => {
                    $scope.namespaces = namespaces;
                    $scope.$emit('get_namespaces', namespaces);
                    GetNamespace();
                }, error_handler);
        };

        $scope.SetNamespace = (namespace: string): void => {
            SessionService.Put({namespace: namespace}, (data: any): void => {
                $scope.namespace = namespace;
                $scope.$emit('change_namespace', data.namespace);
            }, error_handler);
        };

        let GetNamespace = (): void => {
            SessionService.Get((session: any): void => {
                if (session) {
                    let data = session.data;
                    if (data) {
                        $scope.$emit('change_namespace', data.namespace);
                    }
                }
            }, error_handler);
        };

        $rootScope.$on('change_files', (event, value): void => {
            GetNamespaces();
            GetNamespace();
        });

        $scope.GetNamespace = GetNamespace;

        GetNamespaces();

    }]);




/*! Controllers  */

