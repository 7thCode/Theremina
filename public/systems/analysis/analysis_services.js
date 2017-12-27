/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var AnalysisServices = angular.module('AnalysisServices', []);
AnalysisServices.factory('Analysis', ['$resource',
    function ($resource) {
        return $resource('/analysis/api/:id', { id: "@id" }, {
            get: { method: 'GET' },
            put: { method: 'PUT' },
            delete: { method: 'DELETE' }
        });
    }]);
AnalysisServices.factory('AnalysisQuery', ['$resource',
    function ($resource) {
        return $resource("/analysis/api/query/:query/:option", { query: '@query', option: '@optopn' }, {
            query: { method: 'GET' }
        });
    }]);
AnalysisServices.factory('AnalysisCount', ['$resource',
    function ($resource) {
        return $resource('/analysis/api/count/:query', { query: '@query' }, {
            get: { method: 'GET' }
        });
    }]);
AnalysisServices.service('AnalysisService', ["Analysis", "AnalysisQuery", "AnalysisCount",
    function (Analysis, AnalysisQuery, AnalysisCount) {
        var _this = this;
        this.SetQuery = function (query) {
            _this.option.skip = 0;
            _this.query = {};
            if (query) {
                _this.query = query;
            }
        };
        this.Init = function () {
            _this.option = { limit: 40, skip: 0 };
            _this.SetQuery(null);
            _this.current = { content: {} };
        };
        this.Init = function () {
            init();
        };
        this.Query = function (callback, error) {
            AnalysisQuery.query({
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
            AnalysisCount.get({
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
        this.Get = function (id, callback, error) {
            _this.Init();
            Analysis.get({
                id: id
            }, function (result) {
                if (result) {
                    if (result.code === 0) {
                        _this.current = result.value;
                        callback(_this.current.content);
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
//# sourceMappingURL=analysis_services.js.map