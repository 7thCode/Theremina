/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

let GroupServices: angular.IModule = angular.module('GroupServices', []);

GroupServices.factory('GroupOwn', ['$resource',
    ($resource: any): any => {
        return $resource('/groups/api/own', {}, {});
    }]);

GroupServices.factory('GroupCreate', ['$resource',
    ($resource: any): any => {
        return $resource('/groups/api/create', {}, {});
    }]);

GroupServices.factory('Group', ['$resource',
    ($resource: any): any => {
        return $resource('/groups/api/:id', {id: "@id"}, {
            get: {method: 'GET'},
            put: {method: 'PUT'},
            delete: {method: 'DELETE'}
        });
    }]);

GroupServices.factory('GroupQuery', ['$resource',
    ($resource: any): any => {
        return $resource("/groups/api/query/:query/:option", {query: '@query', option: '@optopn'}, {
            query: {method: 'GET'}
        });
    }]);

GroupServices.factory('GroupCount', ['$resource',
    ($resource: any): any => {
        return $resource('/groups/api/count/:query', {query: '@query'}, {
            get: {method: 'GET'}
        });
    }]);

GroupServices.service('GroupService', [ "GroupOwn","GroupCreate", "Group", "GroupQuery", "GroupCount",
    function (GroupOwn:any,GroupCreate: any, Group: any, GroupQuery: any, GroupCount: any): void {

        this.SetQuery = (query) => {
            this.option.skip = 0;
            this.query = {};
            if (query) {
                this.query = query;
            }
        };

        let init = () => {
            this.option = {limit: 40, skip: 0};
            this.SetQuery(null);
        };

        this.Init = () => {
            init();
        };

        this.Query = (callback: (result: any) => void, error: (code: number, message: string) => void) => {
            GroupQuery.query({
                query: encodeURIComponent(JSON.stringify(this.query)),
                option: encodeURIComponent(JSON.stringify(this.option))
            }, (result: any): void => {
                if (result) {
                    if (result.code === 0) {
                        callback(result.value);
                    } else {
                        error(result.code, result.message);
                    }
                } else {
                    error(10000, "network error");
                }
            });
        };

        this.Count = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            GroupCount.get({
                query: encodeURIComponent(JSON.stringify(this.query))
            }, (result: any): void => {
                if (result) {
                    if (result.code === 0) {
                        callback(result.value);
                    } else {
                        error(result.code, result.message);
                    }
                } else {
                    error(10000, "network error");
                }
            });
        };

        this.Over = (callback: (result: boolean) => void, error: (code: number, message: string) => void): void => {
            this.Count((count) => {
                callback((this.option.skip + this.option.limit) <= count);
            }, error);
        };

        this.Under = (callback: (result: boolean) => void, error: (code: number, message: string) => void): void => {
            callback(this.option.skip > 0);
        };

        this.Next = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            this.Over((hasnext) => {
                if (hasnext) {
                    this.option.skip = this.option.skip + this.option.limit;
                    this.Query(callback, error);
                } else {
                    callback(null);
                }
            },);
        };

        this.Prev = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            this.Under((hasprev) => {
                if (hasprev) {
                    this.option.skip = this.option.skip - this.option.limit;
                    this.Query(callback, error);
                } else {
                    callback(null);
                }
            });
        };

        this.Own = (name: string, content: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            init();
            let group = new GroupOwn();
            group.name = name;
            group.content = content;
            group.$save({}, (result: any): void => {
                if (result) {
                    if (result.code === 0) {
                        callback(result.value);
                    } else {
                        error(result.code, result.message);
                    }
                } else {
                    error(10000, "network error");
                }
            });
        };

        this.Create = (name: string, content: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            init();
            let group = new GroupCreate();
            group.name = name;
            group.content = content;
            group.$save({}, (result: any): void => {
                if (result) {
                    if (result.code === 0) {
                        callback(result.value);
                    } else {
                        error(result.code, result.message);
                    }
                } else {
                    error(10000, "network error");
                }
            });
        };

        this.Get = (id: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            init();
            Group.get({
                id: id
            }, (result: any): void => {
                if (result) {
                    if (result.code === 0) {
                        callback(result.value);
                    } else {
                        error(result.code, result.message);
                    }
                } else {
                    error(10000, "network error");
                }
            });
        };

        this.Put = (id: any, content: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            let group = new Group();
            group.content = content;
            group.$put({
                id: id
            }, (result: any): void => {
                if (result) {
                    if (result.code === 0) {
                        callback(result.value);
                    } else {
                        error(result.code, result.message);
                    }
                } else {
                    error(10000, "network error");
                }
            });
        };

        this.Delete = (id: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            Group.delete({
                id: id
            }, (result: any): void => {
                if (result) {
                    if (result.code === 0) {
                        init();
                        callback(result.value);
                    } else {
                        error(result.code, result.message);
                    }
                } else {
                    error(10000, "network error");
                }
            });
        };

        this.Init();

    }]);
