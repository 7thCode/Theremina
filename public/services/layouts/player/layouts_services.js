/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var LayoutServices = angular.module('LayoutServices', []);
LayoutServices.factory('LayoutCreate', ['$resource',
    function ($resource) {
        return $resource('/layouts/layout/create', {}, {});
    }]);
LayoutServices.factory('Layout', ['$resource',
    function ($resource) {
        return $resource('/layouts/layout/:id', { id: "@id" }, {
            get: { method: 'GET' },
            put: { method: 'PUT' },
            delete: { method: 'DELETE' }
        });
    }]);
LayoutServices.factory('LayoutPDF', ['$resource',
    function ($resource) {
        return $resource('/layouts/layout/pdf', {}, {});
    }]);
LayoutServices.factory('LayoutSVG', ['$resource',
    function ($resource) {
        return $resource('/layouts/layout/svg', {}, {});
    }]);
LayoutServices.factory('LayoutQuery', ['$resource',
    function ($resource) {
        return $resource("/layouts/layout/query/:query/:option", { query: '@query', option: '@optopn' }, {
            query: { method: 'GET' }
        });
    }]);
LayoutServices.factory('LayoutCount', ['$resource',
    function ($resource) {
        return $resource('/layouts/layout/count/:query', { query: '@query' }, {
            get: { method: 'GET' }
        });
    }]);
LayoutServices.service('LayoutService', ['$log', "LayoutCreate", "Layout", 'LayoutQuery', "LayoutCount", 'LayoutPDF', 'LayoutSVG',
    function ($log, LayoutCreate, Layout, LayoutQuery, LayoutCount, LayoutPDF, LayoutSVG) {
        var _this = this;
        this.SetQuery = function (query) {
            _this.option.skip = 0;
            _this.query = {};
            if (query) {
                _this.query = query;
            }
        };
        var init = function () {
            _this.option = { sort: { modify: -1 }, limit: 40, skip: 0 };
            _this.SetQuery(null);
            _this.count = 0;
            _this.format = {
                size: [600, 848],
                margins: {
                    top: 72,
                    bottom: 72,
                    left: 72,
                    right: 72
                },
                layout: 'portrait',
                info: {
                    Title: 'title',
                    Author: 'pdf_writer',
                    Subject: 'test',
                    Keywords: 'pdf;javascript',
                    CreationDate: '10/10/2016',
                    ModDate: '11/10/2016'
                }
            };
        };
        this.Init = function () {
            init();
        };
        this.Query = function (callback, error) {
            LayoutQuery.query({
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
            LayoutCount.get({
                query: encodeURIComponent(JSON.stringify(_this.query)),
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
        this.Create = function (namespace, name, content, callback, error) {
            init();
            var layout = new LayoutCreate();
            layout.name = name;
            layout.namespace = namespace;
            layout.content = content;
            layout.$save({}, function (result) {
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
        this.Get = function (id, callback, error) {
            init();
            Layout.get({
                id: id
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
        this.Put = function (_layout, callback, error) {
            var layout = new Layout();
            layout.content = _layout.content;
            layout.name = _layout.name;
            layout.$put({
                id: _this.current_layout._id
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
        this.PutAs = function (name, _layout, callback, error) {
            var layout = new Layout();
            layout.content = _layout.content;
            layout.name = name;
            layout.$put({
                id: _this.current_layout._id
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
            Layout.delete({
                id: _this.current_layout._id
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
        this.PrintPDF = function (content, callback, error) {
            var layout = new LayoutPDF();
            layout.content = content;
            layout.$save({}, function (result) {
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
        this.PrintSVG = function (content, callback, error) {
            var layout = new LayoutSVG();
            layout.content = content;
            layout.$save({}, function (result) {
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
        this.Init();
    }]);
//# sourceMappingURL=layouts_services.js.map