/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var MailerServices = angular.module('MailerServices', []);
MailerServices.factory('MailSend', ['$resource',
    function ($resource) {
        return $resource('/mailer/api/send', {}, {});
    }]);
MailerServices.factory('Mail', ['$resource',
    function ($resource) {
        return $resource('/mailer/api/:id', { id: "@id" }, {
            get: { method: 'GET' },
            put: { method: 'PUT' },
            delete: { method: 'DELETE' }
        });
    }]);
MailerServices.factory('MailQuery', ['$resource',
    function ($resource) {
        return $resource("/mailer/api/query/:query/:option", { query: '@query', option: '@optopn' }, {
            query: { method: 'GET' }
        });
    }]);
MailerServices.factory('MailCount', ['$resource',
    function ($resource) {
        return $resource('/mailer/api/count/:query', { query: '@query' }, {
            get: { method: 'GET' }
        });
    }]);
MailerServices.service('MailerService', ["MailSend", "Mail", "$http",
    function (MailSend, Mail, $http) {
        var _this = this;
        this.sender = [];
        this.SetQuery = function (query) {
            _this.option.skip = 0;
            _this.query = {};
            if (query) {
                _this.query = query;
            }
        };
        var init = function () {
            _this.option = { sort: { create: -1 }, limit: 40, skip: 0 };
            _this.SetQuery(null);
            _this.current_article = null;
        };
        this.Init = function () {
            init();
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
        this.Send = function (content, callback, error) {
            init();
            var article = new MailSend();
            article.content = content;
            article.$save({}, function (result) {
                if (result) {
                    if (result.code === 0) {
                        _this.current_article = result.value;
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
        this.Get = function (mail, callback, error) {
            init();
            Mail.get({
                id: mail._id
            }, function (result) {
                if (result) {
                    if (result.code === 0) {
                        _this.current_article = result.value;
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
        this.Delete = function (mail, callback, error) {
            Mail.delete({
                id: mail._id
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
        init();
    }]);
MailerServices.service('MailQueryService', ["MailQuery", "MailCount",
    function (MailQuery, MailCount) {
        var _this = this;
        this.sender = [];
        this.SetQuery = function (query) {
            _this.option.skip = 0;
            _this.query = {};
            if (query) {
                _this.query = query;
            }
        };
        var init = function () {
            _this.option = { sort: { create: -1 }, limit: 40, skip: 0 };
            _this.SetQuery(null);
            _this.current_article = null;
        };
        this.Init = function () {
            init();
        };
        this.Query = function (send, callback, error) {
            var type = 10001;
            if (send) {
                type = 10000;
            }
            MailQuery.query({
                query: encodeURIComponent(JSON.stringify({ $and: [{ type: type }, _this.query] })),
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
        this.Count = function (send, callback, error) {
            var type = 10001;
            if (send) {
                type = 10000;
            }
            MailCount.get({
                query: encodeURIComponent(JSON.stringify({ $and: [{ type: type }, _this.query] }))
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
        this.Over = function (send, callback, error) {
            _this.Count(send, function (count) {
                callback((_this.option.skip + _this.option.limit) <= count);
            }, error);
        };
        this.Under = function (send, callback, error) {
            callback(_this.option.skip > 0);
        };
        this.Next = function (send, callback, error) {
            _this.Over(send, function (hasnext) {
                if (hasnext) {
                    _this.option.skip = _this.option.skip + _this.option.limit;
                    _this.Query(send, callback, error);
                }
                else {
                    callback(null);
                }
            });
        };
        this.Prev = function (send, callback, error) {
            _this.Under(send, function (hasprev) {
                if (hasprev) {
                    _this.option.skip = _this.option.skip - _this.option.limit;
                    _this.Query(send, callback, error);
                }
                else {
                    callback(null);
                }
            });
        };
        this.Init();
    }]);
//# sourceMappingURL=mailer_services.js.map