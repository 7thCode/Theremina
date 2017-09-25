/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
let FrontServices = angular.module('FrontServices', []);
FrontServices.factory('GroupMember', ['$resource',
    ($resource) => {
        return $resource('/members/api/:id', { id: "@id" }, {
            get: { method: 'GET' },
            put: { method: 'PUT' },
            delete: { method: 'DELETE' }
        });
    }]);
FrontServices.factory('GroupMemberQuery', ['$resource',
    ($resource) => {
        return $resource('/members/api/query/:query/:option', { query: '@query', option: '@option' }, {
            query: { method: 'GET' }
        });
    }]);
FrontServices.factory('GroupMemberCount', ['$resource',
    ($resource) => {
        return $resource('/members/api/count/:query', { query: '@query' }, {
            get: { method: 'GET' }
        });
    }]);
FrontServices.service('MemberService', ['GroupMember', 'GroupMemberQuery', 'GroupMemberCount', 'CollectionService',
    function (GroupMember, GroupMemberQuery, GroupMemberCount, CollectionService) {
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
            CollectionService.List(GroupMemberQuery, this.query, this.option, callback, error);
        };
        this.Count = (callback, error) => {
            CollectionService.Count(GroupMemberCount, this.query, callback, error);
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
        this.Put = (username, content, callback, error) => {
            let group = new GroupMember();
            group.content = content;
            group.$put({
                username: username
            }, (result) => {
                if (result) {
                    if (result.code === 0) {
                        callback(result.value);
                        this.dirty = false;
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
FrontServices.factory('UploadData', ['$resource',
    ($resource) => {
        return $resource('/api/upload/:name', { name: '@name' }, {
            put: { method: 'PUT' }
        });
    }]);
FrontServices.service('DataService', ['UploadData',
    function (UploadData) {
        this.Upload = (url, filename, callback, error) => {
            let data = new UploadData();
            data.url = url;
            data.$put({ name: filename }, (result) => {
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
    }]);
FrontServices.factory('BuildSite', ['$resource',
    ($resource) => {
        return $resource('/api/buildsite/:name', { name: "@name" }, {});
    }]);
FrontServices.service('SiteService', ['BuildSite',
    function (BuildSite) {
        this.Build = (name, callback, error) => {
            let site = new BuildSite();
            site.name = name;
            site.$save({}, (result) => {
                if (result) {
                    if (result.code === 0) {
                        callback(null);
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
    }]);
FrontServices.factory('Namespaces', ['$resource',
    ($resource) => {
        return $resource('/api/namespaces', {}, {});
    }]);
FrontServices.service('NamespaceService', ['Namespaces',
    function (Namespaces) {
        this.Get = (callback, error) => {
            Namespaces.get({}, (result) => {
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
    }]);
//# sourceMappingURL=front_services.js.map