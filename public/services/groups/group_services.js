/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
let GroupServices = angular.module('GroupServices', []);
GroupServices.factory('GroupOwn', ['$resource',
    ($resource) => {
        return $resource('/groups/api/own', {}, {});
    }]);
GroupServices.factory('GroupCreate', ['$resource',
    ($resource) => {
        return $resource('/groups/api/create', {}, {});
    }]);
GroupServices.factory('Group', ['$resource',
    ($resource) => {
        return $resource('/groups/api/:id', { id: "@id" }, {
            get: { method: 'GET' },
            put: { method: 'PUT' },
            delete: { method: 'DELETE' }
        });
    }]);
GroupServices.factory('GroupQuery', ['$resource',
    ($resource) => {
        return $resource("/groups/api/query/:query/:option", { query: '@query', option: '@optopn' }, {
            query: { method: 'GET' }
        });
    }]);
GroupServices.factory('GroupCount', ['$resource',
    ($resource) => {
        return $resource('/groups/api/count/:query', { query: '@query' }, {
            get: { method: 'GET' }
        });
    }]);
GroupServices.service('GroupService', ["GroupOwn", "GroupCreate", "Group", "GroupQuery", "GroupCount",
    function (GroupOwn, GroupCreate, Group, GroupQuery, GroupCount) {
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
        };
        this.Init = () => {
            init();
        };
        this.Query = (callback, error) => {
            GroupQuery.query({
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
            GroupCount.get({
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
        this.Own = (name, content, callback, error) => {
            init();
            let group = new GroupOwn();
            group.name = name;
            group.content = content;
            group.$save({}, (result) => {
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
        this.Create = (name, content, callback, error) => {
            init();
            let group = new GroupCreate();
            group.name = name;
            group.content = content;
            group.$save({}, (result) => {
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
            Group.get({
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
        this.Put = (id, content, callback, error) => {
            let group = new Group();
            group.content = content;
            group.$put({
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
        this.Delete = (id, callback, error) => {
            Group.delete({
                id: id
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
//# sourceMappingURL=group_services.js.map