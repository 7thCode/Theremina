/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
let AccountServices = angular.module('AccountServices', []);
AccountServices.factory('Account', ['$resource',
    ($resource) => {
        return $resource('/accounts/api/:id', { id: "@id" }, {
            get: { method: 'GET' },
            put: { method: 'PUT' },
            delete: { method: 'DELETE' }
        });
    }]);
AccountServices.factory('AccountQuery', ['$resource',
    ($resource) => {
        return $resource('/accounts/api/query/:query/:option', { query: '@query', option: '@option' }, {
            query: { method: 'GET' }
        });
    }]);
AccountServices.factory('AccountCount', ['$resource',
    ($resource) => {
        return $resource('/accounts/api/count/:query', { query: '@query' }, {
            get: { method: 'GET' }
        });
    }]);
AccountServices.service('AccountService', ['Account', 'AccountQuery', 'AccountCount', 'CollectionService',
    function (Account, AccountQuery, AccountCount, CollectionService) {
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
            CollectionService.List(AccountQuery, this.query, this.option, callback, error);
        };
        this.Count = (callback, error) => {
            CollectionService.Count(AccountCount, this.query, callback, error);
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
            let group = new Account();
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
//# sourceMappingURL=account_services.js.map