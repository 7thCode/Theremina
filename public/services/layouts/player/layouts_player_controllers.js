/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
/// <reference path="../../../systems/common/shape_edit/shape_edit.ts" />
/// <reference path="../../../systems/common/shape_edit/server_canvas.ts" />
/// <reference path="../../../systems/common/shape_edit/adaptor.ts" />
"use strict";
let PlayerControllers = angular.module('PlayerControllers', ['ui.bootstrap']);
PlayerControllers.controller('PlayerController', ["$scope", '$document', '$log', '$window', "$compile", '$uibModal', 'ShapeEdit', 'HtmlEdit', 'LayoutService', 'ArticleService',
    ($scope, $document, $log, $window, $compile, $uibModal, ShapeEdit, HtmlEdit, LayoutService, ArticleService) => {
        //   let short = 525;
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
        $document.on('drop dragover', (e) => {
            e.stopPropagation();
            e.preventDefault();
        });
        let watchChange = (_scope, $scope, id, events) => {
            $scope.$watch(id, (newValue, oldValue) => {
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
                            let a = e;
                        }
                    }
                }
            });
        };
        let create_dynamic_target_elements = (shapes, callbacks) => {
            let result = "";
            let _scope = { id: "", canvas: ShapeEdit.Canvas, document: null, shapes: shapes, element: null, newValue: "", oldValue: "", setValue: null };
            _.forEach(shapes, (shape) => {
                let id = shape.ID();
                let property = shape.Property();
                _.forEach(property.description["field"], (field_description, key) => {
                    let label = field_description.label;
                    let type = field_description.type;
                    let validate = field_description.validate;
                    let options = field_description.options;
                    let events = field_description.events;
                    let mode = field_description.mode;
                    if (mode == "dynamic") {
                        let callback = callbacks[key];
                        let text = property.text;
                        var field = [];
                        let control_id = id + "A" + key;
                        switch (type) {
                            case "text":
                                field = [{
                                        "name": "div", "type": "element",
                                        "_$": { "class": "form-group" },
                                        "@": [
                                            {
                                                "name": "label", "type": "element",
                                                "_$": { "for": control_id },
                                                "@": label,
                                            },
                                            {
                                                "name": "span", "type": "element",
                                                "_$": { "ng-messages": "validate." + control_id + ".$error" },
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
                                                "_$": { "class": "form-control no-zoom", "id": control_id, "ng-model": control_id, "type": "text", "name": control_id, "value": text, "ng-maxlength": validate["ng-maxlength"], "ng-minlength": validate["ng-minlength"], "required": validate["required"] },
                                            }
                                        ]
                                    }];
                                watchChange(_scope, $scope, control_id, events);
                                break;
                            case "textarea":
                                field = [{
                                        "name": "div", "type": "element",
                                        "_$": { "class": "form-group" },
                                        "@": [
                                            {
                                                "name": "label", "type": "element",
                                                "_$": { "for": control_id },
                                                "@": label,
                                            },
                                            {
                                                "name": "span", "type": "element",
                                                "_$": { "ng-messages": "validate." + control_id + ".$error" },
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
                                                "_$": { "class": "form-control no-zoom", "id": control_id, "ng-model": control_id, "type": "text", "name": control_id, "ng-maxlength": validate["ng-maxlength"], "ng-minlength": validate["ng-minlength"], "required": validate["required"] }
                                            }
                                        ]
                                    }];
                                watchChange(_scope, $scope, control_id, events);
                                break;
                            case "select":
                                let options_model_name = id + "_options";
                                $scope[options_model_name] = options;
                                field = [{
                                        "name": "div", "type": "element",
                                        "_$": { "class": "form-group" },
                                        "@": [
                                            {
                                                "name": "label", "type": "element",
                                                "_$": { "for": control_id },
                                                "@": label,
                                            },
                                            {
                                                "name": "select", "type": "element",
                                                "_$": { "class": "form-control", "id": control_id, "ng-init": id + " = " + options_model_name + "[0]", "ng-model": control_id, "ng-options": "option for option in " + options_model_name, "name": id, "required": validate["required"] }
                                            }
                                        ]
                                    }];
                                $scope.$watch(id, (newValue, oldValue) => {
                                    if (events) {
                                        if (events.onChange != "") {
                                            try {
                                                _scope.id = id;
                                                _scope.document = document;
                                                _scope.element = document.getElementById(id);
                                                _scope.newValue = newValue;
                                                _scope.oldValue = oldValue;
                                                _scope.setValue = (id) => {
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
                                                let a = e;
                                            }
                                        }
                                    }
                                });
                                break;
                            case "radio":
                                let radio_elements = [];
                                _.forEach(options, (label) => {
                                    let radio_element = {
                                        "name": "div", "type": "element",
                                        "_$": { "class": "radio" },
                                        "@": [
                                            {
                                                "name": "label", "type": "element",
                                                "_$": {},
                                                "@": [
                                                    {
                                                        "name": "input", "type": "element",
                                                        "_$": { type: "radio", id: label, "ng-model": control_id, value: label },
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
                                    radio_elements.push(radio_element);
                                });
                                field = [{
                                        "name": "div", "type": "element",
                                        "_$": { "class": "form-group" },
                                        "@": radio_elements
                                    }];
                                watchChange(_scope, $scope, control_id, events);
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
                                                "_$": { "for": control_id },
                                                "@": label,
                                            },
                                            {
                                                "name": "input", "type": "element",
                                                "_$": { "class": "form-control no-zoom", "id": control_id, "ng-model": control_id, "type": "color", "name": control_id, "value": text },
                                            }
                                        ]
                                    }];
                                watchChange(_scope, $scope, control_id, events);
                                break;
                            default:
                        }
                        result += HtmlEdit.toHtml(field, "");
                        $scope.$watch(control_id, (value) => {
                            if (value) {
                                let element = ShapeEdit.Canvas.shapes.getShapeById(id);
                                if (element) {
                                    callback(element, value);
                                    ShapeEdit.Canvas.Draw();
                                }
                            }
                        });
                    }
                });
            });
            return result;
        };
        let lookup_value = (shapes, values, callbacks) => {
            if (values) {
                _.forEach(shapes, (shape) => {
                    let id = shape.ID();
                    let property = shape.Property();
                    _.forEach(property.description["field"], (field_description, key) => {
                        let lookup = field_description.lookup;
                        let type = field_description.type;
                        //  let validate = field_description.validate;
                        //  let options = field_description.options;
                        let mode = field_description.mode;
                        if (mode == "lookup") {
                            let callback = callbacks[key];
                            switch (type) {
                                case "text":
                                case "textarea":
                                    let text = ShapeEdit.Canvas.shapes.getShapeById(id);
                                    if (text) {
                                        let value = values[lookup];
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
        let setup_layout = (layout) => {
            LayoutService.current_layout = layout;
            $scope.current_layout = LayoutService.current_layout;
            let shapes = [];
            ShapeEdit.Canvas.shapes.getShapeByType("Text", shapes);
            let elements_text = create_dynamic_target_elements(shapes, {
                text: (text, value) => {
                    text.SetText(value);
                },
                color: (shape, value) => {
                    let color = new ShapeEdit.RGBAColor(0, 0, 0, 1);
                    color.SetRGB(value);
                    shape.SetFillColor(color);
                }
            });
            shapes = [];
            ShapeEdit.Canvas.shapes.getShapeByTypes(["Box", "Oval", "Polygon", "Bezier", "Shapes"], shapes);
            elements_text += create_dynamic_target_elements(shapes, {
                color: (shape, value) => {
                    let color = new ShapeEdit.RGBAColor(0, 0, 0, 1);
                    color.SetRGB(value);
                    shape.SetFillColor(color);
                }
            });
            shapes = [];
            ShapeEdit.Canvas.shapes.getShapeByType("ImageRect", shapes);
            elements_text += create_dynamic_target_elements(shapes, {
                text: (image, value) => {
                    image.SetPath(value);
                }
            });
            let elements = angular.element('.input-root').html(elements_text);
            $compile(elements.contents())($scope);
            // lookup
            if (ArticleService.current_article) {
                shapes = [];
                ShapeEdit.Canvas.shapes.getShapeByType("Text", shapes);
                lookup_value(shapes, ArticleService.current_article.content, {
                    text: (text, value) => {
                        switch (value.type) {
                            case "array":
                                let s = "";
                                let delimiter = "";
                                _.forEach(value.value, (element) => {
                                    s += delimiter + element;
                                    delimiter = ", ";
                                });
                                text.SetText(s);
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
                    text: (image, value) => {
                        image.SetPath(value.value);
                    }
                });
            }
        };
        let clear_layout = () => {
            let elements = angular.element('.input-root').html("");
            $compile(elements.contents())($scope);
        };
        let CreateFromTemplate = () => {
            let modalRegist = $uibModal.open({
                controller: 'PlayerCreateDialogController',
                templateUrl: '/layouts/player/dialogs/create_dialog',
                resolve: {
                    items: () => {
                    }
                }
            });
            modalRegist.result.then((layout) => {
                setup_layout(layout);
                LayoutCount();
                LayoutList();
                $scope.opened = true;
            }, () => {
            });
        };
        let ArticleList = () => {
            ArticleService.Query((result) => {
                $scope.articles = result;
            }, error_handler);
        };
        let LayoutCount = () => {
            LayoutService.Count((result) => {
                $scope.count = result;
            }, error_handler);
        };
        let LayoutList = () => {
            progress(true);
            LayoutService.Query((result) => {
                if (result) {
                    $scope.layouts = result;
                }
                ArticleService.Over((hasnext) => { $scope.over = !hasnext; });
                ArticleService.Under((hasprev) => { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        // Lookup Text, Image
        let SelectArticle = (id) => {
            ArticleService.Get(id, (result) => {
                ArticleService.current_article = result;
                $scope.current_article = result;
                let shapes = [];
                ShapeEdit.Canvas.shapes.getShapeByType("Text", shapes);
                lookup_value(shapes, result.content, {
                    text: (text, value) => {
                        switch (value.type) {
                            case "array":
                                let s = "";
                                let delimiter = "";
                                _.forEach(value.value, (element) => {
                                    s += delimiter + element;
                                    delimiter = ", ";
                                });
                                text.SetText(s);
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
                    text: (image, value) => {
                        image.SetPath(value.value);
                    }
                });
            }, error_handler);
        };
        let SelectedArticle = (id) => {
            let result = false;
            if (ArticleService.current_article) {
                result = (ArticleService.current_article._id == id);
            }
            return result;
        };
        let SelectLayout = (id) => {
            progress(true);
            LayoutService.Get(id, (result) => {
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
        let SelectedLayout = (id) => {
            let result = false;
            if (LayoutService.current_layout) {
                result = (LayoutService.current_layout._id == id);
            }
            return result;
        };
        let Update = () => {
            if (LayoutService.current_layout) {
                progress(true);
                LayoutService.current_layout.content.text = ShapeEdit.Serialize();
                LayoutService.Put(LayoutService.current_layout, (result) => {
                    $scope.current_layout = LayoutService.current_layout;
                    LayoutCount();
                    LayoutList();
                    progress(false);
                }, error_handler);
            }
        };
        let UpdateAs = () => {
            let modalRegist = $uibModal.open({
                controller: 'PlayerSaveAsDialogController',
                templateUrl: '/layouts/player/dialogs/saveas_dialog',
                resolve: {
                    items: $scope
                }
            });
            modalRegist.result.then((layout) => {
                $scope.name = layout.name;
                $scope.userid = layout.userid;
                $scope.opened = true;
            }, () => {
            });
        };
        let Delete = () => {
            if (LayoutService.current_layout) {
                let modalRegist = $uibModal.open({
                    controller: 'PlayerDeleteConfirmController',
                    templateUrl: '/layouts/player/dialogs/delete_confirm_dialog',
                    resolve: {
                        items: () => {
                            return LayoutService.current_layout;
                        }
                    }
                });
                modalRegist.result.then((content) => {
                    progress(true);
                    LayoutService.Delete((result) => {
                        LayoutService.current_layout = null;
                        $scope.current_layout = null;
                        ShapeEdit.Clear();
                        LayoutCount();
                        LayoutList();
                        clear_layout();
                        $scope.opened = false;
                        progress(false);
                    }, error_handler);
                }, () => {
                });
            }
        };
        let PrintPNG = () => {
            let width, height;
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
        let PrintPDF = () => {
            progress(true);
            LayoutService.current_layout.content.text = ShapeEdit.Serialize();
            LayoutService.current_layout.content.format = LayoutService.format;
            LayoutService.PrintPDF(LayoutService.current_layout, (result) => {
                progress(false);
                $window.location.href = "/layouts/download/pdf";
            }, error_handler);
        };
        let PrintSVG = () => {
            progress(true);
            LayoutService.current_layout.content.text = ShapeEdit.Serialize();
            LayoutService.PrintSVG(LayoutService.current_layout, (result) => {
                progress(false);
                $window.location.href = "/layouts/download/svg";
            }, error_handler);
        };
        let LayoutQuery = () => LayoutList;
        ShapeEdit.onResizeWindow((wrapper, inner) => {
        });
        let direction = -1;
        let Find = (newValue) => {
            if (newValue) {
                ArticleService.query = { name: { $regex: newValue } };
            }
            else {
                ArticleService.query = {};
            }
            ArticleService.Over((hasnext) => { $scope.over = !hasnext; });
            ArticleService.Under((hasprev) => { $scope.under = !hasprev; });
            ArticleList();
        };
        let Count = () => {
            ArticleService.Count((result) => {
                if (result) {
                    $scope.count = result;
                }
            }, error_handler);
        };
        let Sort = (name) => {
            if (name) {
                direction = -direction;
                ArticleService.option.sort[name] = direction;
            }
            ArticleList();
        };
        let Next = () => {
            progress(true);
            ArticleService.Next((result) => {
                if (result) {
                    $scope.articles = result;
                }
                ArticleService.Over((hasnext) => { $scope.over = !hasnext; });
                ArticleService.Under((hasprev) => { $scope.under = !hasprev; });
                progress(false);
            }, error_handler);
        };
        let Prev = () => {
            progress(true);
            ArticleService.Prev((result) => {
                if (result) {
                    $scope.articles = result;
                }
                ArticleService.Over((hasnext) => { $scope.over = !hasnext; });
                ArticleService.Under((hasprev) => { $scope.under = !hasprev; });
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
    ($scope, $log, $uibModalInstance, $uibModal, items, ShapeEdit, TemplateService, LayoutService) => {
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
        let Count = () => {
            TemplateService.Count((result) => {
                $scope.count = result;
            }, error_handler);
        };
        let Query = () => {
            TemplateService.Query((value) => {
                $scope.layouts = value;
            }, error_handler);
        };
        let Next = () => {
            progress(true);
            TemplateService.Next((result) => {
                if (result) {
                    $scope.layouts = result;
                }
                progress(false);
            }, error_handler);
        };
        let Prev = () => {
            progress(true);
            TemplateService.Prev((result) => {
                if (result) {
                    $scope.layouts = result;
                }
                progress(false);
            }, error_handler);
        };
        let Create = () => {
            progress(true);
            let name = $scope.name;
            let namespace = $scope.namespace;
            let content = TemplateService.current_layout.content;
            LayoutService.Create(namespace, name, content, (new_layout) => {
                LayoutService.format = new_layout.content.format;
                ShapeEdit.Load(new_layout.content.text);
                progress(false);
                $uibModalInstance.close(new_layout);
            }, error_handler);
        };
        let SelectTemplate = (id) => {
            progress(true);
            TemplateService.Get(id, (new_layout) => {
                let name = $scope.name;
                TemplateService.current_layout = new_layout;
                progress(false);
            }, error_handler);
        };
        let SelectedTemplate = (id) => {
            let result = false;
            if (TemplateService.current_layout) {
                result = (TemplateService.current_layout._id == id);
            }
            return result;
        };
        let HasSelectedTemplate = () => {
            return (TemplateService.current_layout);
        };
        let hide = () => {
            $uibModalInstance.close();
        };
        let cancel = () => {
            $uibModalInstance.dismiss();
        };
        let LayoutQuery = () => Query;
        $scope.Next = Next;
        $scope.Prev = Prev;
        $scope.Create = Create;
        $scope.SelectTemplate = SelectTemplate;
        $scope.SelectedTemplate = SelectedTemplate;
        $scope.HasSelectedTemplate = HasSelectedTemplate;
        $scope.hide = hide;
        $scope.cancel = cancel;
        $scope.LayoutQuery = () => Query;
        Count();
        Query();
    }]);
PlayerControllers.controller('PlayerOpenDialogController', ['$scope', '$log', '$uibModalInstance', '$uibModal', 'items', 'ShapeEdit', 'LayoutService',
    ($scope, $log, $uibModalInstance, $uibModal, items, ShapeEdit, LayoutService) => {
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
        let Count = () => {
            LayoutService.Count((result) => {
                if (result) {
                    $scope.count = result;
                }
            }, error_handler);
        };
        let Query = () => {
            progress(true);
            LayoutService.Query((result) => {
                if (result) {
                    $scope.layouts = result;
                }
                progress(false);
            }, error_handler);
        };
        let Next = () => {
            if (!$scope.progress) {
                progress(true);
                LayoutService.Next((result) => {
                    if (result) {
                        $scope.layouts = result;
                    }
                    progress(false);
                }, error_handler);
            }
        };
        let Prev = () => {
            progress(true);
            LayoutService.Prev((result) => {
                if (result) {
                    $scope.layouts = result;
                }
                progress(false);
            }, error_handler);
        };
        let Get = (layout) => {
            progress(true);
            LayoutService.Get(layout._id, (result) => {
                LayoutService.format = result.content.format;
                ShapeEdit.Load(result.content.text);
                progress(false);
                $uibModalInstance.close(result);
            }, error_handler);
        };
        let hide = () => {
            $uibModalInstance.close();
        };
        let cancel = () => {
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
    ($scope, $log, $uibModalInstance, LayoutService, ShapeEdit, items) => {
        let error_handler = (code, message) => {
            progress(false);
            $scope.message = message;
            $log.error(message);
        };
        let progress = (value) => {
            $scope.$emit('progress', value);
        };
        $scope.$on('progress', (event, value) => {
            items.progress = value;
        });
        $scope.hide = () => {
            $uibModalInstance.close();
        };
        $scope.cancel = () => {
            $uibModalInstance.dismiss();
        };
        $scope.answer = () => {
            progress(true);
            if (LayoutService.current_layout) {
                progress(true);
                LayoutService.current_layout.content.text = ShapeEdit.Serialize();
                LayoutService.PutAs($scope.title, LayoutService.current_layout, (result) => {
                    progress(false);
                    $uibModalInstance.close({});
                }, error_handler);
            }
        };
    }]);
PlayerControllers.controller('PlayerDeleteConfirmController', ['$scope', '$uibModalInstance', 'items',
    ($scope, $uibModalInstance, items) => {
        $scope.title = items.content.title;
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
//# sourceMappingURL=layouts_player_controllers.js.map