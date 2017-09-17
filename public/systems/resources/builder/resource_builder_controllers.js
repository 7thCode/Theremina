/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
let ResourceBuilderControllers = angular.module('ResourceBuilderControllers', ['ui.ace']);
ResourceBuilderControllers.controller('ResourceBuilderController', ["$scope", "$document", "$log", "$compile", "$uibModal", "ResourceBuilderService", "ElementsService",
    function ($scope, $document, $log, $compile, $uibModal, ResourceBuilderService, ElementsService) {
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
        };
        window.addEventListener('beforeunload', (e) => {
            if (!editor.session.getUndoManager().isClean()) {
                e.returnValue = '';
                return '';
            }
        }, false);
        let editor = null;
        let document = null;
        let inner_peview = false;
        let preview_window = null;
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
        $scope.aceOption = {
            theme: "chrome",
            onLoad: (_ace) => {
                editor = _ace;
                let session = _ace.getSession();
                //      let beautify = _ace.require("ace/ext/beautify"); // get reference to extension
                //      beautify.beautify(session);
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
            ResourceBuilderService.Get(id, (result) => {
                progress(false);
                ResourceBuilderService.current = current;
                editor.insert(result.resource);
                Draw(result.resource);
            }, error_handler);
        };
        let OpenPreview = () => {
            //      $scope.inner_preview = inner_peview;
            //      if (inner_peview) {
            //          let preview = window.document.getElementById("view");
            //          document = preview.contentDocument;
            //      } else {
            //          preview_window = window.open("", "", "width=1024,height=800");
            //          document = preview_window.document;
            //      }
            //      Draw(ResourceBuilderService.current.content.resource);
        };
        let ClosePreview = () => {
            //      if (preview_window) {
            //          document = preview_window.close();
            //      }
        };
        let Create = () => {
            let modalRegist = $uibModal.open({
                controller: 'ResourceBuilderCreateDialogController',
                templateUrl: '/resources/dialogs/create_dialog',
                resolve: {
                    items: $scope
                }
            });
            modalRegist.result.then((resource) => {
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
                $scope.resource = {};
                $scope.name = ResourceBuilderService.current.name;
                $scope.userid = ResourceBuilderService.current.userid;
                editor.session.getUndoManager().markClean();
                $scope.opened = true;
            }, () => {
            });
        };
        let Open = () => {
            let modalRegist = $uibModal.open({
                controller: 'ResourceBuilderOpenDialogController',
                templateUrl: '/resources/dialogs/open_dialog',
                resolve: {
                    items: $scope
                }
            });
            modalRegist.result.then((content) => {
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
                $scope.resource = content.resource;
                $scope.name = ResourceBuilderService.current.name;
                $scope.userid = ResourceBuilderService.current.userid;
                editor.session.getUndoManager().markClean();
                $scope.opened = true;
            }, () => {
            });
        };
        let Update = () => {
            if (ResourceBuilderService.current) {
                progress(true);
                ResourceBuilderService.current.content.resource = $scope.resource;
                ResourceBuilderService.Put((result) => {
                    editor.session.getUndoManager().markClean();
                    progress(false);
                }, error_handler);
            }
        };
        let Delete = () => {
            if (ResourceBuilderService.current) {
                let modalRegist = $uibModal.open({
                    controller: 'ResourceBuilderDeleteConfirmController',
                    templateUrl: '/resources/dialogs/delete_confirm_dialog',
                    resolve: {
                        items: () => {
                            return ResourceBuilderService.current;
                        }
                    }
                });
                modalRegist.result.then((content) => {
                    progress(true);
                    ResourceBuilderService.Delete((result) => {
                        ClosePreview();
                        $scope.resource = {};
                        $scope.name = "";
                        $scope.opened = false;
                        ResourceBuilderService.Draw("");
                        progress(false);
                    }, error_handler);
                }, () => {
                });
            }
        };
        let Query = () => {
            ResourceBuilderService.query = { type: { $lt: 10 } };
            ResourceBuilderService.Query((result) => {
                if (result) {
                    $scope.templates = result;
                }
            }, error_handler);
        };
        $scope.opened = false;
        $scope.Create = Create;
        $scope.Open = Open;
        $scope.Update = Update;
        $scope.Delete = Delete;
        //$scope.OpenPreview = OpenPreview;
        Query();
    }]);
ResourceBuilderControllers.controller('ResourceBuilderCreateDialogController', ['$scope', '$log', '$uibModalInstance', 'ResourceBuilderService', 'items',
    ($scope, $log, $uibModalInstance, ResourceBuilderService, items) => {
        let progress = (value) => {
            $scope.$emit('progress', value);
        };
        $scope.$on('progress', (event, value) => {
            items.progress = value;
        });
        let error_handler = (code, message) => {
            progress(false);
            $scope.message = message;
            $log.error(message);
        };
        $scope.type = 20;
        $scope.hide = () => {
            $uibModalInstance.close();
        };
        $scope.cancel = () => {
            $uibModalInstance.dismiss();
        };
        $scope.answer = () => {
            progress(true);
            ResourceBuilderService.Init();
            //ResourceBuilderService.current.content.resource = $scope.resource;
            ResourceBuilderService.current.content.type = $scope.mimetype;
            ResourceBuilderService.Create($scope.title, $scope.type, (result) => {
                progress(false);
                $scope.message = "";
                $uibModalInstance.close(result);
            }, error_handler);
        };
    }]);
ResourceBuilderControllers.controller('ResourceBuilderOpenDialogController', ['$scope', '$log', '$uibModalInstance', '$uibModal', 'items', 'ResourceBuilderService',
    ($scope, $log, $uibModalInstance, $uibModal, items, ResourceBuilderService) => {
        let progress = (value) => {
            $scope.$emit('progress', value);
        };
        $scope.$on('progress', (event, value) => {
            items.progress = value;
        });
        let error_handler = (code, message) => {
            progress(false);
            $scope.message = message;
            $log.error(message);
        };
        let Query = () => {
            progress(true);
            ResourceBuilderService.InitQuery(null);
            ResourceBuilderService.Query((result) => {
                if (result) {
                    $scope.pages = result;
                }
                ResourceBuilderService.Over((hasnext) => { $scope.over = !hasnext; });
                ResourceBuilderService.Under((hasprev) => { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        let Find = (name) => {
            progress(true);
            ResourceBuilderService.InitQuery(null);
            if (name) {
                ResourceBuilderService.AddQuery({ name: { $regex: name } });
            }
            ResourceBuilderService.Query((result) => {
                if (result) {
                    $scope.pages = result;
                }
                ResourceBuilderService.Over((hasnext) => { $scope.over = !hasnext; });
                ResourceBuilderService.Under((hasprev) => { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        let Count = () => {
            ResourceBuilderService.Count((result) => {
                if (result) {
                    $scope.count = result;
                }
            }, error_handler);
        };
        let Next = () => {
            progress(true);
            ResourceBuilderService.Next((result) => {
                if (result) {
                    $scope.pages = result;
                }
                ResourceBuilderService.Over((hasnext) => { $scope.over = !hasnext; });
                ResourceBuilderService.Under((hasprev) => { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        let Prev = () => {
            progress(true);
            ResourceBuilderService.Prev((result) => {
                if (result) {
                    $scope.pages = result;
                }
                ResourceBuilderService.Over((hasnext) => { $scope.over = !hasnext; });
                ResourceBuilderService.Under((hasprev) => { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        let Get = (resource) => {
            progress(true);
            ResourceBuilderService.Get(resource._id, (result) => {
                progress(false);
                $scope.message = "";
                $uibModalInstance.close(result);
            }, error_handler);
        };
        let hide = () => {
            $uibModalInstance.close();
        };
        let cancel = () => {
            $uibModalInstance.dismiss();
        };
        let LayoutQuery = () => Query;
        $scope.Count = Count;
        $scope.Next = Next;
        $scope.Prev = Prev;
        $scope.Find = Find;
        $scope.Get = Get;
        $scope.hide = hide;
        $scope.cancel = cancel;
        $scope.LayoutQuery = () => Query;
        Query();
    }]);
ResourceBuilderControllers.controller('ResourceBuilderDeleteConfirmController', ['$scope', '$uibModalInstance', 'items',
    ($scope, $uibModalInstance, items) => {
        $scope.title = items.name;
        $scope.hide = () => {
            $uibModalInstance.close();
        };
        $scope.cancel = () => {
            $uibModalInstance.dismiss();
        };
        $scope.answer = () => {
            $uibModalInstance.close({});
        };
    }]);
//# sourceMappingURL=resource_builder_controllers.js.map