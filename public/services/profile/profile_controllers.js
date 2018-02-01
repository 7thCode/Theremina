/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var ProfileControllersModule;
(function (ProfileControllersModule) {
    var ProfileControllers = angular.module('ProfileControllers', ['ui.bootstrap', 'flow']);
    //Self
    ProfileControllers.controller('ProfileController', ['$scope', '$document', '$log', "$uibModal", "ProfileService", 'SessionService', 'FileService',
        function ($scope, $document, $log, $uibModal, ProfileService, SessionService, FileService) {
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
            $document.on('drop dragover', function (e) {
                e.stopPropagation();
                e.preventDefault();
            });
            $scope.opened = false;
            $scope.Save = function () {
                ProfileService.Put({}, function (result) {
                }, error_handler);
            };
            $scope.CreateProfilePicture = function (files) {
                progress(true);
                var local_file = files[0];
                var fileReader = new FileReader();
                var image = new Image();
                image.crossOrigin = 'Anonymous';
                $scope.userid = ""; // $scope trick for redraw
                fileReader.onload = function (event) {
                    var uri = event.target.result;
                    image.src = uri;
                    image.onload = function () {
                        ProfileService.Get(function (self) {
                            if (self) {
                                FileService.Delete(self.username, 1999, function (result) {
                                    FileService.Create(event.target.result, self.username, 1999, function (result) {
                                        ProfileService.Get(function (self) {
                                            if (self) {
                                                $scope.$evalAsync(// $apply
                                                function ($scope) {
                                                    $scope.userid = self.userid; // $scope trick for redraw
                                                    progress(false);
                                                });
                                            }
                                        }, error_handler);
                                    }, error_handler);
                                }, FileService.Create(event.target.result, self.username, 1999, function (result) {
                                    ProfileService.Get(function (self) {
                                        if (self) {
                                            $scope.$evalAsync(// $apply
                                            function ($scope) {
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
            ProfileService.Get(function (self) {
                if (self) {
                    $scope.userid = self.userid;
                    $scope.provider = self.provider;
                    $scope.type = self.type;
                    $scope.username = self.username;
                    $scope.opened = true;
                }
            }, error_handler);
            // Guidance
            /*
             let session_data: any = {guidance: {self: {step: 0}}};

             $scope.next = (): void => {
             $scope.step++;
             session_data.guidance.self.step = $scope.step;
             SessionService.Put(session_data, (data: any): void => {
             if (data) {
             session_data = data;
             }
             }, error_handler);
             };

             $scope.prev = (): void => {
             $scope.step--;
             session_data.guidance.self.step = $scope.step;
             SessionService.Put(session_data, (data: any): void => {
             if (data) {
             session_data = data;
             }
             }, error_handler);
             };

             $scope.to = (step: number): void => {
             $scope.step = step;
             session_data.guidance.self.step = $scope.step;
             SessionService.Put(session_data, (data: any): void => {
             if (data) {
             session_data = data;
             }
             }, error_handler);
             };

             SessionService.Get((data: any): void => {
             if (data) {
             session_data = data;
             if (!session_data.guidance.self) {
             session_data.guidance = {self: {step: 0}};
             }
             $scope.step = session_data.guidance.self.step;
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
             */
        }]);
    ProfileControllers.controller('ProfileUpdateDialogController', ['$scope', '$uibModalInstance', 'items', 'ZipService',
        function ($scope, $uibModalInstance, items, ZipService) {
            var progress = function (value) {
                $scope.$emit('progress', value);
            };
            $scope.$on('progress', function (event, value) {
                $scope.progress = value;
            });
            $scope.magazine = true;
            $scope.Zip = function (zip) {
                if (zip) {
                    if (zip.length > 6) {
                        progress(true);
                        ZipService.Zip(zip, function (error, result) {
                            if (!error) {
                                if (result) {
                                    if (result.results) {
                                        if (result.results.length > 0) {
                                            var address = result.results[0];
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
})(ProfileControllersModule || (ProfileControllersModule = {}));
//# sourceMappingURL=profile_controllers.js.map