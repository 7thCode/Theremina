/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

let AccountServices: angular.IModule = angular.module('AccountServices', []);

AccountServices.factory('Account', ['$resource',
    ($resource: any): any => {
        return $resource('/accounts/api/:id', {id: "@id"}, {
            get: {method: 'GET'},
            put: {method: 'PUT'},
            delete: {method: 'DELETE'}
        });
    }]);

AccountServices.factory('AccountQuery', ['$resource',
    ($resource: any): any => {
        return $resource('/accounts/api/query/:query/:option', {query: '@query', option: '@option'}, {
            query: {method: 'GET'}
        });
    }]);

AccountServices.factory('AccountCount', ['$resource',
    ($resource: any): any => {
        return $resource('/accounts/api/count/:query', {query: '@query'}, {
            get: {method: 'GET'}
        });
    }]);

AccountServices.service('AccountService', ['Account','AccountQuery', 'AccountCount', 'CollectionService',
    function (Account:any, AccountQuery: any, AccountCount: any, CollectionService: any): void {

        this.SetQuery = (query):void => {
            this.option.skip = 0;
            this.query = {};
            if (query) {
                this.query = query;
            }
        };

        let init = ():void => {
            this.option = {limit: 40, skip: 0};
            this.SetQuery(null);
        };

        this.Init = ():void => {
            init();
        };

        this.Query = (callback: (data) => void, error: (code: number, message: string) => void): void => {
            CollectionService.List(AccountQuery, this.query, this.option, callback, error);
        };

        this.Count = (callback: (data: any) => void, error: (code: number, message: string) => void): void => {
            CollectionService.Count(AccountCount, this.query, callback, error);
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
            });
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

        this.Put = (username: any, content: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            let group = new Account();
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