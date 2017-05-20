"use strict";

export namespace PageRouter {

    const express = require('express');
    export const router = express.Router();

    const _ = require('lodash');

    const core = require(process.cwd() + '/core');
    const share: any = core.share;
    const config: any = share.config;
    const auth: any = core.auth;
    const exception: any = core.exception;
    const analysis: any = core.analysis;

    const services_config = share.services_config;
    const webfonts: any[] = services_config.webfonts;

    const applications_config = share.applications_config;

    const FrontModule: any = require(share.Server("applications/front/controllers/front_controller"));
    const pages: any = new FrontModule.Pages;

    const LocalAccount: any = require(share.Models("systems/accounts/account"));
    const ResourceModel: any = require(share.Models("systems/resources/resource"));
    const ArticleModel: any = require(share.Models("services/articles/article"));

    const dialog_message = {long: "too long", short: "Too Short", required: "Required"};


    router.get("/", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        response.redirect(302, applications_config.redirect["/"]);
    }]);

    router.get("/front", [analysis.page_view, (request: any, response: any): void => {
        response.render("applications/front/index", {
            config:config,
            user: request.user,
            message: "Welcome",
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
                                        let url = config.protocol + "://" + config.domain + "/site/" + account.userid + "/" + page.name + "/" + doc.name;
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
            response.set('Content-Type', 'text/xml');
            response.send(r);
        }).catch((error: any): void => {

        });

    }]);

    router.get("/robots.txt", [(request: any, response: any): void => {
        let robots = "User-agent: *\n\nSitemap: http://" + config.domain + "/sitemap.xml";
        response.set('Content-Type', 'text/plain');
        response.send(robots);
    }]);

    //self
    router.get("/self", [exception.page_guard, auth.page_valid, analysis.page_view, (request: any, response: any): void => {
        response.render("applications/self/index", {config:config,user: request.user, message: "Self", status: 200, fonts: webfonts});
    }]);

    router.get('/dialogs/save_done_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('applications/self/dialogs/save_done_dialog', {messages: dialog_message});
    }]);

    //start
    router.get("/start", [exception.page_guard, auth.page_valid, analysis.page_view, (request: any, response: any): void => {
        response.render("applications/start/index", {
            config:config,
            user: request.user,
            message: "Data",
            status: 200,
            fonts: webfonts
        });
    }]);


    //data
    router.get("/data", [exception.page_guard, auth.page_valid, analysis.page_view, (request: any, response: any): void => {
        response.render("applications/data/index", {config:config, user: request.user, message: "Data", status: 200, fonts: webfonts});
    }]);

    router.get('/dialogs/self_update_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('applications/data/dialogs/self_update_dialog', {messages: dialog_message});
    }]);

    router.get('/dialogs/delete_confirm_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('applications/data/dialogs/delete_confirm_dialog', {messages: dialog_message});
    }]);

    router.get('/data/dialogs/create_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('applications/data/dialogs/create_dialog', {messages: dialog_message});
    }]);

    router.get('/pages/dialogs/create_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('applications/pages/dialogs/create_dialog', {messages: dialog_message});
    }]);

    router.get('/pages/dialogs/open_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('applications/pages/dialogs/open_dialog', {messages: dialog_message});
    }]);

    router.get('/pages/dialogs/delete_confirm_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('applications/pages/dialogs/delete_confirm_dialog', {messages: dialog_message});
    }]);

    //pages
    router.get("/pages", [exception.page_guard, auth.page_valid, analysis.page_view, (request: any, response: any): void => {
        response.render("applications/pages/index", {
            config:config,
            domain: config.domain,
            user: request.user,
            message: "Pages",
            status: 200,
            fonts: webfonts
        });
    }]);

    //photo
    router.get("/photo", [exception.page_guard, auth.page_valid, analysis.page_view, (request: any, response: any): void => {
        response.render("applications/photo/index", {
            config:config,
            user: request.user,
            message: "Data",
            status: 200,
            fonts: webfonts
        });
    }]);

    router.get("/signup", [analysis.page_view, (request: any, response: any): void => {
        response.render("applications/signup/index", {
            config:config,
            user: request.user,
            message: "Welcome",
            status: 200,
            fonts: webfonts
        });
    }]);

    //SVG
    router.get("/svg", [exception.page_guard, auth.page_valid, analysis.page_view, (request: any, response: any): void => {
        response.render("applications/svg/index", {
            config:config,
            domain: config.domain,
            user: request.user,
            message: "SVG",
            status: 200,
            fonts: webfonts
        });
    }]);

    router.get('/svg/dialogs/create_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('applications/svg/dialogs/create_dialog', {messages: dialog_message});
    }]);

    router.get('/svg/dialogs/open_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('applications/svg/dialogs/open_dialog', {messages: dialog_message});
    }]);

    router.get('/svg/dialogs/saveas_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('applications/svg/dialogs/saveas_dialog', {messages: dialog_message});
    }]);

    router.get('/svg/dialogs/delete_confirm_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('applications/svg/dialogs/delete_confirm_dialog', {messages: dialog_message});
    }]);


    // Members
    router.get("/members", [exception.page_guard, auth.page_valid, (request: any, response: any): void => {
        response.render("applications/members/index", {config:config, user: request.user, message: "Accounts", status: 200, fonts:webfonts});
    }]);

    router.get('/members/dialogs/open_dialog', [exception.page_guard, auth.page_valid, (request: any, response: any, next: any) => {
        response.render("applications/members/dialogs/open_dialog", {messages: dialog_message});
    }]);


    /*
     <a href="/site/000000000000000000000000/verb_index?o={%22skip%22:|{prev}|,%22limit%22:2}">p</a>
     <div>{count}</div>
     <a href="/site/000000000000000000000000/verb_index?o={%22skip%22:|{next}|,%22limit%22:2}">n</a>
     */

    // localhost:8000/site/000000000000000000000000/test1&q={}&o={}

    // http://localhost:8000/site/000000000000000000000000/page_name/title_article_name&q={}&o={}
    // http://localhost:8000/site/000000000000000000000000/verb_index/b&q={}&o={}
    // http://localhost:8000/site/000000000000000000000000/verb_index?q={%22content.title.value%22:%22zzz%22}
    // http://localhost:8000/site/000000000000000000000000/verb_index?q={%22content.title.value%22:%22zzz%22}&o={%22limit%22:10}&p=1
    // http://localhost:8000/site/000000000000000000000000/verb_index?o={%22skip%22:0,%22limit%22:10}

    router.get("/site/:userid/:page_name", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        pages.render_pages(request.params.userid, request.params.page_name, null, request.query, (error: any, result: any): void => {
            if (!error) {
                response.writeHead(200, {'Content-Type': result.type});
                response.write(result.resource);
                response.end();
          //      response.send(result.resource);
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

    router.get("/site/:userid/:page_name/:article_name", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        pages.render_pages(request.params.userid, request.params.page_name, request.params.article_name, request.query, (error: any, result: any): void => {
            if (!error) {
                response.writeHead(200, {'Content-Type': result.type});
                response.write(result.resource);
                response.end();

         //       response.send(result.resource);
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






}

module.exports = PageRouter.router;