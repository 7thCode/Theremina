/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var FormBuilderControllersModule;
(function (FormBuilderControllersModule) {
    var FormBuilderControllers = angular.module('FormBuilderControllers', ['ui.ace']);
    var RGBAColor = /** @class */ (function () {
        function RGBAColor(r, g, b, a) {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
        }
        RGBAColor.prototype.RGB = function () {
            return "#" + ("0" + this.r.toString(16)).slice(-2) + ("0" + this.g.toString(16)).slice(-2) + ("0" + this.b.toString(16)).slice(-2);
        };
        RGBAColor.prototype.RGBA = function () {
            return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + this.a + ")";
        };
        RGBAColor.prototype.SetRGB = function (color) {
            if (color) {
                if (color.length === 6) {
                    this.r = parseInt(color.slice(0, 2), 16);
                    this.g = parseInt(color.slice(2, 4), 16);
                    this.b = parseInt(color.slice(4, 6), 16);
                    //this._a = parseInt(color.slice(6, 8), 16);
                }
                else if (color[0] === "#") {
                    this.r = parseInt(color.slice(1, 3), 16);
                    this.g = parseInt(color.slice(3, 5), 16);
                    this.b = parseInt(color.slice(5, 7), 16);
                    //this._a = parseInt(color.slice(7, 9), 16);
                }
            }
        };
        RGBAColor.Check = function (a) {
            var result = 0;
            if (a > 255) {
                result = 255;
            }
            if (a < 0) {
                result = 0;
            }
            return result;
        };
        ;
        RGBAColor.prototype.Lighten = function (n) {
            var check = function (a, b) {
                var result = a + b;
                if (a > 255) {
                    result = 255;
                }
                return result;
            };
            return new RGBAColor(check(this.r, n), check(this.g, n), check(this.b, n), this.a);
        };
        RGBAColor.prototype.Darken = function (n) {
            var check = function (a, b) {
                var result = a - b;
                if (a < 0) {
                    result = 0;
                }
                return result;
            };
            return new RGBAColor(check(this.r, n), check(this.g, n), check(this.b, n), this.a);
        };
        RGBAColor.prototype.Invert = function () {
            return new RGBAColor(255 - this.r, 255 - this.g, 255 - this.b, this.a);
        };
        return RGBAColor;
    }());
    var key_escape = /^(?!.*(\"|\\|\/|\.)).+$/;
    var tag_escape = /^(?!.*\u3040-\u30ff).+$/;
    var class_escape = /^(?!.*\u3040-\u30ff).+$/;
    FormBuilderControllers.controller('FormBuilderController', ["$scope", "$document", "$log", "$compile", "$uibModal", "FormBuilderService", "ElementsService",
        function ($scope, $document, $log, $compile, $uibModal, FormBuilderService, ElementsService) {
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
            $document.on('drop dragover', function (e) {
                e.stopPropagation();
                e.preventDefault();
            });
            window.addEventListener('beforeunload', function (e) {
                if ($scope.opened) {
                    e.returnValue = '';
                    return '';
                }
            }, false);
            var pages = [
                {
                    contents: []
                }
            ];
            var mark = document.getElementById("mark");
            mark.style.setProperty('display', 'none');
            mark.style.backgroundColor = 'rgba(100,100,100,0.5)';
            mark.style.position = 'absolute';
            window.addEventListener('resize', function (event) {
                redraw_select();
            });
            var editor = null;
            $scope.aceLoaded = function (_editor) {
                editor = _editor;
                editor.setTheme("ace/theme/chrome");
                $scope.theme = 'chrome';
                $scope.mode = 'html';
                $scope.source = '';
                editor.setOptions({
                    showGutter: true,
                    enableBasicAutocompletion: true,
                    enableSnippets: true,
                    enableLiveAutocompletion: true
                });
            };
            $scope.aceChanged = function (e) {
                redraw_select();
            };
            var changeElementContents = function (contents) {
                $scope.contents = contents;
                redraw_select();
            };
            var absolute_position = function (target_element) {
                var left = 0;
                var top = 0;
                var element = target_element;
                while (element) {
                    left += element.offsetLeft;
                    top += element.offsetTop;
                    element = element.offsetParent;
                }
                return { left: left, top: top };
            };
            var redraw_select = function () {
                if (FormBuilderService.Selected()) {
                    var selected_element = FormBuilderService.Selected();
                    var root_element = document.getElementById("box");
                    var target_element = document.getElementById(selected_element.id);
                    if (target_element) {
                        var root_position = absolute_position(root_element);
                        var target_position = absolute_position(target_element);
                        var select_reft = target_position.left - root_position.left;
                        var select_top = target_position.top - root_position.top;
                        var select_width = target_element.offsetWidth;
                        var select_height = target_element.offsetHeight;
                        mark.innerHTML = "<div style='float:right'>" + target_element.id + "</div>";
                        mark.style.top = "" + select_top + "px";
                        mark.style.left = "" + select_reft + "px";
                        mark.style.width = "" + select_width + "px";
                        mark.style.height = "" + select_height + "px";
                        mark.style.setProperty('display', 'block');
                    }
                }
                else {
                    mark.style.setProperty('display', 'none');
                }
                $scope.current_page = FormBuilderService.current_page;
            };
            var ElementOpen = function (id) {
                var element = FormBuilderService.Find(id);
                if (element.length == 1) {
                    var modalRegist = $uibModal.open({
                        controller: 'FormBuilderEditElementDialogController',
                        templateUrl: '/forms/dialogs/elements/edit_element_dialog',
                        resolve: {
                            items: element[0]
                        }
                    });
                }
            };
            var ElementSelect = function (id) {
                FormBuilderService.Select(id, function (element) {
                    $scope.selected_element_type = element.type;
                    var selected_element = FormBuilderService.Selected();
                    var target_element = document.getElementById(selected_element.id); // $event.target;
                    $scope.newid = element.id;
                    var style = element.attributes.style;
                    $scope.items = [];
                    if (style) {
                        $scope.items = style;
                    }
                    if ((typeof element.contents) == 'string') {
                        $scope.tab = { element_contents: element.contents };
                    }
                    $scope.attributes = element.attributes;
                    FormBuilderService.Draw(function (event) {
                        if (event.name == "exit") {
                            redraw_select();
                        }
                    });
                }, function (element) {
                    redraw_select();
                    $scope.items = [];
                });
            };
            var ElementSelected = function (id) {
                var result = false;
                var selected = FormBuilderService.Selected();
                if (selected) {
                    result = (selected.id == id);
                }
                return result;
            };
            var edit = function ($event, id) {
                $event.stopPropagation();
                $event.preventDefault();
                ElementSelect(id);
            };
            var deselect = function () {
                FormBuilderService.Deselect(function (selected) {
                });
                redraw_select();
            };
            var up = function () {
                FormBuilderService.UpElement();
                redraw_select();
            };
            var down = function () {
                FormBuilderService.DownElement();
                redraw_select();
            };
            var addTag = function () {
                var modalRegist = $uibModal.open({
                    controller: 'FormBuilderAddTagDialogController',
                    templateUrl: '/forms/dialogs/elements/add_tag_dialog',
                    resolve: {
                        items: null
                    }
                });
                modalRegist.result.then(function (dialog_scope) {
                    var new_tag = ElementsService.Tag(dialog_scope.tag, {
                        class: "a",
                        style: { "border-style": "solid", "border-color": "black", "border-width": "1px;" }
                    });
                    FormBuilderService.AddElement(new_tag);
                }, function () {
                });
            };
            var addDiv = function () {
                var modalRegist = $uibModal.open({
                    controller: 'FormBuilderAddDivDialogController',
                    templateUrl: '/forms/dialogs/elements/add_div_dialog',
                    resolve: {
                        items: null
                    }
                });
                modalRegist.result.then(function (dialog_scope) {
                    FormBuilderService.AddElement(ElementsService.Div(dialog_scope.klass));
                }, function () {
                });
            };
            var addForm = function () {
                var add_field = function (label) {
                    var parent_id = FormBuilderService.ParentId("root");
                    var id = FormBuilderService.CreateId("root");
                    var new_form = {
                        kind: "control",
                        type: "form",
                        id: id,
                        elements: [
                            {
                                type: "form",
                                id: "form",
                                parent: "root",
                                label: "",
                                attributes: { name: "validate" },
                                contents: [],
                                events: {}
                            }
                        ]
                    };
                    FormBuilderService.AddElement(new_form);
                };
                var modalRegist = $uibModal.open({
                    controller: 'FormBuilderAddStyleDialogController',
                    templateUrl: '/forms/dialogs/add_style_dialog',
                    resolve: {
                        items: null
                    }
                });
                modalRegist.result.then(function (dialog_scope) {
                    add_field(dialog_scope.key);
                }, function () {
                });
            };
            var addField = function () {
                var modalRegist = $uibModal.open({
                    controller: 'FormBuilderAddFieldDialogController',
                    templateUrl: '/forms/dialogs/elements/add_field_dialog',
                    resolve: {
                        items: null
                    }
                });
                modalRegist.result.then(function (dialog_scope) {
                    var validator = {
                        min: {
                            value: dialog_scope.min.value,
                            message: dialog_scope.min.message
                        },
                        max: {
                            value: dialog_scope.max.value,
                            message: dialog_scope.max.message
                        },
                        pattern: {
                            value: dialog_scope.pattern.value,
                            message: dialog_scope.pattern.message
                        },
                        required: {
                            value: dialog_scope.required.value,
                            message: dialog_scope.required.message
                        }
                    };
                    FormBuilderService.AddElement(ElementsService.Field(dialog_scope.key, validator));
                }, function () {
                });
            };
            var addHtmlField = function () {
                var modalRegist = $uibModal.open({
                    controller: 'FormBuilderAddFieldDialogController',
                    templateUrl: '/forms/dialogs/elements/add_field_dialog',
                    resolve: {
                        items: null
                    }
                });
                modalRegist.result.then(function (dialog_scope) {
                    var validator = {
                        min: {
                            value: dialog_scope.min.value,
                            message: dialog_scope.min.message
                        },
                        max: {
                            value: dialog_scope.max.value,
                            message: dialog_scope.max.message
                        },
                        pattern: {
                            value: dialog_scope.pattern.value,
                            message: dialog_scope.pattern.message
                        },
                        required: {
                            value: dialog_scope.required.value,
                            message: dialog_scope.required.message
                        }
                    };
                    FormBuilderService.AddElement(ElementsService.HtmlField(dialog_scope.key, validator));
                }, function () {
                });
            };
            var addTextArea = function () {
                var modalRegist = $uibModal.open({
                    controller: 'FormBuilderAddTextAreaDialogController',
                    templateUrl: '/forms/dialogs/elements/add_textarea_dialog',
                    resolve: {
                        items: null
                    }
                });
                modalRegist.result.then(function (dialog_scope) {
                    var validator = {
                        min: { value: dialog_scope.min.value, message: dialog_scope.min.message },
                        max: { value: dialog_scope.max.value, message: dialog_scope.max.message },
                        required: { value: dialog_scope.required.value, message: dialog_scope.required.message }
                    };
                    FormBuilderService.AddElement(ElementsService.TextArea(dialog_scope.key, validator));
                }, function () {
                });
            };
            var addNumber = function () {
                var modalRegist = $uibModal.open({
                    controller: 'FormBuilderAddNumberDialogController',
                    templateUrl: '/forms/dialogs/elements/add_number_dialog',
                    resolve: {
                        items: null
                    }
                });
                modalRegist.result.then(function (dialog_scope) {
                    var validator = {
                        min: { value: dialog_scope.min.value, message: "" },
                        max: { value: dialog_scope.max.value, message: "" },
                        step: { value: dialog_scope.step.value, message: "" }
                    };
                    FormBuilderService.AddElement(ElementsService.Number(dialog_scope.key, validator));
                }, function () {
                });
            };
            var addDate = function () {
                var modalRegist = $uibModal.open({
                    controller: 'FormBuilderAddFieldDialogController',
                    templateUrl: '/forms/dialogs/elements/add_field_dialog',
                    resolve: {
                        items: null
                    }
                });
                modalRegist.result.then(function (dialog_scope) {
                    var validator = {
                        min: {
                            value: dialog_scope.min.value,
                            message: dialog_scope.min.message
                        },
                        max: {
                            value: dialog_scope.max.value,
                            message: dialog_scope.max.message
                        },
                        pattern: {
                            value: dialog_scope.pattern.value,
                            message: dialog_scope.pattern.message
                        },
                        required: {
                            value: dialog_scope.required.value,
                            message: dialog_scope.required.message
                        }
                    };
                    FormBuilderService.AddElement(ElementsService.Date(dialog_scope.key, validator));
                }, function () {
                });
            };
            var addHtml = function () {
                var modalRegist = $uibModal.open({
                    controller: 'FormBuilderAddTextAreaDialogController',
                    templateUrl: '/forms/dialogs/elements/add_textarea_dialog',
                    resolve: {
                        items: null
                    }
                });
                modalRegist.result.then(function (dialog_scope) {
                    var validator = {
                        min: { value: dialog_scope.min.value, message: dialog_scope.min.message },
                        max: { value: dialog_scope.max.value, message: dialog_scope.max.message },
                        required: { value: dialog_scope.required.value, message: dialog_scope.required.message }
                    };
                    FormBuilderService.AddElement(ElementsService.HtmlElement(dialog_scope.key, validator));
                }, function () {
                });
            };
            var addImg = function () {
                var modalRegist = $uibModal.open({
                    controller: 'FormBuilderAddImgDialogController',
                    templateUrl: '/forms/dialogs/elements/add_img_dialog',
                    resolve: {
                        items: null
                    }
                });
                modalRegist.result.then(function (dialog_scope) {
                    var property = {};
                    FormBuilderService.AddElement(ElementsService.Img(dialog_scope.key, property));
                }, function () {
                });
            };
            var addSelect = function () {
                var modalRegist = $uibModal.open({
                    controller: 'FormBuilderAddSelectDialogController',
                    templateUrl: '/forms/dialogs/elements/add_select_dialog',
                    resolve: {
                        items: null
                    }
                });
                modalRegist.result.then(function (dialog_scope) {
                    var validator = { contents: dialog_scope.contents };
                    if (dialog_scope.required) {
                        validator = { contents: dialog_scope.contents, required: { value: true, message: dialog_scope.required.message } };
                    }
                    FormBuilderService.AddElement(ElementsService.Select(dialog_scope.key, validator));
                }, function () {
                });
            };
            var addChack = function () {
                var modalRegist = $uibModal.open({
                    controller: 'FormBuilderAddImgDialogController',
                    templateUrl: '/forms/dialogs/elements/add_img_dialog',
                    resolve: {
                        items: null
                    }
                });
                modalRegist.result.then(function (dialog_scope) {
                    var property = {};
                    FormBuilderService.AddElement(ElementsService.Check(dialog_scope.key, property));
                }, function () {
                });
            };
            var addRadio = function () {
                var parent_id = FormBuilderService.ParentId("root");
                var id = FormBuilderService.CreateId("root");
                var new_field = {
                    kind: "control",
                    type: "radio",
                    id: id,
                    elements: [
                        {
                            type: "div",
                            id: id,
                            parent: parent_id,
                            editable: true,
                            label: "",
                            attributes: { style: {} },
                            contents: [],
                            events: {}
                        },
                        // radio element 1
                        {
                            type: "div",
                            id: "zzzz31",
                            parent: id,
                            label: "",
                            attributes: { class: "radio", style: { "margin": "30px" } },
                            contents: [],
                            events: {}
                        },
                        {
                            type: "label",
                            id: "zzzz311",
                            parent: "zzzz31",
                            label: "",
                            attributes: {},
                            contents: [],
                            events: {}
                        },
                        {
                            type: "input",
                            id: "zzzz3111",
                            parent: "zzzz311",
                            label: "zzzz3111" + "radio",
                            attributes: { type: "radio", id: "zzzz31111", "ng-model": "zzzz3", value: "b" },
                            contents: [],
                            events: {}
                        },
                        {
                            type: "label",
                            id: "zzzz3112",
                            parent: "zzzz311",
                            label: "",
                            attributes: { for: "zzzz31111", style: { "font-size": "32px" } },
                            contents: "label 1",
                            events: {}
                        },
                        // radio element 2
                        {
                            type: "div",
                            id: "zzzz32",
                            parent: "zzzz3",
                            label: "",
                            attributes: { class: "radio", style: { "margin": "30px" } },
                            contents: [],
                            events: {}
                        },
                        {
                            type: "label",
                            id: "zzzz321",
                            parent: "zzzz32",
                            label: "",
                            attributes: {},
                            contents: [],
                            events: {}
                        },
                        {
                            type: "input",
                            id: "zzzz3211",
                            parent: "zzzz321",
                            label: id + "zzzz32111",
                            attributes: { type: "radio", id: "zzzz32111", "ng-model": "zzzz3", value: "a" },
                            contents: [],
                            events: {}
                        },
                        {
                            type: "label",
                            id: "zzzz3212",
                            parent: "zzzz321",
                            label: "",
                            attributes: { for: "zzzz32111", style: { "font-size": "32px" } },
                            contents: "label 2",
                            events: {}
                        }
                    ]
                };
                FormBuilderService.AddElement(new_field);
            };
            var addButton = function () {
                var parent_id = FormBuilderService.ParentId("root");
                var id = FormBuilderService.CreateId("root");
                var new_text = {
                    kind: "static",
                    type: "text",
                    id: id,
                    elements: [
                        {
                            type: "div",
                            id: "sssss",
                            parent: parent_id,
                            editable: true,
                            label: "",
                            attributes: { style: { "background-color": "rgba(120,120,120,0.1)" } },
                            contents: "Its New",
                            events: {}
                        }
                    ]
                };
                var new_field = {
                    kind: "control",
                    type: "field",
                    id: id,
                    elements: [
                        {
                            type: "div",
                            id: id,
                            parent: parent_id,
                            editable: true,
                            label: "",
                            attributes: { class: "form-group", style: {} },
                            contents: [],
                            events: {}
                        },
                        {
                            type: "label",
                            id: "fieldlabel",
                            parent: id,
                            label: "",
                            attributes: { for: "fieldmodel" },
                            contents: "Label",
                            events: {}
                        },
                        {
                            type: "span",
                            id: "fielderrors",
                            parent: id,
                            label: "",
                            attributes: { "ng-messages": "validate." + "fieldmodel" + ".$error" },
                            contents: [],
                            events: {}
                        },
                        {
                            type: "span",
                            id: "fielderror1",
                            parent: "fielderrors",
                            label: "",
                            attributes: { "ng-message": "required", class: "error-message" },
                            contents: "必須です",
                            events: {}
                        },
                        {
                            type: "span",
                            id: "fielderror2",
                            parent: "fielderrors",
                            label: "",
                            attributes: { "ng-message": "minlength", class: "error-message" },
                            contents: "もう少し長く",
                            events: {}
                        },
                        {
                            type: "span",
                            id: "fielderror3",
                            parent: "fielderrors",
                            label: "",
                            attributes: { "ng-message": "maxlength", class: "error-message" },
                            contents: "もう少し短く",
                            events: {}
                        },
                        {
                            type: "input",
                            id: "fieldinput",
                            parent: id,
                            label: id + "button",
                            attributes: {
                                class: "form-control",
                                "ng-model": id,
                                type: "text",
                                name: id,
                                style: { "font-size": "32px" },
                                "ng-maxlength": "50",
                                "ng-minlength": "0",
                                required: "true"
                            },
                            contents: [],
                            events: { onChange: "" }
                        }
                    ]
                };
                var new_div = {
                    kind: "control",
                    type: "field",
                    id: id,
                    elements: [
                        {
                            type: "div",
                            id: id,
                            parent: parent_id,
                            editable: true,
                            label: "",
                            attributes: { style: { "border-style": "solid", "border-color": "black", "border-width": "1px;" } },
                            contents: id,
                            events: {}
                        },
                    ]
                };
                FormBuilderService.AddElement(new_field);
            };
            var addChips = function () {
                var modalRegist = $uibModal.open({
                    controller: 'FormBuilderAddChipsDialogController',
                    templateUrl: '/forms/dialogs/elements/add_chips_dialog',
                    resolve: {
                        items: null
                    }
                });
                modalRegist.result.then(function (dialog_scope) {
                    var property = { contents: [] };
                    FormBuilderService.AddElement(ElementsService.Chips(dialog_scope.key, property));
                }, function () {
                });
            };
            var addAddress = function () {
                var modalRegist = $uibModal.open({
                    controller: 'FormBuilderAddChipsDialogController',
                    templateUrl: '/forms/dialogs/elements/add_chips_dialog',
                    resolve: {
                        items: null
                    }
                });
                modalRegist.result.then(function (dialog_scope) {
                    var property = { contents: [] };
                    var new_address = ElementsService.Address(dialog_scope.key, property);
                    FormBuilderService.AddElement(new_address);
                }, function () {
                });
            };
            var DeleteElement = function () {
                FormBuilderService.DeleteElement();
                redraw_select();
            };
            var setmode = function (mode) {
                FormBuilderService.SetEditMode(mode, function (element) {
                    redraw_select();
                });
            };
            var redraw = function (page_no) {
                FormBuilderService.current_page = pages[page_no].contents;
                FormBuilderService.Draw(function (event) {
                    if (event.name == "exit") {
                        redraw_select();
                    }
                });
            };
            var contents_update = function (value) {
                var target = FormBuilderService.Selected();
                if (target) {
                    target.contents = value;
                    FormBuilderService.Draw(function (event) {
                        if (event.name == "exit") {
                            redraw_select();
                        }
                    });
                }
            };
            var attribute_value_update = function (key, value) {
                var target = FormBuilderService.Selected();
                if (target) {
                    target.attributes[key] = value;
                    FormBuilderService.Draw(function (event) {
                        if (event.name == "exit") {
                            redraw_select();
                        }
                    });
                }
            };
            var style_value_update = function (key, value) {
                var target = FormBuilderService.Selected();
                if (target) {
                    target.attributes.style[key] = value;
                    FormBuilderService.Draw(function (event) {
                        if (event.name == "exit") {
                            redraw_select();
                        }
                    });
                }
            };
            var remove_attribute = function (key) {
                var result = false;
                if (key != 'style') {
                    var target = FormBuilderService.Selected();
                    if (target) {
                        if (key in target.attributes) {
                            delete target.attributes[key];
                            FormBuilderService.Draw(function (event) {
                                if (event.name == "exit") {
                                    redraw_select();
                                }
                            });
                            result = true;
                        }
                    }
                }
                return result;
            };
            var remove_style = function (key) {
                var result = false;
                var target = FormBuilderService.Selected();
                if (target) {
                    if (key in target.attributes.style) {
                        delete target.attributes.style[key];
                        FormBuilderService.Draw(function (event) {
                            if (event.name == "exit") {
                                redraw_select();
                            }
                        });
                        result = true;
                    }
                }
                return result;
            };
            var add_attribute = function () {
                var add_attribute = function (key, value) {
                    var result = false;
                    if (key != 'style') {
                        var target = FormBuilderService.Selected();
                        if (target) {
                            if (!(key in target.attributes)) {
                                target.attributes[key] = value;
                                FormBuilderService.Draw(function (event) {
                                    if (event.name == "exit") {
                                        redraw_select();
                                    }
                                });
                                result = true;
                            }
                        }
                    }
                    return result;
                };
                var modalRegist = $uibModal.open({
                    controller: 'FormBuilderAddAttributeDialogController as dialog',
                    templateUrl: '/forms/dialogs/add_attribute_dialog',
                    resolve: {
                        items: null
                    }
                });
                modalRegist.result.then(function (dialog_scope) {
                    add_attribute(dialog_scope.key, dialog_scope.value);
                }, function () {
                });
            };
            var add_style = function () {
                var add_style = function (key, value) {
                    var result = false;
                    var target = FormBuilderService.Selected();
                    if (target) {
                        if (!target.attributes.style) {
                            target.attributes["style"] = {};
                        }
                        if (!(key in target.attributes.style)) {
                            target.attributes.style[key] = value;
                            FormBuilderService.Draw(function (event) {
                                if (event.name == "exit") {
                                    redraw_select();
                                }
                            });
                            result = true;
                        }
                    }
                    return result;
                };
                var modalRegist = $uibModal.open({
                    controller: 'FormBuilderAddStyleDialogController as dialog',
                    templateUrl: '/forms/dialogs/add_style_dialog',
                    resolve: {
                        items: null
                    }
                });
                modalRegist.result.then(function (dialog_scope) {
                    add_style(dialog_scope.key, dialog_scope.value);
                }, function () {
                });
            };
            var Create = function () {
                var modalRegist = $uibModal.open({
                    controller: 'FormBuilderCreateDialogController',
                    templateUrl: '/forms/dialogs/create_dialog',
                    resolve: {
                        items: $scope
                    }
                });
                modalRegist.result.then(function (layout) {
                    $scope.layout = layout;
                    $scope.name = layout.name;
                    $scope.userid = layout.userid;
                    $scope.opened = true;
                    FormBuilderService.current_page = layout.content;
                    FormBuilderService.Draw(function (event) {
                        if (event.name == "exit") {
                            redraw_select();
                        }
                    });
                }, function () {
                });
            };
            var Open = function () {
                var modalRegist = $uibModal.open({
                    controller: 'FormBuilderOpenDialogController',
                    templateUrl: '/forms/dialogs/open_dialog',
                    resolve: {
                        items: $scope
                    }
                });
                modalRegist.result.then(function (layout) {
                    $scope.layout = layout;
                    $scope.name = layout.name;
                    $scope.userid = layout.userid;
                    $scope.opened = true;
                    FormBuilderService.current_page = layout.content;
                    FormBuilderService.Draw(function (event) {
                        if (event.name == "exit") {
                            redraw_select();
                        }
                    });
                }, function () {
                });
            };
            var Update = function () {
                if (FormBuilderService.current_page) {
                    progress(true);
                    FormBuilderService.Put(FormBuilderService.current_page, function (result) {
                        progress(false);
                    }, error_handler);
                }
            };
            var Delete = function () {
                if (FormBuilderService.current_page) {
                    var modalRegist = $uibModal.open({
                        controller: 'FormBuilderDeleteConfirmController',
                        templateUrl: '/forms/dialogs/delete_confirm_dialog',
                        resolve: {
                            items: function () {
                                return FormBuilderService.current_page;
                            }
                        }
                    });
                    modalRegist.result.then(function (content) {
                        progress(true);
                        FormBuilderService.Delete(function (result) {
                            $scope.name = "";
                            FormBuilderService.current_page = [];
                            FormBuilderService.Draw(function (event) {
                                if (event.name == "exit") {
                                    redraw_select();
                                }
                            });
                            progress(false);
                            $scope.opened = false;
                        }, error_handler);
                    }, function () {
                    });
                }
            };
            $scope.opened = false;
            $scope.edit_mode = false;
            $scope.changeElementContents = changeElementContents;
            $scope.ElementOpen = ElementOpen;
            $scope.ElementSelect = ElementSelect;
            $scope.ElementSelected = ElementSelected;
            $scope.edit = edit;
            $scope.up = up;
            $scope.down = down;
            $scope.deselect = deselect;
            $scope.addTag = addTag;
            $scope.addDiv = addDiv;
            $scope.addForm = addForm;
            $scope.addField = addField;
            $scope.addHtmlField = addHtmlField;
            $scope.addTextArea = addTextArea;
            $scope.addNumber = addNumber;
            $scope.addDate = addDate;
            $scope.addHtml = addHtml;
            $scope.addImg = addImg;
            $scope.addSelect = addSelect;
            $scope.addChack = addChack;
            $scope.addRadio = addRadio;
            $scope.addButton = addButton;
            $scope.addChips = addChips;
            $scope.delete = DeleteElement;
            $scope.setmode = setmode;
            $scope.redraw = redraw;
            $scope.contents_update = contents_update;
            $scope.attribute_value_update = attribute_value_update;
            $scope.style_value_update = style_value_update;
            $scope.remove_attribute = remove_attribute;
            $scope.remove_style = remove_style;
            $scope.add_attribute = add_attribute;
            $scope.add_style = add_style;
            $scope.Create = Create;
            $scope.Open = Open;
            $scope.Update = Update;
            $scope.Delete = Delete;
            $scope.$watch('class', function () {
                var target = FormBuilderService.Selected();
                if (target) {
                    if ($scope.class) {
                        target.attributes.class = $scope.class;
                        FormBuilderService.Draw(function (event) {
                            if (event.name == "exit") {
                                redraw_select();
                            }
                        });
                    }
                }
            });
            $scope.$watch('contents', function () {
                var target = FormBuilderService.Selected();
                if (target) {
                    target.contents = $scope.contents;
                    FormBuilderService.Draw(function (event) {
                        if (event.name == "exit") {
                            redraw_select();
                        }
                    });
                }
            });
            FormBuilderService.$scope = $scope;
            FormBuilderService.$compile = $compile;
            $scope.components = true;
            $scope.attributes = true;
            // froala
            //     $scope.froalaOptions = {
            //         toolbarButtons : ["bold", "italic", "underline", "|", "align", "formatOL", "formatUL"]
            //     };
        }]);
    FormBuilderControllers.controller('FormBuilderAddStyleDialogController', ['$uibModalInstance', 'items',
        function ($uibModalInstance, items) {
            var _this = this;
            this.hide = function () {
                $uibModalInstance.close();
            };
            this.cancel = function () {
                $uibModalInstance.dismiss();
            };
            this.answer = function () {
                $uibModalInstance.close(_this);
            };
        }]);
    FormBuilderControllers.controller('FormBuilderAddAttributeDialogController', ['$uibModalInstance', 'items',
        function ($uibModalInstance, items) {
            var _this = this;
            this.hide = function () {
                $uibModalInstance.close();
            };
            this.cancel = function () {
                $uibModalInstance.dismiss();
            };
            this.answer = function () {
                $uibModalInstance.close(_this);
            };
        }]);
    FormBuilderControllers.controller('FormBuilderAddTagDialogController', ['$scope', '$uibModalInstance', 'items',
        function ($scope, $uibModalInstance, items) {
            $scope.tag_escape = tag_escape;
            $scope.hide = function () {
                $uibModalInstance.close();
            };
            $scope.cancel = function () {
                $uibModalInstance.dismiss();
            };
            $scope.answer = function () {
                $uibModalInstance.close($scope);
            };
        }]);
    FormBuilderControllers.controller('FormBuilderAddDivDialogController', ['$scope', '$uibModalInstance', 'items',
        function ($scope, $uibModalInstance, items) {
            $scope.class_escape = class_escape;
            $scope.hide = function () {
                $uibModalInstance.close();
            };
            $scope.cancel = function () {
                $uibModalInstance.dismiss();
            };
            $scope.answer = function () {
                $uibModalInstance.close($scope);
            };
        }]);
    FormBuilderControllers.controller('FormBuilderAddFieldDialogController', ['$scope', '$uibModalInstance', 'items',
        function ($scope, $uibModalInstance, items) {
            $scope.key_escape = key_escape;
            $scope.min = { value: 5, message: 'もう少し長く' };
            $scope.max = { value: 100, message: 'もう少し短く' };
            $scope.pattern = { value: "", message: "" };
            $scope.required = { value: false, message: '必須です' };
            $scope.hide = function () {
                $uibModalInstance.close();
            };
            $scope.cancel = function () {
                $uibModalInstance.dismiss();
            };
            $scope.answer = function () {
                $uibModalInstance.close($scope);
            };
        }]);
    FormBuilderControllers.controller('FormBuilderAddNumberDialogController', ['$scope', '$uibModalInstance', 'items',
        function ($scope, $uibModalInstance, items) {
            $scope.min = { value: 0, message: '' };
            $scope.max = { value: 100, message: '' };
            $scope.step = { value: 1, message: '' };
            $scope.hide = function () {
                $uibModalInstance.close();
            };
            $scope.cancel = function () {
                $uibModalInstance.dismiss();
            };
            $scope.answer = function () {
                $uibModalInstance.close($scope);
            };
        }]);
    FormBuilderControllers.controller('FormBuilderAddTextAreaDialogController', ['$scope', '$uibModalInstance', 'items',
        function ($scope, $uibModalInstance, items) {
            $scope.key_escape = key_escape;
            $scope.min = { value: 5, message: 'もう少し長く' };
            $scope.max = { value: 100, message: 'もう少し短く' };
            $scope.required = { value: false, message: '必須です' };
            $scope.hide = function () {
                $uibModalInstance.close();
            };
            $scope.cancel = function () {
                $uibModalInstance.dismiss();
            };
            $scope.answer = function () {
                $uibModalInstance.close($scope);
            };
        }]);
    FormBuilderControllers.controller('FormBuilderAddImgDialogController', ['$scope', '$uibModalInstance', 'items',
        function ($scope, $uibModalInstance, items) {
            $scope.key_escape = key_escape;
            $scope.hide = function () {
                $uibModalInstance.close();
            };
            $scope.cancel = function () {
                $uibModalInstance.dismiss();
            };
            $scope.answer = function () {
                $uibModalInstance.close($scope);
            };
        }]);
    FormBuilderControllers.controller('FormBuilderAddSelectDialogController', ['$scope', '$uibModalInstance', 'items',
        function ($scope, $uibModalInstance, items) {
            $scope.key_escape = key_escape;
            $scope.contents = [];
            $scope.hide = function () {
                $uibModalInstance.close();
            };
            $scope.cancel = function () {
                $uibModalInstance.dismiss();
            };
            $scope.answer = function () {
                $uibModalInstance.close($scope);
            };
        }]);
    FormBuilderControllers.controller('FormBuilderAddChipsDialogController', ['$scope', '$uibModalInstance', 'items',
        function ($scope, $uibModalInstance, items) {
            $scope.key_escape = key_escape;
            $scope.contents = [];
            $scope.hide = function () {
                $uibModalInstance.close();
            };
            $scope.cancel = function () {
                $uibModalInstance.dismiss();
            };
            $scope.answer = function () {
                $uibModalInstance.close($scope);
            };
        }]);
    FormBuilderControllers.controller('FormBuilderAddElementDialogController', ['$scope', '$uibModalInstance', 'items',
        function ($scope, $uibModalInstance, items) {
            $scope.hide = function () {
                $uibModalInstance.close();
            };
            $scope.cancel = function () {
                $uibModalInstance.dismiss();
            };
            $scope.answer = function () {
                $uibModalInstance.close($scope);
            };
        }]);
    FormBuilderControllers.controller('FormBuilderCreateDialogController', ['$scope', '$log', '$uibModalInstance', 'FormBuilderService', 'items',
        function ($scope, $log, $uibModalInstance, FormBuilderService, items) {
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
            $scope.type = 1;
            $scope.hide = function () {
                $uibModalInstance.close();
            };
            $scope.cancel = function () {
                $uibModalInstance.dismiss();
            };
            $scope.answer = function () {
                progress(true);
                FormBuilderService.Create($scope.title, $scope.type, function (result) {
                    progress(false);
                    $scope.message = "";
                    $uibModalInstance.close(result);
                }, error_handler);
            };
        }]);
    FormBuilderControllers.controller('FormBuilderOpenDialogController', ['$scope', '$log', '$uibModalInstance', '$uibModal', 'items', 'FormBuilderService',
        function ($scope, $log, $uibModalInstance, $uibModal, items, FormBuilderService) {
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
                FormBuilderService.query = {};
                FormBuilderService.Query(function (result) {
                    if (result) {
                        $scope.pages = result;
                    }
                    FormBuilderService.Over(function (hasnext) {
                        $scope.over = !hasnext;
                    });
                    FormBuilderService.Under(function (hasprev) {
                        $scope.under = !hasprev;
                    });
                    progress(false);
                }, error_handler);
            };
            var Find = function (name) {
                progress(true);
                FormBuilderService.query = {};
                if (name) {
                    FormBuilderService.query = { name: name };
                }
                FormBuilderService.Query(function (result) {
                    if (result) {
                        $scope.pages = result;
                    }
                    FormBuilderService.Over(function (hasnext) {
                        $scope.over = !hasnext;
                    });
                    FormBuilderService.Under(function (hasprev) {
                        $scope.under = !hasprev;
                    });
                    progress(false);
                }, error_handler);
            };
            var Count = function () {
                FormBuilderService.Count(function (result) {
                    if (result) {
                        $scope.count = result;
                    }
                }, error_handler);
            };
            var Next = function () {
                progress(true);
                FormBuilderService.Next(function (result) {
                    if (result) {
                        $scope.pages = result;
                    }
                    FormBuilderService.Over(function (hasnext) {
                        $scope.over = !hasnext;
                    });
                    FormBuilderService.Under(function (hasprev) {
                        $scope.under = !hasprev;
                    });
                    progress(false);
                }, error_handler);
            };
            var Prev = function () {
                progress(true);
                FormBuilderService.Prev(function (result) {
                    if (result) {
                        $scope.pages = result;
                    }
                    FormBuilderService.Over(function (hasnext) {
                        $scope.over = !hasnext;
                    });
                    FormBuilderService.Under(function (hasprev) {
                        $scope.under = !hasprev;
                    });
                    progress(false);
                }, error_handler);
            };
            var Get = function (layout) {
                progress(true);
                FormBuilderService.Get(layout._id, function (result) {
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
    FormBuilderControllers.controller('FormBuilderDeleteConfirmController', ['$scope', '$uibModalInstance', 'items',
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
    FormBuilderControllers.controller('FormBuilderEditElementDialogController', ['$scope', '$uibModal', '$uibModalInstance', 'FormBuilderService', 'items',
        function ($scope, $uibModal, $uibModalInstance, FormBuilderService, items) {
            $scope.control = items;
            $scope.hide = function () {
                $uibModalInstance.close();
            };
            $scope.cancel = function () {
                $uibModalInstance.dismiss();
            };
            $scope.answer = function () {
                $uibModalInstance.close({});
            };
            $scope.ElementOpen = function (id) {
                var element = FormBuilderService.Find(id);
                if (element.length == 1) {
                    var modalRegist = $uibModal.open({
                        controller: 'FormBuilderEditElementDialogController',
                        templateUrl: '/forms/dialogs/elements/edit_element_dialog',
                        resolve: {
                            items: element[0]
                        }
                    });
                }
                /*      let modalRegist: any = $uibModal.open({
                 controller: 'FormBuilderEditElementDialogController',
                 templateUrl: '/forms/dialogs/elements/edit_element_dialog',
                 resolve: {
                 items: null
                 }
                 }); */
            };
        }]);
})(FormBuilderControllersModule || (FormBuilderControllersModule = {}));
//# sourceMappingURL=form_builder_controllers.js.map