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
let FileControllers = angular.module('FileControllers', ["ngResource", 'ngMessages', 'ngAnimate', 'flow']);
/*! Controllers  */
FileControllers.controller('FileController', ['$scope', '$uibModal', '$q', '$document', '$log', 'CollectionService', 'FileService',
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
                FileService.Over((hasnext) => { $scope.over = !hasnext; });
                FileService.Under((hasprev) => { $scope.under = !hasprev; });
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
                FileService.Over((hasnext) => { $scope.over = !hasnext; });
                FileService.Under((hasprev) => { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        let Prev = () => {
            progress(true);
            FileService.Prev((result) => {
                if (result) {
                    $scope.files = result;
                }
                FileService.Over((hasnext) => { $scope.over = !hasnext; });
                FileService.Under((hasprev) => { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        let createFile = (files) => {
            progress(true);
            let promises = [];
            _.forEach(files, (local_file) => {
                let deferred = $q.defer();
                let fileReader = new FileReader();
                fileReader.onload = (event) => {
                    FileService.Create(event.target.result, local_file.name, 0, (result) => {
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
        let deleteFile = (filename) => {
            let modalInstance = $uibModal.open({
                controller: 'FileDeleteDialogController',
                templateUrl: '/files/dialogs/file_delete_dialog',
            });
            modalInstance.result.then((answer) => {
                FileService.Delete(filename, 0, (result) => {
                    $scope.files = [];
                    Draw();
                }, error_handler);
            }, () => {
            });
        };
        let Find = (name) => {
            if (!name) {
                name = "";
            }
            FileService.query = { filename: { $regex: name } };
            Draw();
        };
        let Upload = (files) => {
            progress(true);
            let fileReader = new FileReader();
            fileReader.onload = (event) => {
                FileService.Upload(event.target.result, files[0].name, (result) => {
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
//# sourceMappingURL=file_controllers.js.map