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
    var Article = /** @class */ (function () {
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
            if (request.user) {
                if (request.user.data) {
                    result = request.user.data.namespace;
                }
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
                        else if (content.type == "date") {
                            if (typeof content.value === 'string') {
                                article_1.content[key].value = new Date(content.value);
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
         */
        Article.prototype.create_article_many = function (request, response) {
            if (request.body.articles) {
                var articles = JSON.parse(request.body.articles);
                var save_1 = function (data, callback, error) {
                    if (data) {
                        if (data.name) {
                            if (data.name.indexOf('/') == -1) {
                                var article_2 = new ArticleModel();
                                article_2.userid = Article.userid(request);
                                article_2.namespace = Article.namespace(request);
                                article_2.version = data.version;
                                article_2.status = data.status;
                                article_2.name = data.name;
                                article_2.type = data.type;
                                article_2.content = data.content;
                                article_2.open = data.open;
                                _.forEach(article_2.content, function (content, key) {
                                    if (content.type == "date") {
                                        if (typeof content.value === 'string') {
                                            article_2.content[key].value = new Date(content.value);
                                        }
                                    }
                                });
                                article_2.save().then(function () {
                                    callback({});
                                }).catch(function (e) {
                                    error(e);
                                });
                            }
                            else {
                                error({ code: 3, message: "article name must not contain '/'" });
                            }
                        }
                        else {
                            error({ code: 3, message: "no article name" });
                        }
                    }
                };
                if (Array.isArray(articles)) {
                    var save_promise_1 = function (data) {
                        return new Promise(function (resolve, reject) {
                            save_1(data, function (d) { return resolve(d); }, function (error) { return reject(error); });
                        });
                    };
                    Promise.all(articles.map(function (data) {
                        return save_promise_1(data);
                    })).then(function (results) {
                        Wrapper.SendSuccess(response, {});
                    }).catch(function (error) {
                        Wrapper.SendError(response, error.code, error.message, error);
                    });
                }
                else {
                    save_1(articles, function (d) { return Wrapper.SendSuccess(response, d); }, function (error) { return Wrapper.SendError(response, error.code, error.message, error); });
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
                    if (request.body.content !== {}) {
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
                        Wrapper.SendWarn(response, 1, "no content", { code: 1, message: "no content" });
                    }
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
            var userid = Article.userid(request);
            var namespace = Article.namespace(request);
            var id = request.params.id;
            // "$and userid query" for security.
            Wrapper.FindOne(response, 1400, ArticleModel, { $and: [{ namespace: namespace }, { userid: userid }, { type: 0 }, { _id: id }] }, function (response, article) {
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
                    response.send(JSON.stringify([article]));
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
        Article.prototype.get_article_query_with_namespace = function (request, response) {
            var namespace = request.params.namespace;
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
            var userid = Article.userid(request);
            var namespace = Article.namespace(request);
            var query = Wrapper.Decode(request.params.query);
            var option = Wrapper.Decode(request.params.option);
            Wrapper.Find(response, 1500, ArticleModel, { $and: [{ namespace: namespace }, { userid: userid }, { type: 0 }, query] }, {}, option, function (response, articles) {
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
            Wrapper.Find(response, 1400, ArticleModel, { $and: [{ namespace: namespace }, { userid: userid }, { type: 0 }, query] }, { "_id": 0 }, option, function (response, articles) {
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
        /**
         * @param userid
         * @param callback
         * @returns none
         */
        Article.prototype.namespaces = function (userid, callback) {
            ArticleModel.find({ userid: userid }, { "namespace": 1, "_id": 0 }, {}).then(function (pages) {
                var result = [];
                _.forEach(pages, function (page) {
                    if (page.namespace) {
                        result.push(page.namespace);
                    }
                });
                callback(null, _.uniqBy(result));
            }).catch(function (error) {
                callback(error, null);
            });
        };
        return Article;
    }());
    ArticleModule.Article = Article;
})(ArticleModule = exports.ArticleModule || (exports.ArticleModule = {}));
module.exports = ArticleModule;
//# sourceMappingURL=article_controller.js.map