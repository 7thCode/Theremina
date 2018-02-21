/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import {IRouter} from "express-serve-static-core";

export namespace GooglePageRouter {

    const express = require('express');
    export const router: IRouter = express.Router();

    const core = require(process.cwd() + '/gs');
    const auth: any = core.auth;
    const share: any = core.share;
    const exception: any = core.exception;

    const config: any = share.config;
    const message : any = config.message;

    const services_config = share.services_config;
    const webfonts:any[] = services_config.webfonts || [];
    const plugins_config = share.plugins_config;

    if (plugins_config.google_api) {
        const GoogleModule: any = require(share.Server("plugins/google/controllers/google_controller"));
        const calendar: any = new GoogleModule.Calendar(plugins_config.google_api.calendar);

        //step1
        router.get('/auth', (request: any, response: any): void => {
            let user: any = request.session.req.user;
            if (user) {
                if (user.tokens) {
                    let tokens:any = user.tokens.google_calendar_token;
                    calendar.authorize(tokens, (client: any, tokens: any): void => {
                        if (client) {
                            calendar.analytics(client, (error: any, result: string): void => {
                                if (!error) {
                                    response.send(result);
                                } else {
                                    response.status(500).render('error', {
                                        status: 500,
                                        message: error.message,
                                        url: request.url
                                    });
                                }
                            });
                        } else {
                            response.status(403).render('error', {
                                status: 403,
                                message: "Forbidden...",
                                url: request.url
                            });
                        }
                    });
                } else {
                    let url: string = calendar.authorize_url(['https://www.googleapis.com/auth/calendar.readonly', 'https://www.googleapis.com/auth/calendar', "https://www.googleapis.com/auth/analytics.readonly"]);
                    response.redirect(url);
                }
            } else {
                response.status(403).render('error', {status: 403, message: "Forbidden...", url: request.url});
            }
        });

        //step2
        router.get('/callback', (request: any, response: any): void => {
            let code:any = request.query.code;
            calendar.authorize_callback(code, (client: any, tokens: any): void => {
                if (client) {
                    let user = request.session.req.user;
                    if (user) {
                        user.tokens = {google_calendar_token: tokens};
                        request.session.save();
                        calendar.analytics(client, (error: any, result: string): void => {
                            if (!error) {
                                response.send(JSON.stringify(result));
                            } else {
                                response.status(500).render('error', {
                                    status: 500,
                                    message: error.message,
                                    url: request.url
                                });
                            }
                        });
                    } else {
                        response.status(403).render('error', {status: 403, message: "Forbidden...", url: request.url});
                    }
                } else {
                    response.status(403).render('error', {status: 403, message: "Forbidden...", url: request.url});
                }
            });
        });

        router.get('/', [exception.page_guard, auth.page_valid, (request: any, response: any, next: any) => {
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

}

module.exports = GooglePageRouter.router;