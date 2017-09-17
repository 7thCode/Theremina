/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ResourcePageRouter;
(function (ResourcePageRouter) {
    const express = require('express');
    ResourcePageRouter.router = express.Router();
    const core = require(process.cwd() + '/gs');
    const share = core.share;
    const exception = core.exception;
    const config = share.config;
    const services_config = share.services_config;
    const webfonts = services_config.webfonts;
    const message = config.message;
    const AuthController = require(share.Server("systems/auth/controllers/auth_controller"));
    const auth = new AuthController.Auth();
    const AnalysisModule = require(share.Server("systems/analysis/controllers/analysis_controller"));
    const analysis = new AnalysisModule.Analysis;
    const ResourcesModule = require(share.Server("systems/resources/controllers/resource_controller"));
    const resources = new ResourcesModule.Resource;
    const pages = new ResourcesModule.Pages;
    ResourcePageRouter.router.get("/", [exception.page_guard, auth.page_valid, auth.page_is_system, (request, response) => {
            response.render("systems/resources/player/index", {
                config: config,
                user: request.user,
                message: message,
                status: 200,
                fonts: webfonts
            });
        }]);
    ResourcePageRouter.router.get("/builder", [exception.page_guard, auth.page_valid, auth.page_is_system, (request, response) => {
            response.render("systems/resources/builder/index", {
                config: config,
                domain: share.config.domain,
                user: request.user,
                message: message,
                status: 200,
                fonts: webfonts
            });
        }]);
    ResourcePageRouter.router.get('/dialogs/create_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, (req, result, next) => {
            result.render('systems/resources/builder/dialogs/create_dialog', { message: message });
        }]);
    ResourcePageRouter.router.get('/dialogs/open_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, (req, result, next) => {
            result.render('systems/resources/builder/dialogs/open_dialog', { message: message });
        }]);
    ResourcePageRouter.router.get('/dialogs/delete_confirm_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, (req, result, next) => {
            result.render('systems/resources/builder/dialogs/delete_confirm_dialog', { message: message });
        }]);
    //http://localhost:8000/resources/render/000000000000000000000000/words_index
    // New Render
    let Error = (error, request, response) => {
        switch (error.code) {
            case 10000:
            case 20000:
                let userid = request.params.userid;
                pages.render_object(userid, "error.html", {
                    status: 404,
                    message: error.message,
                    url: request.url
                }, (error, result) => {
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
    ResourcePageRouter.router.get("/:userid/doc/static/:page", [exception.page_catch, analysis.page_view, (request, response) => {
            pages.render_direct(request, (error, result) => {
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
    ResourcePageRouter.router.get("/:userid/doc/:page", [exception.page_catch, analysis.page_view, (request, response) => {
            pages.render_html(request, (error, result) => {
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
    ResourcePageRouter.router.get("/:userid/fragment/:parent/:page", [exception.page_catch, analysis.page_view, (request, response) => {
            pages.render_fragment(request, (error, result) => {
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