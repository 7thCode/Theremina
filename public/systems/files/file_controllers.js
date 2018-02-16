/**!
 Copyright (c) 2016 7thCode.(https://seventh-code.com/)
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
var FileControllersModule;
(function (FileControllersModule) {
    var FileControllers = angular.module('FileControllers', ["ngResource", 'ngMessages', 'ngAnimate', 'flow']);
    /*! Controllers  */
    FileControllers.controller('FileController', ['$scope', '$uibModal', '$q', '$document', '$log', 'CollectionService', 'FileService',
        function ($scope, $uibModal, $q, $document, $log, CollectionService, FileService) {
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
                    FileService.Over(function (hasnext) {
                        $scope.over = !hasnext;
                    });
                    FileService.Under(function (hasprev) {
                        $scope.under = !hasprev;
                    });
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
                    FileService.Over(function (hasnext) {
                        $scope.over = !hasnext;
                    });
                    FileService.Under(function (hasprev) {
                        $scope.under = !hasprev;
                    });
                    progress(false);
                }, error_handler);
            };
            var Prev = function () {
                progress(true);
                FileService.Prev(function (result) {
                    if (result) {
                        $scope.files = result;
                    }
                    FileService.Over(function (hasnext) {
                        $scope.over = !hasnext;
                    });
                    FileService.Under(function (hasprev) {
                        $scope.under = !hasprev;
                    });
                    progress(false);
                }, error_handler);
            };
            var createFile = function (files) {
                progress(true);
                var promises = [];
                _.forEach(files, function (local_file) {
                    var deferred = $q.defer();
                    var fileReader = new FileReader();
                    fileReader.onload = function (event) {
                        FileService.Create(event.target.result, local_file.name, 0, function (result) {
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
                });
            };
            var deleteFile = function (filename) {
                var modalInstance = $uibModal.open({
                    controller: 'FileDeleteDialogController',
                    templateUrl: '/files/dialogs/file_delete_dialog',
                });
                modalInstance.result.then(function (answer) {
                    FileService.Delete(filename, 0, function (result) {
                        $scope.files = [];
                        Draw();
                    }, error_handler);
                }, function () {
                });
            };
            var Find = function (name) {
                if (!name) {
                    name = "";
                }
                FileService.query = { filename: { $regex: name } };
                Draw();
            };
            var Upload = function (files) {
                progress(true);
                var fileReader = new FileReader();
                fileReader.onload = function (event) {
                    FileService.Upload(event.target.result, files[0].name, function (result) {
                        progress(false);
                    }, error_handler);
                };
                fileReader.readAsDataURL(files[0].file);
            };
            $scope.Type = Type;
            $scope.Count = Count;
            $scope.Next = Next;
            $scope.Prev = Prev;
            $scope.createFile = createFile;
            $scope.deleteFile = deleteFile;
            $scope.Find = Find;
            $scope.Upload = Upload;
            Draw();
        }]);
    /*! Dialogs  */
    FileControllers.controller('FileDeleteDialogController', ['$scope', '$uibModalInstance',
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
})(FileControllersModule || (FileControllersModule = {}));
//# sourceMappingURL=file_controllers.js.map