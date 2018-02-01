/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var GroupServicesModule;
(function (GroupServicesModule) {
    var GroupServices = angular.module('GroupServices', []);
    GroupServices.factory('GroupOwn', ['$resource',
        function ($resource) {
            return $resource('/groups/api/own', {}, {});
        }]);
    GroupServices.factory('GroupCreate', ['$resource',
        function ($resource) {
            return $resource('/groups/api/create', {}, {});
        }]);
    GroupServices.factory('Group', ['$resource',
        function ($resource) {
            return $resource('/groups/api/:id', { id: "@id" }, {
                get: { method: 'GET' },
                put: { method: 'PUT' },
                delete: { method: 'DELETE' }
            });
        }]);
    GroupServices.factory('GroupQuery', ['$resource',
        function ($resource) {
            return $resource("/groups/api/query/:query/:option", { query: '@query', option: '@optopn' }, {
                query: { method: 'GET' }
            });
        }]);
    GroupServices.factory('GroupCount', ['$resource',
        function ($resource) {
            return $resource('/groups/api/count/:query', { query: '@query' }, {
                get: { method: 'GET' }
            });
        }]);
    GroupServices.service('GroupService', ["GroupOwn", "GroupCreate", "Group", "GroupQuery", "GroupCount",
        function (GroupOwn, GroupCreate, Group, GroupQuery, GroupCount) {
            var _this = this;
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
            };
            this.Init = function () {
                init();
            };
            this.Query = function (callback, error) {
                GroupQuery.query({
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
                GroupCount.get({
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
            this.Own = function (name, content, callback, error) {
                init();
                var group = new GroupOwn();
                group.name = name;
                group.content = content;
                group.$save({}, function (result) {
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
            this.Create = function (name, content, callback, error) {
                init();
                var group = new GroupCreate();
                group.name = name;
                group.content = content;
                group.$save({}, function (result) {
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
                Group.get({
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
            this.Put = function (id, content, callback, error) {
                var group = new Group();
                group.content = content;
                group.$put({
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
            this.Delete = function (id, callback, error) {
                Group.delete({
                    id: id
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
            this.Init();
        }]);
})(GroupServicesModule || (GroupServicesModule = {}));
//# sourceMappingURL=group_services.js.map