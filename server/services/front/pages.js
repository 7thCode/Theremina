/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PageRouter;
(function (PageRouter) {
    const express = require('express');
    PageRouter.router = express.Router();
    const _ = require('lodash');
    const core = require(process.cwd() + '/gs');
    const share = core.share;
    const config = share.config;
    const analysis = core.analysis;
    const services_config = share.services_config;
    const webfonts = services_config.webfonts;
    let message = config.message;
    const LocalAccount = require(share.Models("systems/accounts/account"));
    const ResourceModel = require(share.Models("systems/resources/resource"));
    const ArticleModel = require(share.Models("services/articles/article"));
    PageRouter.router.get("/", [analysis.page_view, (request, response) => {
            response.render("services/front/index", {
                config: config,
                user: request.user,
                message: message,
                status: 200,
                fonts: webfonts
            });
        }]);
    PageRouter.router.get("/sitemap.xml", [(request, response) => {
            let result = "";
            function MakeSitemap() {
                return new Promise((resolve, reject) => {
                    LocalAccount.find().then((accounts) => {
                        _.forEach(accounts, (account) => {
                            ResourceModel.find({ $and: [{ type: 20 }, { "content.type": "text/html" }, { userid: account.userid }] }).then((pages) => {
                                ArticleModel.find({ $and: [{ type: 0 }, { userid: account.userid }] }).then((docs) => {
                                    _.forEach(pages, (page) => {
                                        _.forEach(docs, (doc) => {
                                            let url = config.protocol + "://" + config.domain + "/" + account.userid + "/doc/" + page.name + "/" + doc.name;
                                            let priority = "1.0";
                                            result += '<url><loc>' + url + '</loc><priority>' + priority + '</priority></url>';
                                        });
                                    });
                                    resolve(result);
                                });
                            }).catch((error) => {
                                reject(error);
                            });
                        });
                    }).catch((error) => {
                        reject(error);
                    });
                });
            }
            MakeSitemap().then((value) => {
                let r = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
                    result
                    + '</urlset>';
                response.setHeader('Content-Type', 'text/xml');
                response.send(r);
            }).catch((error) => {
            });
        }]);
    PageRouter.router.get("/robots.txt", [(request, response) => {
            let robots = "User-agent: *\n\nSitemap: http://" + config.domain + "/sitemap.xml";
            response.setHeader('Content-Type', 'text/plain');
            response.send(robots);
        }]);
    PageRouter.router.get("/test", [(request, response) => {
            response.render("test", { user: request.user, message: message, status: 200 });
        }]);
})(PageRouter = exports.PageRouter || (exports.PageRouter = {}));
module.exports = PageRouter.router;
//# sourceMappingURL=pages.js.map