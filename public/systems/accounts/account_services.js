/**!
 Copyright (c) 2016 7thCode.(https://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var AccountServicesModule;
(function (AccountServicesModule) {
    var AccountServices = angular.module('AccountServices', []);
    AccountServices.factory('Account', ['$resource',
        function ($resource) {
            return $resource('/accounts/api/:id', { id: "@id" }, {
                get: { method: 'GET' },
                put: { method: 'PUT' },
                delete: { method: 'DELETE' }
            });
        }]);
    AccountServices.factory('AccountQuery', ['$resource',
        function ($resource) {
            return $resource('/accounts/api/query/:query/:option', { query: '@query', option: '@option' }, {
                query: { method: 'GET' }
            });
        }]);
    AccountServices.factory('AccountCount', ['$resource',
        function ($resource) {
            return $resource('/accounts/api/count/:query', { query: '@query' }, {
                get: { method: 'GET' }
            });
        }]);
    AccountServices.service('AccountService', ['Account', 'AccountQuery', 'AccountCount', 'CollectionService',
        function (Account, AccountQuery, AccountCount, CollectionService) {
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
                CollectionService.List(AccountQuery, _this.query, _this.option, callback, error);
            };
            this.Count = function (callback, error) {
                CollectionService.Count(AccountCount, _this.query, callback, error);
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
            this.Put = function (username, content, callback, error) {
                var group = new Account();
                group.content = content;
                group.$put({
                    username: username
                }, function (result) {
                    if (result) {
                        if (result.code === 0) {
                            callback(result.value);
                            _this.dirty = false;
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
})(AccountServicesModule || (AccountServicesModule = {}));
//# sourceMappingURL=account_services.js.map