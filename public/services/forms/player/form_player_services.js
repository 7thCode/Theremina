/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
let FormPlayerServices = angular.module('FormPlayerServices', []);
FormPlayerServices.factory('FormCreate', ['$resource',
    ($resource) => {
        return $resource('/forms/api/create', {}, {});
    }]);
FormPlayerServices.factory('Form', ['$resource',
    ($resource) => {
        return $resource('/forms/api/:id', { id: "@id" }, {
            get: { method: 'GET' },
            put: { method: 'PUT' },
            delete: { method: 'DELETE' }
        });
    }]);
FormPlayerServices.factory('FormQuery', ['$resource',
    ($resource) => {
        return $resource("/forms/api/query/:query/:option", { query: '@query', option: '@optopn' }, {
            query: { method: 'GET' }
        });
    }]);
FormPlayerServices.factory('FormCount', ['$resource',
    ($resource) => {
        return $resource('/forms/api/count/:query', { query: '@query' }, {
            get: { method: 'GET' }
        });
    }]);
FormPlayerServices.service('FormPlayerService', ["HtmlEdit", "FormCreate", "Form", "FormQuery", "FormCount",
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
            this.edit_mode = false;
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
        let watchChange = ($scope, id, events) => {
            if (events) {
                if (events.onChange) {
                    change_watchers.push($scope.$watch(id, (value) => {
                        let _scope = { id: id, $scope: $scope, value: value };
                        try {
                            new Function("_scope", "with (_scope) {" + events.onChange + "}")(_scope); //scope chainをぶった切る(for Security)
                        }
                        catch (e) {
                        }
                    }));
                }
            }
        };
        let watchChangeClear = () => {
            _.forEach(change_watchers, (change_watcher) => {
                change_watcher();
            });
        };
        let watchClick = ($scope, id, events) => {
            if (events) {
                if (events.onClick) {
                    $scope["click_" + id] = () => {
                        click_watchers.push(id);
                        let _scope = { id: id, $scope: $scope };
                        try {
                            new Function("_scope", "with (_scope) {" + events.onClick + "}")(_scope); //scope chainをぶった切る(for Security)
                        }
                        catch (e) {
                        }
                    };
                }
            }
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
            let result = {};
            if (this.edit_mode) {
                if (!element.attributes) {
                    element.attributes = {};
                }
                else {
                    if (element.attributes.style) {
                        //       element.attributes.style['cursor'] = 'crosshair';
                    }
                }
                result = flatten_collection(element.attributes, { 'ng-click': click_handler(element.id) });
            }
            else {
                if (element.attributes) {
                    if (element.attributes['ng-click']) {
                        delete element.attributes['ng-click'];
                    }
                    if (element.attributes.style) {
                        delete element.attributes.style['cursor'];
                    }
                    result = element.attributes;
                }
            }
            return result;
        };
        let Deselect = (callback) => {
            this.selected = null;
            callback(null);
        };
        this.Select = (id, select, deselect) => {
            Elements(this.current_page, (control, element) => {
                let _continue = true;
                if (element) {
                    if (element.editable) {
                        if (element.id == id) {
                            Deselect(deselect);
                            this.selected = element;
                            select(element);
                            _continue = false;
                        }
                    }
                }
                return _continue;
            });
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
                                    if (index > 1) {
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
        this.AddElement = (control) => {
            if (this.edit_mode) {
                this.current_page.push(control);
                this.Draw();
            }
        };
        this.DeleteElement = () => {
            if (this.selected) {
                Elements(this.current_page, (target, element) => {
                    let _continue = true;
                    if (element.editable) {
                        if (element.id == this.selected.id) {
                            this.current_page = _.filter(this.current_page, (control) => {
                                return (target != control);
                            });
                            _continue = false;
                        }
                    }
                    return _continue;
                });
                this.Draw();
            }
        };
        this.ChildCount = (id) => {
            return angular.element("#" + id).children().length;
        };
        this.ParentId = (_default) => {
            let parent = this.Selected();
            let result = _default;
            if (parent) {
                result = parent.id;
            }
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
            this.$compile(angular.element("#root").contents())(this.$scope);
            Elements(this.current_page, (control, shape) => {
                let field = [];
                let id = shape.id;
                let parent = shape.parent;
                let label = shape.label;
                let type = shape.type;
                let attributes = attributes_by_mode(this.edit_mode, shape);
                let contents = shape.contents;
                let events = shape.events;
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
                        if (!this.edit_mode) {
                            watchChange(this.$scope, id, events);
                        }
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
                        if (!this.edit_mode) {
                            watchChange(this.$scope, id, events);
                        }
                        break;
                    case "button":
                        field = [
                            {
                                "name": "button", "type": "element",
                                "_$": flatten_collection({ id: id, class: "form-control", "ng-click": "click_" + id + "()" }, attributes),
                                "@": label
                            }
                        ];
                        if (!this.edit_mode) {
                            watchClick(this.$scope, id, events);
                            watchChange(this.$scope, id, events);
                        }
                        break;
                    default:
                        field = [{
                                "name": type, "type": "element",
                                "_$": flatten_collection({ "id": id }, attributes),
                                "@": contents
                            }];
                        if (!this.edit_mode) {
                            watchChange(this.$scope, id, events);
                        }
                        break;
                }
                let hoge = HtmlEdit.toHtml(field, "");
                let angular_element = angular.element(HtmlEdit.toHtml(field, ""));
                angular.element("#" + parent).append(angular_element);
                return true;
            });
            this.$compile(angular.element("#root").contents())(this.$scope);
        };
        this.SetEditMode = (mode, callback) => {
            Deselect(callback);
            this.edit_mode = mode;
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
        this.Create = (name, content, callback, error) => {
            init();
            let form = new FormCreate();
            form.name = name;
            form.content = content;
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
        this.Init();
    }]);
//# sourceMappingURL=form_player_services.js.map