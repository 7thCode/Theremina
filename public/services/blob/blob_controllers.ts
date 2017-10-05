/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

let BlobControllers: angular.IModule = angular.module('BlobControllers', ['ui.bootstrap', 'ngAnimate', 'flow', 'ui.ace']);

//blob

//  4000 < key < 5999

BlobControllers.controller('BlobController', ['$scope', '$uibModal', '$q', '$document', '$log', 'CollectionService', 'FileService',
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

BlobControllers.controller('BlobDeleteDialogController', ['$scope', '$uibModalInstance',
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

/*! Controllers  */