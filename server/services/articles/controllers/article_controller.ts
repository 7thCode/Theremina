/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace ArticleModule {

    const _: _.LoDashStatic = require('lodash');

    const mongoose: any = require('mongoose');
    mongoose.Promise = require('q').Promise;

    const core = require(process.cwd() + '/core');
    const share: any = core.share;
    const config = share.config;
    const Wrapper = share.Wrapper;
    const logger = share.logger;
    //const page: any = core.page;

    const ResourcesModule = require(share.Server("systems/resources/controllers/resource_controller"));
    const resource = new ResourcesModule.Resource;

    const FormsModule = require(share.Server("services/forms/controllers/forms_controller"));
    const form = new FormsModule.Form();

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

        /**
         * @param request
         * @param response
         * @returns none
         */
        public create_article(request: any, response: any): void {
            if (request.body.name.indexOf(':') == -1) {
                let article: any = new ArticleModel();
                article.userid = Article.userid(request);
                article.name = request.body.name;
                article.type = request.body.type;
                article.content = request.body.content;
                _.forEach(article.content, (content: any, key): void => {
                    if (content.type == "quoted") {//単純記事はエスケープ
                        if (typeof content.value === 'string') {
                            article.content[key].value = validator.escape(content.value);
                        }
                    }
                });
                article.open = true;
                Wrapper.Save(response, 1000, article, (response: any, object: any): void => {
                    Wrapper.SendSuccess(response, object);
                });
            } else {
                Wrapper.SendError(response, 3, "article name must not contain ':'", {});
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
            let id = request.params.id;
            Wrapper.FindOne(response, 10000, ArticleModel, {$and: [{_id: id}, {userid: userid}]}, (response: any, article: any): void => {
                if (article) {
                    article.content = request.body.content;
                    _.forEach(article.content, (content: any, key): void => {
                        if (content.type == "quoted") {//単純記事はエスケープ
                            if (typeof content.value === 'string') {
                                article.content[key].value = validator.escape(content.value);
                            }
                        }
                    });
                    article.open = true;
                    Wrapper.Save(response, 1100, article, (response: any, object: any): void => {
                        Wrapper.SendSuccess(response, object);
                    });
                } else {
                    Wrapper.SendWarn(response, 2, "not found", {});
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
            let id = request.params.id;
            Wrapper.FindOne(response, 10000, ArticleModel, {$and: [{_id: id}, {userid: userid}]}, (response: any, article: any): void => {
                if (article) {
                    Wrapper.Remove(response, 1200, article, (response: any): void => {
                        Wrapper.SendSuccess(response, {});
                    });
                } else {
                    Wrapper.SendWarn(response, 2, "not found", {});
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
            Wrapper.Delete(response, 1300, ArticleModel, {userid: userid}, (response: any): void => {
                Wrapper.SendSuccess(response, {});
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_article(request: any, response: any): void {
            let id = request.params.id;
            Wrapper.FindOne(response, 1400, ArticleModel, {_id: id}, (response: any, article: any): void => {
                if (article) {
                    Wrapper.SendSuccess(response, article);
                } else {
                    Wrapper.SendWarn(response, 2, "not found", {});
                }
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_article_query_query(request: any, response: any): void {
            let userid = Article.userid(request);
            let query: any = JSON.parse(decodeURIComponent(request.params.query));
            let option: any = JSON.parse(decodeURIComponent(request.params.option));
            Wrapper.Find(response, 1500, ArticleModel, {$and: [{userid: userid}, {type: 0}, query]}, {}, option, (response: any, articles: any): any => {

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
            let query: any = JSON.parse(decodeURIComponent(request.params.query));
            let option: any = JSON.parse(decodeURIComponent(request.params.option));
            Wrapper.Find(response, 1400, ArticleModel, query, {}, option, (response: any, articles: any): any => {
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
            let query: any = JSON.parse(decodeURIComponent(request.params.query));
            Wrapper.Count(response, 2800, ArticleModel, {$and: [{userid: userid}, {type: 0}, query]}, (response: any, count: any): any => {
                Wrapper.SendSuccess(response, count);
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public render_object(request: any, response: any): void {
            let doc: any = request.body.content;
            if (doc) {
                resource.render(request.params.userid, request.params.page_name, doc, [doc], (error: any, result: string)=>{
                    Wrapper.SendSuccess(response, result);
                });
            } else {
                Wrapper.SendError(response, 2, "", {});
            }
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public render_fragment(request: any, response: any): void {
            let doc: any = request.body.content;
            if (doc) {
                resource.render_fragment(request.params.userid, request.params.page_name, doc, [doc], request.query, (error: any, result: string)=>{
                    Wrapper.SendSuccess(response, result);
                });
            } else {
                Wrapper.SendError(response, 2, "", {});
            }
        }

        public render_articles(request: any, response: any): void {
            ArticleModel.findOne({$and: [{$and: [{name: request.params.article_name}, {userid: request.params.userid}, {open: true}]}]}).then((doc: any): void => {
                if (doc) {
                    resource.render(request.params.userid, request.params.page_name, doc, [doc._doc], request.query, (error: any, result: string)=>{
                        Wrapper.SendSuccess(response, result);
                    });
                } else {
                    Wrapper.SendError(response, 2, "", {});
                }
            }).catch((error: any): void => {
                Wrapper.SendError(response, 3, "", {});
            });
        }

        /**
         * @param userid
         * @param page_name
         * @param article_name
         * @param callback
         * @returns none
         */
        // series query -> to parallel query (page, article)
        public render_form(userid: string, page_name: string, article_name: string, callback: (error: any, result: string) => void): void {
            ArticleModel.findOne({$and: [{$and: [{name: article_name}, {userid: userid}, {open: true}]}]}).then((doc: any): void => {
                if (doc) {
                    form.render(userid, page_name, doc._doc, callback);
                } else {
                    callback({code: 20000, message: ""}, null);
                }
            }).catch((error: any): void => {
                callback(error, null);
            });
        }

        /**
         * @param userid
         * @param page_name
         * @param article_name
         * @param callback
         * @returns none
         */
        // series query -> to parallel query (page, article)
        public render_resource(userid: string, page_name: string, article_name: string,query:any, callback: (error: any, result: string) => void): void {
            ArticleModel.findOne({$and: [{$and: [{name: article_name}, {userid: userid}, {open: true}]}]}).then((doc: any): void => {
                if (doc) {
                    resource.render(userid, page_name, doc, [doc._doc], query, callback);
                } else {
                    callback({code: 20000, message: ""}, null);
                }
            }).catch((error: any): void => {
                callback(error, null);
            });
        }

        /**
         * @param userid
         * @param page_name
         * @param article_name
         * @param query
         * @param callback
         * @returns none
         */
        public render_resources(userid: string, page_name: string,article_name: string, query_field: any, callback: (error: any, result: string) => void): void {

            let query = {};
            if (query_field.q) {
                try {
                    query = JSON.parse(query_field.q);
                } catch (e) {
                }
            }

            let order = {};
            if (query_field.o) {
                try {
                    order = JSON.parse(query_field.o);
                } catch (e) {
                }
            }

            let sort = {};
            if (query_field.s) {
                try {
                    sort = {sort: JSON.parse(query_field.s)};
                } catch (e) {
                }
            }

            ArticleModel.find({$and: [{$and: [query, {userid: userid}, {open: true}]}]},{},sort).then((docs: any): void => {
                ArticleModel.findOne({$and: [{$and: [{name: article_name}, {userid: userid}, {open: true}]}]}).then((doc: any): void => {
                    if (doc) {
                        resource.render(userid, page_name,doc, docs, callback);
                    } else {
                        callback({code: 20000, message: ""}, null);
                    }
                }).catch((error: any): void => {
                    callback(error, null);
                });

            }).catch((error: any): void => {
                callback(error, null);
            });
        }

    }
}

module.exports = ArticleModule;
