/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

let FrontServices: angular.IModule = angular.module('FrontServices', []);

FrontServices.factory('GroupMember', ['$resource',
    ($resource: any): angular.resource.IResource<any> => {
        return $resource('/members/api/:id', {id: "@id"}, {
            get: {method: 'GET'},
            put: {method: 'PUT'},
            delete: {method: 'DELETE'}
        });
    }]);

FrontServices.factory('GroupMemberQuery', ['$resource',
    ($resource: any): angular.resource.IResource<any> => {
        return $resource('/members/api/query/:query/:option', {query: '@query', option: '@option'}, {
            query: {method: 'GET'}
        });
    }]);

FrontServices.factory('GroupMemberCount', ['$resource',
    ($resource: any): angular.resource.IResource<any> => {
        return $resource('/members/api/count/:query', {query: '@query'}, {
            get: {method: 'GET'}
        });
    }]);

FrontServices.service('MemberService', ['GroupMember','GroupMemberQuery', 'GroupMemberCount', 'CollectionService',
    function (GroupMember:any, GroupMemberQuery: any, GroupMemberCount: any, CollectionService: any): void {

        this.SetQuery = (query) => {
            this.query = {};
            if (query) {
                this.query = query;
            }
        };

        let init = () => {
            this.pagesize = 25;

            this.option = {limit: this.pagesize, skip: 0};
            this.SetQuery(null);

        };

        this.Init = () => {
            init();
        };

        this.Query = (callback: (data) => void, error: (code: number, message: string) => void): void => {
            CollectionService.List(GroupMemberQuery, this.query, this.option, callback, error);
        };

        this.Count = (callback: (data: any) => void, error: (code: number, message: string) => void): void => {
            CollectionService.Count(GroupMemberCount, this.query, callback, error);
        };

        this.Over = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            this.Count((count) => {
                callback((this.option.skip + this.pagesize) < count);
            }, error);
        };

        this.Under = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            callback(this.option.skip >= this.pagesize);
        };

        this.Next = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            this.Over((hasnext) => {
                if (hasnext) {
                    this.option.skip = this.option.skip + this.pagesize;
                    this.Query(callback, error);
                } else {
                    callback(null);
                }
            });
        };

        this.Prev = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            this.Under((hasprev) => {
                if (hasprev) {
                    this.option.skip = this.option.skip - this.pagesize;
                    this.Query(callback, error);
                } else {
                    callback(null);
                }
            });
        };

        this.Put = (username: any, content: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            let group = new GroupMember();
            group.content = content;
            group.$put({
                username: username
            }, (result: any): void => {
                if (result) {
                    if (result.code === 0) {
                        callback(result.value);
                        this.dirty = false;
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