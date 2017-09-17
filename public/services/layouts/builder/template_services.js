/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
let TemplateServices = angular.module('TemplateServices', []);
TemplateServices.factory('TemplateCount', ['$resource',
    ($resource) => {
        return $resource('/layouts/template/count/:query', { query: '@query' }, {
            get: { method: 'GET' }
        });
    }]);
TemplateServices.factory('TemplateCreate', ['$resource',
    ($resource) => {
        return $resource('/layouts/template/create', {}, {});
    }]);
TemplateServices.factory('Template', ['$resource',
    ($resource) => {
        return $resource('/layouts/template/:id', { id: "@id" }, {
            get: { method: 'GET' },
            put: { method: 'PUT' },
            delete: { method: 'DELETE' }
        });
    }]);
TemplateServices.factory('TemplatePDF', ['$resource',
    ($resource) => {
        return $resource('/layouts/template/pdf', {}, {});
    }]);
TemplateServices.factory('TemplateSVG', ['$resource',
    ($resource) => {
        return $resource('/layouts/template/svg', {}, {});
    }]);
TemplateServices.factory('TemplateQuery', ['$resource',
    ($resource) => {
        return $resource("/layouts/template/query/:query/:option", { query: '@query', option: '@optopn' }, {
            query: { method: 'GET' }
        });
    }]);
TemplateServices.factory('TemplateCount', ['$resource',
    ($resource) => {
        return $resource('/layouts/template/count/:query', { query: '@query' }, {
            get: { method: 'GET' }
        });
    }]);
TemplateServices.service('TemplateService', ['$log', "TemplateCreate", "Template", 'TemplateQuery', "TemplateCount", 'TemplatePDF', 'TemplateSVG',
    function ($log, TemplateCreate, Template, TemplateQuery, TemplateCount, TemplatePDF, TemplateSVG) {
        this.SetQuery = (query) => {
            this.option.skip = 0;
            this.query = {};
            if (query) {
                this.query = query;
            }
        };
        let init = () => {
            this.current_layout = null;
            this.option = { sort: { modify: -1 }, limit: 40, skip: 0 };
            this.SetQuery(null);
            this.count = 0;
            this.format = {
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
        this.Init = () => {
            init();
        };
        this.Query = (callback, error) => {
            TemplateQuery.query({
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
            TemplateCount.get({
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
            let layout = new TemplateCreate();
            layout.name = name;
            layout.content = content;
            layout.$save({}, (result) => {
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
        this.Get = (id, callback, error) => {
            init();
            Template.get({
                id: id
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
        this.Put = (_layout, callback, error) => {
            let layout = new Template();
            layout.content = _layout.content;
            layout.name = _layout.name;
            layout.$put({
                id: this.current_layout._id
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
        this.PutAs = (name, _layout, callback, error) => {
            let layout = new Template();
            layout.content = _layout.content;
            layout.name = name;
            layout.$put({
                id: this.current_layout._id
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
            Template.delete({
                id: this.current_layout._id
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
        this.PrintPDF = (content, callback, error) => {
            let layout = new TemplatePDF();
            layout.content = content;
            layout.$save({}, (result) => {
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
        this.PrintSVG = (content, callback, error) => {
            let layout = new TemplateSVG();
            layout.content = content;
            layout.$save({}, (result) => {
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
//# sourceMappingURL=template_services.js.map