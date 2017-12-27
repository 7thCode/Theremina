/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ArticleModule;
(function (ArticleModule) {
    var _ = require('lodash');
    var mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    var core = require(process.cwd() + '/gs');
    var share = core.share;
    var Wrapper = share.Wrapper;
    var ArticleModel = require(share.Models("services/articles/article"));
    var validator = require('validator');
    var Article = (function () {
        function Article() {
        }
        /**
         * @param request
         * @returns userid
         */
        Article.userid = function (request) {
            return request.user.userid;
        };
        Article.namespace = function (request) {
            var result = "";
            if (request.user.data) {
                result = request.user.data.namespace;
            }
            return result;
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Article.prototype.create_article = function (request, response) {
            if (request.body.name) {
                var article_1 = new ArticleModel();
                article_1.userid = Article.userid(request);
                article_1.namespace = Article.namespace(request);
                article_1.name = request.body.name;
                article_1.type = request.body.type;
                article_1.content = request.body.content;
                if (article_1.name.indexOf('/') == -1) {
                    _.forEach(article_1.content, function (content, key) {
                        if (content.type == "quoted") {
                            if (typeof content.value === 'string') {
                                article_1.content[key].value = validator.escape(content.value);
                            }
                            else {
                                article_1.content[key].value = content.value;
                            }
                        }
                    });
                    article_1.open = true;
                    Wrapper.Save(response, 1000, article_1, function (response, object) {
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
        };
        /**
         * @param request
         * @param response
         * @returns none
         *  {$and: [{_id: id}, {userid: userid}]} -> useridが一致しないと操作不可
         */
        Article.prototype.put_article = function (request, response) {
            var userid = Article.userid(request);
            var namespace = Article.namespace(request);
            var id = request.params.id;
            Wrapper.FindOne(response, 10000, ArticleModel, { $and: [{ _id: id }, { namespace: namespace }, { userid: userid }] }, function (response, article) {
                if (article) {
                    article.content = request.body.content;
                    _.forEach(article.content, function (content, key) {
                        if (content.type == "quoted") {
                            if (typeof content.value === 'string') {
                                article.content[key].value = validator.escape(content.value);
                            }
                            else {
                                article.content[key].value = content.value;
                            }
                        }
                        else if (content.type == "html") {
                            article.content[key].value = content.value.replace(/\s/g, " "); // replace "C2A0"(U+00A0) to "20"
                        }
                        else if (content.type == "date") {
                            article.content[key].value = new Date(content.value);
                        }
                    });
                    article.open = true;
                    Wrapper.Save(response, 1100, article, function (response, object) {
                        Wrapper.SendSuccess(response, object);
                    });
                }
                else {
                    Wrapper.SendWarn(response, 2, "not found", { code: 2, message: "not found" });
                }
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         * {$and: [{_id: id}, {userid: userid}]} -> useridが一致しないと操作不可
         */
        Article.prototype.delete_article = function (request, response) {
            var userid = Article.userid(request);
            var namespace = Article.namespace(request);
            var id = request.params.id;
            Wrapper.FindOne(response, 10000, ArticleModel, { $and: [{ _id: id }, { namespace: namespace }, { userid: userid }] }, function (response, article) {
                if (article) {
                    Wrapper.Remove(response, 1200, article, function (response) {
                        Wrapper.SendSuccess(response, {});
                    });
                }
                else {
                    Wrapper.SendWarn(response, 2, "not found", { code: 2, message: "not found" });
                }
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Article.prototype.delete_own = function (request, response) {
            var userid = Article.userid(request);
            var namespace = Article.namespace(request);
            Wrapper.Delete(response, 1300, ArticleModel, { $and: [{ namespace: namespace }, { userid: userid }] }, function (response) {
                Wrapper.SendSuccess(response, {});
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Article.prototype.get_article = function (request, response) {
            //     let userid = Article.userid(request);
            var namespace = Article.namespace(request);
            var id = request.params.id;
            Wrapper.FindOne(response, 1400, ArticleModel, { $and: [{ namespace: namespace }, { type: 0 }, { _id: id }] }, function (response, article) {
                if (article) {
                    Wrapper.SendSuccess(response, article);
                }
                else {
                    Wrapper.SendWarn(response, 2, "not found", { code: 2, message: "not found" });
                }
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Article.prototype.get_article_json = function (request, response) {
            var userid = Article.userid(request);
            var namespace = Article.namespace(request);
            var id = request.params.id;
            Wrapper.FindOne(response, 1400, ArticleModel, { $and: [{ namespace: namespace }, { userid: userid }, { type: 0 }, { _id: id }] }, function (response, article) {
                if (article) {
                    response.jsonp(JSON.stringify(article));
                }
                else {
                    Wrapper.SendWarn(response, 2, "not found", { code: 2, message: "not found" });
                }
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Article.prototype.get_article_query = function (request, response) {
            //     let userid = Article.userid(request);
            var namespace = Article.namespace(request);
            var query = Wrapper.Decode(request.params.query);
            Wrapper.Find(response, 1500, ArticleModel, { $and: [{ namespace: namespace }, { type: 0 }, query] }, {}, {}, function (response, articles) {
                Wrapper.SendSuccess(response, articles);
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Article.prototype.get_article_query_query = function (request, response) {
            //       let userid = Article.userid(request);
            var namespace = Article.namespace(request);
            var query = Wrapper.Decode(request.params.query);
            var option = Wrapper.Decode(request.params.option);
            Wrapper.Find(response, 1500, ArticleModel, { $and: [{ namespace: namespace }, { type: 0 }, query] }, {}, option, function (response, articles) {
                _.forEach(articles, function (article) {
                    article.content = null;
                });
                Wrapper.SendSuccess(response, articles);
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Article.prototype.get_article_query_query_json = function (request, response) {
            var userid = Article.userid(request);
            var namespace = Article.namespace(request);
            var query = Wrapper.Decode(request.params.query);
            var option = Wrapper.Decode(request.params.option);
            Wrapper.Find(response, 1400, ArticleModel, { $and: [{ namespace: namespace }, { userid: userid }, { type: 0 }, query] }, { "_id": 0, "version": 1, "status": 1, "namespace": 1, "modify": 1, "create": 1, "open": 1, "content": 1, "type": 1, "name": 1, "userid": 1 }, option, function (response, articles) {
                Wrapper.SendSuccess(response, articles);
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Article.prototype.get_article_count = function (request, response) {
            var userid = Article.userid(request);
            var namespace = Article.namespace(request);
            var query = Wrapper.Decode(request.params.query);
            Wrapper.Count(response, 2800, ArticleModel, { $and: [{ namespace: namespace }, { userid: userid }, { type: 0 }, query] }, function (response, count) {
                Wrapper.SendSuccess(response, count);
            });
        };
        return Article;
    }());
    ArticleModule.Article = Article;
})(ArticleModule = exports.ArticleModule || (exports.ArticleModule = {}));
module.exports = ArticleModule;
//# sourceMappingURL=article_controller.js.map