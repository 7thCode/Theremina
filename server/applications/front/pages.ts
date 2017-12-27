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

    const PicturesModule: any = require(share.Server("services/pictures/controllers/pictures_controller"));
    const pictures: any = new PicturesModule.Pictures;

    const LayoutsModule: any = require(share.Server("services/layouts/controllers/layouts_controller"));

    let message = config.message;

    let render_html = (request: any, response: any): void => {
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
    };

    let render_static = (request: any, response: any): void => {
        resources.render_direct(request, (error: { code: number, message: string }, result: any): void => {
            if (!error) {
                response.writeHead(200, {'Content-Type': result.type, 'Cache-Control': config.cache});
                response.write(result.content);
                response.end();
            } else {
                Error(error, request, response);
            }
        });
    };

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

    router.get("/", [exception.page_catch, analysis.page_view, (request: any, response: any, next: any): void => {

        let userid = applications_config.first_responder["default"].userid;
        let namespace = applications_config.first_responder["default"].namespace;
        let page = applications_config.first_responder["default"].page;
        let query = applications_config.first_responder["default"].query;

        resources.render_html({
            params: {userid: userid, page: page, namespace: namespace},
            query: query
        }, (error: { code: number, message: string }, result: any) => {
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

    router.get("/front", [analysis.page_view, (request: any, response: any): void => {
        response.render("services/front/index", {
            config: config,
            user: request.user,
            message: message,
            status: 200,
            fonts: webfonts
        });
    }]);

    router.get("/robots.txt", [(request: any, response: any): void => {
        let robots = "User-agent: *\n\nSitemap: " + config.protocol + "://" + config.domain + "/sitemap.xml";
        response.setHeader('Content-Type', 'text/plain');
        response.send(robots);
    }]);

    router.get("/start", [exception.page_guard, auth.page_valid, analysis.page_view, (request: any, response: any): void => {
        response.render("services/start/index", {
            config: config,
            user: request.user,
            message: message,
            status: 200,
            fonts: webfonts
        });
    }]);

    router.get("/signup", [analysis.page_view, (request: any, response: any): void => {
        response.render("services/signup/index", {
            config: config,
            user: request.user,
            message: message,
            status: 200,
            fonts: webfonts
        });
    }]);

    router.get("/shortcut/:name", [exception.page_catch, (request: any, response: any): void => {
        let urls = applications_config.redirect;

        let url = urls[request.params.name];
        if (url) {
            response.redirect(302, urls[request.params.name]);
        }
    }]);

    router.get("/js/:page", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        let userid = applications_config.first_responder["default"].userid;
        let namespace = applications_config.first_responder["default"].namespace;
        let page = request.params.page;
        let query = request.query;

        resources.render_direct({
            params: {userid: userid, page: page, namespace: namespace},
            query: query
        }, (error: { code: number, message: string }, result: any): void => {
            if (!error) {
                response.writeHead(200, {'Content-Type': result.type, 'Cache-Control': config.cache});
                response.write(result.content);
                response.end();
            } else {
                Error(error, request, response);
            }
        });
    }]);

    router.get("/css/:page", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        let userid = applications_config.first_responder["default"].userid;
        let namespace = applications_config.first_responder["default"].namespace;
        let page = request.params.page;
        let query = request.query;

        resources.render_direct({
            params: {userid: userid, page: page, namespace: namespace},
            query: query
        }, (error: { code: number, message: string }, result: any): void => {
            if (!error) {
                response.writeHead(200, {'Content-Type': result.type, 'Cache-Control': config.cache});
                response.write(result.content);
                response.end();
            } else {
                Error(error, request, response);
            }
        });
    }]);

    router.get("/static/:page", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        let userid = applications_config.first_responder["default"].userid;
        let namespace = applications_config.first_responder["default"].namespace;
        let page = request.params.page;
        let query = request.query;

        resources.render_direct({
            params: {userid: userid, page: page, namespace: namespace},
            query: query
        }, (error: { code: number, message: string }, result: any): void => {
            if (!error) {
                response.writeHead(200, {'Content-Type': result.type, 'Cache-Control': config.cache});
                response.write(result.content);
                response.end();
            } else {
                Error(error, request, response);
            }
        });
    }]);

    router.get("/fragment/:parent/:page", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {

        let userid = applications_config.first_responder["default"].userid;
        let namespace = applications_config.first_responder["default"].namespace;
        let page = request.params.page;
        let query = request.query;

        resources.render_fragment({
            params: {userid: userid, page: page, namespace: namespace},
            query: query
        }, (error: { code: number, message: string }, result: any): void => {
            if (!error) {
                response.writeHead(200, {'Content-Type': result.type, 'Cache-Control': config.cache});
                response.write(result.content);
                response.end();
            } else {
                Error(error, request, response);
            }
        });
    }]);

    router.get("/:page", [exception.page_catch, analysis.page_view, (request: any, response: any, next: any): void => {

        let userid = applications_config.first_responder["default"].userid;
        let namespace = applications_config.first_responder["default"].namespace;
        let page = request.params.page;

        let query = request.query;
        if (!Object.keys(query).length) {
             query = applications_config.first_responder["default"].query;
        }

        resources.render_html({
            params: {userid: userid, page: page, namespace: namespace},
            query: query
        }, (error: { code: number, message: string }, result: any) => {
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

    router.get("/img/:name", [(request: any, response: any): void => {
        let userid = applications_config.first_responder["default"].userid;
        let namespace = applications_config.first_responder["default"].namespace;
        let name = request.params.name;
        let query = request.query;

        pictures.get_picture({
            params: {userid: userid, name: name, namespace: namespace},
            query: query
        }, response);
    }]);

    router.get("/:namespace/doc/js/:page", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        let namespace = request.params.namespace;
        request.params.userid = applications_config.first_responder["default"].userid;
        try {
            request.params.userid = applications_config.first_responder[namespace].userid;
        } catch (e) {

        }
        render_static(request, response);
    }]);

    router.get("/:namespace/doc/css/:page", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        let namespace = request.params.namespace;
        request.params.userid = applications_config.first_responder["default"].userid;
        try {
            request.params.userid = applications_config.first_responder[namespace].userid;
        } catch (e) {

        }
        render_static(request, response);
    }]);

    router.get("/:namespace/static/:page", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        let namespace = request.params.namespace;
        request.params.userid = applications_config.first_responder["default"].userid;
        try {
            request.params.userid = applications_config.first_responder[namespace].userid;
        } catch (e) {

        }
        render_static(request, response);
    }]);

    router.get("/:namespace/doc/img/:name", [(request: any, response: any): void => {
        let namespace = request.params.namespace;
        request.params.userid = applications_config.first_responder["default"].userid;
        try {
            request.params.userid = applications_config.first_responder[namespace].userid;
        } catch (e){

        }

        pictures.get_picture(request, response);
    }]);

    router.get("/:namespace/doc/:page", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {

        let namespace = request.params.namespace;

        let userid = applications_config.first_responder["default"].userid;
        try {
            userid = applications_config.first_responder[namespace].userid;
        } catch (e){

        }

        let query = request.query;
        if (!Object.keys(query).length) {
            query = applications_config.first_responder["default"].query;
            try {
                query = applications_config.first_responder[namespace].query;
            } catch (e) {

            }
        }

        let page = request.params.page;

        resources.render_html({
            params: {userid: userid, page: page, namespace: namespace},
            query: query
        }, (error: { code: number, message: string }, result: any) => {
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

    router.get("/:namespace/fragment/:parent/:page", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        let namespace = request.params.namespace;
        request.params.userid = applications_config.first_responder["default"].userid;
        try {
            request.params.userid = applications_config.first_responder[namespace].userid;
        } catch (e){

        }

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

    router.get("/:namespace/svg/:name", [exception.page_catch, (request: any, response: any): void => {
        let namespace = request.params.namespace;
        request.params.userid = applications_config.first_responder["default"].userid;
        try {
            request.params.userid = applications_config.first_responder[namespace].userid;
        } catch (e) {

        }

        LayoutsModule.Layout.get_svg(request, response, request.params.userid, request.params.name, 2);
    }]);

    router.get("/:namespace/doc", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {

        let namespace = request.params.namespace;
        let userid = applications_config.first_responder["default"].userid;
        try {
            userid = applications_config.first_responder[namespace].userid;
        } catch (e) {

        }

        let page = applications_config.first_responder["default"].page;
        try {
            page = applications_config.first_responder[namespace].page;
        } catch (e) {

        }

        let query = request.query;
        if (!Object.keys(query).length) {
            query = applications_config.first_responder["default"].query;
            try {
                query = applications_config.first_responder[namespace].query;
            } catch (e) {

            }
        }

        resources.render_html({
            params: {userid: userid, page: page, namespace: namespace},
            query: query
        }, (error: { code: number, message: string }, result: any) => {
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

    router.get("/:userid/:namespace/doc/js/:page", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        render_static(request, response);
    }]);

    router.get("/:userid/:namespace/doc/css/:page", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        render_static(request, response);
    }]);

    router.get("/:userid/:namespace/static/:page", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        render_static(request, response);
    }]);

    router.get('/:userid/:namespace/doc/img/:name', pictures.get_picture);

    router.get("/:userid/:namespace/doc/:page", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        render_html(request, response);
    }]);

    router.get("/:userid/:namespace/fragment/:parent/:page", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
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

    router.get("/:userid/:namespace/svg/:name", [exception.page_catch, (request: any, response: any): void => {
        LayoutsModule.Layout.get_svg(request, response, request.params.userid, request.params.name, 2);
    }]);

    router.get('/front/dialogs/build_site_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        let items = [];
        if (applications_config.sites) {
            let keys = Object.keys(applications_config.sites);
            keys.forEach((key: string): void => {
                items.push(applications_config.sites[key].description);
            });
        }
        result.render('applications/front/dialogs/build_site_dialog',
            {
                message: message,
                items: items
            });
    }]);

}

module.exports = PageRouter.router;