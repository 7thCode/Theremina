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

    const AnalysisModule: any = require(share.Server("systems/analysis/controllers/analysis_controller"));
    const analysis: any = new AnalysisModule.Analysis;

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

    // localhost:8000/articles/render/000000000000000000000000/test1/あ
    /*
    router.get("/form/:userid/:page_name/:article_name", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        article.render_form(request.params.userid, request.params.page_name, request.params.article_name, (error: any, result: string): void => {
            if (!error) {
                response.render("services/forms/render", {html: result, fonts: webfonts});
            } else {
                switch (error.code) {
                    case 10000:
                        response.status(404).render('error', {
                            status: 404,
                            message: "page not found...",
                            url: request.url
                        });
                        break;
                    case 20000:
                        response.status(404).render('error', {
                            status: 404,
                            message: "article not found...",
                            url: request.url
                        });
                        break;
                    default:
                        response.status(500).render('error', {status: 500, message: error.message, url: request.url});
                }
            }
        });
    }]);
*/
    // localhost:8000/articles/resource/000000000000000000000000/test1/あ
 /*
    router.get("/resource/:userid/:page_name/:article_name", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        article.render_resource(request.params.userid, request.params.page_name, request.params.article_name, request.query, (error: any, result: any): void => {
            if (!error) {
                response.send(result.resource);
            } else {
                switch (error.code) {
                    case 10000:
                        response.status(404).render('error', {
                            status: 404,
                            message: "page not found...",
                            url: request.url
                        });
                        break;
                    case 20000:
                        response.status(404).render('error', {
                            status: 404,
                            message: "article not found...",
                            url: request.url
                        });
                        break;
                    default:
                        response.status(500).render('error', {status: 500, message: error.message, url: request.url});
                }
            }
        });
    }]);
*/
    // localhost:8000/articles/resources/000000000000000000000000/test1&q={}&o={}
/*    router.get("/resources/:userid/:page_name/:article_name", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        article.render_resources(request.params.userid, request.params.page_name, request.params.article_name, request.query, (error: any, result: any): void => {
            if (!error) {
                response.send(result.resource);
            } else {
                switch (error.code) {
                    case 10000:
                        response.status(404).render('error', {
                            status: 404,
                            message: "page not found...",
                            url: request.url
                        });
                        break;
                    case 20000:
                        response.status(404).render('error', {
                            status: 404,
                            message: "article not found...",
                            url: request.url
                        });
                        break;
                    default:
                        response.status(500).render('error', {status: 500, message: error.message, url: request.url});
                }
            }
        });
    }]);
*/
}

module.exports = ArticlePageRouter.router;