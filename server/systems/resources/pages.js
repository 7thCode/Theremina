/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ResourcePageRouter;
(function (ResourcePageRouter) {
    var express = require('express');
    ResourcePageRouter.router = express.Router();
    var core = require(process.cwd() + '/gs');
    var share = core.share;
    var exception = core.exception;
    var config = share.config;
    var services_config = share.services_config;
    var webfonts = services_config.webfonts;
    var message = config.message;
    var AuthController = require(share.Server("systems/auth/controllers/auth_controller"));
    var auth = new AuthController.Auth();
    var AnalysisModule = require(share.Server("systems/analysis/controllers/analysis_controller"));
    var analysis = new AnalysisModule.Analysis;
    var ResourcesModule = require(share.Server("systems/resources/controllers/resource_controller"));
    var resources = new ResourcesModule.Resource;
    var pages = new ResourcesModule.Pages;
    ResourcePageRouter.router.get("/", [exception.page_guard, auth.page_valid, auth.page_is_system, function (request, response) {
            response.render("systems/resources/player/index", {
                config: config,
                user: request.user,
                message: message,
                status: 200,
                fonts: webfonts
            });
        }]);
    ResourcePageRouter.router.get("/builder", [exception.page_guard, auth.page_valid, auth.page_is_system, function (request, response) {
            response.render("systems/resources/builder/index", {
                config: config,
                domain: share.config.domain,
                user: request.user,
                message: message,
                status: 200,
                fonts: webfonts
            });
        }]);
    ResourcePageRouter.router.get('/dialogs/create_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, function (req, result, next) {
            result.render('systems/resources/builder/dialogs/create_dialog', { message: message });
        }]);
    ResourcePageRouter.router.get('/dialogs/open_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, function (req, result, next) {
            result.render('systems/resources/builder/dialogs/open_dialog', { message: message });
        }]);
    ResourcePageRouter.router.get('/dialogs/delete_confirm_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, function (req, result, next) {
            result.render('systems/resources/builder/dialogs/delete_confirm_dialog', { message: message });
        }]);
    //http://localhost:8000/resources/render/000000000000000000000000/words_index
    // New Render
    var Error = function (error, request, response) {
        switch (error.code) {
            case 10000:
            case 20000:
                var userid = request.params.userid;
                pages.render_object(userid, "error.html", {
                    status: 404,
                    message: error.message,
                    url: request.url
                }, function (error, result) {
                    if (!error) {
                        response.writeHead(200, { 'Content-Type': result.type, 'Cache-Control': config.cache });
                        response.write(result.content);
                        response.end();
                    }
                    else {
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
    var render_static = function (request, response) {
        pages.render_direct(request, function (error, result) {
            if (!error) {
                response.writeHead(200, { 'Content-Type': result.type, 'Cache-Control': config.cache });
                response.write(result.content);
                response.end();
            }
            else {
                Error(error, request, response);
            }
        });
    };
    ResourcePageRouter.router.get("/:userid/:namespace/doc/js/:page", [exception.page_catch, analysis.page_view, function (request, response) {
            render_static(request, response);
        }]);
    ResourcePageRouter.router.get("/:userid/:namespace/doc/css/:page", [exception.page_catch, analysis.page_view, function (request, response) {
            render_static(request, response);
        }]);
    ResourcePageRouter.router.get("/:userid/:namespace/static/:page", [exception.page_catch, analysis.page_view, function (request, response) {
            render_static(request, response);
        }]);
    var render_html = function (request, response) {
        pages.render_html(request, function (error, result) {
            if (!error) {
                response.writeHead(200, { 'Content-Type': result.type, 'Cache-Control': config.cache });
                response.write(result.content);
                response.end();
            }
            else {
                Error(error, request, response);
            }
        });
    };
    ResourcePageRouter.router.get("/:userid/:namespace/doc/:page", [exception.page_catch, analysis.page_view, function (request, response) {
            render_html(request, response);
        }]);
    // router.get("/:userid/doc", [exception.page_catch, analysis.page_view, (request: any, response: any): void => {
    //     render_html(request, response);
    // }]);
    ResourcePageRouter.router.get("/:userid/:namespace/fragment/:parent/:page", [exception.page_catch, analysis.page_view, function (request, response) {
            pages.render_fragment(request, function (error, result) {
                if (!error) {
                    response.writeHead(200, { 'Content-Type': result.type, 'Cache-Control': config.cache });
                    response.write(result.content);
                    response.end();
                }
                else {
                    Error(error, request, response);
                }
            });
        }]);
})(ResourcePageRouter = exports.ResourcePageRouter || (exports.ResourcePageRouter = {}));
module.exports = ResourcePageRouter.router;
//# sourceMappingURL=pages.js.map