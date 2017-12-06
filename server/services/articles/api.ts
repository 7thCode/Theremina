/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace ArticleApiRouter {

    const express = require('express');
    export const router = express.Router();

    const core = require(process.cwd() + '/gs');
    const share: any = core.share;
    const exception: any = core.exception;

    const AuthController: any = require(share.Server("systems/auth/controllers/auth_controller"));
    export const auth: any = new AuthController.Auth();

    const ArticleModule: any = require(share.Server("services/articles/controllers/article_controller"));
    const article: any = new ArticleModule.Article;

    router.get("/json/query/:query/:option", [article.get_article_query_query_json]);
    router.post("/api/create", [exception.exception, exception.guard, exception.authenticate, article.create_article]);
    router.get("/api/:id", [article.get_article]);
    router.put("/api/:id", [exception.exception, exception.guard, exception.authenticate, article.put_article]);
    router.delete("/api/:id", [exception.exception, exception.guard, exception.authenticate, article.delete_article]);

    router.get('/api/query/:query', [article.get_article_query]);
    router.get('/api/query/:query/:option', [article.get_article_query_query]);
    router.get("/api/count/:query", [article.get_article_count]);

    router.delete('/api/own', [exception.exception, exception.guard, exception.authenticate, article.delete_own]);

}

module.exports = ArticleApiRouter.router;

