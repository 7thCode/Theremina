/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ArticleApiRouter;
(function (ArticleApiRouter) {
    var express = require('express');
    ArticleApiRouter.router = express.Router();
    var core = require(process.cwd() + '/gs');
    var share = core.share;
    var exception = core.exception;
    var AuthController = require(share.Server("systems/auth/controllers/auth_controller"));
    ArticleApiRouter.auth = new AuthController.Auth();
    var ArticleModule = require(share.Server("services/articles/controllers/article_controller"));
    var article = new ArticleModule.Article;
    ArticleApiRouter.router.get("/json/:id", [article.get_article_json]);
    ArticleApiRouter.router.get("/json/query/:query/:option", [article.get_article_query_query_json]);
    ArticleApiRouter.router.post("/api/create", [exception.exception, exception.guard, exception.authenticate, article.create_article]);
    ArticleApiRouter.router.get("/api/:id", [article.get_article]);
    ArticleApiRouter.router.put("/api/:id", [exception.exception, exception.guard, exception.authenticate, article.put_article]);
    ArticleApiRouter.router.delete("/api/:id", [exception.exception, exception.guard, exception.authenticate, article.delete_article]);
    ArticleApiRouter.router.post("/api/createmany", [exception.exception, exception.guard, exception.authenticate, article.create_article_many]);
    ArticleApiRouter.router.get('/api/query/:query', [article.get_article_query]);
    ArticleApiRouter.router.get('/api/querynamespace/:namespace/:query', [article.get_article_query_with_namespace]);
    ArticleApiRouter.router.get('/api/query/:query/:option', [article.get_article_query_query]);
    ArticleApiRouter.router.get("/api/count/:query", [article.get_article_count]);
    ArticleApiRouter.router.delete('/api/own', [exception.exception, exception.guard, exception.authenticate, article.delete_own]);
})(ArticleApiRouter = exports.ArticleApiRouter || (exports.ArticleApiRouter = {}));
module.exports = ArticleApiRouter.router;
//# sourceMappingURL=api.js.map