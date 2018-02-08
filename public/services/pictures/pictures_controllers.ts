/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace PicturesControllersModule {

    let PicturesControllers: angular.IModule = angular.module('PicturesControllers', ['ui.bootstrap', 'ngAnimate', 'flow', 'ui.ace']);

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

    PicturesControllers.controller('PictureController', ['$scope', '$rootScope', '$q', '$document', '$uibModal', '$log', 'ProfileService', 'SessionService', 'FileService', 'ImageService',
        ($scope: any, $rootScope: any, $q: any, $document: any, $uibModal: any, $log: any, ProfileService: any, SessionService: any, FileService: any, ImageService: any): void => {

            FileService.option = {limit: 30, skip: 0};

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

            let createPicture = (files: any): void => {
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
                                case "image/png":
                                    let modalInstance: any = $uibModal.open({
                                        controller: 'PictureResizeDialogController',
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

                    fileReader.onerror = (event: any): void => {
                        deferred.reject(false);
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

            let editPicture = (filename: string): void => {

                FileService.Get(filename, (result: any) => {

                    ImageService.DecodeImage(result, (image: any, type: string): void => {
                        switch (type) {
                            case "image/jpeg":
                            case "image/jpg":
                            case "image/png":
                                let modalInstance: any = $uibModal.open({
                                    controller: 'PictureResizeDialogController',
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

            let showPicture = (url: any): void => {
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

            let deletePicture = (filename: any): void => {

                let modalInstance = $uibModal.open({
                    controller: 'PictureDeleteDialogController',
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

                fileReader.onerror = (event: any): void => {
                };

                fileReader.readAsDataURL(local_file.file);
            };

            let Find = (name: string): void => {
                if (!name) {
                    name = "";
                }
                FileService.SetQuery({$and: [{filename: {$regex: name}}, {"metadata.type": {$regex: "image/"}}]}, 2000);
                Draw();
            };

            FileService.SetQuery({"metadata.type": {$regex: "image/"}}, 2000);

            ProfileService.Get((self: any): void => {
                if (self) {
                    $scope.userid = self.userid;
                }
            }, error_handler);

            $rootScope.$on('change_namespace', (event, value): void => {
                $scope.namespace = value;
                Draw();
            });

            $scope.createProfile = CreateProfile;
            $scope.Type = Type;
            $scope.Next = Next;
            $scope.Prev = Prev;
            $scope.createPicture = createPicture;
            $scope.editPicture = editPicture;
            $scope.showPicture = showPicture;
            $scope.deletePicture = deletePicture;
            $scope.Find = Find;

            // Guidance
            /*
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
                    */

        }]);

    PicturesControllers.controller('PicturePalleteController', ['$scope', '$rootScope', '$q', '$document', '$uibModal', '$log', 'ProfileService', 'SessionService', 'FileService', 'ImageService',
        ($scope: any, $rootScope: any, $q: any, $document: any, $uibModal: any, $log: any, ProfileService: any, SessionService: any, FileService: any, ImageService: any): void => {

            FileService.option = {limit: 12, skip: 0};

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

            let createPicture = (files: any): void => {
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
                                case "image/png":
                                    let modalInstance: any = $uibModal.open({
                                        controller: 'PictureResizeDialogController',
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

                    fileReader.onerror = (event: any): void => {
                        deferred.reject(false);
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

            let editPicture = (filename: string): void => {

                FileService.Get(filename, (result: any) => {

                    ImageService.DecodeImage(result, (image: any, type: string): void => {
                        switch (type) {
                            case "image/jpeg":
                            case "image/jpg":
                            case "image/png":
                                let modalInstance: any = $uibModal.open({
                                    controller: 'PictureResizeDialogController',
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

            let showPicture = (url: any): void => {
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

            let deletePicture = (filename: any): void => {

                let modalInstance = $uibModal.open({
                    controller: 'PictureDeleteDialogController',
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

                fileReader.onerror = (event: any): void => {
                };

                fileReader.readAsDataURL(local_file.file);
            };

            let Find = (name: string): void => {
                if (!name) {
                    name = "";
                }
                FileService.SetQuery({$and: [{filename: {$regex: name}}, {"metadata.type": {$regex: "image/"}}]}, 2000);
                Draw();
            };

            FileService.SetQuery({"metadata.type": {$regex: "image/"}}, 2000);

            ProfileService.Get((self: any): void => {
                if (self) {
                    $scope.userid = self.userid;
                }
            }, error_handler);

            $rootScope.$on('change_namespace', (event, value): void => {
                $scope.namespace = value;
                Draw();
            });

            $scope.createProfile = CreateProfile;
            $scope.Type = Type;
            $scope.Next = Next;
            $scope.Prev = Prev;
            $scope.createPicture = createPicture;
            $scope.editPicture = editPicture;
            $scope.showPicture = showPicture;
            $scope.deletePicture = deletePicture;
            $scope.Find = Find;

            // Guidance
            /*
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
                    */

        }]);

    PicturesControllers.controller('PictureDeleteDialogController', ['$scope', '$uibModalInstance',
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

    PicturesControllers.controller('PictureResizeDialogController', ['$scope', '$log', '$uibModalInstance', 'items', 'ImageService', 'SessionService', '$timeout', 'Cropper',
        ($scope: any, $log: any, $uibModalInstance: any, items: any, ImageService: any, SessionService: any, $timeout: any, Cropper: any): void => {

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
            };

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
                    progress(false);
                });
            };

            $scope.Rotate = (n: number) => {
                progress(true);
                index += 1;
                current_size.orientation = orientations[Math.abs(index % 4)];
                SetOrientation();
                Deformation(() => {
                    progress(false);
                });
            };

            $scope.hide = (): void => {
                $uibModalInstance.close();
            };

            $scope.cancel = (): void => {
                $uibModalInstance.dismiss();
            };

            $scope.answer = (answer: any): void => {
                SetNamespace(() => {
                    $uibModalInstance.close(result);
                });
            };

            let GetNamespace = (callback: () => void): void => {
                SessionService.Get((session: any): void => {
                    if (session) {
                        let data = session.data;
                        if (data) {
                            $scope.namespace = data.namespace;
                            callback();
                        }
                    }
                }, error_handler);
            };

            let SetNamespace = (callback: () => void): void => {
                SessionService.Get((session: any): void => {
                    if (session) {
                        let data = {namespace: $scope.namespace};
                        SessionService.Put(data, (result: any) => {
                            callback();
                        }, error_handler);
                    }
                }, error_handler);
            };

            GetNamespace(() => {
            });

///////////////////////
            /*
                        let data: any = null;

                        $scope.options = {
                            viewMode: 3,
                            aspectRatio: null,
                            strict: true,
                            background: false,
                            zoomable: false,
                            crop: function (dataNew) {
                                data = dataNew;
                            }
                        };

                        let showCropper: () => void = (): void => {
                            $scope.$broadcast($scope.showEvent);
                        };

                        let _crop = (image, width: number, callback: (data) => void): void => {
                            Cropper.crop(image, data)
                                .then((blob: any): any => {
                                    return Cropper.scale(blob, {width: width});
                                })
                                .then(Cropper.encode).then((dataUrl: any): void => {
                                callback(dataUrl);
                            });
                        };

                        let Crop = () => {
                            _crop(items.image, current_size.width, (data) => {
                                $scope.image = data;
                            });
                        };

                        $scope.Crop = Crop;

                        let pushImage: (file: any) => void = (file: any): void => {
                            if (file) {
                                if (file.type.match('image/*')) {
                                    let reader: FileReader = new FileReader();
                                    reader.onload = (): void => {
                                        $scope.image = reader.result;
                                        $scope.$apply();
                                        $timeout(showCropper);
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }
                        };


                        pushImage(items.image);

            */

///////////////////////


            // cropper

            /*


                        let file: any = null;
                        let data: any = null;

                        let showCropper: () => void = (): void => {
                            $scope.$broadcast($scope.showEvent);
                        };

                        let pushImage: (file: any) => void = (file: any): void => {
                            if (file) {
                                if (file.type.match('image/*')) {
                                    let reader: FileReader = new FileReader();
                                    reader.onload = (): void => {
                                        $scope.avatarSrc = reader.result;
                                        $scope.$apply();
                                        $timeout(showCropper);
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }
                        };
            */
            /*
                        $scope.avatarSrc = "";

                        $scope.cropper = {};

                        $scope.options = {
                            viewMode: 3,
                            aspectRatio: null,
                            strict: true,
                            background: false,
                            zoomable: false,
                            crop: function (dataNew) {
                                data = dataNew;
                            }
                        };

                        $scope.showEvent = 'show';

                        $scope.hideEvent = 'hide';

                        $scope.cropperProxy = 'cropper.first';

                        // if using...
                        $scope.preview = (): void => {
                            if (file) {
                                if (data) {
                                    Cropper.crop(file, data).then(Cropper.encode).then((dataUrl: any): void => {
                                        ($scope.preview || ($scope.preview = {})).dataUrl = dataUrl;
                                    });
                                }
                            }
                        };

                        $scope.clear = (degrees: number): void => {
                            if ($scope.cropper.first) {
                                $scope.cropper.first('clear');
                            }
                        };

                        $scope.scale = (width: number): void => {
                            Cropper.crop(items.image, data)
                                .then((blob: any): any => {
                                    return Cropper.scale(blob, {width: width});
                                })
                                .then(Cropper.encode).then((dataUrl: any): void => {
                                ($scope.preview || ($scope.preview = {})).dataUrl = dataUrl;
                            });
                        };

                        let scale = (width: number, callback: (data) => void): void => {
                            Cropper.crop(items.image, data)
                                .then((blob: any): any => {
                                    return Cropper.scale(blob, {width: width});
                                })
                                .then(Cropper.encode).then((dataUrl: any): void => {
                                callback(dataUrl);
                            });
                        };

                        $scope.pushImage = pushImage;

                        $scope.createAvatar = (): any => {
                            scale(200, (dataUrl) => {
                                $uibModalInstance.close(dataUrl);
                            });
                        };

                        pushImage(items.image);
            */

        }]);
}