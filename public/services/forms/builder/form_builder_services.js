/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
//import {version} from "punycode";
let FormBuilderServices = angular.module('FormBuilderServices', []);
FormBuilderServices.factory('FormCreate', ['$resource',
    ($resource) => {
        return $resource('/forms/api/create', {}, {});
    }]);
FormBuilderServices.factory('Form', ['$resource',
    ($resource) => {
        return $resource('/forms/api/:id', { id: "@id" }, {
            get: { method: 'GET' },
            put: { method: 'PUT' },
            delete: { method: 'DELETE' }
        });
    }]);
FormBuilderServices.factory('FormQuery', ['$resource',
    ($resource) => {
        return $resource("/forms/api/query/:query/:option", { query: '@query', option: '@optopn' }, {
            query: { method: 'GET' }
        });
    }]);
FormBuilderServices.factory('FormCount', ['$resource',
    ($resource) => {
        return $resource('/forms/api/count/:query', { query: '@query' }, {
            get: { method: 'GET' }
        });
    }]);
FormBuilderServices.service('FormBuilderService', ["HtmlEdit", "FormCreate", "Form", "FormQuery", "FormCount",
    function (HtmlEdit, FormCreate, Form, FormQuery, FormCount) {
        this.$scope = null;
        this.$compile = null;
        let change_watchers = [];
        let click_watchers = [];
        this.SetQuery = (query) => {
            this.option.skip = 0;
            this.query = {};
            if (query) {
                this.query = query;
            }
        };
        let init = () => {
            this.option = { limit: 40, skip: 0 };
            this.SetQuery(null);
            this.current_page = null;
            this.current_id = null;
            change_watchers = [];
            click_watchers = [];
        };
        this.Init = () => {
            init();
        };
        let click_handler = (id) => {
            return 'edit($event,"' + id + '");';
        };
        let flatten_style = (a) => {
            let result = "";
            _.forEach(a, (v, k) => {
                result += k + ":" + v + ";";
            });
            return result;
        };
        let flatten_collection = (a, b) => {
            _.forEach(b, (v, k) => {
                if (k == "style") {
                    a[k] = flatten_style(v);
                }
                else {
                    a[k] = v;
                }
            });
            return a;
        };
        let watchChangeClear = () => {
            _.forEach(change_watchers, (change_watcher) => {
                change_watcher();
            });
        };
        let watchClickClear = () => {
            _.forEach(click_watchers, (click_watch_id) => {
                this.$scope["click_" + click_watch_id] = null;
            });
        };
        let Elements = (page, callback) => {
            let _continue = true;
            _.forEach(page, (control) => {
                _.forEach(control.elements, (element) => {
                    _continue = callback(control, element);
                    return _continue;
                });
                return _continue;
            });
        };
        let attributes_by_mode = (editmode, element) => {
            if (!element.attributes) {
                element.attributes = {};
            }
            //else {
            //        if (element.attributes.style) {
            //              element.attributes.style['cursor'] = 'crosshair';
            //        }
            //   }
            let result = flatten_collection(element.attributes, { 'ng-click': click_handler(element.id) });
            return result;
        };
        this.Select = (id, select, deselect) => {
            Elements(this.current_page, (control, element) => {
                let _continue = true;
                if (element) {
                    if (element.editable) {
                        if (element.id == id) {
                            this.Deselect(deselect);
                            this.selected = element;
                            select(element);
                            _continue = false;
                        }
                    }
                }
                return _continue;
            });
        };
        this.Deselect = (callback) => {
            this.selected = null;
            callback(null);
        };
        this.Selected = () => {
            return this.selected;
        };
        this.UpElement = () => {
            if (this.selected) {
                Elements(this.current_page, (target, element) => {
                    let _continue = true;
                    if (element.editable) {
                        if (element.id == this.selected.id) {
                            let index = 0;
                            _.forEach(this.current_page, (control) => {
                                if (control == target) {
                                    if (index > 0) {
                                        let t = this.current_page[index - 1];
                                        this.current_page[index - 1] = this.current_page[index];
                                        this.current_page[index] = t;
                                        _continue = false;
                                    }
                                }
                                index++;
                                return _continue;
                            });
                        }
                    }
                    return _continue;
                });
                this.Draw();
            }
        };
        this.DownElement = () => {
            if (this.selected) {
                Elements(this.current_page, (target, element) => {
                    let _continue = true;
                    if (element.editable) {
                        if (element.id == this.selected.id) {
                            let index = 0;
                            _.forEach(this.current_page, (control) => {
                                let result = true;
                                if (control == target) {
                                    if (index < this.current_page.length - 1) {
                                        let t = this.current_page[index + 1];
                                        this.current_page[index + 1] = this.current_page[index];
                                        this.current_page[index] = t;
                                        _continue = false;
                                    }
                                }
                                index++;
                                return _continue;
                            });
                        }
                    }
                    return _continue;
                });
                this.Draw();
            }
        };
        this.Find = (id) => {
            return _.filter(this.current_page, { 'id': id });
        };
        this.AddElement = (control) => {
            this.current_page.push(control);
            this.Draw();
        };
        let collect_family = (current_page, root_id, hit_indexes) => {
            _.forEach(current_page, (control, index) => {
                let elements = control.elements;
                let element = elements[0];
                if (element.parent == root_id) {
                    hit_indexes.push(index);
                    collect_family(current_page, control.id, hit_indexes);
                }
            });
        };
        this.DeleteElement = () => {
            if (this.selected) {
                let is_hit = false;
                let hit_indexes = [];
                _.forEach(this.current_page, (control, index) => {
                    if (control.id == this.selected.id) {
                        is_hit = true;
                        hit_indexes.push(index);
                    }
                });
                collect_family(this.current_page, this.selected.id, hit_indexes);
                let sorted_indexes = _.sortBy(hit_indexes).reverse();
                // delayed delete for "forEach"
                if (is_hit) {
                    _.forEach(sorted_indexes, (hits_index) => {
                        this.current_page.splice(hits_index, 1);
                    });
                }
                this.Deselect(() => {
                });
                this.Draw();
            }
        };
        this.idToNo = (id) => {
            let result = "";
            for (var i = id.length - 1; i >= 0; i--) {
                let c = id[i];
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
        this.ChildCount = (id) => {
            let numbers = [0];
            let children = angular.element("#" + id).children();
            _.forEach(children, (element) => {
                let number = this.idToNo(element.id);
                numbers.push(number);
            });
            return _.max(numbers) + 1;
            //        return angular.element("#" + id).children().length;
        };
        this.ParentId = (_default) => {
            let parent = this.Selected();
            let result = _default;
            if (parent) {
                result = parent.id;
            }
            return result;
        };
        this.SelectChild = (id) => {
            let result = [];
            _.forEach(this.current_page, (element) => {
                if (element.parent = id) {
                    result.push(element);
                }
            });
            return result;
        };
        this.CreateId = (_default_root) => {
            let parent_id = this.ParentId(_default_root);
            let num = this.ChildCount(parent_id);
            return parent_id + "_" + num;
        };
        this.Draw = (callback) => {
            watchChangeClear();
            watchClickClear();
            angular.element("#root").empty();
            Elements(this.current_page, (control, element) => {
                let field = [];
                let id = element.id;
                let parent = element.parent;
                let label = element.label;
                let type = element.type;
                let attributes = attributes_by_mode(true, element);
                let contents = element.contents;
                let events = element.events;
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
                    case "select":
                        let contents_model_name = id + "_contents";
                        this.$scope[contents_model_name] = contents;
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
                    case "button":
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
                let child_element = angular.element(HtmlEdit.toHtml(field, ""));
                let parent_element = angular.element("#" + parent);
                parent_element.append(child_element);
                return true;
            });
            this.$compile(angular.element("#root").contents())(this.$scope);
            if (callback) {
                callback({ name: "exit" });
            }
        };
        this.SetEditMode = (mode, callback) => {
            this.Deselect(callback);
            this.Draw();
        };
        this.Query = (callback, error) => {
            FormQuery.query({
                query: encodeURIComponent(JSON.stringify(this.query)),
                option: encodeURIComponent(JSON.stringify(this.option))
            }, (result) => {
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
        this.Count = (callback, error) => {
            FormCount.get({
                query: encodeURIComponent(JSON.stringify(this.query))
            }, (result) => {
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
        this.Over = (callback, error) => {
            this.Count((count) => {
                callback((this.option.skip + this.option.limit) <= count);
            }, error);
        };
        this.Under = (callback, error) => {
            callback(this.option.skip > 0);
        };
        this.Next = (callback, error) => {
            this.Over((hasnext) => {
                if (hasnext) {
                    this.option.skip = this.option.skip + this.option.limit;
                    this.Query(callback, error);
                }
                else {
                    callback(null);
                }
            });
        };
        this.Prev = (callback, error) => {
            this.Under((hasprev) => {
                if (hasprev) {
                    this.option.skip = this.option.skip - this.option.limit;
                    this.Query(callback, error);
                }
                else {
                    callback(null);
                }
            });
        };
        this.Create = (name, type, callback, error) => {
            init();
            let form = new FormCreate();
            form.name = name;
            form.type = type;
            form.$save({}, (result) => {
                if (result) {
                    if (result.code === 0) {
                        this.current_id = result.value._id;
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
        this.Get = (id, callback, error) => {
            init();
            this.current_id = id;
            Form.get({
                id: this.current_id
            }, (result) => {
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
        this.Put = (content, callback, error) => {
            let form = new Form();
            form.content = content;
            form.$put({
                id: this.current_id
            }, (result) => {
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
        this.Delete = (callback, error) => {
            Form.delete({
                id: this.current_id
            }, (result) => {
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
        this.Tag = (name, attributes) => {
            let parent_id = FormBuilderService.ParentId("root");
            let id = FormBuilderService.CreateId("root");
            let new_tag = {
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
        this.Div = (klass) => {
            let parent_id = FormBuilderService.ParentId("root");
            let id = FormBuilderService.CreateId("root");
            let new_div = {
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
        this.Field = (label, validator) => {
            let parent_id = FormBuilderService.ParentId("root");
            let id = FormBuilderService.CreateId("root");
            let attribute = (id, val) => {
                let result = { class: "form-control no-zoom field-control", "ng-model": id, type: "text", name: id, style: {} };
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
            let new_field = {
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
                let min = {
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
                let max = {
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
                let max = {
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
                let required = {
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
        this.HtmlField = (label, validator) => {
            let parent_id = FormBuilderService.ParentId("root");
            let id = FormBuilderService.CreateId("root");
            let attribute = (id, val) => {
                let result = { class: "form-control no-zoom field-control", "ng-model": id, type: "text", name: id, style: {} };
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
            let new_field = {
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
                let min = {
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
                let max = {
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
                let max = {
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
                let required = {
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
        this.TextArea = (label, validator) => {
            let parent_id = FormBuilderService.ParentId("root");
            let id = FormBuilderService.CreateId("root");
            let attribute = (id, val) => {
                let result = { class: "form-control no-zoom textarea-control", "ng-model": id, type: "text", name: id, style: {} };
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
            let new_field = {
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
                let min = {
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
                let max = {
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
                let required = {
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
        this.Number = (label, validator) => {
            let parent_id = FormBuilderService.ParentId("root");
            let id = FormBuilderService.CreateId("root");
            let attribute = (id, val) => {
                let result = { class: "form-control no-zoom number-control", "ng-model": id, type: "number", name: id, style: {} };
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
            let new_field = {
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
                let min = {
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
                let max = {
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
                let required = {
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
        this.HtmlElement = (label, validator) => {
            let parent_id = FormBuilderService.ParentId("root");
            let id = FormBuilderService.CreateId("root");
            let attribute = (id, val) => {
                return { class: "", "text-angular": "true", "ng-model": id, type: "text", style: {} };
            };
            let new_field = {
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
                        attributes: { for: id + "_fieldinput" },
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
                        type: "div",
                        id: id + "_edit",
                        parent: id,
                        label: label,
                        attributes: attribute(id, validator),
                        contents: [],
                        events: {}
                    }
                ]
            };
            return new_field;
        };
        this.Img = (label, property) => {
            let parent_id = FormBuilderService.ParentId("root");
            let id = FormBuilderService.CreateId("root");
            let new_field = {
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
        this.Select = (label, validator) => {
            let parent_id = FormBuilderService.ParentId("root");
            let id = FormBuilderService.CreateId("root");
            let attributes = { class: "form-control select-control", "ng-model": id, style: { "font-size": "12px", "border-width": "2px", "border-style": "solid", "border-color": "rgba(120,120,120,0.1)" } };
            if (validator.required) {
                attributes = { class: "form-control select-control", "ng-model": id, required: validator.required.value, style: { "font-size": "12px", "border-width": "2px", "border-style": "solid", "border-color": "rgba(120,120,120,0.1)" } };
            }
            let new_field = {
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
                let required = {
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
        this.Check = (label, property) => {
            let parent_id = FormBuilderService.ParentId("root");
            let id = FormBuilderService.CreateId("root");
            let new_field = {
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
        this.Chips = (label, property) => {
            let parent_id = FormBuilderService.ParentId("root");
            let id = FormBuilderService.CreateId("root");
            let attribute = (id, val) => {
                let result = { class: "chips-control", "ng-model": id, name: id, style: {}, "ng-change": "contents_update(tab.element_contents);" };
                return result;
            };
            let new_chips = {
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
        this.Address = (label, property) => {
            let parent_id = FormBuilderService.ParentId("root");
            let id = FormBuilderService.CreateId("root");
            let attribute = (id, val) => {
                let result = { class: "", "ng-model": id, name: id, style: {}, "ng-change": "contents_update(tab.element_contents);" };
                return result;
            };
            let new_address = {
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
//# sourceMappingURL=form_builder_services.js.map