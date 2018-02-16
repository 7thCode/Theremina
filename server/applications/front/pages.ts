/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

export namespace PageRouter {

    const express = require('express');
    export const router: IRouter = express.Router();

    const _ = require('lodash');
    const minify = require('html-minifier').minify;

    const core = require(process.cwd() + '/gs');
    const share: any = core.share;
    const config: any = share.config;
    const logger: any = share.logger;
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
    const layout: any = new LayoutsModule.Layout;

    const message: any = config.message;

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

    let render_static = (request: any, sub_path: string[], response: any): void => {
        resources.render_direct(request, sub_path, (error: { code: number, message: string }, result: any): void => {
            if (!error) {
                response.writeHead(200, {'Content-Type': result.type, 'Cache-Control': config.cache});
                response.write(result.content);
                response.end();
            } else {
                Error(error, request, response);
            }
        });
    };

    let default_user_id = () => {
        return applications_config.first_responder["default"].userid;
    };

    let default_namespace = () => {
        return applications_config.first_responder["default"].namespace;
    };

    let default_page = () => {
        return applications_config.first_responder["default"].page;
    };

    let default_query = () => {
        return applications_config.first_responder["default"].query;
    };

    let default_user_id_by = (namespace: string) => {
        let userid = default_user_id();
        try {
            userid = applications_config.first_responder[namespace].userid;
        } catch (e) {

        }
        return userid;
    };

    let default_page_by = (namespace: string) => {
        let page = default_page();
        try {
            page = applications_config.first_responder[namespace].page;
        } catch (e) {

        }
        return page;
    };

    let default_query_by = (namespace: string) => {
        let query = default_query();
        try {
            query = applications_config.first_responder[namespace].query;
        } catch (e) {

        }
        return query;
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
                logger.error(error.message);
                response.status(500).render('error', {
                    status: 500,
                    message: error.message,
                    url: request.url
                });
        }
    };

    router.get("/", [exception.page_catch, analysis.page_view, (request: any, response: any, next: any): void => {
        resources.render_html({
            params: {userid: default_user_id(), page: default_page(), namespace: default_namespace()},
            query: default_query()
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
            role: auth.role(request.user),
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
            role: auth.role(request.user),
            message: message,
            status: 200,
            fonts: webfonts
        });
    }]);

    router.get("/signup", [analysis.page_view, (request: any, response: any): void => {
        response.render("services/signup/index", {
            config: config,
            user: request.user,
            role: auth.role(request.user),
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
        response.redirect(302, "/" + default_user_id() + "/" + default_namespace() + "/doc/js/" + request.params.page);
    }]);

    router.get("/css/:page", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        response.redirect(302, "/" + default_user_id() + "/" + default_namespace() + "/doc/css/" + request.params.page);
    }]);

    router.get("/static/:page", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        response.redirect(302, "/" + default_user_id() + "/" + default_namespace() + "/static/" + request.params.page);
    }]);

    router.get("/fragment/:parent/:page", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        resources.render_fragment({
            params: {userid: default_user_id(), page: request.params.page, namespace: default_namespace()},
            query: request.query
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
        let query = request.query;
        if (!Object.keys(query).length) {
            query = default_query();
        }

        resources.render_html({
            params: {userid: default_user_id(), page: request.params.page, namespace: default_namespace()},
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
    /**
     * public
     */
    router.get("/img/:name", [exception.page_catch, (request: any, response: any): void => {
        /*       pictures.get_picture({
                   params: {userid: default_user_id(), name: request.params.name, namespace: default_namespace()},
                   query:  request.query
               }, response);
       */
        response.redirect(302, "/" + default_user_id() + "/" + default_namespace() + "/doc/img/" + request.params.name);

    }]);
    /**
     * public
     */
    router.get("/svg/:name", [exception.page_catch, (request: any, response: any): void => {
        /*     layout.get_layout_svg({
                 params: {userid: default_user_id(), name: request.params.name, namespace: default_namespace()},
                 query: request.query
             }, response);
     */
        response.redirect(302, "/" + default_user_id() + "/" + default_namespace() + "/doc/svg/" + request.params.name);
    }]);

    router.get("/:namespace/doc/js/:page", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        let namespace = request.params.namespace;
        response.redirect(302, "/" + default_user_id_by(namespace) + "/" + namespace + "/doc/js/" + request.params.page);
    }]);

    router.get("/:namespace/doc/css/:page", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        let namespace = request.params.namespace;
        response.redirect(302, "/" + default_user_id_by(namespace) + "/" + namespace + "/doc/css/" + request.params.page);
    }]);

    router.get("/:namespace/static/:page", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        let namespace = request.params.namespace;
        response.redirect(302, "/" + default_user_id_by(namespace) + "/" + namespace + "/static/" + request.params.page);
    }]);

    router.get("/:namespace/doc/img/:name", [(request: any, response: any): void => {
        let namespace = request.params.namespace;
        response.redirect(302, "/" + default_user_id_by(namespace) + "/" + namespace + "/doc/img/" + request.params.name);
    }]);

    router.get("/:namespace/doc/svg/:name", [exception.page_catch, (request: any, response: any): void => {
        let namespace = request.params.namespace;
        response.redirect(302, "/" + default_user_id_by(namespace) + "/" + namespace + "/doc/svg/" + request.params.name);
    }]);

    router.get("/:namespace/doc/:page", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        let namespace = request.params.namespace;
        let query = request.query;
        if (!Object.keys(query).length) {
            query = default_query_by(namespace);
        }

        resources.render_html({
            params: {userid: default_user_id_by(namespace), page: request.params.page, namespace: namespace},
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

        request.params.userid = default_user_id_by(namespace);

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

    router.get("/:namespace/doc", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        let namespace = request.params.namespace;
        let query = request.query;
        if (!Object.keys(query).length) {
            query = default_query_by(namespace);
        }

        resources.render_html({
            params: {userid: default_user_id_by(namespace), page: default_page_by(namespace), namespace: namespace},
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
        render_static(request, ["doc", "js"], response);
    }]);

    router.get("/:userid/:namespace/doc/css/:page", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        render_static(request, ["doc", "css"], response);
    }]);

    router.get("/:userid/:namespace/static/:page", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        render_static(request, ["static"], response);
    }]);

    router.get('/:userid/:namespace/doc/img/:name', [exception.page_catch, pictures.get_picture]);

    router.get("/:userid/:namespace/doc/svg/:name", [exception.page_catch, layout.get_layout_svg]);

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

    /*
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
    */
}

module.exports = PageRouter.router;