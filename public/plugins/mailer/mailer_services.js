/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
let MailerServices = angular.module('MailerServices', []);
MailerServices.factory('MailSend', ['$resource',
    ($resource) => {
        return $resource('/mailer/api/send', {}, {});
    }]);
MailerServices.factory('Mail', ['$resource',
    ($resource) => {
        return $resource('/mailer/api/:id', { id: "@id" }, {
            get: { method: 'GET' },
            put: { method: 'PUT' },
            delete: { method: 'DELETE' }
        });
    }]);
MailerServices.factory('MailQuery', ['$resource',
    ($resource) => {
        return $resource("/mailer/api/query/:query/:option", { query: '@query', option: '@optopn' }, {
            query: { method: 'GET' }
        });
    }]);
MailerServices.factory('MailCount', ['$resource',
    ($resource) => {
        return $resource('/mailer/api/count/:query', { query: '@query' }, {
            get: { method: 'GET' }
        });
    }]);
MailerServices.service('MailerService', ["MailSend", "Mail", "$http",
    function (MailSend, Mail, $http) {
        this.sender = [];
        this.SetQuery = (query) => {
            this.option.skip = 0;
            this.query = {};
            if (query) {
                this.query = query;
            }
        };
        let init = () => {
            this.option = { sort: { create: -1 }, limit: 40, skip: 0 };
            this.SetQuery(null);
            this.current_article = null;
        };
        this.Init = () => {
            init();
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
        this.Send = (content, callback, error) => {
            init();
            let article = new MailSend();
            article.content = content;
            article.$save({}, (result) => {
                if (result) {
                    if (result.code === 0) {
                        this.current_article = result.value;
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
        this.Get = (mail, callback, error) => {
            init();
            Mail.get({
                id: mail._id
            }, (result) => {
                if (result) {
                    if (result.code === 0) {
                        this.current_article = result.value;
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
        this.Delete = (mail, callback, error) => {
            Mail.delete({
                id: mail._id
            }, (result) => {
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
        this.sender = [];
        this.SetQuery = (query) => {
            this.option.skip = 0;
            this.query = {};
            if (query) {
                this.query = query;
            }
        };
        let init = () => {
            this.option = { sort: { create: -1 }, limit: 40, skip: 0 };
            this.SetQuery(null);
            this.current_article = null;
        };
        this.Init = () => {
            init();
        };
        this.Query = (send, callback, error) => {
            let type = 10001;
            if (send) {
                type = 10000;
            }
            MailQuery.query({
                query: encodeURIComponent(JSON.stringify({ $and: [{ type: type }, this.query] })),
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
        this.Count = (send, callback, error) => {
            let type = 10001;
            if (send) {
                type = 10000;
            }
            MailCount.get({
                query: encodeURIComponent(JSON.stringify({ $and: [{ type: type }, this.query] }))
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
        this.Over = (send, callback, error) => {
            this.Count(send, (count) => {
                callback((this.option.skip + this.option.limit) <= count);
            }, error);
        };
        this.Under = (send, callback, error) => {
            callback(this.option.skip > 0);
        };
        this.Next = (send, callback, error) => {
            this.Over(send, (hasnext) => {
                if (hasnext) {
                    this.option.skip = this.option.skip + this.option.limit;
                    this.Query(send, callback, error);
                }
                else {
                    callback(null);
                }
            });
        };
        this.Prev = (send, callback, error) => {
            this.Under(send, (hasprev) => {
                if (hasprev) {
                    this.option.skip = this.option.skip - this.option.limit;
                    this.Query(send, callback, error);
                }
                else {
                    callback(null);
                }
            });
        };
        this.Init();
    }]);
//# sourceMappingURL=mailer_services.js.map