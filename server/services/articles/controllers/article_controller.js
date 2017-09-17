/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ArticleModule;
(function (ArticleModule) {
    const _ = require('lodash');
    const mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    const core = require(process.cwd() + '/gs');
    const share = core.share;
    const Wrapper = share.Wrapper;
    const ArticleModel = require(share.Models("services/articles/article"));
    const validator = require('validator');
    class Article {
        /**
         * @param request
         * @returns userid
         */
        static userid(request) {
            return request.user.userid;
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        create_article(request, response) {
            if (request.body.name) {
                let article = new ArticleModel();
                article.userid = Article.userid(request);
                article.name = request.body.name;
                article.type = request.body.type;
                article.content = request.body.content;
                if (article.name.indexOf('/') == -1) {
                    _.forEach(article.content, (content, key) => {
                        if (content.type == "quoted") {
                            if (typeof content.value === 'string') {
                                article.content[key].value = validator.escape(content.value);
                            }
                            else {
                                article.content[key].value = content.value;
                            }
                        }
                    });
                    article.open = true;
                    Wrapper.Save(response, 1000, article, (response, object) => {
                        Wrapper.SendSuccess(response, object);
                    });
                }
                else {
                    Wrapper.SendError(response, 3, "article name must not contain '/'", {
                        code: 3,
                        message: "article name must not contain '/'"
                    });
                }
            }
            else {
                Wrapper.SendError(response, 3, "no article name", { code: 3, message: "no article name" });
            }
        }
        static make_query(id, userid) {
            return { $and: [{ _id: id }, { userid: userid }] };
        }
        /**
         * @param request
         * @param response
         * @returns none
         *  {$and: [{_id: id}, {userid: userid}]} -> useridが一致しないと操作不可
         */
        put_article(request, response) {
            let userid = Article.userid(request);
            let id = request.params.id;
            Wrapper.FindOne(response, 10000, ArticleModel, Article.make_query(id, userid), (response, article) => {
                if (article) {
                    article.content = request.body.content;
                    _.forEach(article.content, (content, key) => {
                        if (content.type == "quoted") {
                            if (typeof content.value === 'string') {
                                article.content[key].value = validator.escape(content.value);
                            }
                            else {
                                article.content[key].value = content.value;
                            }
                        }
                    });
                    article.open = true;
                    Wrapper.Save(response, 1100, article, (response, object) => {
                        Wrapper.SendSuccess(response, object);
                    });
                }
                else {
                    Wrapper.SendWarn(response, 2, "not found", { code: 2, message: "not found" });
                }
            });
        }
        /**
         * @param request
         * @param response
         * @returns none
         * {$and: [{_id: id}, {userid: userid}]} -> useridが一致しないと操作不可
         */
        delete_article(request, response) {
            let userid = Article.userid(request);
            let id = request.params.id;
            Wrapper.FindOne(response, 10000, ArticleModel, Article.make_query(id, userid), (response, article) => {
                if (article) {
                    Wrapper.Remove(response, 1200, article, (response) => {
                        Wrapper.SendSuccess(response, {});
                    });
                }
                else {
                    Wrapper.SendWarn(response, 2, "not found", { code: 2, message: "not found" });
                }
            });
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        delete_own(request, response) {
            let userid = Article.userid(request);
            Wrapper.Delete(response, 1300, ArticleModel, { userid: userid }, (response) => {
                Wrapper.SendSuccess(response, {});
            });
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        get_article(request, response) {
            let id = request.params.id;
            Wrapper.FindOne(response, 1400, ArticleModel, { _id: id }, (response, article) => {
                if (article) {
                    Wrapper.SendSuccess(response, article);
                }
                else {
                    Wrapper.SendWarn(response, 2, "not found", { code: 2, message: "not found" });
                }
            });
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        get_article_query_query(request, response) {
            let userid = Article.userid(request);
            let query = Wrapper.Decode(request.params.query);
            let option = Wrapper.Decode(request.params.option);
            Wrapper.Find(response, 1500, ArticleModel, { $and: [{ userid: userid }, { type: 0 }, query] }, {}, option, (response, articles) => {
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
        get_article_query_query_json(request, response) {
            let query = Wrapper.Decode(request.params.query);
            let option = Wrapper.Decode(request.params.option);
            Wrapper.Find(response, 1400, ArticleModel, query, {}, option, (response, articles) => {
                Wrapper.SendSuccess(response, articles);
            });
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        get_article_count(request, response) {
            let userid = Article.userid(request);
            let query = Wrapper.Decode(request.params.query);
            Wrapper.Count(response, 2800, ArticleModel, { $and: [{ userid: userid }, { type: 0 }, query] }, (response, count) => {
                Wrapper.SendSuccess(response, count);
            });
        }
    }
    ArticleModule.Article = Article;
})(ArticleModule = exports.ArticleModule || (exports.ArticleModule = {}));
module.exports = ArticleModule;
//# sourceMappingURL=article_controller.js.map