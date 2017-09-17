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
let ImageControllers = angular.module('ImageControllers', ["ngResource", 'ngMessages', 'flow']);
/*! Controllers  */
ImageControllers.controller('ImageController', ['$scope', '$q', '$document', '$uibModal', '$log', 'FileService',
    ($scope, $q, $document, $uibModal, $log, FileService) => {
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
        let createImage = (files) => {
            progress(true);
            let promises = [];
            _.forEach(files, (local_file) => {
                let deferred = $q.defer();
                let fileReader = new FileReader();
                fileReader.onload = (event) => {
                    FileService.Create(event.target.result, local_file.name, 1000, (result) => {
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
        let showImage = (url) => {
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
        let deleteImage = (filename) => {
            let modalInstance = $uibModal.open({
                controller: 'FileDeleteDialogController',
                templateUrl: '/files/dialogs/file_delete_dialog',
            });
            modalInstance.result.then((answer) => {
                FileService.Delete(filename, 1000, (result) => {
                    Draw();
                }, error_handler);
            }, () => {
            });
        };
        FileService.query = { "metadata.key": { $gte: 1000 } };
        let Find = (name) => {
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
    ($scope, $uibModalInstance, items) => {
        $scope.image = items;
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
ImageControllers.controller('ImageDeleteDialogController', ['$scope', '$uibModalInstance',
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
//# sourceMappingURL=image_controllers.js.map