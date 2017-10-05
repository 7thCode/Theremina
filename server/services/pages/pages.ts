/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace PagesPageRouter {

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


    let message = config.message;

    //pages
    router.get("/", [exception.page_guard, auth.page_valid, analysis.page_view, (request: any, response: any): void => {
        response.render("services/pages/index", {
            config: config,
            user: request.user,
            message: message,
            status: 200,
            fonts: webfonts
        });
    }]);

    router.get('/dialogs/create_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('services/pages/dialogs/create_dialog', {message: message});
    }]);

    router.get('/dialogs/open_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('services/pages/dialogs/open_dialog', {message: message});
    }]);

    router.get('/dialogs/build_site_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {

        let items = [];
        if (applications_config.sites) {
            let keys = Object.keys(applications_config.sites);

            keys.forEach((key:string):void => {
                items.push(applications_config.sites[key].description);
            });
        }

        result.render('services/pages/dialogs/build_site_dialog',
            {
                message: message,
                items: items
            });
    }]);

    /*
    [
                    {
                        class: "item active",
                        img: "/000000000000000000000000/verb/doc/img/img_3.jpg",
                        name: "verb"
                    },
                    {
                        class: "item",
                        img: "/000000000000000000000000/verb/doc/img/img_4.jpg",
                        name: "story"
                    },
                    {
                        class: "item",
                        img: "/000000000000000000000000/verb/doc/img/img_5.jpg",
                        name: "words"
                    }
                ]


    */

    router.get('/dialogs/delete_confirm_dialog', [exception.page_guard, auth.page_valid, (req: any, result: any, next: any) => {
        result.render('services/pages/dialogs/delete_confirm_dialog', {message: message});
    }]);

}

module.exports = PagesPageRouter.router;