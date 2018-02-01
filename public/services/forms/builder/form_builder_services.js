/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
//import {version} from "punycode";
var FormBuilderServicesModule;
(function (FormBuilderServicesModule) {
    var FormBuilderServices = angular.module('FormBuilderServices', []);
    FormBuilderServices.factory('FormCreate', ['$resource',
        function ($resource) {
            return $resource('/forms/api/create', {}, {});
        }]);
    FormBuilderServices.factory('Form', ['$resource',
        function ($resource) {
            return $resource('/forms/api/:id', { id: "@id" }, {
                get: { method: 'GET' },
                put: { method: 'PUT' },
                delete: { method: 'DELETE' }
            });
        }]);
    FormBuilderServices.factory('FormQuery', ['$resource',
        function ($resource) {
            return $resource("/forms/api/query/:query/:option", { query: '@query', option: '@optopn' }, {
                query: { method: 'GET' }
            });
        }]);
    FormBuilderServices.factory('FormCount', ['$resource',
        function ($resource) {
            return $resource('/forms/api/count/:query', { query: '@query' }, {
                get: { method: 'GET' }
            });
        }]);
    FormBuilderServices.service('FormBuilderService', ["HtmlEdit", "FormCreate", "Form", "FormQuery", "FormCount",
        function (HtmlEdit, FormCreate, Form, FormQuery, FormCount) {
            var _this = this;
            this.$scope = null;
            this.$compile = null;
            var change_watchers = [];
            var click_watchers = [];
            this.SetQuery = function (query) {
                _this.option.skip = 0;
                _this.query = {};
                if (query) {
                    _this.query = query;
                }
            };
            var init = function () {
                _this.option = { limit: 40, skip: 0 };
                _this.SetQuery(null);
                _this.current_page = null;
                _this.current_id = null;
                change_watchers = [];
                click_watchers = [];
            };
            this.Init = function () {
                init();
            };
            var click_handler = function (id) {
                return 'edit($event,"' + id + '");';
            };
            var flatten_style = function (a) {
                var result = "";
                _.forEach(a, function (v, k) {
                    result += k + ":" + v + ";";
                });
                return result;
            };
            var flatten_collection = function (a, b) {
                _.forEach(b, function (v, k) {
                    if (k == "style") {
                        a[k] = flatten_style(v);
                    }
                    else {
                        a[k] = v;
                    }
                });
                return a;
            };
            var watchChangeClear = function () {
                _.forEach(change_watchers, function (change_watcher) {
                    change_watcher();
                });
            };
            var watchClickClear = function () {
                _.forEach(click_watchers, function (click_watch_id) {
                    _this.$scope["click_" + click_watch_id] = null;
                });
            };
            var Elements = function (page, callback) {
                var _continue = true;
                _.forEach(page, function (control) {
                    _.forEach(control.elements, function (element) {
                        _continue = callback(control, element);
                        return _continue;
                    });
                    return _continue;
                });
            };
            var attributes_by_mode = function (editmode, element) {
                if (!element.attributes) {
                    element.attributes = {};
                }
                //else {
                //        if (element.attributes.style) {
                //              element.attributes.style['cursor'] = 'crosshair';
                //        }
                //   }
                var result = flatten_collection(element.attributes, { 'ng-click': click_handler(element.id) });
                return result;
            };
            this.Select = function (id, select, deselect) {
                Elements(_this.current_page, function (control, element) {
                    var _continue = true;
                    if (element) {
                        if (element.editable) {
                            if (element.id == id) {
                                _this.Deselect(deselect);
                                _this.selected = element;
                                select(element);
                                _continue = false;
                            }
                        }
                    }
                    return _continue;
                });
            };
            this.Deselect = function (callback) {
                _this.selected = null;
                callback(null);
            };
            this.Selected = function () {
                return _this.selected;
            };
            this.UpElement = function () {
                if (_this.selected) {
                    Elements(_this.current_page, function (target, element) {
                        var _continue = true;
                        if (element.editable) {
                            if (element.id == _this.selected.id) {
                                var index_1 = 0;
                                _.forEach(_this.current_page, function (control) {
                                    if (control == target) {
                                        if (index_1 > 0) {
                                            var t = _this.current_page[index_1 - 1];
                                            _this.current_page[index_1 - 1] = _this.current_page[index_1];
                                            _this.current_page[index_1] = t;
                                            _continue = false;
                                        }
                                    }
                                    index_1++;
                                    return _continue;
                                });
                            }
                        }
                        return _continue;
                    });
                    _this.Draw();
                }
            };
            this.DownElement = function () {
                if (_this.selected) {
                    Elements(_this.current_page, function (target, element) {
                        var _continue = true;
                        if (element.editable) {
                            if (element.id == _this.selected.id) {
                                var index_2 = 0;
                                _.forEach(_this.current_page, function (control) {
                                    var result = true;
                                    if (control == target) {
                                        if (index_2 < _this.current_page.length - 1) {
                                            var t = _this.current_page[index_2 + 1];
                                            _this.current_page[index_2 + 1] = _this.current_page[index_2];
                                            _this.current_page[index_2] = t;
                                            _continue = false;
                                        }
                                    }
                                    index_2++;
                                    return _continue;
                                });
                            }
                        }
                        return _continue;
                    });
                    _this.Draw();
                }
            };
            this.Find = function (id) {
                return _.filter(_this.current_page, { 'id': id });
            };
            this.AddElement = function (control) {
                _this.current_page.push(control);
                _this.Draw();
            };
            var collect_family = function (current_page, root_id, hit_indexes) {
                _.forEach(current_page, function (control, index) {
                    var elements = control.elements;
                    var element = elements[0];
                    if (element.parent == root_id) {
                        hit_indexes.push(index);
                        collect_family(current_page, control.id, hit_indexes);
                    }
                });
            };
            this.DeleteElement = function () {
                if (_this.selected) {
                    var is_hit_1 = false;
                    var hit_indexes_1 = [];
                    _.forEach(_this.current_page, function (control, index) {
                        if (control.id == _this.selected.id) {
                            is_hit_1 = true;
                            hit_indexes_1.push(index);
                        }
                    });
                    collect_family(_this.current_page, _this.selected.id, hit_indexes_1);
                    var sorted_indexes = _.sortBy(hit_indexes_1).reverse();
                    // delayed delete for "forEach"
                    if (is_hit_1) {
                        _.forEach(sorted_indexes, function (hits_index) {
                            _this.current_page.splice(hits_index, 1);
                        });
                    }
                    _this.Deselect(function () {
                    });
                    _this.Draw();
                }
            };
            this.idToNo = function (id) {
                var result = "";
                for (var i = id.length - 1; i >= 0; i--) {
                    var c = id[i];
                    if (_.includes(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"], c)) {
                        result = c + result;
                    }
                    else {
                        break;
                    }
                }
                if (result == "") {
                    result = 0;
                }
                return result * 1;
            };
            this.ChildCount = function (id) {
                var numbers = [0];
                var children = angular.element("#" + id).children();
                _.forEach(children, function (element) {
                    var number = _this.idToNo(element.id);
                    numbers.push(number);
                });
                return _.max(numbers) + 1;
                //        return angular.element("#" + id).children().length;
            };
            this.ParentId = function (_default) {
                var parent = _this.Selected();
                var result = _default;
                if (parent) {
                    result = parent.id;
                }
                return result;
            };
            this.SelectChild = function (id) {
                var result = [];
                _.forEach(_this.current_page, function (element) {
                    if (element.parent = id) {
                        result.push(element);
                    }
                });
                return result;
            };
            this.CreateId = function (_default_root) {
                var parent_id = _this.ParentId(_default_root);
                var num = _this.ChildCount(parent_id);
                return parent_id + "_" + num;
            };
            this.Draw = function (callback) {
                watchChangeClear();
                watchClickClear();
                angular.element("#root").empty();
                Elements(_this.current_page, function (control, element) {
                    var field = [];
                    var id = element.id;
                    var parent = element.parent;
                    var label = element.label;
                    var type = element.type;
                    var attributes = attributes_by_mode(true, element);
                    var contents = element.contents;
                    var events = element.events;
                    switch (type) {
                        case "form":
                        case "div":
                        case "span":
                        case "label":
                        case "input":
                        case "textarea":
                        case "img":
                            field = [{
                                    "name": type, "type": "element",
                                    "_$": flatten_collection({ "id": id }, attributes),
                                    "@": contents
                                }];
                            break;
                        case "select":// for bootstrap 3
                            var contents_model_name = id + "_contents";
                            _this.$scope[contents_model_name] = contents;
                            field = [{
                                    "name": "div", "type": "element",
                                    "_$": { "class": "form-group" },
                                    "@": [
                                        {
                                            "name": "label", "type": "element",
                                            "_$": { "for": id },
                                            "@": label,
                                        },
                                        {
                                            "name": "select", "type": "element",
                                            "_$": flatten_collection({ id: id, "class": "form-control", "ng-init": id + " = " + contents_model_name + "[0]", "ng-model": id, "ng-options": "option for option in " + contents_model_name, "name": id }, attributes)
                                        }
                                    ]
                                }];
                            break;
                        case "button":// for bootstrap 3
                            field = [
                                {
                                    "name": "button", "type": "element",
                                    "_$": flatten_collection({ id: id, class: "form-control", "ng-click": "click_" + id + "()" }, attributes),
                                    "@": label
                                }
                            ];
                            break;
                        default:
                            field = [{
                                    "name": type, "type": "element",
                                    "_$": flatten_collection({ "id": id }, attributes),
                                    "@": contents
                                }];
                            break;
                    }
                    var child_element = angular.element(HtmlEdit.toHtml(field, ""));
                    var parent_element = angular.element("#" + parent);
                    parent_element.append(child_element);
                    return true;
                });
                _this.$compile(angular.element("#root").contents())(_this.$scope);
                if (callback) {
                    callback({ name: "exit" });
                }
            };
            this.SetEditMode = function (mode, callback) {
                _this.Deselect(callback);
                _this.Draw();
            };
            this.Query = function (callback, error) {
                FormQuery.query({
                    query: encodeURIComponent(JSON.stringify(_this.query)),
                    option: encodeURIComponent(JSON.stringify(_this.option))
                }, function (result) {
                    if (result) {
                        if (result.code === 0) {
                            callback(result.value);
                        }
                        else {
                            error(result.code, result.message);
                        }
                    }
                    else {
                        error(10000, "network error");
                    }
                });
            };
            this.Count = function (callback, error) {
                FormCount.get({
                    query: encodeURIComponent(JSON.stringify(_this.query))
                }, function (result) {
                    if (result) {
                        if (result.code === 0) {
                            callback(result.value);
                        }
                        else {
                            error(result.code, result.message);
                        }
                    }
                    else {
                        error(10000, "network error");
                    }
                });
            };
            this.Over = function (callback, error) {
                _this.Count(function (count) {
                    callback((_this.option.skip + _this.option.limit) <= count);
                }, error);
            };
            this.Under = function (callback, error) {
                callback(_this.option.skip > 0);
            };
            this.Next = function (callback, error) {
                _this.Over(function (hasnext) {
                    if (hasnext) {
                        _this.option.skip = _this.option.skip + _this.option.limit;
                        _this.Query(callback, error);
                    }
                    else {
                        callback(null);
                    }
                });
            };
            this.Prev = function (callback, error) {
                _this.Under(function (hasprev) {
                    if (hasprev) {
                        _this.option.skip = _this.option.skip - _this.option.limit;
                        _this.Query(callback, error);
                    }
                    else {
                        callback(null);
                    }
                });
            };
            this.Create = function (name, type, callback, error) {
                init();
                var form = new FormCreate();
                form.name = name;
                form.type = type;
                form.$save({}, function (result) {
                    if (result) {
                        if (result.code === 0) {
                            _this.current_id = result.value._id;
                            callback(result.value);
                        }
                        else {
                            error(result.code, result.message);
                        }
                    }
                    else {
                        error(10000, "network error");
                    }
                });
            };
            this.Get = function (id, callback, error) {
                init();
                _this.current_id = id;
                Form.get({
                    id: _this.current_id
                }, function (result) {
                    if (result) {
                        if (result.code === 0) {
                            callback(result.value);
                        }
                        else {
                            error(result.code, result.message);
                        }
                    }
                    else {
                        error(10000, "network error");
                    }
                });
            };
            this.Put = function (content, callback, error) {
                var form = new Form();
                form.content = content;
                form.$put({
                    id: _this.current_id
                }, function (result) {
                    if (result) {
                        if (result.code === 0) {
                            callback(result.value);
                        }
                        else {
                            error(result.code, result.message);
                        }
                    }
                    else {
                        error(10000, "network error");
                    }
                });
            };
            this.Delete = function (callback, error) {
                Form.delete({
                    id: _this.current_id
                }, function (result) {
                    if (result) {
                        if (result.code === 0) {
                            init();
                            callback(result.value);
                        }
                        else {
                            error(result.code, result.message);
                        }
                    }
                    else {
                        error(10000, "network error");
                    }
                });
            };
            init();
        }]);
    FormBuilderServices.service('ElementsService', ["FormBuilderService",
        function (FormBuilderService) {
            this.Tag = function (name, attributes) {
                var parent_id = FormBuilderService.ParentId("root");
                var id = FormBuilderService.CreateId("root");
                var new_tag = {
                    kind: "control",
                    type: name,
                    id: id,
                    elements: [
                        {
                            type: name,
                            id: id,
                            parent: parent_id,
                            editable: true,
                            label: "",
                            attributes: attributes,
                            contents: id,
                            events: {}
                        },
                    ]
                };
                return new_tag;
            };
            this.Div = function (klass) {
                var parent_id = FormBuilderService.ParentId("root");
                var id = FormBuilderService.CreateId("root");
                var new_div = {
                    kind: "control",
                    type: "div",
                    id: id,
                    elements: [
                        {
                            type: "div",
                            id: id,
                            parent: parent_id,
                            editable: true,
                            label: "",
                            attributes: { class: klass, style: { "border-style": "solid", "border-color": "black", "border-width": "1px;" } },
                            contents: id,
                            events: {}
                        }
                    ]
                };
                return new_div;
            };
            this.Field = function (label, validator) {
                var parent_id = FormBuilderService.ParentId("root");
                var id = FormBuilderService.CreateId("root");
                var attribute = function (id, val) {
                    var result = { class: "form-control no-zoom field-control", "ng-model": id, type: "text", name: id, style: {} };
                    if (val.max.message) {
                        result["ng-maxlength"] = val.max.value;
                    }
                    if (val.min.message) {
                        result["ng-minlength"] = val.min.value;
                    }
                    if (val.pattern.message) {
                        result["ng-pattern"] = val.pattern.value;
                    }
                    if (val.required.message) {
                        result["required"] = val.required.value;
                    }
                    return result;
                };
                var new_field = {
                    kind: "control",
                    type: "field",
                    id: id,
                    value: validator,
                    elements: [
                        {
                            type: "div",
                            id: id,
                            parent: parent_id,
                            editable: true,
                            label: "",
                            attributes: { "class": "form-group", style: {} },
                            contents: [],
                            events: {}
                        },
                        {
                            type: "label",
                            id: id + "_fieldlabel",
                            parent: id,
                            label: "",
                            attributes: { "for": id + "_fieldinput", class: "field-label" },
                            contents: label,
                            events: {}
                        },
                        {
                            type: "span",
                            id: id + "_fielderrors",
                            parent: id,
                            label: "",
                            attributes: { "ng-messages": "validate." + id + ".$error" },
                            contents: [],
                            events: {}
                        },
                        {
                            type: "input",
                            id: id + "_fieldinput",
                            parent: id,
                            label: label,
                            attributes: attribute(id, validator),
                            contents: [],
                            events: { onChange: "" }
                        }
                    ]
                };
                if (validator.min) {
                    var min = {
                        type: "span",
                        id: id + "_fielderror_min",
                        parent: id + "_fielderrors",
                        label: "",
                        attributes: { "ng-message": "minlength", class: "error-message" },
                        contents: validator.min.message,
                        events: {}
                    };
                    new_field.elements.push(min);
                }
                if (validator.max) {
                    var max = {
                        type: "span",
                        id: id + "_fielderror_max",
                        parent: id + "_fielderrors",
                        label: "",
                        attributes: {
                            "ng-message": "maxlength", class: "error-message"
                        },
                        contents: validator.max.message,
                        events: {}
                    };
                    new_field.elements.push(max);
                }
                if (validator.pattern) {
                    var max = {
                        type: "span",
                        id: id + "_fielderror_pattern",
                        parent: id + "_fielderrors",
                        label: "",
                        attributes: {
                            "ng-message": "pattern", class: "error-message"
                        },
                        contents: validator.pattern.message,
                        events: {}
                    };
                    new_field.elements.push(max);
                }
                if (validator.required) {
                    var required = {
                        type: "span",
                        id: id + "_fielderror_required",
                        parent: id + "_fielderrors",
                        label: "",
                        attributes: {
                            "ng-message": "required", class: "error-message"
                        },
                        contents: validator.required.message,
                        events: {}
                    };
                    new_field.elements.push(required);
                }
                return new_field;
            };
            this.HtmlField = function (label, validator) {
                var parent_id = FormBuilderService.ParentId("root");
                var id = FormBuilderService.CreateId("root");
                var attribute = function (id, val) {
                    var result = { class: "form-control no-zoom field-control", "ng-model": id, type: "text", name: id, style: {} };
                    if (val.max.message) {
                        result["ng-maxlength"] = val.max.value;
                    }
                    if (val.min.message) {
                        result["ng-minlength"] = val.min.value;
                    }
                    if (val.pattern.message) {
                        result["ng-pattern"] = val.pattern.value;
                    }
                    if (val.required.message) {
                        result["required"] = val.required.value;
                    }
                    return result;
                };
                var new_field = {
                    kind: "control",
                    type: "html",
                    id: id,
                    value: validator,
                    elements: [
                        {
                            type: "div",
                            id: id,
                            parent: parent_id,
                            editable: true,
                            label: "",
                            attributes: { "class": "form-group", style: {} },
                            contents: [],
                            events: {}
                        },
                        {
                            type: "label",
                            id: id + "_fieldlabel",
                            parent: id,
                            label: "",
                            attributes: { "for": id + "_fieldinput", class: "field-label" },
                            contents: label,
                            events: {}
                        },
                        {
                            type: "span",
                            id: id + "_fielderrors",
                            parent: id,
                            label: "",
                            attributes: { "ng-messages": "validate." + id + ".$error" },
                            contents: [],
                            events: {}
                        },
                        {
                            type: "input",
                            id: id + "_fieldinput",
                            parent: id,
                            label: label,
                            attributes: attribute(id, validator),
                            contents: [],
                            events: { onChange: "" }
                        }
                    ]
                };
                if (validator.min) {
                    var min = {
                        type: "span",
                        id: id + "_fielderror_min",
                        parent: id + "_fielderrors",
                        label: "",
                        attributes: { "ng-message": "minlength", class: "error-message" },
                        contents: validator.min.message,
                        events: {}
                    };
                    new_field.elements.push(min);
                }
                if (validator.max) {
                    var max = {
                        type: "span",
                        id: id + "_fielderror_max",
                        parent: id + "_fielderrors",
                        label: "",
                        attributes: {
                            "ng-message": "maxlength", class: "error-message"
                        },
                        contents: validator.max.message,
                        events: {}
                    };
                    new_field.elements.push(max);
                }
                if (validator.pattern) {
                    var max = {
                        type: "span",
                        id: id + "_fielderror_pattern",
                        parent: id + "_fielderrors",
                        label: "",
                        attributes: {
                            "ng-message": "pattern", class: "error-message"
                        },
                        contents: validator.pattern.message,
                        events: {}
                    };
                    new_field.elements.push(max);
                }
                if (validator.required) {
                    var required = {
                        type: "span",
                        id: id + "_fielderror_required",
                        parent: id + "_fielderrors",
                        label: "",
                        attributes: {
                            "ng-message": "required", class: "error-message"
                        },
                        contents: validator.required.message,
                        events: {}
                    };
                    new_field.elements.push(required);
                }
                return new_field;
            };
            this.Date = function (label, validator) {
                var parent_id = FormBuilderService.ParentId("root");
                var id = FormBuilderService.CreateId("root");
                var attribute = function (id, val) {
                    var result = { class: "form-control no-zoom field-control", "ng-model": id, type: "text", name: id, style: {} };
                    if (val.max.message) {
                        result["ng-maxlength"] = val.max.value;
                    }
                    if (val.min.message) {
                        result["ng-minlength"] = val.min.value;
                    }
                    if (val.pattern.message) {
                        result["ng-pattern"] = val.pattern.value;
                    }
                    if (val.required.message) {
                        result["required"] = val.required.value;
                    }
                    return result;
                };
                var new_field = {
                    kind: "control",
                    type: "date",
                    id: id,
                    value: validator,
                    elements: [
                        {
                            type: "div",
                            id: id,
                            parent: parent_id,
                            editable: true,
                            label: "",
                            attributes: { "class": "form-group", style: {} },
                            contents: [],
                            events: {}
                        },
                        {
                            type: "label",
                            id: id + "_fieldlabel",
                            parent: id,
                            label: "",
                            attributes: { "for": id + "_fieldinput", class: "field-label" },
                            contents: label,
                            events: {}
                        },
                        {
                            type: "span",
                            id: id + "_fielderrors",
                            parent: id,
                            label: "",
                            attributes: { "ng-messages": "validate." + id + ".$error" },
                            contents: [],
                            events: {}
                        },
                        {
                            type: "input",
                            id: id + "_fieldinput",
                            parent: id,
                            label: label,
                            attributes: attribute(id, validator),
                            contents: [],
                            events: { onChange: "" }
                        }
                    ]
                };
                if (validator.min) {
                    var min = {
                        type: "span",
                        id: id + "_fielderror_min",
                        parent: id + "_fielderrors",
                        label: "",
                        attributes: { "ng-message": "minlength", class: "error-message" },
                        contents: validator.min.message,
                        events: {}
                    };
                    new_field.elements.push(min);
                }
                if (validator.max) {
                    var max = {
                        type: "span",
                        id: id + "_fielderror_max",
                        parent: id + "_fielderrors",
                        label: "",
                        attributes: {
                            "ng-message": "maxlength", class: "error-message"
                        },
                        contents: validator.max.message,
                        events: {}
                    };
                    new_field.elements.push(max);
                }
                if (validator.pattern) {
                    var max = {
                        type: "span",
                        id: id + "_fielderror_pattern",
                        parent: id + "_fielderrors",
                        label: "",
                        attributes: {
                            "ng-message": "pattern", class: "error-message"
                        },
                        contents: validator.pattern.message,
                        events: {}
                    };
                    new_field.elements.push(max);
                }
                if (validator.required) {
                    var required = {
                        type: "span",
                        id: id + "_fielderror_required",
                        parent: id + "_fielderrors",
                        label: "",
                        attributes: {
                            "ng-message": "required", class: "error-message"
                        },
                        contents: validator.required.message,
                        events: {}
                    };
                    new_field.elements.push(required);
                }
                return new_field;
            };
            this.TextArea = function (label, validator) {
                var parent_id = FormBuilderService.ParentId("root");
                var id = FormBuilderService.CreateId("root");
                var attribute = function (id, val) {
                    var result = { class: "form-control no-zoom textarea-control", "ng-model": id, type: "text", name: id, style: {} };
                    if (val.max.message) {
                        result["ng-maxlength"] = val.max.value;
                    }
                    if (val.min.message) {
                        result["ng-minlength"] = val.min.value;
                    }
                    if (val.required.message) {
                        result["required"] = val.required.value;
                    }
                    return result;
                };
                var new_field = {
                    kind: "control",
                    type: "textarea",
                    id: id,
                    value: validator,
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
                            id: id + "_fieldlabel",
                            parent: id,
                            label: "",
                            attributes: { for: id + "_fieldinput", class: "textarea-label" },
                            contents: label,
                            events: {}
                        },
                        {
                            type: "span",
                            id: id + "_fielderrors",
                            parent: id,
                            label: "",
                            attributes: { "ng-messages": "validate." + id + ".$error" },
                            contents: [],
                            events: {}
                        },
                        {
                            type: "textarea",
                            id: id + "_textarea",
                            parent: id,
                            label: label,
                            attributes: attribute(id, validator),
                            //attributes: {class: "form-control no-zoom", "ng-model": id, type: "text", name: id, style: {},"ng-maxlength": "2000", "ng-minlength": "1", required: "true"},
                            contents: [],
                            events: {}
                        }
                    ]
                };
                if (validator.min) {
                    var min = {
                        type: "span",
                        id: id + "_fielderror_min",
                        parent: id + "_fielderrors",
                        label: "",
                        attributes: { "ng-message": "minlength", class: "error-message" },
                        contents: validator.min.message,
                        events: {}
                    };
                    new_field.elements.push(min);
                }
                if (validator.max) {
                    var max = {
                        type: "span",
                        id: id + "_fielderror_max",
                        parent: id + "_fielderrors",
                        label: "",
                        attributes: {
                            "ng-message": "maxlength", class: "error-message"
                        },
                        contents: validator.max.message,
                        events: {}
                    };
                    new_field.elements.push(max);
                }
                if (validator.required) {
                    var required = {
                        type: "span",
                        id: id + "_fielderror_required",
                        parent: id + "_fielderrors",
                        label: "",
                        attributes: {
                            "ng-message": "required", class: "error-message"
                        },
                        contents: validator.required.message,
                        events: {}
                    };
                    new_field.elements.push(required);
                }
                return new_field;
            };
            this.Number = function (label, validator) {
                var parent_id = FormBuilderService.ParentId("root");
                var id = FormBuilderService.CreateId("root");
                var attribute = function (id, val) {
                    var result = { class: "form-control no-zoom number-control", "ng-model": id, type: "number", name: id, style: {} };
                    /*
                     if (val.max) {
                     result["max"] = val.max.value;
                     }
                     if (val.min) {
                     result["min"] = val.min.value;
                     }
                     if (val.step) {
                     result["step"] = val.step.value;
                     }
                     */
                    return result;
                };
                var new_field = {
                    kind: "control",
                    type: "number",
                    id: id,
                    value: validator,
                    elements: [
                        {
                            type: "div",
                            id: id,
                            parent: parent_id,
                            editable: true,
                            label: "",
                            attributes: { "class": "form-group", style: {} },
                            contents: [],
                            events: {}
                        },
                        {
                            type: "label",
                            id: id + "_fieldlabel",
                            parent: id,
                            label: "",
                            attributes: { "for": id + "_fieldinput", class: "number-label" },
                            contents: label,
                            events: {}
                        },
                        {
                            type: "span",
                            id: id + "_fielderrors",
                            parent: id,
                            label: "",
                            attributes: { "ng-messages": "validate." + id + ".$error" },
                            contents: [],
                            events: {}
                        },
                        {
                            type: "input",
                            id: id + "_fieldinput",
                            parent: id,
                            label: label,
                            attributes: attribute(id, validator),
                            contents: [],
                            events: { onChange: "" }
                        }
                    ]
                };
                if (validator.min) {
                    var min = {
                        type: "span",
                        id: id + "_fielderror_min",
                        parent: id + "_fielderrors",
                        label: "",
                        attributes: { "ng-message": "minlength", class: "error-message" },
                        contents: validator.min.message,
                        events: {}
                    };
                    new_field.elements.push(min);
                }
                if (validator.max) {
                    var max = {
                        type: "span",
                        id: id + "_fielderror_max",
                        parent: id + "_fielderrors",
                        label: "",
                        attributes: {
                            "ng-message": "maxlength", class: "error-message"
                        },
                        contents: validator.max.message,
                        events: {}
                    };
                    new_field.elements.push(max);
                }
                if (validator.required) {
                    var required = {
                        type: "span",
                        id: id + "_fielderror_required",
                        parent: id + "_fielderrors",
                        label: "",
                        attributes: {
                            "ng-message": "required", class: "error-message"
                        },
                        contents: validator.required.message,
                        events: {}
                    };
                    new_field.elements.push(required);
                }
                return new_field;
            };
            this.HtmlElement = function (label, validator) {
                var parent_id = FormBuilderService.ParentId("root");
                var id = FormBuilderService.CreateId("root");
                var attribute = function (id, val) {
                    var result = { class: "form-control no-zoom textarea-control", "ui-tinymce": " tinymceOptions", "ng-model": id, type: "text", name: id, style: {} };
                    if (val.max.message) {
                        result["ng-maxlength"] = val.max.value;
                    }
                    if (val.min.message) {
                        result["ng-minlength"] = val.min.value;
                    }
                    if (val.required.message) {
                        result["required"] = val.required.value;
                    }
                    return result;
                };
                var new_field = {
                    kind: "control",
                    type: "html",
                    id: id,
                    value: validator,
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
                            id: id + "_fieldlabel",
                            parent: id,
                            label: "",
                            attributes: { for: id + "_fieldinput", class: "textarea-label" },
                            contents: label,
                            events: {}
                        },
                        {
                            type: "span",
                            id: id + "_fielderrors",
                            parent: id,
                            label: "",
                            attributes: { "ng-messages": "validate." + id + ".$error" },
                            contents: [],
                            events: {}
                        },
                        {
                            type: "textarea",
                            id: id + "_textarea",
                            parent: id,
                            label: label,
                            attributes: attribute(id, validator),
                            //attributes: {class: "form-control no-zoom", "ng-model": id, type: "text", name: id, style: {},"ng-maxlength": "2000", "ng-minlength": "1", required: "true"},
                            contents: [],
                            events: {}
                        }
                    ]
                };
                if (validator.min) {
                    var min = {
                        type: "span",
                        id: id + "_fielderror_min",
                        parent: id + "_fielderrors",
                        label: "",
                        attributes: { "ng-message": "minlength", class: "error-message" },
                        contents: validator.min.message,
                        events: {}
                    };
                    new_field.elements.push(min);
                }
                if (validator.max) {
                    var max = {
                        type: "span",
                        id: id + "_fielderror_max",
                        parent: id + "_fielderrors",
                        label: "",
                        attributes: {
                            "ng-message": "maxlength", class: "error-message"
                        },
                        contents: validator.max.message,
                        events: {}
                    };
                    new_field.elements.push(max);
                }
                if (validator.required) {
                    var required = {
                        type: "span",
                        id: id + "_fielderror_required",
                        parent: id + "_fielderrors",
                        label: "",
                        attributes: {
                            "ng-message": "required", class: "error-message"
                        },
                        contents: validator.required.message,
                        events: {}
                    };
                    new_field.elements.push(required);
                }
                return new_field;
            };
            this.Img = function (label, property) {
                var parent_id = FormBuilderService.ParentId("root");
                var id = FormBuilderService.CreateId("root");
                var new_field = {
                    kind: "control",
                    type: "img",
                    id: id,
                    value: property,
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
                            type: "div",
                            id: id + "_imglabel",
                            parent: id,
                            label: "",
                            attributes: { for: id + "_imginput" },
                            contents: label,
                            events: {}
                        },
                        {
                            type: "img",
                            id: id + "_img",
                            parent: id,
                            label: label,
                            attributes: { class: "image image-control", "ng-src": "{{" + id + "}}", "ng-drop": "true", "ng-drop-success": 'onDrop($data,$event,\"' + id + '\")', "ng-model": id, name: id + "_imginput", style: { border: "1px", height: "148px", width: "197px" } },
                            contents: [],
                            events: {}
                        }
                    ]
                };
                return new_field;
            };
            this.Select = function (label, validator) {
                var parent_id = FormBuilderService.ParentId("root");
                var id = FormBuilderService.CreateId("root");
                var attributes = { class: "form-control select-control", "ng-model": id, style: { "font-size": "12px", "border-width": "2px", "border-style": "solid", "border-color": "rgba(120,120,120,0.1)" } };
                if (validator.required) {
                    attributes = { class: "form-control select-control", "ng-model": id, required: validator.required.value, style: { "font-size": "12px", "border-width": "2px", "border-style": "solid", "border-color": "rgba(120,120,120,0.1)" } };
                }
                var new_field = {
                    kind: "control",
                    type: "select",
                    id: id,
                    elements: [
                        {
                            type: "div",
                            id: id,
                            parent: parent_id,
                            editable: true,
                            label: "",
                            attributes: { class: "", style: {} },
                            contents: [],
                            events: {}
                        },
                        {
                            type: "span",
                            id: id + "_selecterrors",
                            parent: id,
                            label: "",
                            attributes: { "ng-messages": "validate." + id + ".$error" },
                            contents: [],
                            events: {}
                        },
                        {
                            type: "select",
                            id: id + "_select",
                            parent: id,
                            label: label,
                            attributes: attributes,
                            contents: validator.contents,
                            events: {}
                        }
                    ]
                };
                if (validator.required) {
                    var required = {
                        type: "span",
                        id: id + "_fielderror_required",
                        parent: id + "_fielderrors",
                        label: "",
                        attributes: {
                            "ng-message": "required", class: "error-message"
                        },
                        contents: validator.required.message,
                        events: {}
                    };
                    new_field.elements.push(required);
                }
                return new_field;
            };
            this.Check = function (label, property) {
                var parent_id = FormBuilderService.ParentId("root");
                var id = FormBuilderService.CreateId("root");
                var new_field = {
                    kind: "control",
                    type: "check",
                    id: id,
                    elements: [
                        {
                            type: "div",
                            id: id,
                            parent: parent_id,
                            editable: true,
                            label: "",
                            attributes: { class: "checkbox", style: {} },
                            contents: [],
                            events: {}
                        },
                        {
                            type: "label",
                            id: id + "_check",
                            parent: id,
                            label: "",
                            attributes: { style: { "font-size": "12px", margin: "2px" } },
                            contents: [],
                            events: {}
                        },
                        {
                            type: "input",
                            id: id + "_checkinput",
                            parent: id + "_check",
                            label: label,
                            attributes: { class: "check-control", type: "checkbox", "ng-model": id + "_checkinput" },
                            contents: label,
                            events: {}
                        }
                    ]
                };
                return new_field;
            };
            this.Chips = function (label, property) {
                var parent_id = FormBuilderService.ParentId("root");
                var id = FormBuilderService.CreateId("root");
                var attribute = function (id, val) {
                    var result = { class: "chips-control", "ng-model": id, name: id, style: {}, "ng-change": "contents_update(tab.element_contents);" };
                    return result;
                };
                var new_chips = {
                    kind: "control",
                    type: "chips",
                    id: id,
                    elements: [
                        {
                            type: "div",
                            id: id,
                            parent: parent_id,
                            editable: true,
                            label: "",
                            attributes: {},
                            contents: property.contents,
                            events: {}
                        },
                        {
                            type: "label",
                            id: id + "_label",
                            parent: id,
                            label: "",
                            attributes: { for: "" },
                            contents: label,
                            events: {}
                        },
                        {
                            type: "chips",
                            id: id + "_chips",
                            parent: id,
                            label: label,
                            attributes: { "ng-model": id, style: { height: "36px;" }, "ng-change": "contents_update(tab.element_contents);" },
                            contents: "",
                            events: {}
                        },
                        {
                            type: "chip-tmpl",
                            id: id + "_chip-tmpl",
                            parent: id + "_chips",
                            label: label,
                            attributes: attribute(id, property),
                            contents: "",
                            events: {}
                        },
                        {
                            type: "div",
                            id: id + "_default-chip",
                            parent: id + "_chip-tmpl",
                            label: "",
                            attributes: { class: "default-chip" },
                            contents: "{{chip}}",
                            events: {}
                        },
                        {
                            type: "span",
                            id: id + "_chip",
                            parent: id + "_default-chip",
                            label: "",
                            attributes: { class: "fa fa-times", "remove-chip": "" },
                            contents: "",
                            events: {}
                        },
                        {
                            type: "input",
                            id: id + "_input",
                            parent: id + "_chips",
                            label: label,
                            attributes: { id: "element_contents", name: "element_contents", style: { "background-color": "transparent;" }, "chip-control": true },
                            contents: "",
                            events: {}
                        },
                    ]
                };
                return new_chips;
            };
            this.Address = function (label, property) {
                var parent_id = FormBuilderService.ParentId("root");
                var id = FormBuilderService.CreateId("root");
                var attribute = function (id, val) {
                    var result = { class: "", "ng-model": id, name: id, style: {}, "ng-change": "contents_update(tab.element_contents);" };
                    return result;
                };
                var new_address = {
                    kind: "control",
                    type: "chips",
                    id: id,
                    elements: [
                        {
                            type: "div",
                            id: id + "_address_enverope",
                            parent: parent_id,
                            editable: true,
                            label: "",
                            attributes: {},
                            contents: property.contents,
                            events: {}
                        },
                        {
                            type: "label",
                            id: id + "_label",
                            parent: id + "_chips_enverope",
                            label: "",
                            attributes: { for: "" },
                            contents: label,
                            events: {}
                        },
                        {
                            type: "chips",
                            id: id + "_chips",
                            parent: id + "_chips_enverope",
                            label: label,
                            attributes: { "ng-model": id, style: { height: "36px;" }, "ng-change": "contents_update(tab.element_contents);" },
                            contents: "",
                            events: {}
                        },
                        {
                            type: "chip-tmpl",
                            id: id + "_chip-tmpl",
                            parent: id + "_chips",
                            label: "",
                            attributes: attribute(id, property),
                            contents: "",
                            events: {}
                        },
                        {
                            type: "div",
                            id: id + "_default-chip",
                            parent: id + "_chip-tmpl",
                            label: "",
                            attributes: { class: "default-chip" },
                            contents: "{{chip}}",
                            events: {}
                        },
                        {
                            type: "span",
                            id: id + "_chip",
                            parent: id + "_default-chip",
                            label: "",
                            attributes: { class: "fa fa-times", "remove-chip": "" },
                            contents: "",
                            events: {}
                        },
                        {
                            type: "input",
                            id: id + "_input",
                            parent: id + "_chips",
                            label: label,
                            attributes: { id: "element_contents", name: "element_contents", style: { "background-color": "transparent;" }, "chip-control": true },
                            contents: "",
                            events: {}
                        }
                    ]
                };
                return new_address;
            };
        }]);
})(FormBuilderServicesModule || (FormBuilderServicesModule = {}));
//# sourceMappingURL=form_builder_services.js.map