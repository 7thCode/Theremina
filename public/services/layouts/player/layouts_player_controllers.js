/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
/// <reference path="../../../systems/common/shape_edit/shape_edit.ts" />
/// <reference path="../../../systems/common/shape_edit/server_canvas.ts" />
/// <reference path="../../../systems/common/shape_edit/adaptor.ts" />
"use strict";
var PlayerControllersModule;
(function (PlayerControllersModule) {
    var PlayerControllers = angular.module('PlayerControllers', ['ui.bootstrap']);
    PlayerControllers.controller('PlayerController', ["$scope", '$document', '$log', '$window', "$compile", '$uibModal', 'ShapeEdit', 'HtmlEdit', 'LayoutService', 'ArticleService',
        function ($scope, $document, $log, $window, $compile, $uibModal, ShapeEdit, HtmlEdit, LayoutService, ArticleService) {
            //   let short = 525;
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
            $document.on('drop dragover', function (e) {
                e.stopPropagation();
                e.preventDefault();
            });
            var watchChange = function (_scope, $scope, id, events) {
                $scope.$watch(id, function (newValue, oldValue) {
                    if (events) {
                        if (events.onChange != "") {
                            try {
                                _scope.document = document;
                                _scope.element = document.getElementById(id);
                                _scope.newValue = newValue;
                                _scope.oldValue = oldValue;
                                new Function("_scope", "with (_scope) {" + events.onChange + "}")(_scope); //scope chainをぶった切る
                            }
                            catch (e) {
                                var a = e;
                            }
                        }
                    }
                });
            };
            var create_dynamic_target_elements = function (shapes, callbacks) {
                var result = "";
                var _scope = { id: "", canvas: ShapeEdit.Canvas, document: null, shapes: shapes, element: null, newValue: "", oldValue: "", setValue: null };
                _.forEach(shapes, function (shape) {
                    var id = shape.ID();
                    var property = shape.Property();
                    _.forEach(property.description["field"], function (field_description, key) {
                        var label = field_description.label;
                        var type = field_description.type;
                        var validate = field_description.validate;
                        var options = field_description.options;
                        var events = field_description.events;
                        var mode = field_description.mode;
                        if (mode == "dynamic") {
                            var callback_1 = callbacks[key];
                            var text = property.text;
                            var field = [];
                            var control_id_1 = id + "A" + key;
                            switch (type) {
                                case "text":
                                    field = [{
                                            "name": "div", "type": "element",
                                            "_$": { "class": "form-group" },
                                            "@": [
                                                {
                                                    "name": "label", "type": "element",
                                                    "_$": { "for": control_id_1 },
                                                    "@": label,
                                                },
                                                {
                                                    "name": "span", "type": "element",
                                                    "_$": { "ng-messages": "validate." + control_id_1 + ".$error" },
                                                    "@": [
                                                        {
                                                            "name": "span", "type": "element",
                                                            "_$": { "ng-message": "required", "class": "error-message" },
                                                            "@": "必須です"
                                                        },
                                                        {
                                                            "name": "span", "type": "element",
                                                            "_$": { "ng-message": "minlength", "class": "error-message" },
                                                            "@": "もう少し長く"
                                                        },
                                                        {
                                                            "name": "span", "type": "element",
                                                            "_$": { "ng-message": "maxlength", "class": "error-message" },
                                                            "@": "もう少し短く"
                                                        }
                                                    ]
                                                },
                                                {
                                                    "name": "input", "type": "element",
                                                    "_$": { "class": "form-control no-zoom", "id": control_id_1, "ng-model": control_id_1, "type": "text", "name": control_id_1, "value": text, "ng-maxlength": validate["ng-maxlength"], "ng-minlength": validate["ng-minlength"], "required": validate["required"] },
                                                }
                                            ]
                                        }];
                                    watchChange(_scope, $scope, control_id_1, events);
                                    break;
                                case "textarea":
                                    field = [{
                                            "name": "div", "type": "element",
                                            "_$": { "class": "form-group" },
                                            "@": [
                                                {
                                                    "name": "label", "type": "element",
                                                    "_$": { "for": control_id_1 },
                                                    "@": label,
                                                },
                                                {
                                                    "name": "span", "type": "element",
                                                    "_$": { "ng-messages": "validate." + control_id_1 + ".$error" },
                                                    "@": [
                                                        {
                                                            "name": "span", "type": "element",
                                                            "_$": { "ng-message": "required", "class": "error-message" },
                                                            "@": "必須です"
                                                        },
                                                        {
                                                            "name": "span", "type": "element",
                                                            "_$": { "ng-message": "minlength", "class": "error-message" },
                                                            "@": "もう少し長く"
                                                        },
                                                        {
                                                            "name": "span", "type": "element",
                                                            "_$": { "ng-message": "maxlength", "class": "error-message" },
                                                            "@": "もう少し短く"
                                                        }
                                                    ]
                                                },
                                                {
                                                    "name": "textarea", "type": "element",
                                                    "_$": { "class": "form-control no-zoom", "id": control_id_1, "ng-model": control_id_1, "type": "text", "name": control_id_1, "ng-maxlength": validate["ng-maxlength"], "ng-minlength": validate["ng-minlength"], "required": validate["required"] }
                                                }
                                            ]
                                        }];
                                    watchChange(_scope, $scope, control_id_1, events);
                                    break;
                                case "select":
                                    var options_model_name = id + "_options";
                                    $scope[options_model_name] = options;
                                    field = [{
                                            "name": "div", "type": "element",
                                            "_$": { "class": "form-group" },
                                            "@": [
                                                {
                                                    "name": "label", "type": "element",
                                                    "_$": { "for": control_id_1 },
                                                    "@": label,
                                                },
                                                {
                                                    "name": "select", "type": "element",
                                                    "_$": { "class": "form-control", "id": control_id_1, "ng-init": id + " = " + options_model_name + "[0]", "ng-model": control_id_1, "ng-options": "option for option in " + options_model_name, "name": id, "required": validate["required"] }
                                                }
                                            ]
                                        }];
                                    $scope.$watch(id, function (newValue, oldValue) {
                                        if (events) {
                                            if (events.onChange != "") {
                                                try {
                                                    _scope.id = id;
                                                    _scope.document = document;
                                                    _scope.element = document.getElementById(id);
                                                    _scope.newValue = newValue;
                                                    _scope.oldValue = oldValue;
                                                    _scope.setValue = function (id) {
                                                        _scope.document.getElementById(id).selectedIndex = _scope.element.selectedIndex;
                                                        var text = _scope.canvas.shapes.getShapeById(id);
                                                        if (text) {
                                                            text.SetText(_scope.document.getElementById(id).childNodes[_scope.element.selectedIndex].outerText);
                                                            _scope.canvas.Draw();
                                                        }
                                                    };
                                                    new Function("_scope", "with (_scope) {" + events.onChange + "}")(_scope); //scope chainをぶった切る
                                                }
                                                catch (e) {
                                                    var a = e;
                                                }
                                            }
                                        }
                                    });
                                    break;
                                case "radio":
                                    var radio_elements_1 = [];
                                    _.forEach(options, function (label) {
                                        var radio_element = {
                                            "name": "div", "type": "element",
                                            "_$": { "class": "radio" },
                                            "@": [
                                                {
                                                    "name": "label", "type": "element",
                                                    "_$": {},
                                                    "@": [
                                                        {
                                                            "name": "input", "type": "element",
                                                            "_$": { type: "radio", id: label, "ng-model": control_id_1, value: label },
                                                            "@": [],
                                                        },
                                                        {
                                                            "name": "label", "type": "element",
                                                            "_$": { for: label },
                                                            "@": label,
                                                        }
                                                    ],
                                                }
                                            ]
                                        };
                                        radio_elements_1.push(radio_element);
                                    });
                                    field = [{
                                            "name": "div", "type": "element",
                                            "_$": { "class": "form-group" },
                                            "@": radio_elements_1
                                        }];
                                    watchChange(_scope, $scope, control_id_1, events);
                                    break;
                                case "checkbox":
                                    break;
                                case "color":
                                    field = [{
                                            "name": "div", "type": "element",
                                            "_$": { "class": "form-group" },
                                            "@": [
                                                {
                                                    "name": "label", "type": "element",
                                                    "_$": { "for": control_id_1 },
                                                    "@": label,
                                                },
                                                {
                                                    "name": "input", "type": "element",
                                                    "_$": { "class": "form-control no-zoom", "id": control_id_1, "ng-model": control_id_1, "type": "color", "name": control_id_1, "value": text },
                                                }
                                            ]
                                        }];
                                    watchChange(_scope, $scope, control_id_1, events);
                                    break;
                                default:
                            }
                            result += HtmlEdit.toHtml(field, "");
                            $scope.$watch(control_id_1, function (value) {
                                if (value) {
                                    var element = ShapeEdit.Canvas.shapes.getShapeById(id);
                                    if (element) {
                                        callback_1(element, value);
                                        ShapeEdit.Canvas.Draw();
                                    }
                                }
                            });
                        }
                    });
                });
                return result;
            };
            var lookup_value = function (shapes, values, callbacks) {
                if (values) {
                    _.forEach(shapes, function (shape) {
                        var id = shape.ID();
                        var property = shape.Property();
                        _.forEach(property.description["field"], function (field_description, key) {
                            var lookup = field_description.lookup;
                            var type = field_description.type;
                            //  let validate = field_description.validate;
                            //  let options = field_description.options;
                            var mode = field_description.mode;
                            if (mode == "lookup") {
                                var callback = callbacks[key];
                                switch (type) {
                                    case "text":
                                    case "textarea":
                                        var text = ShapeEdit.Canvas.shapes.getShapeById(id);
                                        if (text) {
                                            var value = values[lookup];
                                            if (value) {
                                                callback(text, value);
                                            }
                                            else {
                                                callback(text, "");
                                            }
                                            ShapeEdit.Canvas.Draw();
                                        }
                                        break;
                                    case "select":
                                    case "radio":
                                    case "checkbox":
                                        break;
                                    default:
                                }
                            }
                        });
                    });
                }
            };
            // dynamic element
            var setup_layout = function (layout) {
                LayoutService.current_layout = layout;
                $scope.current_layout = LayoutService.current_layout;
                var shapes = [];
                ShapeEdit.Canvas.shapes.getShapeByType("Text", shapes);
                var elements_text = create_dynamic_target_elements(shapes, {
                    text: function (text, value) {
                        text.SetText(value);
                    },
                    color: function (shape, value) {
                        var color = new ShapeEdit.RGBAColor(0, 0, 0, 1);
                        color.SetRGB(value);
                        shape.SetFillColor(color);
                    }
                });
                shapes = [];
                ShapeEdit.Canvas.shapes.getShapeByTypes(["Box", "Oval", "Polygon", "Bezier", "Shapes"], shapes);
                elements_text += create_dynamic_target_elements(shapes, {
                    color: function (shape, value) {
                        var color = new ShapeEdit.RGBAColor(0, 0, 0, 1);
                        color.SetRGB(value);
                        shape.SetFillColor(color);
                    }
                });
                shapes = [];
                ShapeEdit.Canvas.shapes.getShapeByType("ImageRect", shapes);
                elements_text += create_dynamic_target_elements(shapes, {
                    text: function (image, value) {
                        image.SetPath(value);
                    }
                });
                var elements = angular.element('.input-root').html(elements_text);
                $compile(elements.contents())($scope);
                // lookup
                if (ArticleService.current_article) {
                    shapes = [];
                    ShapeEdit.Canvas.shapes.getShapeByType("Text", shapes);
                    lookup_value(shapes, ArticleService.current_article.content, {
                        text: function (text, value) {
                            switch (value.type) {
                                case "array":
                                    var s_1 = "";
                                    var delimiter_1 = "";
                                    _.forEach(value.value, function (element) {
                                        s_1 += delimiter_1 + element;
                                        delimiter_1 = ", ";
                                    });
                                    text.SetText(s_1);
                                    break;
                                case "quoted":
                                    text.SetText(value.value);
                                    break;
                                default:
                                    text.SetText(value.value);
                            }
                        }
                    });
                    shapes = [];
                    ShapeEdit.Canvas.shapes.getShapeByType("ImageRect", shapes);
                    lookup_value(shapes, ArticleService.current_article.content, {
                        text: function (image, value) {
                            image.SetPath(value.value);
                        }
                    });
                }
            };
            var clear_layout = function () {
                var elements = angular.element('.input-root').html("");
                $compile(elements.contents())($scope);
            };
            var CreateFromTemplate = function () {
                var modalRegist = $uibModal.open({
                    controller: 'PlayerCreateDialogController',
                    templateUrl: '/layouts/player/dialogs/create_dialog',
                    resolve: {
                        items: function () {
                        }
                    }
                });
                modalRegist.result.then(function (layout) {
                    setup_layout(layout);
                    LayoutCount();
                    LayoutList();
                    $scope.opened = true;
                }, function () {
                });
            };
            var ArticleList = function () {
                ArticleService.Query(function (result) {
                    $scope.articles = result;
                }, error_handler);
            };
            var LayoutCount = function () {
                LayoutService.Count(function (result) {
                    $scope.count = result;
                }, error_handler);
            };
            var LayoutList = function () {
                progress(true);
                LayoutService.Query(function (result) {
                    if (result) {
                        $scope.layouts = result;
                    }
                    ArticleService.Over(function (hasnext) {
                        $scope.over = !hasnext;
                    });
                    ArticleService.Under(function (hasprev) {
                        $scope.under = !hasprev;
                    });
                    progress(false);
                }, error_handler);
            };
            // Lookup Text, Image
            var SelectArticle = function (id) {
                ArticleService.Get(id, function (result) {
                    ArticleService.current_article = result;
                    $scope.current_article = result;
                    var shapes = [];
                    ShapeEdit.Canvas.shapes.getShapeByType("Text", shapes);
                    lookup_value(shapes, result.content, {
                        text: function (text, value) {
                            switch (value.type) {
                                case "array":
                                    var s_2 = "";
                                    var delimiter_2 = "";
                                    _.forEach(value.value, function (element) {
                                        s_2 += delimiter_2 + element;
                                        delimiter_2 = ", ";
                                    });
                                    text.SetText(s_2);
                                    break;
                                case "quoted":
                                    text.SetText(value.value);
                                    break;
                                default:
                                    text.SetText(value.value);
                            }
                        }
                    });
                    shapes = [];
                    ShapeEdit.Canvas.shapes.getShapeByType("ImageRect", shapes);
                    lookup_value(shapes, result.content, {
                        text: function (image, value) {
                            image.SetPath(value.value);
                        }
                    });
                }, error_handler);
            };
            var SelectedArticle = function (id) {
                var result = false;
                if (ArticleService.current_article) {
                    result = (ArticleService.current_article._id == id);
                }
                return result;
            };
            var SelectLayout = function (id) {
                progress(true);
                LayoutService.Get(id, function (result) {
                    LayoutService.format = result.content.format;
                    ShapeEdit.Load(result.content.text);
                    //         EditClear();
                    // $scope.current_layout = LayoutService.current_layout;
                    setup_layout(result);
                    progress(false);
                    //       $scope.name = result.name;
                    $scope.userid = result.userid;
                    $scope.opened = true;
                }, error_handler);
            };
            var SelectedLayout = function (id) {
                var result = false;
                if (LayoutService.current_layout) {
                    result = (LayoutService.current_layout._id == id);
                }
                return result;
            };
            var Update = function () {
                if (LayoutService.current_layout) {
                    progress(true);
                    LayoutService.current_layout.content.text = ShapeEdit.Serialize();
                    LayoutService.Put(LayoutService.current_layout, function (result) {
                        $scope.current_layout = LayoutService.current_layout;
                        LayoutCount();
                        LayoutList();
                        progress(false);
                    }, error_handler);
                }
            };
            var UpdateAs = function () {
                var modalRegist = $uibModal.open({
                    controller: 'PlayerSaveAsDialogController',
                    templateUrl: '/layouts/player/dialogs/saveas_dialog',
                    resolve: {
                        items: $scope
                    }
                });
                modalRegist.result.then(function (layout) {
                    $scope.name = layout.name;
                    $scope.userid = layout.userid;
                    $scope.opened = true;
                }, function () {
                });
            };
            var Delete = function () {
                if (LayoutService.current_layout) {
                    var modalRegist = $uibModal.open({
                        controller: 'PlayerDeleteConfirmController',
                        templateUrl: '/layouts/player/dialogs/delete_confirm_dialog',
                        resolve: {
                            items: function () {
                                return LayoutService.current_layout;
                            }
                        }
                    });
                    modalRegist.result.then(function (content) {
                        progress(true);
                        LayoutService.Delete(function (result) {
                            LayoutService.current_layout = null;
                            $scope.current_layout = null;
                            ShapeEdit.Clear();
                            LayoutCount();
                            LayoutList();
                            clear_layout();
                            $scope.opened = false;
                            progress(false);
                        }, error_handler);
                    }, function () {
                    });
                }
            };
            var PrintPNG = function () {
                var width, height;
                ShapeEdit.Canvas.Snap();
                switch (LayoutService.format.layout) {
                    case "portrait":
                        width = LayoutService.format.size[0];
                        height = LayoutService.format.size[1];
                        break;
                    case "landscape":
                        width = LayoutService.format.size[1];
                        height = LayoutService.format.size[0];
                        break;
                    default:
                }
                Canvas2Image.saveAsPNG(ShapeEdit.CanvasElement, width, height);
            };
            var PrintPDF = function () {
                progress(true);
                LayoutService.current_layout.content.text = ShapeEdit.Serialize();
                LayoutService.current_layout.content.format = LayoutService.format;
                LayoutService.PrintPDF(LayoutService.current_layout, function (result) {
                    progress(false);
                    $window.location.href = "/layouts/download/pdf";
                }, error_handler);
            };
            var PrintSVG = function () {
                progress(true);
                LayoutService.current_layout.content.text = ShapeEdit.Serialize();
                LayoutService.PrintSVG(LayoutService.current_layout, function (result) {
                    progress(false);
                    $window.location.href = "/layouts/download/svg";
                }, error_handler);
            };
            var LayoutQuery = function () { return LayoutList; };
            ShapeEdit.onResizeWindow(function (wrapper, inner) {
            });
            var direction = -1;
            var Find = function (newValue) {
                if (newValue) {
                    ArticleService.query = { name: { $regex: newValue } };
                }
                else {
                    ArticleService.query = {};
                }
                ArticleService.Over(function (hasnext) {
                    $scope.over = !hasnext;
                });
                ArticleService.Under(function (hasprev) {
                    $scope.under = !hasprev;
                });
                ArticleList();
            };
            var Count = function () {
                ArticleService.Count(function (result) {
                    if (result) {
                        $scope.count = result;
                    }
                }, error_handler);
            };
            var Sort = function (name) {
                if (name) {
                    direction = -direction;
                    ArticleService.option.sort[name] = direction;
                }
                ArticleList();
            };
            var Next = function () {
                progress(true);
                ArticleService.Next(function (result) {
                    if (result) {
                        $scope.articles = result;
                    }
                    ArticleService.Over(function (hasnext) {
                        $scope.over = !hasnext;
                    });
                    ArticleService.Under(function (hasprev) {
                        $scope.under = !hasprev;
                    });
                    progress(false);
                }, error_handler);
            };
            var Prev = function () {
                progress(true);
                ArticleService.Prev(function (result) {
                    if (result) {
                        $scope.articles = result;
                    }
                    ArticleService.Over(function (hasnext) {
                        $scope.over = !hasnext;
                    });
                    ArticleService.Under(function (hasprev) {
                        $scope.under = !hasprev;
                    });
                    progress(false);
                }, error_handler);
            };
            $scope.Find = Find;
            $scope.Count = Count;
            $scope.Sort = Sort;
            $scope.Next = Next;
            $scope.Prev = Prev;
            $scope.opened = false;
            $scope.CreateFromTemplate = CreateFromTemplate;
            $scope.SelectArticle = SelectArticle;
            $scope.SelectedArticle = SelectedArticle;
            $scope.SelectLayout = SelectLayout;
            $scope.SelectedLayout = SelectedLayout;
            $scope.Update = Update;
            $scope.UpdateAs = UpdateAs;
            $scope.Delete = Delete;
            $scope.PrintPNG = PrintPNG;
            $scope.PrintPDF = PrintPDF;
            $scope.PrintSVG = PrintSVG;
            $scope.LayoutQuery = LayoutQuery;
            ArticleList();
            LayoutCount();
            LayoutList();
        }]);
    PlayerControllers.controller('PlayerCreateDialogController', ['$scope', '$log', '$uibModalInstance', '$uibModal', 'items', 'ShapeEdit', 'TemplateService', 'LayoutService',
        function ($scope, $log, $uibModalInstance, $uibModal, items, ShapeEdit, TemplateService, LayoutService) {
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
            var Count = function () {
                TemplateService.Count(function (result) {
                    $scope.count = result;
                }, error_handler);
            };
            var Query = function () {
                TemplateService.Query(function (value) {
                    $scope.layouts = value;
                }, error_handler);
            };
            var Next = function () {
                progress(true);
                TemplateService.Next(function (result) {
                    if (result) {
                        $scope.layouts = result;
                    }
                    progress(false);
                }, error_handler);
            };
            var Prev = function () {
                progress(true);
                TemplateService.Prev(function (result) {
                    if (result) {
                        $scope.layouts = result;
                    }
                    progress(false);
                }, error_handler);
            };
            var Create = function () {
                progress(true);
                var name = $scope.name;
                var namespace = $scope.namespace;
                var content = TemplateService.current_layout.content;
                LayoutService.Create(namespace, name, content, function (new_layout) {
                    LayoutService.format = new_layout.content.format;
                    ShapeEdit.Load(new_layout.content.text);
                    progress(false);
                    $uibModalInstance.close(new_layout);
                }, error_handler);
            };
            var SelectTemplate = function (id) {
                progress(true);
                TemplateService.Get(id, function (new_layout) {
                    var name = $scope.name;
                    TemplateService.current_layout = new_layout;
                    progress(false);
                }, error_handler);
            };
            var SelectedTemplate = function (id) {
                var result = false;
                if (TemplateService.current_layout) {
                    result = (TemplateService.current_layout._id == id);
                }
                return result;
            };
            var HasSelectedTemplate = function () {
                return (TemplateService.current_layout);
            };
            var hide = function () {
                $uibModalInstance.close();
            };
            var cancel = function () {
                $uibModalInstance.dismiss();
            };
            var LayoutQuery = function () { return Query; };
            $scope.Next = Next;
            $scope.Prev = Prev;
            $scope.Create = Create;
            $scope.SelectTemplate = SelectTemplate;
            $scope.SelectedTemplate = SelectedTemplate;
            $scope.HasSelectedTemplate = HasSelectedTemplate;
            $scope.hide = hide;
            $scope.cancel = cancel;
            $scope.LayoutQuery = function () { return Query; };
            Count();
            Query();
        }]);
    PlayerControllers.controller('PlayerOpenDialogController', ['$scope', '$log', '$uibModalInstance', '$uibModal', 'items', 'ShapeEdit', 'LayoutService',
        function ($scope, $log, $uibModalInstance, $uibModal, items, ShapeEdit, LayoutService) {
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
            var Count = function () {
                LayoutService.Count(function (result) {
                    if (result) {
                        $scope.count = result;
                    }
                }, error_handler);
            };
            var Query = function () {
                progress(true);
                LayoutService.Query(function (result) {
                    if (result) {
                        $scope.layouts = result;
                    }
                    progress(false);
                }, error_handler);
            };
            var Next = function () {
                if (!$scope.progress) {
                    progress(true);
                    LayoutService.Next(function (result) {
                        if (result) {
                            $scope.layouts = result;
                        }
                        progress(false);
                    }, error_handler);
                }
            };
            var Prev = function () {
                progress(true);
                LayoutService.Prev(function (result) {
                    if (result) {
                        $scope.layouts = result;
                    }
                    progress(false);
                }, error_handler);
            };
            var Get = function (layout) {
                progress(true);
                LayoutService.Get(layout._id, function (result) {
                    LayoutService.format = result.content.format;
                    ShapeEdit.Load(result.content.text);
                    progress(false);
                    $uibModalInstance.close(result);
                }, error_handler);
            };
            var hide = function () {
                $uibModalInstance.close();
            };
            var cancel = function () {
                $uibModalInstance.dismiss();
            };
            $scope.Next = Next;
            $scope.Prev = Prev;
            $scope.Get = Get;
            $scope.hide = hide;
            $scope.cancel = cancel;
            $scope.LayoutQuery = Query;
            Count();
            Query();
        }]);
    PlayerControllers.controller('PlayerSaveAsDialogController', ['$scope', '$log', '$uibModalInstance', 'LayoutService', 'ShapeEdit', 'items',
        function ($scope, $log, $uibModalInstance, LayoutService, ShapeEdit, items) {
            var error_handler = function (code, message) {
                progress(false);
                $scope.message = message;
                $log.error(message);
            };
            var progress = function (value) {
                $scope.$emit('progress', value);
            };
            $scope.$on('progress', function (event, value) {
                items.progress = value;
            });
            $scope.hide = function () {
                $uibModalInstance.close();
            };
            $scope.cancel = function () {
                $uibModalInstance.dismiss();
            };
            $scope.answer = function () {
                progress(true);
                if (LayoutService.current_layout) {
                    progress(true);
                    LayoutService.current_layout.content.text = ShapeEdit.Serialize();
                    LayoutService.PutAs($scope.title, LayoutService.current_layout, function (result) {
                        progress(false);
                        $uibModalInstance.close({});
                    }, error_handler);
                }
            };
        }]);
    PlayerControllers.controller('PlayerDeleteConfirmController', ['$scope', '$uibModalInstance', 'items',
        function ($scope, $uibModalInstance, items) {
            $scope.title = items.content.title;
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
})(PlayerControllersModule || (PlayerControllersModule = {}));
//# sourceMappingURL=layouts_player_controllers.js.map