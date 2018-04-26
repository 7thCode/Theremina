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

    const message: any = config.message;

    const services_config = share.services_config;
    const webfonts: any[] = services_config.webfonts || [];

    const ResourcesModule = require(share.Server("systems/resources/controllers/resource_controller"));
    const resources = new ResourcesModule.Pages;

    const LayoutsModule: any = require(share.Server("services/layouts/controllers/layouts_controller"));
    const layout: any = new LayoutsModule.Layout;

    const PicturesModule: any = require(share.Server("applications/pictures/controllers/pictures_controller"));
    const pictures: any = new PicturesModule.Pictures;

    const applications_config = share.applications_config;

    let root = applications_config.path.root;
    let css = applications_config.path.css;
    let js = applications_config.path.js;
    let img = applications_config.path.img;
    let svg = applications_config.path.svg;
    let stat = applications_config.path.stat;

    let render_html = (request: any, response: any, callback: (error) => void): void => {
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
                callback(null)
            } else {
                callback(error);
            }
        });
    };

    let render_html_by_namespace = (query: any, namespace: string, page: string, response: any, callback: (error) => void): void => {
        let params = {userid: default_user_id_by(namespace), page: page, namespace: namespace};
        resources.render_html({params: params, query: query}, (error: { code: number, message: string }, result: any) => {
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
                callback(null)
            } else {
                callback(error);
            }
        });
    };

    let render_static = (request: any, sub_path: string[], response: any, callback: (error) => void): void => {
        resources.render_direct(request, sub_path, (error: { code: number, message: string }, result: any): void => {
            if (!error) {
                response.writeHead(200, {'Content-Type': result.type, 'Cache-Control': config.cache});
                response.write(result.content);
                response.end();
                callback(null);
            } else {
                callback(error);
            }
        });
    };

    let default_user_id = (): string => {
        return applications_config.first_responder["default"].userid;
    };

    let default_namespace = (): string => {
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

    let marge_query = (query: any, default_query: any): any => {
        if (query.sq) {
        } else {
            Object.keys(default_query).forEach(key => {
                if (!query[key]) {
                    query[key] = default_query[key];
                }
            });
        }
        return query;
    };

/*
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
*/

    router.get("/front", [analysis.page_view, (request: any, response: any): void => {
        logger.trace("pages /front");
        response.render("applications/front/index", {
            config: config,
            user: request.user,
            role: auth.role(request.user),
            message: message,
            status: 200,
            fonts: webfonts
        });
    }]);

    router.get("/robots.txt", [(request: any, response: any): void => {
        logger.trace("pages /robots.txt");
        let robots = "User-agent: *\n\nSitemap: " + config.protocol + "://" + config.domain + "/sitemap.xml";
        response.setHeader('Content-Type', 'text/plain');
        response.send(robots);
    }]);

    router.get("/start", [exception.page_guard, auth.page_valid, analysis.page_view, (request: any, response: any): void => {
        logger.trace("pages /start");
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
        logger.trace("pages /signup");
        response.render("services/signup/index", {
            config: config,
            user: request.user,
            role: auth.role(request.user),
            message: message,
            status: 200,
            fonts: webfonts
        });
    }]);

    /* redirect */
    router.get("/shortcut/*", [(request: any, response: any, next): void => {
        if (applications_config.url_scheme) {
            let params_path = request.params[0];
            if (params_path) {
                let params_path_array = params_path.split("/");
                if (params_path_array.length > 0) {
                    let url_schemes = applications_config.url_scheme;
                    if (url_schemes) {
                        let url_scheme = url_schemes[params_path_array[0]];
                        if (url_scheme) {
                            if (url_scheme.hasnoerror(params_path_array)) {
                                let url = url_scheme.convert(params_path_array);
                                if (url) {
                                    response.redirect(302, url);
                                } else {
                                    next();
                                }
                            } else {
                                next();
                            }
                        } else {
                            next();
                        }
                    } else {
                        next();
                    }
                } else {
                    next();
                }
            } else {
                next();
            }

        } else {
            next();
        }
    }]);

    router.get("/sc/*", [(request: any, response: any, next): void => {
        if (applications_config.url_scheme) {
            let params_path = request.params[0];
            if (params_path) {
                let params_path_array = params_path.split("/");
                if (params_path_array.length > 0) {
                    let url_schemes = applications_config.url_scheme;
                    if (url_schemes) {
                        let url_scheme = url_schemes[params_path_array[0]];
                        if (url_scheme) {
                            if (url_scheme.hasnoerror(params_path_array)) {
                                let namespace = url_scheme.namespace;
                                let page = url_scheme.page;
                                let query = url_scheme.query(params_path_array);
                                render_html_by_namespace(query, namespace, page, response, (error):void => {
                                    if (error) {
                                        next(error);
                                    }
                                });
                            } else {
                                next();
                            }
                        } else {
                            next();
                        }
                    } else {
                        next();
                    }
                } else {
                    next();
                }
            } else {
                next();
            }
        } else {
            next();
        }
    }]);

    /* render */
    router.get("/", [exception.page_catch, analysis.page_view, (request: any, response: any, next: any): void => {
        logger.trace("pages /");
        let namespace = default_namespace();
        let page = default_page();

        let query = default_query();
        render_html_by_namespace(query, namespace, page, response, (error):void => {
            if (error) {
                next(error);
            }
        });
    }]);

    /* render */
    router.get("/:page", [exception.page_catch, analysis.page_view, (request: any, response: any, next: any): void => {
        logger.trace("pages /" + request.params.page);
        let namespace = default_namespace();
        let page = request.params.page;

        let query = marge_query(request.query, default_query_by(namespace));
        render_html_by_namespace(query, namespace, page, response, (error):void => {
            if (error) {
                next(error);
            }
        });
    }]);

    /* render */
    router.get("/:namespace/" + root, [exception.page_catch, analysis.page_view, (request: any, response: any, next): void => {
        logger.trace("pages /" + request.params.namespace + "/" + root + "/");
        let namespace = request.params.namespace;
        let page = default_page_by(namespace);

        let query = marge_query(request.query, default_query_by(namespace));
        render_html_by_namespace(query, namespace, page, response, (error):void => {
            if (error) {
                next(error);
            }
        });
    }]);

    /* render */
    router.get("/:namespace/" + root + "/:page", [exception.page_catch, analysis.page_view, (request: any, response: any, next): void => {
        logger.trace("pages /" + request.params.namespace + "/" + root + "/" + request.params.page);
        let namespace = request.params.namespace;
        let page = request.params.page;

        let query = marge_query(request.query, default_query_by(namespace));
        render_html_by_namespace(query, namespace, page, response, (error):void => {
            if (error) {
                next(error);
            }
        });
    }]);

    /* render */
    router.get("/:namespace/fragment/:parent/:page", [exception.page_catch, analysis.page_view, (request: any, response: any, next): void => {
        logger.trace("pages /" + request.params.namespace + "/fragment/" + request.params.parent + "/" + request.params.page);
        let namespace = request.params.namespace;
        request.params.userid = default_user_id_by(namespace);
        resources.render_fragment(request, (error: { code: number, message: string }, result: any): void => {
            if (!error) {
                response.writeHead(200, {'Content-Type': result.type, 'Cache-Control': config.cache});
                response.write(result.content);
                response.end();
            } else {
                next(error);
            }
        });
    }]);

    /* render */
    router.get("/fragment/:parent/:page", [exception.page_catch, analysis.page_view, (request: any, response: any, next): void => {
        logger.trace("pages /fragment/" + request.params.parent + "/" + request.params.page);
        resources.render_fragment({
            params: {userid: default_user_id(), page: request.params.page, namespace: default_namespace()},
            query: request.query
        }, (error: { code: number, message: string }, result: any): void => {
            if (!error) {
                response.writeHead(200, {'Content-Type': result.type, 'Cache-Control': config.cache});
                response.write(result.content);
                response.end();
            } else {
                next(error);
            }
        });
    }]);

    /* render */
    router.get("/:userid/:namespace/" + root + "/" + js + "/:page", [exception.page_catch, analysis.page_view, (request: any, response: any, next): void => {
        logger.trace("pages /" + request.params.userid + "/" + request.params.namespace + "/" + root + "/" + js + "/" + request.params.page);
        render_static(request, [root, js], response, (error):void => {
            if (error) {
                next(error);
            }
        });
    }]);

    /* render */
    router.get("/:userid/:namespace/" + root + "/" + css + "/:page", [exception.page_catch, analysis.page_view, (request: any, response: any, next): void => {
        logger.trace("pages /" + request.params.userid + "/" + request.params.namespace + "/" + root + "/" + css + "/" + request.params.page);
        render_static(request, [root, css], response, (error):void => {
            if (error) {
                next(error);
            }
        });
    }]);

    /* render */
    router.get("/:userid/:namespace/" + root + "/" + img + "/:name", [exception.page_catch, pictures.get_picture]);

    /* render */
    router.get("/:userid/:namespace/" + root + "/" + svg + "/:name", [exception.page_catch, layout.get_layout_svg]);

    /* render */
    router.get("/:userid/:namespace/" + stat + "/:page", [exception.page_catch, analysis.page_view, (request: any, response: any, next): void => {
        logger.trace("pages /" + request.params.userid + "/" + request.params.namespace + "/" + stat + "/" + request.params.page);
        render_static(request, [stat], response, (error):void => {
            if (error) {
                next(error);
            }
        });
    }]);

    /* render */
    router.get("/:userid/:namespace/" + root + "/:page", [exception.page_catch, analysis.page_view, (request: any, response: any, next): void => {
        logger.trace("pages /" + request.params.userid + "/" + request.params.namespace + "/" + root + "/" + request.params.page);
        render_html(request, response, (error):void => {
            if (error) {
                next(error);
            }
        });
    }]);

    /* render */
    router.get("/:userid/:namespace/fragment/:parent/:page", [exception.page_catch, analysis.page_view, (request: any, response: any, next): void => {
        logger.trace("pages /" + request.params.userid + "/" + request.params.namespace + "/fragment/" + request.params.parent + "/" + request.params.page);
        resources.render_fragment(request, (error: { code: number, message: string }, result: any): void => {
            if (!error) {
                response.writeHead(200, {'Content-Type': result.type, 'Cache-Control': config.cache});
                response.write(result.content);
                response.end();
            } else {
                next(error);
            }
        });
    }]);

    /* redirect */
    router.get("/" + js + "/:page", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        logger.trace("pages /" + js + "/" + request.params.page);
        let prefix = applications_config.prefix || "";
        response.redirect(302, prefix + "/" + default_user_id() + "/" + default_namespace() + "/" + root + "/" + js + "/" + request.params.page);
    }]);

    /* redirect */
    router.get("/" + css + "/:page", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        logger.trace("pages /" + css + "/" + request.params.page);
        let prefix = applications_config.prefix || "";
        response.redirect(302, prefix + "/" + default_user_id() + "/" + default_namespace() + "/" + root + "/" + css + "/" + request.params.page);
    }]);

    /* redirect */
    router.get("/" + img + "/:name", [exception.page_catch, (request: any, response: any): void => {
        logger.trace("pages /" + img + "/" + request.params.name);
        let prefix = applications_config.prefix || "";
        response.redirect(302, prefix + "/" + default_user_id() + "/" + default_namespace() + "/" + root + "/" + img + "/" + request.params.name);
    }]);

    /* redirect */
    router.get("/" + svg + "/:name", [exception.page_catch, (request: any, response: any): void => {
        logger.trace("pages /" + svg + "/" + request.params.name);
        let prefix = applications_config.prefix || "";
        response.redirect(302, prefix + "/" + default_user_id() + "/" + default_namespace() + "/" + root + "/" + svg + "/" + request.params.name);
    }]);

    /* redirect */
    router.get("/" + stat + "/:page", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        logger.trace("pages /" + stat + "/" + request.params.page);
        let prefix = applications_config.prefix || "";
        response.redirect(302, prefix + "/" + default_user_id() + "/" + default_namespace() + "/" + stat + "/" + request.params.page);
    }]);

    /* redirect */
    router.get("/:namespace/" + root + "/" + js + "/:page", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        logger.trace("pages /" + request.params.namespace + "/" + root + "/" + js + "/" + request.params.page);
        let prefix = applications_config.prefix || "";
        let namespace = request.params.namespace;
        response.redirect(302, prefix + "/" + default_user_id_by(namespace) + "/" + namespace + "/" + root + "/" + js + "/" + request.params.page);
    }]);

    /* redirect */
    router.get("/:namespace/" + root + "/" + css + "/:page", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        logger.trace("pages /" + request.params.namespace + "/" + root + "/" + css + "/" + request.params.page);
        let prefix = applications_config.prefix || "";
        let namespace = request.params.namespace;
        response.redirect(302, prefix + "/" + default_user_id_by(namespace) + "/" + namespace + "/" + root + "/" + css + "/" + request.params.page);
    }]);

    /* redirect */
    router.get("/:namespace/" + root + "/" + img + "/:name", [(request: any, response: any): void => {
        logger.trace("pages /" + request.params.namespace + "/" + root + "/" + img + "/" + request.params.name);
        let prefix = applications_config.prefix || "";
        let namespace = request.params.namespace;
        response.redirect(302, prefix + "/" + default_user_id_by(namespace) + "/" + namespace + "/" + root + "/" + img + "/" + request.params.name);
    }]);

    /* redirect */
    router.get("/:namespace/" + root + "/" + svg + "/:name", [exception.page_catch, (request: any, response: any): void => {
        logger.trace("pages /" + request.params.namespace + "/" + root + "/" + svg + "/" + request.params.name);
        let prefix = applications_config.prefix || "";
        let namespace = request.params.namespace;
        response.redirect(302, prefix + "/" + default_user_id_by(namespace) + "/" + namespace + "/" + root + "/" + svg + "/" + request.params.name);
    }]);

    /* redirect */
    router.get("/:namespace/" + stat + "/:page", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
        logger.trace("pages /" + request.params.namespace + "/" + stat + "/" + request.params.page);
        let prefix = applications_config.prefix || "";
        let namespace = request.params.namespace;
        response.redirect(302, prefix + "/" + default_user_id_by(namespace) + "/" + namespace + "/static/" + request.params.page);
    }]);

}

module.exports = PageRouter.router;