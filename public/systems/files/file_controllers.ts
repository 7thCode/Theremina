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

namespace FileControllersModule {

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

    let FileControllers: angular.IModule = angular.module('FileControllers', ["ngResource", 'ngMessages', 'ngAnimate', 'flow']);

    /*! Controllers  */

    FileControllers.controller('FileController', ['$scope', '$uibModal', '$q', '$document', '$log', 'CollectionService', 'FileService',
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

            let createFile = (files: any): void => {
                progress(true);
                let promises:any[] = [];
                _.forEach(files, (local_file) => {
                    let deferred:any = $q.defer();
                    let fileReader: any = new FileReader();
                    fileReader.onload = (event: any): void => {
                        FileService.Create(event.target.result, local_file.name, 0, (result: any) => {
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
                });
            };

            let deleteFile = (filename: any): void => {

                let modalInstance = $uibModal.open({
                    controller: 'FileDeleteDialogController',
                    templateUrl: '/files/dialogs/file_delete_dialog',
                });

                modalInstance.result.then((answer: any): void => { // Answer
                    FileService.Delete(filename, 0, (result: any) => {
                        $scope.files = [];
                        Draw();
                    }, error_handler);
                }, (): void => { // Error
                });
            };

            let Find = (name: string): void => {
                if (!name) {
                    name = "";
                }
                FileService.query = {filename: {$regex: name}};
                Draw();
            };

            let Upload = (files: any): void => {
                progress(true);
                let fileReader: any = new FileReader();
                fileReader.onload = (event: any): void => {
                    FileService.Upload(event.target.result, files[0].name, (result: any) => {
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
}