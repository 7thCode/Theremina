/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var ResourceBuilderControllers = angular.module('ResourceBuilderControllers', ['ui.ace']);
ResourceBuilderControllers.controller('ResourceBuilderController', ["$scope", "$document", "$log", "$compile", "$uibModal", "ResourceBuilderService", "ElementsService",
    function ($scope, $document, $log, $compile, $uibModal, ResourceBuilderService, ElementsService) {
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
        };
        window.addEventListener('beforeunload', function (e) {
            if (!editor.session.getUndoManager().isClean()) {
                e.returnValue = '';
                return '';
            }
        }, false);
        var editor = null;
        var document = null;
        var inner_peview = false;
        var preview_window = null;
        var Draw = function (text) {
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
            onLoad: function (_ace) {
                editor = _ace;
                var session = _ace.getSession();
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
            onChange: function (e) {
                Draw($scope.resource);
            }
        };
        $scope.Undo = function () {
            var session = editor.getSession();
            var undo = session.getUndoManager();
            undo.undo(true);
        };
        $scope.Paste = function (id) {
            progress(true);
            var current = ResourceBuilderService.current;
            ResourceBuilderService.Get(id, function (result) {
                progress(false);
                ResourceBuilderService.current = current;
                editor.insert(result.resource);
                Draw(result.resource);
            }, error_handler);
        };
        var OpenPreview = function () {
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
        var ClosePreview = function () {
            //      if (preview_window) {
            //          document = preview_window.close();
            //      }
        };
        var Create = function () {
            var modalRegist = $uibModal.open({
                controller: 'ResourceBuilderCreateDialogController',
                templateUrl: '/resources/dialogs/create_dialog',
                resolve: {
                    items: $scope
                }
            });
            modalRegist.result.then(function (resource) {
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
            }, function () {
            });
        };
        var Open = function () {
            var modalRegist = $uibModal.open({
                controller: 'ResourceBuilderOpenDialogController',
                templateUrl: '/resources/dialogs/open_dialog',
                resolve: {
                    items: $scope
                }
            });
            modalRegist.result.then(function (content) {
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
            }, function () {
            });
        };
        var Update = function () {
            if (ResourceBuilderService.current) {
                progress(true);
                ResourceBuilderService.current.content.resource = $scope.resource;
                ResourceBuilderService.Put(function (result) {
                    editor.session.getUndoManager().markClean();
                    progress(false);
                }, error_handler);
            }
        };
        var Delete = function () {
            if (ResourceBuilderService.current) {
                var modalRegist = $uibModal.open({
                    controller: 'ResourceBuilderDeleteConfirmController',
                    templateUrl: '/resources/dialogs/delete_confirm_dialog',
                    resolve: {
                        items: function () {
                            return ResourceBuilderService.current;
                        }
                    }
                });
                modalRegist.result.then(function (content) {
                    progress(true);
                    ResourceBuilderService.Delete(function (result) {
                        ClosePreview();
                        $scope.resource = {};
                        $scope.name = "";
                        $scope.opened = false;
                        ResourceBuilderService.Draw("");
                        progress(false);
                    }, error_handler);
                }, function () {
                });
            }
        };
        var Query = function () {
            ResourceBuilderService.query = { type: { $lt: 10 } };
            ResourceBuilderService.Query(function (result) {
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
    function ($scope, $log, $uibModalInstance, ResourceBuilderService, items) {
        var progress = function (value) {
            $scope.$emit('progress', value);
        };
        $scope.$on('progress', function (event, value) {
            items.progress = value;
        });
        var error_handler = function (code, message) {
            progress(false);
            $scope.message = message;
            $log.error(message);
        };
        $scope.type = 20;
        $scope.hide = function () {
            $uibModalInstance.close();
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
        $scope.answer = function () {
            progress(true);
            ResourceBuilderService.Init();
            //ResourceBuilderService.current.content.resource = $scope.resource;
            ResourceBuilderService.current.content.type = $scope.mimetype;
            ResourceBuilderService.Create($scope.title, $scope.type, function (result) {
                progress(false);
                $scope.message = "";
                $uibModalInstance.close(result);
            }, error_handler);
        };
    }]);
ResourceBuilderControllers.controller('ResourceBuilderOpenDialogController', ['$scope', '$log', '$uibModalInstance', '$uibModal', 'items', 'ResourceBuilderService',
    function ($scope, $log, $uibModalInstance, $uibModal, items, ResourceBuilderService) {
        var progress = function (value) {
            $scope.$emit('progress', value);
        };
        $scope.$on('progress', function (event, value) {
            items.progress = value;
        });
        var error_handler = function (code, message) {
            progress(false);
            $scope.message = message;
            $log.error(message);
        };
        var Query = function () {
            progress(true);
            ResourceBuilderService.InitQuery(null);
            ResourceBuilderService.Query(function (result) {
                if (result) {
                    $scope.pages = result;
                }
                ResourceBuilderService.Over(function (hasnext) { $scope.over = !hasnext; });
                ResourceBuilderService.Under(function (hasprev) { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        var Find = function (name) {
            progress(true);
            ResourceBuilderService.InitQuery(null);
            if (name) {
                ResourceBuilderService.AddQuery({ name: { $regex: name } });
            }
            ResourceBuilderService.Query(function (result) {
                if (result) {
                    $scope.pages = result;
                }
                ResourceBuilderService.Over(function (hasnext) { $scope.over = !hasnext; });
                ResourceBuilderService.Under(function (hasprev) { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        var Count = function () {
            ResourceBuilderService.Count(function (result) {
                if (result) {
                    $scope.count = result;
                }
            }, error_handler);
        };
        var Next = function () {
            progress(true);
            ResourceBuilderService.Next(function (result) {
                if (result) {
                    $scope.pages = result;
                }
                ResourceBuilderService.Over(function (hasnext) { $scope.over = !hasnext; });
                ResourceBuilderService.Under(function (hasprev) { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        var Prev = function () {
            progress(true);
            ResourceBuilderService.Prev(function (result) {
                if (result) {
                    $scope.pages = result;
                }
                ResourceBuilderService.Over(function (hasnext) { $scope.over = !hasnext; });
                ResourceBuilderService.Under(function (hasprev) { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        var Get = function (resource) {
            progress(true);
            ResourceBuilderService.Get(resource._id, function (result) {
                progress(false);
                $scope.message = "";
                $uibModalInstance.close(result);
            }, error_handler);
        };
        var hide = function () {
            $uibModalInstance.close();
        };
        var cancel = function () {
            $uibModalInstance.dismiss();
        };
        var LayoutQuery = function () { return Query; };
        $scope.Count = Count;
        $scope.Next = Next;
        $scope.Prev = Prev;
        $scope.Find = Find;
        $scope.Get = Get;
        $scope.hide = hide;
        $scope.cancel = cancel;
        $scope.LayoutQuery = function () { return Query; };
        Query();
    }]);
ResourceBuilderControllers.controller('ResourceBuilderDeleteConfirmController', ['$scope', '$uibModalInstance', 'items',
    function ($scope, $uibModalInstance, items) {
        $scope.title = items.name;
        $scope.hide = function () {
            $uibModalInstance.close();
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
        $scope.answer = function () {
            $uibModalInstance.close({});
        };
    }]);
//# sourceMappingURL=resource_builder_controllers.js.map