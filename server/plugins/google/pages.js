/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GooglePageRouter;
(function (GooglePageRouter) {
    var express = require('express');
    GooglePageRouter.router = express.Router();
    var core = require(process.cwd() + '/gs');
    var auth = core.auth;
    var share = core.share;
    var exception = core.exception;
    var config = share.config;
    var message = config.message;
    var services_config = share.services_config;
    var webfonts = services_config.webfonts || [];
    var plugins_config = share.plugins_config;
    if (plugins_config.google_api) {
        var GoogleModule = require(share.Server("plugins/google/controllers/google_controller"));
        var calendar_1 = new GoogleModule.Calendar(plugins_config.google_api.calendar);
        //step1
        GooglePageRouter.router.get('/auth', function (request, response) {
            var user = request.session.req.user;
            if (user) {
                if (user.tokens) {
                    var tokens = user.tokens.google_calendar_token;
                    calendar_1.authorize(tokens, function (client, tokens) {
                        if (client) {
                            calendar_1.analytics(client, function (error, result) {
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
                    var url = calendar_1.authorize_url(['https://www.googleapis.com/auth/calendar.readonly', 'https://www.googleapis.com/auth/calendar', "https://www.googleapis.com/auth/analytics.readonly"]);
                    response.redirect(url);
                }
            }
            else {
                response.status(403).render('error', { status: 403, message: "Forbidden...", url: request.url });
            }
        });
        //step2
        GooglePageRouter.router.get('/callback', function (request, response) {
            var code = request.query.code;
            calendar_1.authorize_callback(code, function (client, tokens) {
                if (client) {
                    var user = request.session.req.user;
                    if (user) {
                        user.tokens = { google_calendar_token: tokens };
                        request.session.save();
                        calendar_1.analytics(client, function (error, result) {
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
        GooglePageRouter.router.get('/', [exception.page_guard, auth.page_valid, function (request, response, next) {
                response.render("plugins/google/index", {
                    config: config,
                    user: request.user,
                    role: auth.role(request.user),
                    message: message,
                    status: 200,
                    fonts: webfonts
                });
            }]);
    }
})(GooglePageRouter = exports.GooglePageRouter || (exports.GooglePageRouter = {}));
module.exports = GooglePageRouter.router;
//# sourceMappingURL=pages.js.map