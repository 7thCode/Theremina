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

        /**
         * @param request
         * @param response
         * @returns none
         */
        public create_article(request: any, response: any): void {
            if (request.body.name) {
                let article: any = new ArticleModel();
                article.userid = Article.userid(request);
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

        static make_query(id: any, userid: any): any {
            let namespace = "";
            return {$and: [{_id: id}, {namespace:namespace},{userid: userid}]};
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
            Wrapper.FindOne(response, 10000, ArticleModel, Article.make_query(id, userid), (response: any, article: any): void => {
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
            let id = request.params.id;
            Wrapper.FindOne(response, 10000, ArticleModel, Article.make_query(id, userid), (response: any, article: any): void => {
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
            let namespace = "";
            Wrapper.Delete(response, 1300, ArticleModel, {$and:[{namespace:namespace}, {userid: userid}]}, (response: any): void => {
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
                    Wrapper.SendWarn(response, 2, "not found", {code: 2, message: "not found"});
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
            let namespace = "";
            let query: any = Wrapper.Decode(request.params.query);
            let option: any = Wrapper.Decode(request.params.option);
            Wrapper.Find(response, 1500, ArticleModel, {$and: [{namespace:namespace},{userid: userid}, {type: 0}, query]}, {}, option, (response: any, articles: any): any => {

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
            let query: any = Wrapper.Decode(request.params.query);
            let option: any = Wrapper.Decode(request.params.option);
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
            let namespace = ""
            let query: any = Wrapper.Decode(request.params.query);
            Wrapper.Count(response, 2800, ArticleModel, {$and: [{namespace:namespace},{userid: userid}, {type: 0}, query]}, (response: any, count: any): any => {
                Wrapper.SendSuccess(response, count);
            });
        }

    }
}

module.exports = ArticleModule;
