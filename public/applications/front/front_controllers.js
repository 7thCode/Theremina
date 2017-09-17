/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
let FrontControllers = angular.module('FrontControllers', ['ui.bootstrap', 'ngAnimate', 'flow', 'ui.ace']);
//Event
FrontControllers.controller('EventController', ['$scope',
    ($scope) => {
        //    $scope.$on('change_controller', (event, value) => {
        //        $scope.controller_name = value;
        //    });
    }]);
//Front
FrontControllers.controller('FrontController', ['$scope', '$log', '$compile', '$uibModal', 'ProfileService',
    ($scope, $log, $compile, $uibModal, ProfileService) => {
        let progress = (value) => {
            $scope.$emit('progress', value);
        };
        $scope.$on('progress', (event, value) => {
            $scope.progress = value;
        });
        //       $scope.$emit('change_controller', "front");
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
        ProfileService.Get((self) => {
            if (self) {
                if (!self.local.address) {
                    //         SelfInit(self);
                }
            }
        }, error_handler);
        let SelfInit = (self) => {
            let modalRegist = $uibModal.open({
                controller: 'SelfUpdateDialogController',
                templateUrl: '/dialogs/self_update_dialog',
                backdrop: false,
                resolve: {
                    items: null
                }
            });
            modalRegist.result.then((dialog_scope) => {
                let mails = [];
                if (dialog_scope.mails) {
                    mails = dialog_scope.mails;
                }
                ProfileService.Put({
                    nickname: dialog_scope.nickname,
                    mails: mails
                }, (result) => {
                }, error_handler);
            }, () => {
            });
        };
    }]);
//Self
FrontControllers.controller('SelfController', ['$scope', '$log', "$uibModal", "ProfileService", 'SessionService', 'ZipService',
    ($scope, $log, $uibModal, ProfileService, SessionService, ZipService) => {
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
        $scope.opened = false;
        $scope.Zip = (zip) => {
            if (zip) {
                if (zip.length > 6) {
                    progress(true);
                    ZipService.Zip(zip, (error, result) => {
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
                }
                else {
                    $scope.address = "";
                    $scope.city = "";
                    $scope.street = "";
                }
            }
        };
        ProfileService.Get((self) => {
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
        $scope.Save = () => {
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
                magazine: { send: $scope.magazine }
            }, (result) => {
            }, error_handler);
            let modalRegist = $uibModal.open({
                controller: 'SaveDoneController',
                templateUrl: '/dialogs/save_done_dialog',
                resolve: {
                    items: () => {
                    }
                }
            });
            modalRegist.result.then((content) => {
            }, () => {
            });
        };
        // Guidance
        $scope.next = () => {
            $scope.step++;
            SessionService.Put({ guidance: { self: { step: $scope.step } } }, (data) => {
            }, error_handler);
        };
        $scope.prev = () => {
            $scope.step--;
            SessionService.Put({ guidance: { self: { step: $scope.step } } }, (data) => {
            }, error_handler);
        };
        $scope.to = (step) => {
            $scope.step = step;
            SessionService.Put({ guidance: { self: { step: $scope.step } } }, (data) => {
            }, error_handler);
        };
        SessionService.Get((session) => {
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
    ($scope, $uibModalInstance) => {
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
FrontControllers.controller('SelfUpdateDialogController', ['$scope', '$uibModalInstance', 'items', 'ZipService',
    ($scope, $uibModalInstance, items, ZipService) => {
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
                    ZipService.Zip(zip, (error, result) => {
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
                }
                else {
                    $scope.address = "";
                    $scope.city = "";
                    $scope.street = "";
                }
            }
        };
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
//Data
FrontControllers.controller('DataController', ['$scope', '$log', '$document', '$compile', '$uibModal', "FormPlayerService", "ArticleService", 'SessionService',
    ($scope, $log, $document, $compile, $uibModal, FormPlayerService, ArticleService, SessionService) => {
        let pagesize = 100;
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
        $scope.opened = false;
        ArticleService.option.limit = pagesize;
        let current_id = null;
        let page_type = "";
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
                                let type = "quoted";
                                let value = $scope[name];
                                switch (element.type) {
                                    case "img":
                                        type = "url";
                                        break;
                                    default:
                                        if (Array.isArray(value)) {
                                            type = "array";
                                        }
                                        else {
                                            switch (control.type) {
                                                case "html":
                                                    type = "html";
                                                    break;
                                                default:
                                            }
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
        $scope.Selected = () => {
            return current_id;
        };
        $scope.CreateArticle = () => {
            let modalRegist = $uibModal.open({
                controller: 'DataCreateDialogController',
                templateUrl: '/data/dialogs/create_dialog',
                resolve: {
                    items: $scope
                }
            });
            modalRegist.result.then((dialog_scope) => {
                progress(true);
                let name = dialog_scope.title;
                ArticleService.Create(name, { type: { "type": "quoted", "value": dialog_scope.type } }, (result) => {
                    current_id = result._id;
                    ArticleService.option.skip = 0;
                    if (current_id) {
                        ArticleService.Get(current_id, (result) => {
                            ArticleService.current_article = result;
                            $scope.current_article = result;
                            $scope.opened = true;
                            page_type = result.content.type.value; //!!
                            DrawPage(page_type, () => {
                                Map(result.content);
                                progress(false);
                            });
                        }, error_handler);
                    }
                    else {
                        DrawPage(page_type, () => {
                            progress(false);
                        });
                    }
                    Clear();
                }, error_handler);
            }, () => {
            });
        };
        $scope.SelectPage = (type) => {
            progress(true);
            page_type = type;
            if (current_id) {
                ArticleService.Get(current_id, (result) => {
                    ArticleService.current_article = result;
                    $scope.current_article = result;
                    $scope.opened = true;
                    DrawPage(page_type, () => {
                        Map(result.content);
                        progress(false);
                    });
                }, error_handler);
            }
            else {
                DrawPage(page_type, () => {
                    progress(false);
                });
            }
        };
        $scope.PageSelected = (type) => {
            return (page_type == type);
        };
        $scope.SelectArticle = (id) => {
            progress(true);
            current_id = id;
            ArticleService.Get(current_id, (result) => {
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
        $scope.ArticleSelected = (id) => {
            return (current_id == id);
        };
        $scope.SaveArticle = () => {
            progress(true);
            let new_record = Reduce();
            ArticleService.Put(current_id, new_record, (result) => {
                progress(false);
            }, error_handler);
        };
        $scope.DeleteArticle = () => {
            if (current_id) {
                let modalRegist = $uibModal.open({
                    controller: 'DataDeleteConfirmController',
                    templateUrl: '/dialogs/delete_confirm_dialog',
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
        $scope.Find = (newValue) => {
            ArticleService.SetQuery(null);
            if (newValue) {
                ArticleService.SetQuery({ name: { $regex: newValue } });
            }
            Draw(() => {
            });
        };
        $scope.Sort = (name) => {
            if (name) {
                direction = -direction;
                ArticleService.option.sort[name] = direction;
            }
            Draw(() => {
            });
        };
        $scope.Next = () => {
            progress(true);
            ArticleService.Next((result) => {
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
        $scope.Prev = () => {
            progress(true);
            ArticleService.Prev((result) => {
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
        $scope.onDrop = (data, evt, id) => {
            $scope[id] = evt.element[0].src;
        };
        FormPlayerService.$scope = $scope;
        FormPlayerService.$compile = $compile;
        let DrawPage = (name, callback) => {
            FormPlayerService.query = { name: name };
            FormPlayerService.Query((value) => {
                if (value.length > 0) {
                    FormPlayerService.Get(value[0]._id, (result) => {
                        FormPlayerService.current_page = result.content;
                        $scope.current_page = result;
                        FormPlayerService.Draw();
                        callback();
                    }, error_handler);
                }
                else {
                    callback();
                }
            }, error_handler);
        };
        let DrawPages = (callback) => {
            FormPlayerService.query = { type: 1 };
            FormPlayerService.Query((value) => {
                $scope.pages = value;
                callback();
            }, error_handler);
        };
        let DrawArticles = (callback) => {
            ArticleService.Query((data) => {
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
        let Draw = (callback) => {
            DrawPage(page_type, () => {
                DrawPages(() => {
                    DrawArticles(callback);
                });
            });
        };
        Draw(() => {
        });
        // Guidance
        $scope.next = () => {
            $scope.step++;
            SessionService.Put({ guidance: { data: { step: $scope.step } } }, (data) => {
            }, error_handler);
        };
        $scope.prev = () => {
            $scope.step--;
            SessionService.Put({ guidance: { data: { step: $scope.step } } }, (data) => {
            }, error_handler);
        };
        $scope.to = (step) => {
            $scope.step = step;
            SessionService.Put({ guidance: { data: { step: $scope.step } } }, (data) => {
            }, error_handler);
        };
        SessionService.Get((session) => {
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
    }]);
FrontControllers.controller('DataCreateDialogController', ['$scope', '$uibModalInstance', 'items',
    ($scope, $uibModalInstance, items) => {
        $scope.pages = items.pages;
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
FrontControllers.controller('DataDeleteConfirmController', ['$scope', '$uibModalInstance', 'items', 'ArticleService',
    ($scope, $uibModalInstance, items, ArticleService) => {
        $scope.name = ArticleService.current_article.name;
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
//Leaflet
FrontControllers.controller('PagesController', ["$scope", "$q", "$document", "$log", "$uibModal", "ResourceBuilderService",
    function ($scope, $q, $document, $log, $uibModal, ResourceBuilderService) {
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
        window.addEventListener('beforeunload', (e) => {
            if (!editor.session.getUndoManager().isClean()) {
                e.returnValue = '';
                return '';
            }
        }, false);
        let editor = null;
        let document = null;
        let inner_peview = false;
        let preview_window = null;
        let local_query = [];
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
        let query_string = localStorage.getItem("pages_query");
        let Query = () => {
            progress(true);
            // template query
            ResourceBuilderService.AddQuery({ type: 21 });
            ResourceBuilderService.Query((result) => {
                ResourceBuilderService.InitQuery(null);
                if (result) {
                    $scope.templates = result;
                    //pages query
                    if (query_string) {
                        ResourceBuilderService.InitQuery(JSON.parse(query_string), 20, 36);
                    }
                    ResourceBuilderService.Query((result) => {
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
        let _Find = (key, value) => {
            progress(true);
            $scope.query_string_before = JSON.stringify(ResourceBuilderService.GetQuery()) + " " + key;
            ResourceBuilderService.RemoveQuery(key);
            if (value) {
                let query = {};
                query[key] = value;
                ResourceBuilderService.AddQuery(query);
            }
            else {
                ResourceBuilderService.RemoveQuery(key);
            }
            $scope.query_string_after = JSON.stringify(ResourceBuilderService.GetQuery()) + " " + key;
            ResourceBuilderService.Query((result) => {
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
        let Find = (name) => {
            _Find("name", { $regex: name });
            localStorage.setItem("pages_find_name", name);
        };
        $scope.type = localStorage.getItem("pages_find_type");
        let FindType = (type) => {
            _Find("type", type);
            localStorage.setItem("pages_find_type", "" + type);
        };
        $scope.mimetype = localStorage.getItem("pages_find_mime");
        let FindMime = (mime) => {
            _Find("content.type", mime);
            localStorage.setItem("pages_find_mime", mime);
        };
        $scope.content = localStorage.getItem("pages_find_resource");
        let FindResource = (value) => {
            _Find("content.resource", { $regex: value });
            localStorage.setItem("pages_find_resource", value);
        };
        let Count = () => {
            ResourceBuilderService.Count((result) => {
                if (result) {
                    $scope.count = result;
                }
            }, error_handler);
        };
        let Next = () => {
            progress(true);
            ResourceBuilderService.Next((result) => {
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
        let Prev = () => {
            progress(true);
            ResourceBuilderService.Prev((result) => {
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
        let Get = (resource) => {
            progress(true);
            ResourceBuilderService.Get(resource._id, (content) => {
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
                }
                else {
                    $scope.resource = "";
                }
                editor.session.getUndoManager().markClean();
                $scope.opened = true;
                progress(false);
            }, error_handler);
        };
        let Close = () => {
            if (!editor.session.getUndoManager().isClean()) {
                if (window.confirm('保存されていません。閉じますか？')) {
                    $scope.opened = false;
                }
            }
            else {
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
            ResourceBuilderService.Get(id, (result) => {
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
        let CreatePages = (files) => {
            progress(true);
            let promises = [];
            _.forEach(files, (local_file) => {
                let deferred = $q.defer();
                let fileReader = new FileReader();
                fileReader.onload = (event) => {
                    let modalInstance = $uibModal.open({
                        controller: 'PagesCreateDialogController',
                        templateUrl: '/pages/dialogs/create_dialog',
                        resolve: {
                            items: { parent_scope: $scope, file: local_file.file, target: event.target }
                        }
                    });
                    modalInstance.result.then((answer) => {
                        deferred.resolve(true);
                    }, () => {
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
                Query();
            }).finally(() => {
            });
        };
        let Create = () => {
            let modalRegist = $uibModal.open({
                controller: 'PagesCreateDialogController',
                templateUrl: '/pages/dialogs/create_dialog',
                resolve: {
                    items: { parent_scope: $scope, file: null, target: null }
                }
            });
            modalRegist.result.then((resource) => {
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
                Query();
                editor.session.getUndoManager().markClean();
                $scope.opened = true;
            }, () => {
            });
        };
        let Open = () => {
            let modalRegist = $uibModal.open({
                controller: 'PagesOpenDialogController',
                templateUrl: '/pages/dialogs/open_dialog',
                resolve: {
                    items: $scope
                }
            });
            modalRegist.result.then((content) => {
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
            }, () => {
            });
        };
        let Update = () => {
            if (ResourceBuilderService.current) {
                progress(true);
                ResourceBuilderService.current.content.resource = $scope.resource;
                ResourceBuilderService.Put((result) => {
                    editor.session.getUndoManager().markClean();
                    progress(false);
                }, error_handler);
            }
        };
        let Delete = () => {
            if (ResourceBuilderService.current) {
                let modalRegist = $uibModal.open({
                    controller: 'PagesDeleteConfirmController',
                    templateUrl: '/pages/dialogs/delete_confirm_dialog',
                    resolve: {
                        items: () => {
                            return ResourceBuilderService.current;
                        }
                    }
                });
                modalRegist.result.then((content) => {
                    progress(true);
                    ResourceBuilderService.Delete((result) => {
                        ClosePreview();
                        Query();
                        $scope.name = "";
                        progress(false);
                        $scope.opened = false;
                    }, error_handler);
                }, () => {
                });
            }
        };
        let BuildSite = () => {
            let modalRegist = $uibModal.open({
                controller: 'BiildSiteDialogController',
                templateUrl: '/pages/dialogs/build_site_dialog',
                resolve: {
                    items: $scope
                }
            });
            modalRegist.result.then((resource) => {
                Query();
            }, () => {
            });
        };
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
        Query();
    }]);
FrontControllers.controller('PagesCreateDialogController', ['$scope', '$log', '$uibModalInstance', 'ResourceBuilderService', 'items',
    ($scope, $log, $uibModalInstance, ResourceBuilderService, items) => {
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
        let error_handler = (code, message) => {
            progress(false);
            $scope.message = message;
            $log.error(message);
        };
        $scope.type = 20;
        $scope.hide = () => {
            $uibModalInstance.close();
        };
        $scope.cancel = () => {
            $uibModalInstance.dismiss();
        };
        $scope.answer = () => {
            progress(true);
            ResourceBuilderService.Init();
            ResourceBuilderService.current.content.type = $scope.mimetype;
            if (target) {
                ResourceBuilderService.current.content.resource = target.result;
            }
            ResourceBuilderService.Create($scope.title, $scope.type, (result) => {
                progress(false);
                $scope.message = "";
                $uibModalInstance.close(result);
            }, error_handler);
        };
    }]);
FrontControllers.controller('PagesOpenDialogController', ['$scope', '$log', '$uibModalInstance', '$uibModal', 'items', 'ResourceBuilderService',
    ($scope, $log, $uibModalInstance, $uibModal, items, ResourceBuilderService) => {
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
            ResourceBuilderService.InitQuery(null, 20);
            ResourceBuilderService.Query((result) => {
                if (result) {
                    $scope.pages = result;
                }
                progress(false);
            }, error_handler);
        };
        let Find = (name) => {
            progress(true);
            ResourceBuilderService.InitQuery(null, 20);
            if (name) {
                ResourceBuilderService.AddQuery({ name: { $regex: name } });
                //            ResourceBuilderService.SetQuery({name: {$regex: name}}, 20);
            }
            ResourceBuilderService.Query((result) => {
                if (result) {
                    $scope.pages = result;
                }
                progress(false);
            }, error_handler);
        };
        let Count = () => {
            ResourceBuilderService.Count((result) => {
                if (result) {
                    $scope.count = result;
                }
            }, error_handler);
        };
        let Next = () => {
            progress(true);
            ResourceBuilderService.Next((result) => {
                if (result) {
                    $scope.pages = result;
                }
                progress(false);
            }, error_handler);
        };
        let Prev = () => {
            progress(true);
            ResourceBuilderService.Prev((result) => {
                if (result) {
                    $scope.pages = result;
                }
                progress(false);
            }, error_handler);
        };
        let Get = (resource) => {
            progress(true);
            ResourceBuilderService.Get(resource._id, (result) => {
                progress(false);
                $scope.message = "";
                $uibModalInstance.close(result);
            }, error_handler);
        };
        let hide = () => {
            $uibModalInstance.close();
        };
        let cancel = () => {
            $uibModalInstance.dismiss();
        };
        let LayoutQuery = () => Query;
        $scope.Count = Count;
        $scope.Next = Next;
        $scope.Prev = Prev;
        $scope.Find = Find;
        $scope.Get = Get;
        $scope.hide = hide;
        $scope.cancel = cancel;
        $scope.LayoutQuery = () => Query;
        Query();
    }]);
FrontControllers.controller('PagesDeleteConfirmController', ['$scope', '$uibModalInstance', 'items',
    ($scope, $uibModalInstance, items) => {
        $scope.title = items.name;
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
FrontControllers.controller('BiildSiteDialogController', ['$scope', '$log', '$uibModalInstance', 'SiteService', 'items',
    ($scope, $log, $uibModalInstance, SiteService, items) => {
        let file = items.file;
        let target = items.target;
        let parent_scope = items.parent_scope;
        $scope.name = "mega";
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
        let error_handler = (code, message) => {
            progress(false);
            $scope.message = message;
            $log.error(message);
        };
        $scope.type = 20;
        $scope.hide = () => {
            $uibModalInstance.close();
        };
        $scope.cancel = () => {
            $uibModalInstance.dismiss();
        };
        $scope.answer = () => {
            progress(true);
            SiteService.Build($scope.name, (result) => {
                progress(false);
                $scope.message = "";
                $uibModalInstance.close(result);
            }, error_handler);
        };
    }]);
FrontControllers.controller('PhotoController', ['$scope', '$q', '$document', '$uibModal', '$log', 'ProfileService', 'SessionService', 'FileService', 'ImageService',
    ($scope, $q, $document, $uibModal, $log, ProfileService, SessionService, FileService, ImageService) => {
        FileService.option = { limit: 20, skip: 0 };
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
        let Type = (mimetype) => {
            let result = "";
            let nameparts = mimetype.split("/");
            if (nameparts.length == 2) {
                result = nameparts[0].toLowerCase();
            }
            return result;
        };
        let Draw = () => {
            FileService.Query((result) => {
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
        let Exist = (query) => {
            FileService.Exist(query, (result) => {
                if (result) {
                    $scope.count = result;
                }
            }, error_handler);
        };
        let Count = () => {
            FileService.Count((result) => {
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
        let createPhoto = (files) => {
            progress(true);
            let promises = [];
            _.forEach(files, (local_file) => {
                let deferred = $q.defer();
                //            FileService.Exist({"filename":local_file.name}, (exist) => {
                //               if (!exist) {
                let fileReader = new FileReader();
                fileReader.onload = (event) => {
                    ImageService.DecodeImage(event.target.result, (image, type) => {
                        switch (type) {
                            case "image/jpeg":
                            case "image/jpg":
                                let modalInstance = $uibModal.open({
                                    controller: 'PhotoResizeDialogController',
                                    templateUrl: '/images/dialogs/image_resize_dialog',
                                    resolve: {
                                        items: () => {
                                            return {
                                                name: local_file.name,
                                                image: event.target.result,
                                                width: image.width,
                                                height: image.height
                                            };
                                        }
                                    }
                                });
                                modalInstance.result.then((answer) => {
                                    if (answer.deformation) {
                                        ImageService.ResizeImage(event.target.result, answer.width, answer.height, (resized) => {
                                            ImageService.RotateImage(resized, answer.resize, answer.orientation, (rotate) => {
                                                ImageService.Brightness(rotate, answer.brightness, (brightness) => {
                                                    FileService.Create(brightness, local_file.name, 2000, (brightness) => {
                                                        deferred.resolve(true);
                                                    }, (code, message) => {
                                                        deferred.reject(false);
                                                    });
                                                });
                                            });
                                        });
                                    }
                                    else {
                                        FileService.Create(event.target.result, local_file.name, 2000, (result) => {
                                            deferred.resolve(true);
                                        }, (code, message) => {
                                            deferred.reject(false);
                                        });
                                    }
                                }, () => {
                                });
                                break;
                            default:
                                FileService.Create(event.target.result, local_file.name, 2000, (result) => {
                                    deferred.resolve(true);
                                }, (code, message) => {
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
        let editPhoto = (filename) => {
            FileService.Get(filename, (result) => {
                ImageService.DecodeImage(result, (image, type) => {
                    switch (type) {
                        case "image/jpeg":
                        case "image/jpg":
                            let modalInstance = $uibModal.open({
                                controller: 'PhotoResizeDialogController',
                                templateUrl: '/images/dialogs/image_resize_dialog',
                                resolve: {
                                    items: () => {
                                        return {
                                            name: filename,
                                            image: result,
                                            width: image.width,
                                            height: image.height
                                        };
                                    }
                                }
                            });
                            modalInstance.result.then((answer) => {
                                if (answer.deformation) {
                                    ImageService.ResizeImage(result, answer.width, answer.height, (resized) => {
                                        ImageService.RotateImage(resized, answer.resize, answer.orientation, (rotate) => {
                                            ImageService.Brightness(rotate, answer.brightness, (brightness) => {
                                                FileService.Update(brightness, filename, 2000, (brightness) => {
                                                    Draw();
                                                }, error_handler);
                                            });
                                        });
                                    });
                                }
                            }, () => {
                            });
                            break;
                        default:
                    }
                });
            }, error_handler);
        };
        let showPhoto = (url) => {
            let modalInstance = $uibModal.open({
                controller: 'ImageShowDialogController',
                templateUrl: '/images/dialogs/image_show_dialog',
                resolve: {
                    items: () => {
                        return url;
                    }
                }
            });
            modalInstance.result.then((answer) => {
            }, () => {
            });
        };
        let deletePhoto = (filename) => {
            let modalInstance = $uibModal.open({
                controller: 'PhotoDeleteDialogController',
                templateUrl: '/files/dialogs/file_delete_dialog',
            });
            modalInstance.result.then((answer) => {
                FileService.Delete(filename, 2000, (result) => {
                    $scope.files = [];
                    Draw();
                }, error_handler);
            }, () => {
            });
        };
        FileService.SetQuery({ "metadata.type": { $regex: "image/" } }, 2000);
        let Find = (name) => {
            if (!name) {
                name = "";
            }
            FileService.SetQuery({ $and: [{ filename: { $regex: name } }, { "metadata.type": { $regex: "image/" } }] }, 2000);
            Draw();
        };
        let CreateProfile = (files) => {
            progress(true);
            let local_file = files[0];
            let fileReader = new FileReader();
            let image = new Image();
            $scope.userid = ""; // $scope trick for redraw
            fileReader.onload = (event) => {
                let uri = event.target.result;
                image.src = uri;
                image.onload = () => {
                    ProfileService.Get((self) => {
                        if (self) {
                            FileService.Delete(self.username, 1999, (result) => {
                                FileService.Create(event.target.result, self.username, 1999, (result) => {
                                    ProfileService.Get((self) => {
                                        if (self) {
                                            $scope.$evalAsync(// $apply
                                            ($scope) => {
                                                $scope.userid = self.userid; // $scope trick for redraw
                                                progress(false);
                                            });
                                        }
                                    }, error_handler);
                                }, error_handler);
                            }, FileService.Create(event.target.result, self.username, 1999, (result) => {
                                ProfileService.Get((self) => {
                                    if (self) {
                                        $scope.$evalAsync(// $apply
                                        ($scope) => {
                                            $scope.userid = self.userid; // $scope trick for redraw
                                            progress(false);
                                        });
                                    }
                                }, error_handler);
                            }, error_handler));
                        }
                    }, error_handler);
                };
            };
            fileReader.readAsDataURL(local_file.file);
        };
        ProfileService.Get((self) => {
            if (self) {
                $scope.userid = self.userid;
            }
        }, error_handler);
        $scope.createProfile = CreateProfile;
        $scope.Type = Type;
        $scope.Next = Next;
        $scope.Prev = Prev;
        $scope.createPhoto = createPhoto;
        $scope.editPhoto = editPhoto;
        $scope.showPhoto = showPhoto;
        $scope.deletePhoto = deletePhoto;
        $scope.Find = Find;
        Draw();
        // Guidance
        $scope.next = () => {
            $scope.step++;
            SessionService.Put({ guidance: { photo: { step: $scope.step } } }, (data) => {
            }, error_handler);
        };
        $scope.prev = () => {
            $scope.step--;
            SessionService.Put({ guidance: { photo: { step: $scope.step } } }, (data) => {
            }, error_handler);
        };
        $scope.to = (step) => {
            $scope.step = step;
            SessionService.Put({ guidance: { photo: { step: $scope.step } } }, (data) => {
            }, error_handler);
        };
        SessionService.Get((session) => {
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
    ($scope, $uibModalInstance) => {
        $scope.hide = () => {
            $uibModalInstance.close();
        };
        $scope.cancel = () => {
            $uibModalInstance.dismiss();
        };
        $scope.answer = (answer) => {
            $uibModalInstance.close($scope);
        };
    }]);
FrontControllers.controller('PhotoResizeDialogController', ['$scope', '$uibModalInstance', 'items', 'ImageService',
    ($scope, $uibModalInstance, items, ImageService) => {
        let progress = (value) => {
            $scope.$emit('progress', value);
        };
        $scope.$on('progress', (event, value) => {
            $scope.progress = value;
        });
        let result = { width: 0, height: 0, orientation: 1, resize: false, brightness: 0, deformation: false };
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
        let orientations = [
            { direction: 0, resize: false },
            { direction: 0.5, resize: true },
            { direction: 1, resize: false },
            { direction: 1.5, resize: true }
        ];
        let current_size = { width: 0, height: 0, orientation: orientations[0], brightness: 0 };
        let Deformation = (callback) => {
            ImageService.ResizeImage(items.image, current_size.width, current_size.height, (resized) => {
                ImageService.RotateImage(resized, current_size.orientation.resize, current_size.orientation.direction, (rotate) => {
                    ImageService.Brightness(rotate, current_size.brightness, (brightness) => {
                        $scope.$evalAsync(// $apply
                        ($scope) => {
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
                        });
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
                progress(false);
            });
        };
        /*  $scope.RatioChange = () => {
              progress(true);
              SetOrientation();
              Deformation(() => {
                  progress(false)
              });
          };*/
        $scope.Rotate = (n) => {
            progress(true);
            index += 1;
            current_size.orientation = orientations[Math.abs(index % 4)];
            SetOrientation();
            Deformation(() => {
                progress(false);
            });
        };
        $scope.hide = () => {
            $uibModalInstance.close();
        };
        $scope.cancel = () => {
            $uibModalInstance.dismiss();
        };
        $scope.answer = (answer) => {
            $uibModalInstance.close(result);
        };
    }]);
//blob
//  4000 < key < 5999
FrontControllers.controller('BlobController', ['$scope', '$uibModal', '$q', '$document', '$log', 'CollectionService', 'FileService',
    function ($scope, $uibModal, $q, $document, $log, CollectionService, FileService) {
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
        let Type = (mimetype) => {
            let result = "";
            let nameparts = mimetype.split("/");
            if (nameparts.length == 2) {
                result = nameparts[0].toLowerCase();
            }
            return result;
        };
        let Draw = () => {
            FileService.Query((result) => {
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
        let Exist = (query) => {
            FileService.Exist(query, (result) => {
                if (result) {
                    $scope.count = result;
                }
            }, error_handler);
        };
        let Count = () => {
            FileService.Count((result) => {
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
        let createBlob = (files) => {
            progress(true);
            let promises = [];
            _.forEach(files, (local_file) => {
                let deferred = $q.defer();
                let fileReader = new FileReader();
                fileReader.onload = (event) => {
                    FileService.Create(event.target.result, local_file.name, 4000, (result) => {
                        deferred.resolve(true);
                    }, (code, message) => {
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
        let deleteBlob = (filename) => {
            let modalInstance = $uibModal.open({
                controller: 'BlobDeleteDialogController',
                templateUrl: '/blob/dialogs/delete_confirm_dialog',
            });
            modalInstance.result.then((answer) => {
                FileService.Delete(filename, 4000, (result) => {
                    $scope.files = [];
                    Draw();
                }, error_handler);
            }, () => {
            });
        };
        FileService.SetQuery({}, 4000);
        let Find = (name) => {
            if (!name) {
                name = "";
            }
            FileService.SetQuery({ filename: { $regex: name } }, 4000);
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
    ($scope, $uibModalInstance) => {
        $scope.hide = () => {
            $uibModalInstance.close();
        };
        $scope.cancel = () => {
            $uibModalInstance.dismiss();
        };
        $scope.answer = (answer) => {
            $uibModalInstance.close($scope);
        };
    }]);
//SVG
FrontControllers.controller('SVGController', ["$scope", '$document', '$log', '$window', "$compile", '$uibModal', 'ShapeEdit', 'LayoutService',
    ($scope, $document, $log, $window, $compile, $uibModal, ShapeEdit, TemplateService) => {
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
        window.addEventListener('beforeunload', (event) => {
            if ($scope.opened) {
                if (ShapeEdit.IsDirty()) {
                    event.returnValue = '';
                    return '';
                }
            }
        }, false);
        window.addEventListener("keydown", (event) => {
            ShapeEdit.Canvas.onKeyDown(event);
        });
        window.addEventListener("keyup", (event) => {
            ShapeEdit.Canvas.onKeyUp(event);
        });
        let EditClear = () => {
            _.each(ShapeEdit.Input, function (element, id) {
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
        let Font_Display = () => {
            $scope.fontfills = ShapeEdit.CurrentFillColor().RGB();
            $scope.fontsize = ShapeEdit.CurrentFontSize();
            $scope.FontKeyword = ShapeEdit.CurrentFontKeyword();
            $scope.FontWeight = ShapeEdit.CurrentFontWeight();
            $scope.FontVariant = ShapeEdit.CurrentFontVariant();
            $scope.FontStyle = ShapeEdit.CurrentFontStyle();
            $scope.FontFamily = ShapeEdit.CurrentFontFamily()[0];
            $scope.path = ShapeEdit.CurrentPath();
        };
        let Select = (shape) => {
            let loc = shape.Location();
            $scope.x = loc.x;
            $scope.y = loc.y;
            let size = shape.Size();
            $scope.w = size.w;
            $scope.h = size.h;
            let property = shape.Property();
            let fields = property.description["field"];
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
        let Deselect = () => {
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
        let changeText = () => {
            ShapeEdit.SetCurrentText($scope.text);
        };
        let IsOpen = () => {
            return ShapeEdit.IsOpen;
        };
        let SetScale = (scale) => {
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
        let SetAlign = (align) => {
            ShapeEdit.SetCurrentShapesAlign(align);
        };
        let Create = () => {
            let modalRegist = $uibModal.open({
                controller: 'SVGCreateDialogController',
                templateUrl: '/svg/dialogs/create_dialog',
                resolve: {
                    items: $scope
                }
            });
            modalRegist.result.then((layout) => {
                $scope.name = layout.name;
                $scope.userid = layout.userid;
                $scope.opened = true;
            }, () => {
            });
        };
        let Open = () => {
            let modalRegist = $uibModal.open({
                controller: 'SVGOpenDialogController',
                templateUrl: '/svg/dialogs/open_dialog',
                resolve: {
                    items: $scope
                }
            });
            modalRegist.result.then((layout) => {
                $scope.opened = true;
                $scope.name = layout.name;
                $scope.userid = layout.userid;
            }, () => {
            });
        };
        let Update = () => {
            if (TemplateService.current_layout) {
                progress(true);
                TemplateService.current_layout.content.text = ShapeEdit.Serialize();
                TemplateService.Put(TemplateService.current_layout, (result) => {
                    progress(false);
                }, error_handler);
            }
        };
        //
        let UpdateAs = () => {
            let modalRegist = $uibModal.open({
                controller: 'SVGSaveAsDialogController',
                templateUrl: '/svg/dialogs/saveas_dialog',
                resolve: {
                    items: $scope
                }
            });
            modalRegist.result.then((layout) => {
                $scope.name = layout.name;
                $scope.userid = layout.userid;
                $scope.opened = true;
            }, () => {
            });
        };
        let Delete = () => {
            if (TemplateService.current_layout) {
                let modalRegist = $uibModal.open({
                    controller: 'SVGDeleteConfirmController',
                    templateUrl: '/svg/dialogs/delete_confirm_dialog',
                    resolve: {
                        items: () => {
                            return TemplateService.current_layout;
                        }
                    }
                });
                modalRegist.result.then((content) => {
                    progress(true);
                    TemplateService.Delete((result) => {
                        TemplateService.current_layout = null;
                        progress(false);
                        ShapeEdit.Clear();
                        $scope.opened = false;
                    }, error_handler);
                }, () => {
                });
            }
        };
        let PrintPNG = () => {
            let width, height;
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
        let PrintPDF = () => {
            progress(true);
            TemplateService.current_layout.content.text = ShapeEdit.Serialize();
            TemplateService.current_layout.content.format = TemplateService.format;
            TemplateService.PrintPDF(TemplateService.current_layout, (result) => {
                progress(false);
                $window.location.href = "/layouts/download/pdf";
            }, error_handler);
        };
        let PrintSVG = () => {
            progress(true);
            TemplateService.current_layout.content.text = ShapeEdit.Serialize();
            TemplateService.PrintSVG(TemplateService.current_layout, (result) => {
                progress(false);
                $window.location.href = "/layouts/download/svg";
            }, error_handler);
        };
        let ChangeEditMode = (mode) => {
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
        let changeLocationX = (x) => {
            let loc = ShapeEdit.CurrentLocation();
            loc.x = x;
            ShapeEdit.SetCurrentLocation(loc);
        };
        let changeLocationY = (y) => {
            let loc = ShapeEdit.CurrentLocation();
            loc.y = y;
            ShapeEdit.SetCurrentLocation(loc);
        };
        let changeSizeW = (w) => {
            let size = ShapeEdit.CurrentSize();
            size.w = w;
            ShapeEdit.SetCurrentSize(size);
        };
        let changeSizeH = (h) => {
            let size = ShapeEdit.CurrentSize();
            size.h = h;
            ShapeEdit.SetCurrentSize(size);
        };
        let strokewidthChange = (stroke) => {
            let color = null;
            ShapeEdit.SetCurrentStrokeWidth(stroke);
        };
        let pathChange = (path) => {
            ShapeEdit.SetCurrentPath(path);
        };
        let changeFontStyle = (fontstyle) => {
            ShapeEdit.SetCurrentFontStyle(fontstyle);
            Font_Display();
        };
        // 太さ   normal、bold、lighter、bolder、または100〜900の9段階
        let changeFontWeigt = (fontweight) => {
            ShapeEdit.SetCurrentFontWeight(fontweight);
            Font_Display();
        };
        // font names
        let changeFontAlign = (FontAlign) => {
            ShapeEdit.SetCurrentAlign(FontAlign);
            Font_Display();
        };
        let fontsizeChange = (fontsize) => {
            ShapeEdit.SetCurrentFontSize(fontsize);
            Font_Display();
        };
        let labelChange = (label, index) => {
            if (label) {
                let shapes = ShapeEdit.Selected();
                if (shapes.length != 0) {
                    shapes[0].Property().description["field"][index].label = label;
                }
            }
        };
        let modeChange = (mode, index) => {
            if (mode) {
                let shapes = ShapeEdit.Selected();
                if (shapes.length != 0) {
                    shapes[0].Property().description["field"][index].mode = mode;
                }
            }
        };
        let typeChange = (type, index) => {
            if (type) {
                let shapes = ShapeEdit.Selected();
                if (shapes.length != 0) {
                    shapes[0].Property().description["field"][index].type = type;
                }
            }
        };
        let requiredChange = (required, index) => {
            if (required) {
                let shapes = ShapeEdit.Selected();
                if (shapes.length != 0) {
                    shapes[0].Property().description["field"][index].validate.required = (required == "true");
                }
            }
        };
        let maxlengthChange = (maxlength, index) => {
            if (maxlength) {
                let shapes = ShapeEdit.Selected();
                if (shapes.length != 0) {
                    shapes[0].Property().description["field"][index].validate["ng-maxlength"] = Number(maxlength);
                }
            }
        };
        let minlengthChange = (minlength, index) => {
            if (minlength) {
                let shapes = ShapeEdit.Selected();
                if (shapes.length != 0) {
                    shapes[0].Property().description["field"][index].validate["ng-minlength"] = Number(minlength);
                }
            }
        };
        let optionsChange = (options, index) => {
            if (options) {
                let shapes = ShapeEdit.Selected();
                if (shapes.length != 0) {
                    shapes[0].Property().description["field"][index].options = options;
                }
            }
        };
        let onChangeChange = (onChange, index) => {
            if (onChange) {
                let shapes = ShapeEdit.Selected();
                if (shapes.length != 0) {
                    shapes[0].Property().description["field"][index].events = { onChange: onChange };
                }
            }
        };
        let lookupChange = (lookup, index) => {
            if (lookup) {
                let shapes = ShapeEdit.Selected();
                if (shapes.length != 0) {
                    shapes[0].Property().description["field"][index].lookup = lookup;
                }
            }
        };
        let AddText = () => {
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
        let AddBox = () => {
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
        let AddOval = () => {
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
        let AddBezier = () => {
            let obj = {
                rectangle: new ShapeEdit.Rectangle(200, 200, 100, 100),
                property: new ShapeEdit.ShapeProperty(ShapeEdit.Canvas, '', [], '', new ShapeEdit.RGBAColor(0, 0, 0, 1), new ShapeEdit.RGBAColor(0, 0, 0, 1), 1, new ShapeEdit.Font("", "", "", 18, "sans-serif", []), "", "miter", {
                    "category": "",
                    "type": ""
                })
            };
            let context = new ShapeEdit.Bezier(ShapeEdit.Canvas, obj);
            context.bezierCurveTo(310.17, 147.19, 310.17, 97.81, 271.5, 67.35);
            context.bezierCurveTo(232.84, 36.88, 170.16, 36.88, 131.5, 67.35);
            context.bezierCurveTo(92.83, 97.81, 92.83, 147.19, 131.5, 177.65);
            context.bezierCurveTo(170.16, 208.12, 232.84, 208.12, 271.5, 177.65);
            context.ResizeRectangle();
            ShapeEdit.Add(context);
        };
        let AddImage = () => {
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
        let DeleteSelected = () => {
            ShapeEdit.DeleteSelected();
        };
        let SelectedCount = () => {
            return ShapeEdit.SelectedCount();
        };
        ShapeEdit.onTick((shape, context) => {
            return context;
        });
        ShapeEdit.onDraw((shape, context) => {
        });
        ShapeEdit.onNew((shape) => {
            switch (shape.type) {
                case "Text":
                    {
                        shape.Property().description["field"] = {
                            text: {
                                label: "text",
                                type: "text",
                                mode: "static",
                                validate: { required: true, "ng-maxlength": 50, "ng-minlength": 10 },
                                options: [],
                                events: { onChange: "" },
                                lookup: ""
                            },
                            color: {
                                label: "color",
                                type: "color",
                                mode: "static",
                                validate: { required: true, "ng-maxlength": 7, "ng-minlength": 7 },
                                options: [],
                                events: { onChange: "" },
                                lookup: ""
                            }
                        };
                    }
                    break;
                case "Box":
                case "Oval":
                case "Polygon":
                case "Bezier":
                case "Shapes":
                    {
                        shape.Property().description["field"] = {
                            color: {
                                label: "color",
                                type: "color",
                                mode: "static",
                                validate: { required: true, "ng-maxlength": 7, "ng-minlength": 7 },
                                options: [],
                                events: { onChange: "" },
                                lookup: ""
                            }
                        };
                    }
                    break;
                case "ImageRect": {
                    shape.Property().description["field"] = {
                        text: {
                            label: "text",
                            type: "text",
                            mode: "static",
                            validate: { required: true, "ng-maxlength": 50, "ng-minlength": 10 },
                            options: [],
                            events: { onChange: "" },
                            lookup: ""
                        }
                    };
                }
            }
        });
        ShapeEdit.onResizeWindow((wrapper, inner) => {
        });
        ShapeEdit.onSelect((shape, context) => {
            // for inPlace text input
            if (ShapeEdit.SelectedCount() === 1) {
                if (shape.Parent().IsRoot()) {
                    switch (shape.type) {
                        case "Text":
                            $scope.$evalAsync(// $apply
                            function ($scope) {
                                let id = shape.ID();
                                $scope.id = id;
                                $scope.text = shape.Property().text;
                                Select(shape);
                                $scope.SelectType = "Text";
                            });
                            break;
                        case "Box":
                        case "Oval":
                        case "Polygon":
                        case "Bezier":
                        case "Shapes":
                            {
                                $scope.$evalAsync(// $apply
                                function ($scope) {
                                    let id = shape.ID();
                                    $scope.id = id;
                                    Select(shape);
                                    $scope.SelectType = "Shape";
                                });
                            }
                            break;
                        case "ImageRect":
                            {
                                $scope.$evalAsync(// $apply
                                function ($scope) {
                                    let id = shape.ID();
                                    $scope.id = id;
                                    Select(shape);
                                    $scope.SelectType = "Image";
                                });
                            }
                            break;
                        default:
                    }
                }
            }
            else {
                EditClear(); // for inPlace text input
            }
        });
        ShapeEdit.onDelete((shape) => {
            $scope.id = null;
            Deselect();
            $scope.SelectType = "";
            $scope.SelectImage = false;
        });
        ShapeEdit.onDeselect((shape, context) => {
            $scope.$evalAsync(// $apply
            function ($scope) {
                $scope.id = null;
                Deselect();
                $scope.SelectType = "";
                $scope.SelectImage = false;
            });
        });
        ShapeEdit.onMove((shape) => {
            $scope.$evalAsync(// $apply
            function ($scope) {
                let loc = shape.Location();
                $scope.x = loc.x;
                $scope.y = loc.y;
            });
        });
        ShapeEdit.onResize((shape) => {
            $scope.$evalAsync(// $apply
            function ($scope) {
                let size = shape.Size();
                $scope.w = size.w;
                $scope.h = size.h;
            });
        });
        ShapeEdit.onDeformation((shape) => {
            $scope.$evalAsync(// $apply
            function ($scope) {
                let size = shape.Size();
                $scope.w = size.w;
                $scope.h = size.h;
            });
        });
        ShapeEdit.onChange(() => {
        });
        ShapeEdit.onKeydown((shape, e) => {
        });
        ShapeEdit.onDrop((shape, e) => {
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
                    image.onload = (ex) => {
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
                    image.onerror = () => {
                    };
                    image.src = url;
                }
            }
            else {
                let file = e.dataTransfer.files[0];
                let reader = new FileReader();
                reader.onload = ((theFile) => {
                    return (ex) => {
                        let img = new Image();
                        img.crossOrigin = 'Anonymous';
                        img.onload = () => {
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
        $scope.$watch('fills', (color_string) => {
            if (color_string) {
                let color = new ShapeEdit.RGBAColor(0, 0, 0, 1);
                color.SetRGB(color_string);
                ShapeEdit.SetCurrentFillColor(color);
                Font_Display();
            }
        });
        $scope.$watch('strokefills', (color_string) => {
            if (color_string) {
                let color = new ShapeEdit.RGBAColor(0, 0, 0, 0);
                color.SetRGB(color_string);
                ShapeEdit.SetCurrentStrokeColor(color);
                Font_Display();
            }
        });
        $scope.$watch('FontVariant', (FontVariant) => {
            if (FontVariant) {
                ShapeEdit.SetCurrentFontVariant(FontVariant);
                Font_Display();
            }
        });
        $scope.$watch('FontWeight', (fontweight) => {
            if (fontweight) {
                ShapeEdit.SetCurrentFontWeight(fontweight);
                Font_Display();
            }
        });
        $scope.$watch('FontKeyword', (FontKeyword) => {
            if (FontKeyword) {
                ShapeEdit.SetCurrentFontKeyword(FontKeyword);
                Font_Display();
            }
        });
        $scope.$watch('FontFamily', (FontFamily) => {
            if (FontFamily) {
                ShapeEdit.SetCurrentFontFamily([FontFamily]);
                Font_Display();
            }
        });
        Font_Display();
    }]);
FrontControllers.controller('SVGCreateDialogController', ['$scope', '$log', '$uibModalInstance', 'LayoutService', 'ShapeEdit', 'items',
    ($scope, $log, $uibModalInstance, TemplateService, ShapeEdit, items) => {
        $scope.dpi = 800;
        $scope.ratio = 1.414;
        $scope.margintop = 72;
        $scope.marginbottom = 72;
        $scope.marginleft = 72;
        $scope.marginright = 72;
        $scope.layout = "portrait";
        let error_handler = (code, message) => {
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
        $scope.hide = () => {
            $uibModalInstance.close();
        };
        $scope.cancel = () => {
            $uibModalInstance.dismiss();
        };
        $scope.answer = () => {
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
            let cover_letter = {
                "type": "Canvas",
                "shapes": {
                    "type": "Shapes",
                    "locked": "false",
                    "rectangle": {
                        "type": "Size",
                        "location": { "type": "Location", "x": 0, "y": 0, "miter": 0 },
                        "size": { "type": "Size", "w": 0, "h": 0 }
                    },
                    "property": {
                        "type": "ShapeProperty",
                        "text": "",
                        "textwidth": [],
                        "path": "",
                        "fillstyle": { "type": "RGBAColor", "r": 0, "g": 0, "b": 0, "a": 0 },
                        "strokestyle": { "type": "RGBAColor", "r": 0, "g": 0, "b": 0, "a": 0 },
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
            TemplateService.Create($scope.title, content, (result) => {
                TemplateService.current_layout = result;
                TemplateService.format = result.content.format;
                ShapeEdit.Load(result.content.text);
                progress(false);
                $uibModalInstance.close(result);
            }, error_handler);
        };
    }]);
FrontControllers.controller('SVGOpenDialogController', ['$scope', '$log', '$uibModalInstance', '$uibModal', 'items', 'ShapeEdit', 'LayoutService',
    ($scope, $log, $uibModalInstance, $uibModal, items, ShapeEdit, TemplateService) => {
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
        let EditClear = () => {
            _.each(ShapeEdit.Input, function (element, id) {
                ShapeEdit.Wrapper.removeChild(element);
                delete ShapeEdit.Input[id];
            });
        };
        let Count = () => {
            TemplateService.Count((result) => {
                $scope.count = result;
            }, error_handler);
        };
        let Query = () => {
            TemplateService.Query((value) => {
                $scope.layouts = value;
            }, error_handler);
        };
        let Next = () => {
            progress(true);
            TemplateService.Next((result) => {
                if (result) {
                    $scope.layouts = result;
                }
                progress(false);
            }, error_handler);
        };
        let Prev = () => {
            progress(true);
            TemplateService.Prev((result) => {
                if (result) {
                    $scope.layouts = result;
                }
                progress(false);
            }, error_handler);
        };
        let Get = (layout) => {
            progress(true);
            TemplateService.Get(layout._id, (result) => {
                TemplateService.current_layout = result;
                TemplateService.format = result.content.format;
                ShapeEdit.Load(result.content.text);
                //        EditClear();
                progress(false);
                $uibModalInstance.close(result);
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
        $scope.Get = Get;
        $scope.hide = hide;
        $scope.cancel = cancel;
        $scope.LayoutQuery = () => Query;
        Count();
        Query();
    }]);
FrontControllers.controller('SVGSaveAsDialogController', ['$scope', '$log', '$uibModalInstance', 'LayoutService', 'ShapeEdit', 'items',
    ($scope, $log, $uibModalInstance, TemplateService, ShapeEdit, items) => {
        let error_handler = (code, message) => {
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
        $scope.hide = () => {
            $uibModalInstance.close();
        };
        $scope.cancel = () => {
            $uibModalInstance.dismiss();
        };
        $scope.answer = () => {
            //       let short = 525;
            progress(true);
            if (TemplateService.current_layout) {
                progress(true);
                TemplateService.current_layout.content.text = ShapeEdit.Serialize();
                TemplateService.PutAs($scope.title, TemplateService.current_layout, (result) => {
                    progress(false);
                    $uibModalInstance.close({});
                }, error_handler);
            }
        };
    }]);
FrontControllers.controller('SVGDeleteConfirmController', ['$scope', '$uibModalInstance', 'items',
    ($scope, $uibModalInstance, items) => {
        $scope.title = items.content.title;
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
//Member
FrontControllers.controller('MemberController', ['$scope', '$document', '$log', '$uibModal', 'MemberService',
    ($scope, $document, $log, $uibModal, MemberService) => {
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
        let Draw = () => {
            MemberService.Query((result) => {
                if (result) {
                    $scope.accounts = result;
                }
            }, error_handler);
        };
        let Count = () => {
            MemberService.Count((result) => {
                if (result) {
                    $scope.count = result;
                }
            }, error_handler);
        };
        let Next = () => {
            progress(true);
            MemberService.Next((result) => {
                if (result) {
                    $scope.accounts = result;
                }
                progress(false);
            }, error_handler);
        };
        let Prev = () => {
            progress(true);
            MemberService.Prev((result) => {
                if (result) {
                    $scope.accounts = result;
                }
                progress(false);
            }, error_handler);
        };
        let Find = (name) => {
            if (name) {
                MemberService.query = { username: { $regex: name } };
            }
            Draw();
            Count();
        };
        let Open = (acount) => {
            let modalRegist = $uibModal.open({
                controller: 'MemberOpenDialogController',
                templateUrl: '/members/dialogs/open_dialog',
                resolve: {
                    items: acount
                }
            });
            modalRegist.result.then((group) => {
                $scope.layout = group;
                $scope.name = group.name;
                $scope.opened = true;
            }, () => {
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
    ($scope, $uibModalInstance, items) => {
        $scope.items = items;
        $scope.hide = () => {
            $uibModalInstance.close();
        };
        $scope.cancel = () => {
            $uibModalInstance.dismiss();
        };
    }]);
FrontControllers.controller('UserSettingController', ['$scope', '$q', '$document', '$uibModal', '$log', 'DataService',
    ($scope, $q, $document, $uibModal, $log, DataService) => {
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
        $scope.UploadBackup = (file) => {
            progress(true);
            let fileReader = new FileReader();
            fileReader.onload = (event) => {
                DataService.Upload(event.target.result, file[0].name, (result) => {
                }, (code, message) => {
                });
            };
            fileReader.readAsDataURL(file[0].file);
        };
    }]);
//# sourceMappingURL=front_controllers.js.map