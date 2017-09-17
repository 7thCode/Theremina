/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
let AnalysisServices = angular.module('AnalysisServices', []);
AnalysisServices.factory('Analysis', ['$resource',
    ($resource) => {
        return $resource('/analysis/api/:id', { id: "@id" }, {
            get: { method: 'GET' },
            put: { method: 'PUT' },
            delete: { method: 'DELETE' }
        });
    }]);
AnalysisServices.factory('AnalysisQuery', ['$resource',
    ($resource) => {
        return $resource("/analysis/api/query/:query/:option", { query: '@query', option: '@optopn' }, {
            query: { method: 'GET' }
        });
    }]);
AnalysisServices.factory('AnalysisCount', ['$resource',
    ($resource) => {
        return $resource('/analysis/api/count/:query', { query: '@query' }, {
            get: { method: 'GET' }
        });
    }]);
AnalysisServices.service('AnalysisService', ["Analysis", "AnalysisQuery", "AnalysisCount",
    function (Analysis, AnalysisQuery, AnalysisCount) {
        this.SetQuery = (query) => {
            this.option.skip = 0;
            this.query = {};
            if (query) {
                this.query = query;
            }
        };
        this.Init = () => {
            this.option = { limit: 40, skip: 0 };
            this.SetQuery(null);
            this.current = { content: {} };
        };
        this.Init = () => {
            init();
        };
        this.Query = (callback, error) => {
            AnalysisQuery.query({
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
            AnalysisCount.get({
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
        this.Get = (id, callback, error) => {
            this.Init();
            Analysis.get({
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
        this.Init();
    }]);
//# sourceMappingURL=analysis_services.js.map