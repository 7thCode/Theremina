/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace ArticleModule {

    const _ = require('lodash');

    const mongoose: any = require('mongoose');
    mongoose.Promise = global.Promise;

    const core = require(process.cwd() + '/gs');
    const share: any = core.share;

    const Wrapper = share.Wrapper;

    const ArticleModel: any = require(share.Models("services/articles/article"));

    const validator = require('validator');

    export class Article {

        /**
         * @param request
         * @returns userid
         */
        static userid(request: any): string {
            return request.user.userid;
        }

        static namespace(request: any): string {
            let result = "";
            if (request.user) {
                if (request.user.data) {
                    result = request.user.data.namespace;
                }
            }
            return result;
        }


        /**
         * @param request
         * @param response
         * @returns none
         */
        public create_article(request: any, response: any): void {
            if (request.body.name) {
                let article: any = new ArticleModel();
                article.userid = Article.userid(request);
                article.namespace = Article.namespace(request);
                article.name = request.body.name;
                article.type = request.body.type;
                article.content = request.body.content;
                if (article.name.indexOf('/') == -1) {
                    _.forEach(article.content, (content: any, key): void => {
                        if (content.type == "quoted") {//単純記事はエスケープ
                            if (typeof content.value === 'string') {
                                article.content[key].value = validator.escape(content.value);
                            } else {
                                article.content[key].value = content.value;
                            }
                        } else if (content.type == "date") {
                            if (typeof content.value === 'string') {
                                article.content[key].value = new Date(content.value);
                            }
                        }
                    });
                    article.open = true;
                    Wrapper.Save(response, 1000, article, (response: any, object: any): void => {
                        Wrapper.SendSuccess(response, object);
                    });
                } else {
                    Wrapper.SendError(response, 3, "article name must not contain '/'", {
                        code: 3,
                        message: "article name must not contain '/'"
                    });
                }
            } else {
                Wrapper.SendError(response, 3, "no article name", {code: 3, message: "no article name"});
            }
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public create_article_many(request: any, response: any): void {
            if (request.body.articles) {
                let articles = JSON.parse(request.body.articles);

                let save = (data: any, callback: (d) => void, error: (e) => void): any => {
                    if (data) {
                        if (data.name) {
                            if (data.name.indexOf('/') == -1) {

                                let article: any = new ArticleModel();
                                article.userid = Article.userid(request);
                                article.namespace = Article.namespace(request);
                                article.version = data.version;
                                article.status = data.status;
                                article.name = data.name;
                                article.type = data.type;
                                article.content = data.content;
                                article.open = data.open;

                                _.forEach(article.content, (content: any, key): void => {
                                    if (content.type == "date") {
                                        if (typeof content.value === 'string') {
                                            article.content[key].value = new Date(content.value);
                                        }
                                    }
                                });

                                article.save().then(() => {
                                    callback({});
                                }).catch((e: any): void => {
                                    error(e);
                                });
                            } else {
                                error({code: 3, message: "article name must not contain '/'"});
                            }
                        } else {
                            error({code: 3, message: "no article name"});
                        }
                    }
                };

                if (Array.isArray(articles)) {
                    let save_promise = (data: any): any => {
                        return new Promise((resolve: any, reject: any): void => {
                            save(data, d => resolve(d), error => reject(error));
                        });
                    };
                    Promise.all(articles.map((data: any): void => {
                        return save_promise(data);
                    })).then((results: any[]): void => {
                        Wrapper.SendSuccess(response, {});
                    }).catch((error: any): void => {
                        Wrapper.SendError(response, error.code, error.message, error);
                    });
                } else {
                    save(articles,
                        d => Wrapper.SendSuccess(response, d),
                        error => Wrapper.SendError(response, error.code, error.message, error)
                    );
                }
            } else {
                Wrapper.SendError(response, 3, "no article name", {code: 3, message: "no article name"});
            }
        }

        /**
         * @param request
         * @param response
         * @returns none
         *  {$and: [{_id: id}, {userid: userid}]} -> useridが一致しないと操作不可
         */
        public put_article(request: any, response: any): void {
            let userid = Article.userid(request);
            let namespace = Article.namespace(request);
            let id = request.params.id;
            Wrapper.FindOne(response, 10000, ArticleModel, {$and: [{_id: id}, {namespace: namespace}, {userid: userid}]}, (response: any, article: any): void => {
                if (article) {
                    article.content = request.body.content;
                    _.forEach(article.content, (content: any, key): void => {
                        if (content.type == "quoted") {//単純記事はエスケープ
                            if (typeof content.value === 'string') {
                                article.content[key].value = validator.escape(content.value);
                            } else {
                                article.content[key].value = content.value;
                            }
                        } else if (content.type == "html") {
                            article.content[key].value = content.value.replace(/\s/g, " "); // replace "C2A0"(U+00A0) to "20"
                        } else if (content.type == "date") {
                            article.content[key].value = new Date(content.value);
                        }
                    });
                    article.open = true;
                    Wrapper.Save(response, 1100, article, (response: any, object: any): void => {
                        Wrapper.SendSuccess(response, object);
                    });
                } else {
                    Wrapper.SendWarn(response, 2, "not found", {code: 2, message: "not found"});
                }
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         * {$and: [{_id: id}, {userid: userid}]} -> useridが一致しないと操作不可
         */
        public delete_article(request: any, response: any): void {
            let userid = Article.userid(request);
            let namespace = Article.namespace(request);
            let id = request.params.id;
            Wrapper.FindOne(response, 10000, ArticleModel, {$and: [{_id: id}, {namespace: namespace}, {userid: userid}]}, (response: any, article: any): void => {
                if (article) {
                    Wrapper.Remove(response, 1200, article, (response: any): void => {
                        Wrapper.SendSuccess(response, {});
                    });
                } else {
                    Wrapper.SendWarn(response, 2, "not found", {code: 2, message: "not found"});
                }
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public delete_own(request: any, response: any): void {
            let userid = Article.userid(request);
            let namespace = Article.namespace(request);
            Wrapper.Delete(response, 1300, ArticleModel, {$and: [{namespace: namespace}, {userid: userid}]}, (response: any): void => {
                Wrapper.SendSuccess(response, {});
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_article(request: any, response: any): void {
            //     let userid = Article.userid(request);
            let namespace = Article.namespace(request);
            let id = request.params.id;
            Wrapper.FindOne(response, 1400, ArticleModel, {$and: [{namespace: namespace}, {type: 0}, {_id: id}]}, (response: any, article: any): void => {
                if (article) {
                    Wrapper.SendSuccess(response, article);
                } else {
                    Wrapper.SendWarn(response, 2, "not found", {code: 2, message: "not found"});
                }
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_article_json(request: any, response: any): void {
            let userid = Article.userid(request);
            let namespace = Article.namespace(request);
            let id = request.params.id;
            Wrapper.FindOne(response, 1400, ArticleModel, {$and: [{namespace: namespace}, {userid: userid}, {type: 0}, {_id: id}]}, (response: any, article: any): void => {
                if (article) {
                    response.send(JSON.stringify([article]));
                } else {
                    Wrapper.SendWarn(response, 2, "not found", {code: 2, message: "not found"});
                }
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_article_query(request: any, response: any): void {
            //     let userid = Article.userid(request);
            let namespace = Article.namespace(request);
            let query: any = Wrapper.Decode(request.params.query);
            Wrapper.Find(response, 1500, ArticleModel, {$and: [{namespace: namespace}, {type: 0}, query]}, {}, {}, (response: any, articles: any): any => {
                Wrapper.SendSuccess(response, articles);
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_article_query_query(request: any, response: any): void {
            //       let userid = Article.userid(request);
            let namespace = Article.namespace(request);
            let query: any = Wrapper.Decode(request.params.query);
            let option: any = Wrapper.Decode(request.params.option);
            Wrapper.Find(response, 1500, ArticleModel, {$and: [{namespace: namespace}, {type: 0}, query]}, {}, option, (response: any, articles: any): any => {
                _.forEach(articles, (article) => {
                    article.content = null;
                });
                Wrapper.SendSuccess(response, articles);
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_article_query_query_json(request: any, response: any): void {
            let userid = Article.userid(request);
            let namespace = Article.namespace(request);
            let query: any = Wrapper.Decode(request.params.query);
            let option: any = Wrapper.Decode(request.params.option);
            Wrapper.Find(response, 1400, ArticleModel, {$and: [{namespace: namespace}, {userid: userid}, {type: 0}, query]}, {"_id": 0}, option, (response: any, articles: any): any => {
                Wrapper.SendSuccess(response, articles);
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_article_count(request: any, response: any): void {
            let userid = Article.userid(request);
            let namespace = Article.namespace(request);
            let query: any = Wrapper.Decode(request.params.query);
            Wrapper.Count(response, 2800, ArticleModel, {$and: [{namespace: namespace}, {userid: userid}, {type: 0}, query]}, (response: any, count: any): any => {
                Wrapper.SendSuccess(response, count);
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public namespaces(userid: string, callback: any): void {
            const number: number = 1400;
            ArticleModel.find({userid: userid}, {"namespace": 1, "_id": 0}, {}).then((pages: any): void => {
                let result:string[] = [];
                _.forEach(pages, (page:{namespace:string}) => {
                    if (page.namespace) {
                        result.push(page.namespace);
                    }
                });
                callback(null, _.uniqBy(result));
            }).catch((error: any): void => {
                callback(error, null);
            });
        }

    }
}

module.exports = ArticleModule;
