/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PageRouter;
(function (PageRouter) {
    var express = require('express');
    PageRouter.router = express.Router();
    var _ = require('lodash');
    var core = require(process.cwd() + '/gs');
    var share = core.share;
    var auth = core.auth;
    var config = share.config;
    var analysis = core.analysis;
    var services_config = share.services_config;
    var webfonts = services_config.webfonts || [];
    var message = config.message;
    var LocalAccount = require(share.Models("systems/accounts/account"));
    var ResourceModel = require(share.Models("systems/resources/resource"));
    var ArticleModel = require(share.Models("services/articles/article"));
    var error_handler = function (error) {
    };
    /*
        router.get("/", [analysis.page_view, (request: any, response: any): void => {
            response.render("services/front/index", {
                config: config,
                user: request.user,
                role: auth.role(request.user),
                message: message,
                status: 200,
                fonts: webfonts
            });
        }]);
    
        router.get("/sitemap.xml", [(request: any, response: any): void => {
            let result: string = "";
    
            function MakeSitemap() {
                return new Promise((resolve, reject): void => {
                    LocalAccount.find().then((accounts: any): void => {
                        _.forEach(accounts, (account) => {
                            ResourceModel.find({$and: [{type: 20}, {"content.type": "text/html"}, {userid: account.userid}]}).then((pages: any): void => {
                                ArticleModel.find({$and: [{type: 0}, {userid: account.userid}]}).then((docs: any): void => {
                                    _.forEach(pages, (page: any): void => {
                                        _.forEach(docs, (doc: any): void => {
                                            let url:string = config.protocol + "://" + config.domain + "/" + account.userid + "/doc/" + page.name + "/" + doc.name;
                                            let priority:string = "1.0";
                                            result += '<url><loc>' + url + '</loc><priority>' + priority + '</priority></url>';
                                        });
                                    });
                                    resolve(result);
                                });
                            }).catch((error: any): void => {
                                reject(error);
                            });
                        });
                    }).catch((error: any): void => {
                        reject(error);
                    });
                });
            }
    
            MakeSitemap().then((value: any): void => {
                let r: string = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
                    result
                    + '</urlset>';
                response.setHeader('Content-Type', 'text/xml');
                response.send(r);
            }).catch((error: any): void => {
                error_handler(error);
            });
    
        }]);
    
        router.get("/robots.txt", [(request: any, response: any): void => {
            let robots: string = "User-agent: *\n\nSitemap: http://" + config.domain + "/sitemap.xml";
            response.setHeader('Content-Type', 'text/plain');
            response.send(robots);
        }]);
    
        router.get("/test", [(request: any, response: any): void => {
            response.render("test", {user: request.user, message: message, status: 200});
        }]);
    */
})(PageRouter = exports.PageRouter || (exports.PageRouter = {}));
module.exports = PageRouter.router;
//# sourceMappingURL=pages.js.map