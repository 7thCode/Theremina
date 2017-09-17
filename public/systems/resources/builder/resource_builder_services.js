/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
let ResourceBuilderServices = angular.module('ResourceBuilderServices', []);
ResourceBuilderServices.factory('ResourceCreate', ['$resource',
    ($resource) => {
        return $resource('/resources/api/create', {}, {});
    }]);
ResourceBuilderServices.factory('Resource', ['$resource',
    ($resource) => {
        return $resource('/resources/api/:id', { id: "@id" }, {
            get: { method: 'GET' },
            put: { method: 'PUT' },
            delete: { method: 'DELETE' }
        });
    }]);
ResourceBuilderServices.factory('ResourceQuery', ['$resource',
    ($resource) => {
        return $resource("/resources/api/query/:query/:option", { query: '@query', option: '@optopn' }, {
            query: { method: 'GET' }
        });
    }]);
ResourceBuilderServices.factory('ResourceCount', ['$resource',
    ($resource) => {
        return $resource('/resources/api/count/:query', { query: '@query' }, {
            get: { method: 'GET' }
        });
    }]);
ResourceBuilderServices.service('ResourceBuilderService', ["HtmlEdit", "ResourceCreate", "Resource", "ResourceQuery", "ResourceCount",
    function (HtmlEdit, ResourceCreate, Resource, ResourceQuery, ResourceCount) {
        this.InitQuery = (query, type = 0, pagesize = 40) => {
            this.option.skip = 0;
            this.option.limit = pagesize;
            this.query = { $and: [{}] };
            if (query) {
                this.query = query;
            }
        };
        this.GetQuery = () => {
            return this.query;
        };
        this.AddQuery = (query) => {
            if (this.query) {
                if (this.query.$and) {
                    if (Object.keys(query).length !== 0) {
                        this.query.$and.push(query);
                    }
                }
            }
        };
        this.RemoveQuery = (name) => {
            if (this.query) {
                if (this.query.$and) {
                    let filted = [{}];
                    this.query.$and.forEach((query) => {
                        if (!query[name]) {
                            if (Object.keys(query).length !== 0) {
                                filted.push(query);
                            }
                        }
                    });
                    this.query.$and = filted;
                    if (filted.length == 0) {
                        this.query = { $and: [{}] };
                    }
                }
            }
        };
        let init = () => {
            this.option = { limit: 40, skip: 0 };
            this.InitQuery();
            this.current = { content: {} };
        };
        this.Init = () => {
            init();
        };
        this.Query = (callback, error) => {
            ResourceQuery.query({
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
            ResourceCount.get({
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
            let resource = new ResourceCreate();
            resource.name = name;
            resource.type = type;
            resource.content = this.current.content;
            resource.$save({}, (result) => {
                if (result) {
                    if (result.code === 0) {
                        this.current = result.value;
                        callback(this.current.content);
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
            //      init();
            Resource.get({
                id: id
            }, (result) => {
                if (result) {
                    if (result.code === 0) {
                        this.current = result.value;
                        callback(this.current.content);
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
        this.Put = (callback, error) => {
            let resource = new Resource();
            resource.content = this.current.content;
            resource.$put({
                id: this.current._id,
            }, (result) => {
                if (result) {
                    if (result.code === 0) {
                        callback(result.value.content);
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
            Resource.delete({
                id: this.current._id
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
        this.preview = document.getElementById("view");
        this.Init();
    }]);
//# sourceMappingURL=resource_builder_services.js.map