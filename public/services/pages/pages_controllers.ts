/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace PagesControllersModule {

    let PagesControllers: angular.IModule = angular.module('PagesControllers', ['ui.bootstrap', 'ngAnimate', 'flow', 'ui.ace']);

//Leaflet

    PagesControllers.controller('PagesController', ["$scope", "$rootScope", "$q", "$document", "$log", "$uibModal", "ResourceBuilderService",
        function ($scope: any, $rootScope: any, $q: any, $document: any, $log: any, $uibModal: any, ResourceBuilderService: any): void {

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

            window.addEventListener('beforeunload', (e) => {
                if (!editor.session.getUndoManager().isClean()) {
                    e.returnValue = '';
                    return '';
                }
            }, false);

            let editor:any = null;
            let document:any = null;

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

            let Query = (): any => {
                progress(true);
                // template query
                //      ResourceBuilderService.Query((result: any): void => {
                //          ResourceBuilderService.InitQuery(null);
                //         if (result) {
                //             $scope.templates = result;
                //pages query

                ResourceBuilderService.InitQuery(JSON.parse(localStorage.getItem("pages_query")), 20, 36);

                ResourceBuilderService.Query((result: any): void => {
                    if (result) {
                        $scope.pages = result;
                        $scope.templates = result;
                        localStorage.setItem("pages_query", JSON.stringify(ResourceBuilderService.GetQuery()));
                    }
                    ResourceBuilderService.Over((hasnext) => {
                        $scope.over = !hasnext;
                    });
                    ResourceBuilderService.Under((hasprev) => {
                        $scope.under = !hasprev;
                    });
                    AllMimeType();
                    progress(false);
                }, error_handler);
                //pages query
                //           }
                //       }, error_handler);
                // template query
            };

            let _Find = (key: string, value: any): any => {
                progress(true);

                ResourceBuilderService.RemoveQuery(key);
                if (value) {
                    let query = {};
                    query[key] = value;
                    ResourceBuilderService.AddQuery(query);
                } else {
                    ResourceBuilderService.RemoveQuery(key);
                }

                ResourceBuilderService.Query((result: any): void => {
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
            let Find = (name: string): any => {
                _Find("name", {$regex: name});
                localStorage.setItem("pages_find_name", name);
            };

            $scope.type = localStorage.getItem("pages_find_type");
            let FindType = (type: number): any => {
                _Find("type", type);
                localStorage.setItem("pages_find_type", "" + type);
            };

            $scope.mimetype = localStorage.getItem("pages_find_mime");
            let FindMime = (mime: string): any => {
                _Find("content.type", mime);
                localStorage.setItem("pages_find_mime", mime);
            };

            $scope.all_mimetypes = [];
            let AllMimeType = () => {
                ResourceBuilderService.MimeTypes((result) => {
                    $scope.all_mimetypes = result;
                }, error_handler);
            };
            AllMimeType();

            /*
                  $scope.all_mimetypes = [
                      "all",
                      "text/html",
                      "text/css",
                      "text/javascript",
                      "application/json"
                  ];
          */
            $scope.content = localStorage.getItem("pages_find_resource");
            let FindResource = (value: string): any => {
                _Find("content.resource", {$regex: value});
                localStorage.setItem("pages_find_resource", value);
            };

            let Count = (): void => {
                ResourceBuilderService.Count((result: any): void => {
                    if (result) {
                        $scope.count = result;
                    }
                }, error_handler);
            };

            let Next = (): void => {
                progress(true);
                ResourceBuilderService.Next((result: any): void => {
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

            let Prev = (): void => {
                progress(true);
                ResourceBuilderService.Prev((result: any): void => {
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

            let Get = (resource: any): void => {
                progress(true);
                ResourceBuilderService.Get(resource._id, (content: any): void => {
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
                    } else {
                        $scope.resource = "";
                    }
                    editor.session.getUndoManager().markClean();
                    $scope.opened = true;
                    progress(false);
                }, error_handler);
            };

            let Close = (): void => {
                if (!editor.session.getUndoManager().isClean()) {
                    if (window.confirm('保存されていません。閉じますか？')) {
                        $scope.opened = false;
                    }
                } else {
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
                ResourceBuilderService.Get(id, (result: any): void => {
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

            let CreatePages = (files: any): void => {
                progress(true);
                let promises = [];
                _.forEach(files, (local_file) => {
                    let deferred = $q.defer();
                    let fileReader: any = new FileReader();
                    fileReader.onload = (event: any): void => {

                        let modalInstance: any = $uibModal.open({
                            controller: 'PagesCreateDialogController',
                            templateUrl: '/pages/dialogs/create_dialog',
                            resolve: {
                                items: {parent_scope: $scope, file: local_file.file, target: event.target}
                            }
                        });

                        modalInstance.result.then((answer: any): void => { // Answer
                            deferred.resolve(true);
                        }, (): void => { // Error
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

                    $rootScope.$emit('change_files', {});
                    $rootScope.$emit('change_namespace', {});
                    //    Query();
                }).finally(() => {
                });
            };

            let Create = (): void => {

                let modalRegist: any = $uibModal.open({
                    controller: 'PagesCreateDialogController',
                    templateUrl: '/pages/dialogs/create_dialog',
                    resolve: {
                        items: {parent_scope: $scope, file: null, target: null}
                    }
                });

                modalRegist.result.then((resource: any): void => {
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

                    $rootScope.$emit('change_files', {});
                    $rootScope.$emit('change_namespace', {});
                    //   Query();
                    editor.session.getUndoManager().markClean();
                    $scope.opened = true;
                }, (): void => {
                });
            };

            let Open = (): void => {

                let modalRegist: any = $uibModal.open({
                    controller: 'PagesOpenDialogController',
                    templateUrl: '/pages/dialogs/open_dialog',
                    resolve: {
                        items: $scope
                    }
                });

                modalRegist.result.then((content: any): void => {
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
                }, (): void => {
                });
            };

            let Update = (): void => {
                if (ResourceBuilderService.current) {
                    progress(true);
                    ResourceBuilderService.current.content.resource = $scope.resource;
                    ResourceBuilderService.Put((result: any): void => {
                        editor.session.getUndoManager().markClean();
                        progress(false);
                    }, error_handler);
                }
            };

            let Delete = (): void => {
                if (ResourceBuilderService.current) {
                    let modalRegist: any = $uibModal.open({
                        controller: 'PagesDeleteConfirmController',
                        templateUrl: '/pages/dialogs/delete_confirm_dialog',
                        resolve: {
                            items: (): any => {
                                return ResourceBuilderService.current;
                            }
                        }
                    });

                    modalRegist.result.then((content): void => {
                        progress(true);
                        ResourceBuilderService.Delete((result: any): void => {
                            ClosePreview();
                            $rootScope.$emit('change_files', {});
                            $rootScope.$emit('change_namespace', {});
                            //      Query();
                            $scope.name = "";
                            progress(false);
                            $scope.opened = false;
                        }, error_handler);
                    }, (): void => {
                    });
                }
            };

            $rootScope.$on('change_files', (event, value): void => {
                Query();
            });

            $rootScope.$on('change_namespace', (event, value): void => {
                $scope.$evalAsync(      // $apply
                    ($scope: any): void => {
                        $scope.namespace = value;
                    }
                );
                Query();
            });

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

            //  $scope.BuildSite = BuildSite;

            //$scope.OpenPreview = OpenPreview;

        }]);

    PagesControllers.controller('PagesCreateDialogController', ['$scope', '$log', '$uibModalInstance', 'SessionService', 'ResourceBuilderService', 'items', '$timeout', '$window',
        ($scope: any, $log: any, $uibModalInstance: any, SessionService: any, ResourceBuilderService: any, items: any, $timeout: any, $window: any): void => {

            let file = items.file;
            let target = items.target;
            let parent_scope = items.parent_scope;

            if (file) {
                $scope.title = file.name;
                $scope.presettype = file.type;
                $scope.mimetype = file.type;
            } else {
                $scope.presettype = "text/html";
                $scope.mimetype = "text/html";
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

            $scope.answer = (): void => {
                progress(true);

                SetNamespace(() => {
                    ResourceBuilderService.Init();
                    ResourceBuilderService.current.content.type = $scope.mimetype;
                    if (target) {
                        ResourceBuilderService.current.content.resource = target.result;
                    }
                    ResourceBuilderService.Create($scope.title, $scope.type, (result: any): void => {
                        progress(false);
                        $scope.message = "";
                        $uibModalInstance.close(result);
                    }, error_handler);
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

            $timeout(() => {
                let element = $window.document.getElementById("name");
                if (element) {
                    element.focus();
                }
            });

            GetNamespace(() => {
            });

        }]);

    PagesControllers.controller('PagesOpenDialogController', ['$scope', '$log', '$uibModalInstance', '$uibModal', 'items', 'ResourceBuilderService',
        ($scope: any, $log: any, $uibModalInstance: any, $uibModal: any, items: any, ResourceBuilderService: any): void => {

            let progress = (value) => {
                $scope.$emit('progress', value);
            };

            $scope.$on('progress', (event, value) => {
                items.progress = value;
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

            let Query = (): any => {
                progress(true);
                ResourceBuilderService.InitQuery(null, 20);
                ResourceBuilderService.Query((result: any): void => {
                    if (result) {
                        $scope.pages = result;
                    }
                    progress(false);
                }, error_handler);
            };

            let Find = (name: string): any => {
                progress(true);
                ResourceBuilderService.InitQuery(null, 20);
                if (name) {
                    ResourceBuilderService.AddQuery({name: {$regex: name}});

                    //            ResourceBuilderService.SetQuery({name: {$regex: name}}, 20);
                }
                ResourceBuilderService.Query((result: any): void => {
                    if (result) {
                        $scope.pages = result;
                    }
                    progress(false);
                }, error_handler);
            };

            let Count = (): void => {
                ResourceBuilderService.Count((result: any): void => {
                    if (result) {
                        $scope.count = result;
                    }
                }, error_handler);
            };

            let Next = (): void => {
                progress(true);
                ResourceBuilderService.Next((result: any): void => {
                    if (result) {
                        $scope.pages = result;
                    }
                    progress(false);
                }, error_handler);
            };

            let Prev = (): void => {
                progress(true);
                ResourceBuilderService.Prev((result: any): void => {
                    if (result) {
                        $scope.pages = result;
                    }
                    progress(false);
                }, error_handler);
            };

            let Get = (resource: any): void => {
                progress(true);
                ResourceBuilderService.Get(resource._id, (result: any): void => {
                    progress(false);
                    $scope.message = "";
                    $uibModalInstance.close(result);
                }, error_handler);
            };

            let hide = (): void => {
                $uibModalInstance.close();
            };

            let cancel = (): void => {
                $uibModalInstance.dismiss();
            };

            let LayoutQuery = (): any => Query;

            $scope.Count = Count;
            $scope.Next = Next;
            $scope.Prev = Prev;
            $scope.Find = Find;
            $scope.Get = Get;
            $scope.hide = hide;
            $scope.cancel = cancel;
            $scope.LayoutQuery = (): any => Query;


        }]);

    PagesControllers.controller('PagesDeleteConfirmController', ['$scope', '$uibModalInstance', 'items',
        ($scope: any, $uibModalInstance: any, items: any): void => {

            $scope.title = items.name;

            $scope.hide = (): void => {
                $uibModalInstance.close();
            };

            $scope.cancel = (): void => {
                $uibModalInstance.dismiss();
            };

            $scope.answer = (): void => {
                $uibModalInstance.close({});
            };

        }]);
}
/*! Controllers  */