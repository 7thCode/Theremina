/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ArticlePageRouter;
(function (ArticlePageRouter) {
    var express = require('express');
    ArticlePageRouter.router = express.Router();
    var core = require(process.cwd() + '/gs');
    var auth = core.auth;
    var share = core.share;
    var exception = core.exception;
    var config = share.config;
    var services_config = share.services_config;
    var webfonts = services_config.webfonts;
    var message = config.message;
    //  const AnalysisModule: any = require(share.Server("systems/analysis/controllers/analysis_controller"));
    // const analysis: any = new AnalysisModule.Analysis;
    //   const ArticleModule: any = require(share.Server("services/articles/controllers/article_controller"));
    //   const article: any = new ArticleModule.Article;
    ArticlePageRouter.router.get("/", [exception.page_guard, auth.page_valid, function (request, response) {
            response.render("services/articles/index", {
                config: config,
                user: request.user,
                message: message,
                status: 200,
                fonts: webfonts
            });
        }]);
    ArticlePageRouter.router.get('/dialogs/create_dialog', [exception.page_guard, auth.page_valid, function (request, response, next) {
            response.render("services/articles/dialogs/create_dialog", { message: message });
        }]);
    ArticlePageRouter.router.get('/dialogs/delete_confirm_dialog', [exception.page_guard, auth.page_valid, function (request, response, next) {
            response.render("services/articles/dialogs/delete_confirm_dialog", { message: message });
        }]);
})(ArticlePageRouter = exports.ArticlePageRouter || (exports.ArticlePageRouter = {}));
module.exports = ArticlePageRouter.router;
//# sourceMappingURL=pages.js.map