/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace ArticlePageRouter {

    const express = require('express');
    export const router = express.Router();

    const core = require(process.cwd() + '/gs');
    const auth: any = core.auth;
    const share: any = core.share;
    const exception: any = core.exception;

    const config: any = share.config;
    const services_config = share.services_config;
    const webfonts: any[] = services_config.webfonts;

    let message = config.message;

  //  const AnalysisModule: any = require(share.Server("systems/analysis/controllers/analysis_controller"));
   // const analysis: any = new AnalysisModule.Analysis;

 //   const ArticleModule: any = require(share.Server("services/articles/controllers/article_controller"));
 //   const article: any = new ArticleModule.Article;

    router.get("/", [exception.page_guard, auth.page_valid, (request: any, response: any): void => {
        response.render("services/articles/index", {
            config: config,
            user: request.user,
            message: message,
            status: 200,
            fonts: webfonts
        });
    }]);

    router.get('/dialogs/create_dialog', [exception.page_guard, auth.page_valid, (request: any, response: any, next: any) => {
        response.render("services/articles/dialogs/create_dialog", {message: message});
    }]);

    router.get('/dialogs/delete_confirm_dialog', [exception.page_guard, auth.page_valid, (request: any, response: any, next: any) => {
        response.render("services/articles/dialogs/delete_confirm_dialog", {message: message});
    }]);

}

module.exports = ArticlePageRouter.router;