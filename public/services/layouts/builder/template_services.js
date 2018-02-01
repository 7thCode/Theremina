/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var TemplateServicesModule;
(function (TemplateServicesModule) {
    var TemplateServices = angular.module('TemplateServices', []);
    TemplateServices.factory('TemplateCount', ['$resource',
        function ($resource) {
            return $resource('/layouts/template/count/:query', { query: '@query' }, {
                get: { method: 'GET' }
            });
        }]);
    TemplateServices.factory('TemplateCreate', ['$resource',
        function ($resource) {
            return $resource('/layouts/template/create', {}, {});
        }]);
    TemplateServices.factory('Template', ['$resource',
        function ($resource) {
            return $resource('/layouts/template/:id', { id: "@id" }, {
                get: { method: 'GET' },
                put: { method: 'PUT' },
                delete: { method: 'DELETE' }
            });
        }]);
    TemplateServices.factory('TemplatePDF', ['$resource',
        function ($resource) {
            return $resource('/layouts/template/pdf', {}, {});
        }]);
    TemplateServices.factory('TemplateSVG', ['$resource',
        function ($resource) {
            return $resource('/layouts/template/svg', {}, {});
        }]);
    TemplateServices.factory('TemplateQuery', ['$resource',
        function ($resource) {
            return $resource("/layouts/template/query/:query/:option", { query: '@query', option: '@optopn' }, {
                query: { method: 'GET' }
            });
        }]);
    TemplateServices.factory('TemplateCount', ['$resource',
        function ($resource) {
            return $resource('/layouts/template/count/:query', { query: '@query' }, {
                get: { method: 'GET' }
            });
        }]);
    TemplateServices.service('TemplateService', ['$log', "TemplateCreate", "Template", 'TemplateQuery', "TemplateCount", 'TemplatePDF', 'TemplateSVG',
        function ($log, TemplateCreate, Template, TemplateQuery, TemplateCount, TemplatePDF, TemplateSVG) {
            var _this = this;
            this.SetQuery = function (query) {
                _this.option.skip = 0;
                _this.query = {};
                if (query) {
                    _this.query = query;
                }
            };
            var init = function () {
                _this.current_layout = null;
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
                TemplateQuery.query({
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
                TemplateCount.get({
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
            this.Create = function (namespace, name, content, callback, error) {
                init();
                var layout = new TemplateCreate();
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
                Template.get({
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
                var layout = new Template();
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
                var layout = new Template();
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
                Template.delete({
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
                var layout = new TemplatePDF();
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
                var layout = new TemplateSVG();
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
})(TemplateServicesModule || (TemplateServicesModule = {}));
//# sourceMappingURL=template_services.js.map