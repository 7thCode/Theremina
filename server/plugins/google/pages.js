/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GooglePageRouter;
(function (GooglePageRouter) {
    const express = require('express');
    GooglePageRouter.router = express.Router();
    const core = require(process.cwd() + '/gs');
    const auth = core.auth;
    const share = core.share;
    const exception = core.exception;
    const config = share.config;
    let message = config.message;
    const services_config = share.services_config;
    const webfonts = services_config.webfonts;
    const plugins_config = share.plugins_config;
    if (plugins_config.google_api) {
        const GoogleModule = require(share.Server("plugins/google/controllers/google_controller"));
        const calendar = new GoogleModule.Calendar(plugins_config.google_api.calendar);
        //step1
        GooglePageRouter.router.get('/auth', (request, response) => {
            let user = request.session.req.user;
            if (user) {
                if (user.tokens) {
                    let tokens = user.tokens.google_calendar_token;
                    calendar.authorize(tokens, (client, tokens) => {
                        if (client) {
                            calendar.analytics(client, (error, result) => {
                                if (!error) {
                                    response.send(result);
                                }
                                else {
                                    response.status(500).render('error', {
                                        status: 500,
                                        message: error.message,
                                        url: request.url
                                    });
                                }
                            });
                        }
                        else {
                            response.status(403).render('error', {
                                status: 403,
                                message: "Forbidden...",
                                url: request.url
                            });
                        }
                    });
                }
                else {
                    let url = calendar.authorize_url(['https://www.googleapis.com/auth/calendar.readonly', 'https://www.googleapis.com/auth/calendar', "https://www.googleapis.com/auth/analytics.readonly"]);
                    response.redirect(url);
                }
            }
            else {
                response.status(403).render('error', { status: 403, message: "Forbidden...", url: request.url });
            }
        });
        //step2
        GooglePageRouter.router.get('/callback', (request, response) => {
            let code = request.query.code;
            calendar.authorize_callback(code, (client, tokens) => {
                if (client) {
                    let user = request.session.req.user;
                    if (user) {
                        user.tokens = { google_calendar_token: tokens };
                        request.session.save();
                        calendar.analytics(client, (error, result) => {
                            if (!error) {
                                response.send(JSON.stringify(result));
                            }
                            else {
                                response.status(500).render('error', {
                                    status: 500,
                                    message: error.message,
                                    url: request.url
                                });
                            }
                        });
                    }
                    else {
                        response.status(403).render('error', { status: 403, message: "Forbidden...", url: request.url });
                    }
                }
                else {
                    response.status(403).render('error', { status: 403, message: "Forbidden...", url: request.url });
                }
            });
        });
        GooglePageRouter.router.get('/', [exception.page_guard, auth.page_valid, (request, response, next) => {
                response.render("plugins/google/index", {
                    config: config,
                    user: request.user,
                    message: message,
                    status: 200,
                    fonts: webfonts
                });
            }]);
    }
})(GooglePageRouter = exports.GooglePageRouter || (exports.GooglePageRouter = {}));
module.exports = GooglePageRouter.router;
//# sourceMappingURL=pages.js.map