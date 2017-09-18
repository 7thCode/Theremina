/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace PageRouter {

    const express = require('express');
    export const router = express.Router();

    const _ = require('lodash');
    const minify = require('html-minifier').minify;

    const core = require(process.cwd() + '/gs');
    const share: any = core.share;
    const config: any = share.config;
    const auth: any = core.auth;
    const exception: any = core.exception;
    const analysis: any = core.analysis;

    const services_config = share.services_config;
    const webfonts: any[] = services_config.webfonts;

    const applications_config = share.applications_config;

    const ResourcesModule = require(share.Server("systems/resources/controllers/resource_controller"));
    const resources = new ResourcesModule.Pages;

    const LocalAccount: any = require(share.Models("systems/accounts/account"));
    const ResourceModel: any = require(share.Models("systems/resources/resource"));
    const ArticleModel: any = require(share.Models("services/articles/article"));

    let message = config.message;

    router.get("/", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        response.redirect(302, applications_config.redirect["/"]);
    }]);

    router.get("/front", [analysis.page_view, (request: any, response: any): void => {
        response.render("applications/front/index", {
            config: config,
            user: request.user,
            message: message,
            status: 200,
            fonts: webfonts
        });
    }]);

    router.get("/sitemap.xml", [(request: any, response: any): void => {
        let result = "";

        function MakeSitemap() {
            return new Promise((resolve, reject): void => {
                LocalAccount.find().then((accounts: any): void => {
                    _.forEach(accounts, (account) => {
                        ResourceModel.find({$and: [{type: 20}, {"content.type": "text/html"}, {userid: account.userid}]}).then((pages: any): void => {
                            ArticleModel.find({$and: [{type: 0}, {userid: account.userid}]}).then((docs: any): void => {
                                _.forEach(pages, (page: any): void => {
                                    _.forEach(docs, (doc: any): void => {
                                        let url = config.protocol + "://" + config.domain + "/" + account.userid + "/doc/" + page.name + "/" + doc.name;
                                        let priority = "1.0";
                                        result += '<url><loc>' + url + '</loc><priority>' + priority + '</priority></url>';
                                    });
                                });
                                resolve(result);
                            });
                        }).catch((error: any): void => {
                            reject(error);
                        });
                    });
                }).catch((error: any): void => {
                    reject(error);
                });
            });
        }

        MakeSitemap().then((value: any): void => {
            let r = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
                result
                + '</urlset>';
            response.setHeader('Content-Type', 'text/xml');
            response.send(r);
        }).catch((error: any): void => {

        });

    }]);

    router.get("/robots.txt", [(request: any, response: any): void => {
        let robots = "User-agent: *\n\nSitemap: " + config.protocol + "://" + config.domain + "/sitemap.xml";
        response.setHeader('Content-Type', 'text/plain');
        response.send(robots);
    }]);

    //self
    router.get("/self", [exception.page_guard, auth.page_valid, analysis.page_view, (request: any, response: any): void => {
        response.render("applications/self/index", {
            config: config,
            user: request.user,
            message: message,
            status: 200,
            fonts: webfonts
        });
    }]);

    router.get('/dialogs/save_done_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('applications/self/dialogs/save_done_dialog', {message: message});
    }]);

    //start
    router.get("/start", [exception.page_guard, auth.page_valid, analysis.page_view, (request: any, response: any): void => {
        response.render("applications/start/index", {
            config: config,
            user: request.user,
            message: message,
            status: 200,
            fonts: webfonts
        });
    }]);

    //data
    router.get("/data", [exception.page_guard, auth.page_valid, analysis.page_view, (request: any, response: any): void => {
        response.render("applications/data/index", {
            config: config,
            user: request.user,
            message: message,
            status: 200,
            fonts: webfonts
        });
    }]);

    router.get('/dialogs/self_update_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('applications/data/dialogs/self_update_dialog', {message: message});
    }]);

    router.get('/dialogs/delete_confirm_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('applications/data/dialogs/delete_confirm_dialog', {message: message});
    }]);

    router.get('/data/dialogs/create_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('applications/data/dialogs/create_dialog', {message: message});
    }]);

    router.get('/pages/dialogs/create_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('applications/pages/dialogs/create_dialog', {message: message});
    }]);

    router.get('/pages/dialogs/open_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('applications/pages/dialogs/open_dialog', {message: message});
    }]);

    router.get('/pages/dialogs/build_site_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('applications/pages/dialogs/build_site_dialog', {message: message});
    }]);

    router.get('/pages/dialogs/delete_confirm_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('applications/pages/dialogs/delete_confirm_dialog', {message: message});
    }]);

    //pages
    router.get("/pages", [exception.page_guard, auth.page_valid, analysis.page_view, (request: any, response: any): void => {
        response.render("applications/pages/index", {
            config: config,
            user: request.user,
            message: message,
            status: 200,
            fonts: webfonts
        });
    }]);

    //photo
    router.get("/photo", [exception.page_guard, auth.page_valid, analysis.page_view, (request: any, response: any): void => {
        response.render("applications/photo/index", {
            config: config,
            user: request.user,
            message: message,
            status: 200,
            fonts: webfonts
        });
    }]);

    router.get("/signup", [analysis.page_view, (request: any, response: any): void => {
        response.render("applications/signup/index", {
            config: config,
            user: request.user,
            message: message,
            status: 200,
            fonts: webfonts
        });
    }]);

    //SVG
    router.get("/svg", [exception.page_guard, auth.page_valid, analysis.page_view, (request: any, response: any): void => {
        response.render("applications/svg/index", {
            config: config,
            user: request.user,
            message: message,
            status: 200,
            fonts: webfonts
        });
    }]);

    router.get('/svg/dialogs/create_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('applications/svg/dialogs/create_dialog', {message: message});
    }]);

    router.get('/svg/dialogs/open_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('applications/svg/dialogs/open_dialog', {message: message});
    }]);

    router.get('/svg/dialogs/saveas_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('applications/svg/dialogs/saveas_dialog', {message: message});
    }]);

    router.get('/svg/dialogs/delete_confirm_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('applications/svg/dialogs/delete_confirm_dialog', {message: message});
    }]);

    //blob
    router.get("/blob", [exception.page_guard, auth.page_valid, analysis.page_view, (request: any, response: any): void => {
        response.render("applications/blob/index", {
            config: config,
            user: request.user,
            message: message,
            status: 200,
            fonts: webfonts
        });
    }]);

    router.get('/blob/dialogs/delete_confirm_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('applications/blob/dialogs/delete_confirm_dialog', {message: message});
    }]);


    // Members
    router.get("/members", [exception.page_guard, auth.page_valid, (request: any, response: any): void => {
        response.render("applications/members/index", {
            config: config,
            user: request.user,
            message: message,
            status: 200,
            fonts: webfonts
        });
    }]);

    router.get('/members/dialogs/open_dialog', [exception.page_guard, auth.page_valid, (request: any, response: any, next: any) => {
        response.render("applications/members/dialogs/open_dialog", {message: message});
    }]);

    // localhost:8000/site/000000000000000000000000/test1&q={}&o={}

    router.get("/:name", [exception.page_catch, analysis.page_view, (request: any, response: any, next: any): void => {
        let redirect_to = applications_config.redirect[request.params.name];
        if (redirect_to) {
            response.redirect(302, redirect_to);
        } else {
            next();
        }
    }]);

    // New Render

    let Error = (error: { code: number, message: string }, request: any, response: any) => {
        switch (error.code) {
            case 10000:
            case 20000:
                let userid = request.params.userid;
                resources.render_object(userid, "error.html", {
                    status: 404,
                    message: error.message,
                    url: request.url
                }, (error: any, result: any) => {
                    if (!error) {
                        response.writeHead(200, {'Content-Type': result.type, 'Cache-Control': config.cache});
                        response.write(result.content);
                        response.end();
                    } else {
                        response.status(404).render('error', {
                            status: 404,
                            message: error.message,
                            url: request.url
                        });
                    }
                });
                break;
            default:
                response.status(500).render('error', {
                    status: 500,
                    message: error.message,
                    url: request.url
                });
        }
    };

    router.get("/:userid/doc/js/:page", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        resources.render_direct(request, (error: { code: number, message: string }, result: any): void => {
            if (!error) {
                response.writeHead(200, {'Content-Type': result.type, 'Cache-Control': config.cache});
                response.write(result.content);
                response.end();
            } else {
                Error(error, request, response);
            }
        });
    }]);

    router.get("/:userid/doc/css/:page", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        resources.render_direct(request, (error: { code: number, message: string }, result: any): void => {
            if (!error) {
                response.writeHead(200, {'Content-Type': result.type, 'Cache-Control': config.cache});
                response.write(result.content);
                response.end();
            } else {
                Error(error, request, response);
            }
        });
    }]);

    router.get("/:userid/static/:page", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        resources.render_direct(request, (error: { code: number, message: string }, result: any): void => {
            if (!error) {
                response.writeHead(200, {'Content-Type': result.type, 'Cache-Control': config.cache});
                response.write(result.content);
                response.end();
            } else {
                Error(error, request, response);
            }
        });
    }]);

    router.get("/:userid/doc/:page", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        resources.render_html(request, (error: { code: number, message: string }, result: any): void => {
            if (!error) {
                response.writeHead(200, {'Content-Type': result.type, 'Cache-Control': config.cache});
                let content = result.content;
                if (config.compression) {
                    content = minify(result.content, {
                        removeComments: true,
                        removeCommentsFromCDATA: true,
                        collapseWhitespace: true,
                        collapseBooleanAttributes: true,
                        removeAttributeQuotes: false,
                        removeRedundantAttributes: false,
                        useShortDoctype: true,
                        removeEmptyAttributes: false,
                        removeOptionalTags: false,
                        removeEmptyElements: false
                    });
                }
                response.write(content);
                response.end();
            } else {
                Error(error, request, response);
            }
        });
    }]);

    router.get("/:userid/fragment/:parent/:page", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        resources.render_fragment(request, (error: { code: number, message: string }, result: any): void => {
            if (!error) {
                response.writeHead(200, {'Content-Type': result.type, 'Cache-Control': config.cache});
                response.write(result.content);
                response.end();
            } else {
                Error(error, request, response);
            }
        });
    }]);



}

module.exports = PageRouter.router;