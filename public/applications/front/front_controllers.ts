/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

let FrontControllers: angular.IModule = angular.module('FrontControllers', ['ui.bootstrap', 'ngAnimate', 'flow', 'ui.ace']);

FrontControllers.controller('EventController', ['$scope',
    ($scope: any): void => {

        //    $scope.$on('change_controller', (event, value) => {
        //        $scope.controller_name = value;
        //    });

    }]);

FrontControllers.controller('FrontController', ['$scope','$rootScope', '$log', '$compile', '$uibModal', 'ProfileService',
    ($scope: any,$rootScope:any, $log: any, $compile: any, $uibModal: any, ProfileService: any): void => {

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

        $scope.BuildSite = (): void => {

            let modalRegist: any = $uibModal.open({
                controller: 'BuildSiteDialogController',
                templateUrl: '/front/dialogs/build_site_dialog',
                resolve: {
                    items: $scope
                }
            });

            modalRegist.result.then((resource: any): void => {
                $rootScope.$emit('change_files', {});
                //  Query();
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

/*
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
+/
        /*
        $scope.Notify = (message: any): void => {
            Socket.emit("server", {value: message}, (): void => {
                let hoge = 1;
            });
        };

        Socket.on("client", (data: any): void => {
            let notifier = new NotifierModule.Notifier();
            notifier.Pass(data);
        });
*/

    }]);

FrontControllers.controller('UserSettingController', ['$scope','$rootScope', '$q', '$document', '$uibModal', '$log', 'ProfileService',"SessionService", 'DataService',
    ($scope: any,$rootScope:any, $q: any, $document: any, $uibModal: any, $log: any, ProfileService,SessionService, DataService: any): void => {

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

        //$rootScope.$on('get_namespaces', (event, value): void => {
            //         $scope.namespaces = value;
        //});

        $rootScope.$on('change_namespace', (event, value): void => {
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

FrontControllers.controller('BuildSiteDialogController', ['$scope', '$log', '$uibModalInstance', 'SiteService', 'items',
    ($scope: any, $log: any, $uibModalInstance: any, SiteService: any, items: any): void => {

        let file = items.file;
        let target = items.target;
        let parent_scope = items;

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

        $scope.answer = (name): void => {
            progress(true);
            let namespace = $scope.namespace;
            SiteService.Build(name, namespace, (result: any): void => {
                progress(false);
                $scope.message = "";
                $uibModalInstance.close(result);
            }, error_handler);
        };

    }]);


/*! Controllers  */

//FrontControllers.controller('SelfController', ['$scope', '$log', "$uibModal", "ProfileService", 'SessionService', 'ZipService',
//    ($scope: any, $log: any, $uibModal: any, ProfileService: any, SessionService: any, ZipService: any): void => {
//
//        let progress = (value) => {
//            $scope.$emit('progress', value);
//        };
//
//        $scope.$on('progress', (event, value) => {
//            $scope.progress = value;
//        });
//
//        let error_handler: (code: number, message: string) => void = (code: number, message: string): void => {
//            progress(false);
//            $scope.message = message;
//            $log.error(message);
//            alert(message);
//        };
//
//        let alert = (message): void => {
//            let modalInstance: any = $uibModal.open({
//                controller: 'AlertDialogController',
//                templateUrl: '/common/dialogs/alert_dialog',
//                resolve: {
//                    items: (): any => {
//                        return message;
//                    }
//                }
//            });
//            modalInstance.result.then((answer: any): void => {
//            }, (): void => {
//            });
//        };
//
//        $scope.opened = false;
//
//        $scope.Zip = (zip) => {
//            if (zip) {
//                if (zip.length > 6) {
//                    progress(true);
//                    ZipService.Zip(zip, (error: any, result: any): void => {
//                        if (!error) {
//                            if (result) {
//                                if (result.results) {
//                                    if (result.results.length > 0) {
//                                        let address = result.results[0];
//                                        $scope.address = address.address1;
//                                        $scope.city = address.address2;
//                                        $scope.street = address.address3;
//                                    }
//                                }
//                            }
//                        }
//                        progress(false);
//                    });
//                } else {
//                    $scope.address = "";
//                    $scope.city = "";
//                    $scope.street = "";
//                }
//            }
//        };
//
//        ProfileService.Get((self: any): void => {
//            if (self) {
//                $scope.provider = self.provider;
//                $scope.type = self.type;
//                $scope.username = self.username;
//                $scope.nickname = self.local.nickname;
//                $scope.address = self.local.address;
//                $scope.city = self.local.city;
//                $scope.street = self.local.street;
//                $scope.category = self.local.category;
//                $scope.group = self.local.group;
//                $scope.zip = self.local.zip;
//                $scope.mails = self.local.mails;
//                //         $scope.magazine = self.local.magazine.send;
//                $scope.opened = true;
//            }
//        }, error_handler);
//
//        $scope.Save = (): void => {
//            let mails = [];
//            if ($scope.mails) {
//                mails = $scope.mails;
//            }
//            ProfileService.Put({
//                nickname: $scope.nickname,
//                address: $scope.address,
//                city: $scope.city,
//                street: $scope.street,
//                category: $scope.category,
//                group: $scope.group,
//                zip: $scope.zip,
//                mails: mails,
//                magazine: {send: $scope.magazine}
//            }, (result: any): void => {
//
//            }, error_handler);
//
//            let modalRegist: any = $uibModal.open({
//                controller: 'SelfSaveDoneController',
//                templateUrl: '/self/dialogs/save_done_dialog',
//                resolve: {
//                    items: (): any => {
//                    }
//                }
//            });
//
//            modalRegist.result.then((content: any): void => {
//            }, (): void => {
//            });
//
//        };
//
//        // Guidance
//
//        $scope.next = (): void => {
//            $scope.step++;
//            SessionService.Put({guidance: {self: {step: $scope.step}}}, (data: any): void => {
//            }, error_handler);
//        };
//
//        $scope.prev = (): void => {
//            $scope.step--;
//            SessionService.Put({guidance: {self: {step: $scope.step}}}, (data: any): void => {
//            }, error_handler);
//        };
//
//        $scope.to = (step: number): void => {
//            $scope.step = step;
//            SessionService.Put({guidance: {self: {step: $scope.step}}}, (data: any): void => {
//            }, error_handler);
//        };
//
//        SessionService.Get((session: any): void => {
//            if (session) {
//                $scope.step = 0;
//                let data = session.data;
//                if (data) {
//                    let guidance = data.guidance;
//                    if (guidance) {
//                        let self = guidance.self;
//                        if (self) {
//                            $scope.step = self.step;
//                        }
//                    }
//                }
//            }
//        }, error_handler);
///*
//        $scope.scenario = [
//            {
//                outer: {
//                    top: -210, left: 80, width: 400, height: 400,
//                    background: "/applications/img/balloon/right.svg",
//                    target: "profile"
//                },
//                inner: {
//                    top: 0, left: 100, width: 300, height: 350,
//                    content: "<h3>プロファイル画像</h3>" +
//                    "<br>" +
//                    "<p>プロファイル画像をドロップしてください</p>" +
//                    "<button class='btn btn-warning' type='button' ng-click='next();' aria-label=''>次へ</button>"
//                },
//                _class: "tada",
//                style: "animation-duration:1s;animation-delay:0.3s;"
//            },
//            {
//                outer: {
//                    top: -250, left: 360, width: 500, height: 500,
//                    background: "/applications/img/balloon/right.svg",
//                    target: "nickname"
//                },
//                inner: {
//                    top: 50, left: 150, width: 300, height: 300,
//                    content: "<h3>ニックネーム</h3>" +
//                    "<br>" +
//                    "<p>ニックネームを入力してください</p>" +
//                    "<button class='btn btn-info' type='button' ng-click='next();' aria-label=''>次へ</button>"
//                },
//                _class: "shake",
//                style: "animation-duration:1s;animation-delay:0.3s;"
//            },
//            {
//                outer: {
//                    top: -120, left: -470, width: 500, height: 500,
//                    background: "/applications/img/balloon/left.svg",
//                    target: "address"
//                },
//                inner: {
//                    top: 30, left: 0, width: 300, height: 300,
//                    content: "<h3>アドレス</h3>" +
//                    "<br>" +
//                    "<p class='text-center'>アドレスを入力してください</p>" +
//                    "<img class='img-responsive center-block' src='http://localhost:8000/files/api/000000000000000000000000/profile'/>" +
//                    "<div class='text-center'>" +
//                    "<button class='btn btn-success' style='margin:5px' type='button' ng-click='next();' aria-label=''>次へ</button>" +
//                    "</div>"
//                },
//                _class: "zoomIn",
//                style: "animation-duration:1s;"
//            },
//            {
//                outer: {
//                    top: 40, left: 30, width: 400, height: 400,
//                    background: "/applications/img/balloon/bottom.svg",
//                    target: "category"
//                },
//                inner: {
//                    top: 100, left: 10, width: 300, height: 300,
//                    content: "<h3>カテゴリー</h3>" +
//                    "<br>" +
//                    "<p class='text-center'>カテゴリーを入力してください</p>" +
//                    "<button class='btn btn-warning' type='button' ng-click='next()', aria-label=''>次へ</button>"
//                },
//                _class: "jello",
//                style: "animation-duration:1s;"
//            },
//            {
//                outer: {
//                    top: -400, left: -160, width: 400, height: 400,
//                    background: "/applications/img/balloon/top.svg",
//                    target: "group"
//                },
//                inner: {
//                    top: 20, left: 20, width: 300, height: 300,
//                    content: "<h3>グループ</h3>" +
//                    "<br>" +
//                    "<p class='text-center'>グループを入力してください</p>" +
//                    "<button class='btn btn-warning' type='button' ng-click='next();' aria-label=''>次へ</button>"
//                },
//                _class: "rubberBand",
//                style: "animation-duration:1s;"
//            },
//            {
//                outer: {
//                    top: 10, left: 100, width: 500, height: 500,
//                    background: "/applications/img/balloon/bottom.svg",
//                    target: "mails"
//                },
//                inner: {
//                    top: 150, left: 20, width: 300, height: 300,
//                    content: "<h3>メール</h3>" +
//                    "<br>" +
//                    "<p class='text-center'>メールを入力してください</p>" +
//                    "<button class='btn btn-primary' type='button' ng-click='next();' aria-label=''>次へ</button>"
//                },
//                _class: "shake",
//                style: "animation-duration:1s;"
//            },
//            {
//                outer: {
//                    top: -170, left: 115, width: 400, height: 400,
//                    background: "/applications/img/balloon/right.svg",
//                    target: "save"
//                },
//                inner: {
//                    top: 10, left: 160, width: 300, height: 300,
//                    content: "<h3>保存</h3>" +
//                    "<br>" +
//                    "<button class='btn btn-danger' type='button' ng-click='to(-1);' aria-label=''>おわり</button>"
//                },
//                _class: "bounceInDown",
//                style: "animation-duration:2s;"
//            }
//        ];
//*/
//    }]);
//
//FrontControllers.controller('SelfSaveDoneController', ['$scope', '$uibModalInstance',
//    ($scope: any, $uibModalInstance: any): void => {
//
//        $scope.hide = (): void => {
//            $uibModalInstance.close();
//        };
//
//        $scope.cancel = (): void => {
//            $uibModalInstance.dismiss();
//        };
//
//        $scope.answer = (): void => {
//            $uibModalInstance.close($scope);
//        };
//
//    }]);
//
//FrontControllers.controller('SelfUpdateDialogController', ['$scope', '$uibModalInstance', 'items', 'ZipService',
//    ($scope: any, $uibModalInstance: any, items: any, ZipService: any): void => {
//
//        $scope.magazine = true;
//
//        let progress = (value) => {
//            $scope.$emit('progress', value);
//        };
//
//        $scope.$on('progress', (event, value) => {
//            $scope.progress = value;
//        });
//
//        $scope.Zip = (zip) => {
//            if (zip) {
//                if (zip.length > 6) {
//                    progress(true);
//                    ZipService.Zip(zip, (error: any, result: any): void => {
//                        if (!error) {
//                            if (result) {
//                                if (result.results) {
//                                    if (result.results.length > 0) {
//                                        let address = result.results[0];
//                                        $scope.address = address.address1;
//                                        $scope.city = address.address2;
//                                        $scope.street = address.address3;
//                                    }
//                                }
//                            }
//                        }
//                        progress(false);
//                    });
//                } else {
//                    $scope.address = "";
//                    $scope.city = "";
//                    $scope.street = "";
//                }
//            }
//        };
//
//        $scope.hide = (): void => {
//            $uibModalInstance.close();
//        };
//
//        $scope.cancel = (): void => {
//            $uibModalInstance.dismiss();
//        };
//
//        $scope.answer = (): void => {
//            $uibModalInstance.close($scope);
//        };
//
//    }]);
//