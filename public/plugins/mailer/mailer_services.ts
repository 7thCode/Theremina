/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

let MailerServices: angular.IModule = angular.module('MailerServices', []);

MailerServices.factory('MailSend', ['$resource',
    ($resource: any): angular.resource.IResource<any> => {
        return $resource('/mailer/api/send', {}, {});
    }]);

MailerServices.factory('Mail', ['$resource',
    ($resource: any): angular.resource.IResource<any> => {
        return $resource('/mailer/api/:id', {id: "@id"}, {
            get: {method: 'GET'},
            put: {method: 'PUT'},
            delete: {method: 'DELETE'}
        });
    }]);

MailerServices.factory('MailQuery', ['$resource',
    ($resource: any): angular.resource.IResource<any> => {
        return $resource("/mailer/api/query/:query/:option", {query: '@query', option: '@optopn'},
            {
                query: {method: 'GET'}
            }
        );
    }]);

MailerServices.factory('MailCount', ['$resource',
    ($resource: any): angular.resource.IResource<any> => {
        return $resource('/mailer/api/count/:query', {query: '@query'}, {
            get: {method: 'GET'}
        });
    }]);

MailerServices.service('MailerService', ["MailSend", "Mail", "$http",
    function (MailSend: any, Mail: any, $http: any): void {

        this.sender = [];

        this.SetQuery = (query) => {
            this.option.skip = 0;
            if (query) {
                this.query = {};
            }
        };

        let init = () => {
            this.pagesize = 10;
            this.option = {sort: {create: -1}, limit: this.pagesize, skip: 0};
            this.SetQuery(null);
            this.current_article = null;
        };

        this.Init = () => {
            init();
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

        this.Send = (content: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            init();
            let article = new MailSend();
            article.content = content;
            article.$save({}, (result: any): void => {
                if (result) {
                    if (result.code === 0) {
                        this.current_article = result.value;
                        callback(result.value);
                    } else {
                        error(result.code, result.message);
                    }
                } else {
                    error(10000, "network error");
                }
            });
        };

        this.Get = (mail: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            init();
            Mail.get({
                id: mail._id
            }, (result: any): void => {
                if (result) {
                    if (result.code === 0) {
                        this.current_article = result.value;
                        callback(result.value);
                    } else {
                        error(result.code, result.message);
                    }
                } else {
                    error(10000, "network error");
                }
            });
        };

        this.Delete = (mail: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            Mail.delete({
                id: mail._id
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

        init();

    }]);

MailerServices.service('MailQueryService', ["MailQuery", "MailCount",
    function (MailQuery: any, MailCount): void {

        this.sender = [];

        this.SetQuery = (query) => {
            this.option.skip = 0;
            if (query) {
                this.query = {};
            }
        };

        let init = () => {
            this.pagesize = 10;
            this.option = {sort: {create: -1}, limit: this.pagesize, skip: 0};
            this.SetQuery(null);
            this.current_article = null;
        };

        this.Init = () => {
            init();
        };

        this.Query = (send: boolean, callback: (result: any) => void, error: (code: number, message: string) => void) => {

            let type = 10001;
            if (send) {
                type = 10000;
            }

            MailQuery.query({
                query: encodeURIComponent(JSON.stringify({$and: [{type: type}, this.query]})),
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

        this.Count = (send: boolean, callback: (result: any) => void, error: (code: number, message: string) => void): void => {

            let type = 10001;
            if (send) {
                type = 10000;
            }

            MailCount.get({
                query: encodeURIComponent(JSON.stringify({$and: [{type: type}, this.query]}))
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

        this.Over = (send: boolean, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            this.Count(send, (count) => {
                callback((this.option.skip + this.pagesize) < count);
            }, error);
        };

        this.Under = (send: boolean, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            callback(this.option.skip >= this.pagesize);
        };

        this.Next = (send: boolean, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            this.Over(send, (hasnext) => {
                if (hasnext) {
                    this.option.skip = this.option.skip + this.pagesize;
                    this.Query(send, callback, error);
                } else {
                    callback(null);
                }
            });
        };

        this.Prev = (send: boolean, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            this.Under(send, (hasprev) => {
                if (hasprev) {
                    this.option.skip = this.option.skip - this.pagesize;
                    this.Query(send, callback, error);
                } else {
                    callback(null);
                }
            });
        };

        init();

    }]);
