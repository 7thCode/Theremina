/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
/**
 0 - ok
 1 - rights
 2 - auth
 3 - user already found
 10 - db
 20 - session
 100 - auth

 Init
 Accepted
 Done

 */
"use strict";
var ImageControllers = angular.module('ImageControllers', ["ngResource", 'ngMessages', 'flow']);
/*! Controllers  */
ImageControllers.controller('ImageController', ['$scope', '$q', '$document', '$uibModal', '$log', 'FileService',
    function ($scope, $q, $document, $uibModal, $log, FileService) {
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
        /*
                let to_mime: (filename: string) => string = (filename: string): string => {
                    let mime: string = "";
                    let nameparts: string[] = filename.split(".");
                    if (nameparts.length == 2) {
                        let filetype = nameparts[1].toLowerCase();
                        switch (filetype) {
                            case "txt":
                                mime = "text/plain";
                                break;
                            case "htm":
                            case "html":
                                mime = "text/html";
                                break;
                            case "xml":
                                mime = "text/xml";
                                break;
                            case "js":
                                mime = "text/javascript";
                                break;
                            case "vbs":
                                mime = "text/vbscript";
                                break;
                            case "css":
                                mime = "text/css";
                                break;
                            case "gif":
                                mime = "image/gif";
                                break;
                            case "jpg":
                            case "jpeg":
                                mime = "image/jpeg";
                                break;
                            case "png":
                                mime = "image/png";
                                break;
                            case "doc":
                                mime = "application/msword";
                                break;
                            case "pdf":
                                mime = "application/pdf";
                                break;
                        }
                    }
                    return mime;
                };
        */
        var Type = function (mimetype) {
            var result = "";
            var nameparts = mimetype.split("/");
            if (nameparts.length == 2) {
                result = nameparts[0].toLowerCase();
            }
            return result;
        };
        var Draw = function () {
            FileService.Query(function (result) {
                if (result) {
                    $scope.files = result;
                }
                FileService.Over(function (hasnext) { $scope.over = !hasnext; });
                FileService.Under(function (hasprev) { $scope.under = !hasprev; });
            }, error_handler);
        };
        var Count = function () {
            FileService.Count(function (result) {
                if (result) {
                    $scope.count = result;
                }
            }, error_handler);
        };
        var Next = function () {
            progress(true);
            FileService.Next(function (result) {
                if (result) {
                    $scope.files = result;
                }
                FileService.Over(function (hasnext) { $scope.over = !hasnext; });
                FileService.Under(function (hasprev) { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        var Prev = function () {
            progress(true);
            FileService.Prev(function (result) {
                if (result) {
                    $scope.files = result;
                }
                FileService.Over(function (hasnext) { $scope.over = !hasnext; });
                FileService.Under(function (hasprev) { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        var createImage = function (files) {
            progress(true);
            var promises = [];
            _.forEach(files, function (local_file) {
                var deferred = $q.defer();
                var fileReader = new FileReader();
                fileReader.onload = function (event) {
                    FileService.Create(event.target.result, local_file.name, 1000, function (result) {
                        deferred.resolve(true);
                    }, function (code, message) {
                        deferred.reject(false);
                    });
                };
                fileReader.readAsDataURL(local_file.file);
                promises.push(deferred.promise);
            });
            $q.all(promises).then(function (result) {
                progress(false);
                files.forEach(function (file) {
                    file.cancel();
                });
                Draw();
            }).finally(function () {
            });
        };
        var showImage = function (url) {
            var modalInstance = $uibModal.open({
                controller: 'ImageShowDialogController',
                templateUrl: '/images/dialogs/image_show_dialog',
                resolve: {
                    items: function () {
                        return url;
                    }
                }
            });
            modalInstance.result.then(function (answer) {
            }, function () {
            });
        };
        var deleteImage = function (filename) {
            var modalInstance = $uibModal.open({
                controller: 'FileDeleteDialogController',
                templateUrl: '/files/dialogs/file_delete_dialog',
            });
            modalInstance.result.then(function (answer) {
                FileService.Delete(filename, 1000, function (result) {
                    Draw();
                }, error_handler);
            }, function () {
            });
        };
        FileService.query = { "metadata.key": { $gte: 1000 } };
        var Find = function (name) {
            if (!name) {
                name = "";
            }
            FileService.query = { $and: [{ "metadata.key": { $gte: 1000 } }, { filename: { $regex: name } }] };
            Draw();
        };
        $scope.Type = Type;
        $scope.Next = Next;
        $scope.Prev = Prev;
        $scope.createImage = createImage;
        $scope.showImage = showImage;
        $scope.deleteImage = deleteImage;
        $scope.Find = Find;
        Draw();
    }]);
ImageControllers.controller('ImageShowDialogController', ['$scope', '$uibModalInstance', 'items',
    function ($scope, $uibModalInstance, items) {
        $scope.image = items;
        $scope.hide = function () {
            $uibModalInstance.close();
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
        $scope.answer = function (answer) {
            $uibModalInstance.close($scope);
        };
    }]);
ImageControllers.controller('ImageDeleteDialogController', ['$scope', '$uibModalInstance',
    function ($scope, $uibModalInstance) {
        $scope.hide = function () {
            $uibModalInstance.close();
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
        $scope.answer = function (answer) {
            $uibModalInstance.close($scope);
        };
    }]);
//# sourceMappingURL=image_controllers.js.map