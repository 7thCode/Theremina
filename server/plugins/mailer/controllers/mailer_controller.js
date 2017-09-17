/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MailerModule;
(function (MailerModule_1) {
    const _ = require('lodash');
    const mongoose = require('mongoose');
    const core = require(process.cwd() + '/gs');
    const share = core.share;
    const config = share.config;
    const Wrapper = share.Wrapper;
    const AssetModel = require(share.Models("plugins/asset/asset"));
    const MailerModule = require('../../../systems/common/mailer');
    const validator = require('validator');
    class Mailer {
        constructor() {
        }
        /**
         * @param request
         * @returns userid
         */
        static userid(request) {
            return request.user.userid;
        }
        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        send(request, response, next) {
            let mailer = null;
            switch (config.mailer.type) {
                case "gmail":
                    mailer = new MailerModule.Mailer2(config.mailer.setting, config.mailer.account);
                    break;
                case "mailgun":
                    mailer = new MailerModule.MailGun(config.mailer.setting, config.mailer.account);
                    break;
                default:
            }
            let to = request.body.content.to;
            let subject = request.body.content.subject;
            let html = request.body.content.html;
            mailer.send(to, subject, html, (error) => {
                if (!error) {
                    let content = {};
                    content["from"] = [{ name: "", address: "" }];
                    content["to"] = [{ name: "", address: to }];
                    content["headers"] = {};
                    content["html"] = "<!DOCTYPE html><html><head><meta charset='utf-8'></head><body>" + html + "</body></html>";
                    content["subject"] = subject;
                    let article = new AssetModel();
                    article.userid = config.systems.userid;
                    let objectid = new mongoose.Types.ObjectId;
                    article.name = objectid.toString();
                    article.content = content;
                    article.type = 10000;
                    article.open = false;
                    Wrapper.Save(response, 1000, article, (response, object) => {
                        Wrapper.SendSuccess(response, { code: 0, message: "" });
                    });
                }
                else {
                    Wrapper.SendError(response, error.code, error.message, error);
                }
            });
        }
        receive(mail) {
            let content = {};
            content["from"] = mail.body.from.value;
            content["to"] = mail.body.to.value;
            content["headers"] = mail.body.headers;
            content["html"] = mail.body.html;
            content["subject"] = mail.body.subject;
            let article = new AssetModel();
            article.userid = config.systems.userid;
            let objectid = new mongoose.Types.ObjectId;
            article.name = objectid.toString();
            article.content = content;
            article.type = 10001;
            article.open = false;
            Wrapper.Save(null, 1000, article, (response, object) => {
            });
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        get_mail_query_query(request, response) {
            let userid = Mailer.userid(request);
            //   let query: any = JSON.parse(decodeURIComponent(request.params.query));
            //   let option: any = JSON.parse(decodeURIComponent(request.params.option));
            let query = Wrapper.Decode(request.params.query);
            let option = Wrapper.Decode(request.params.option);
            Wrapper.Find(response, 1400, AssetModel, { $and: [{ userid: config.systems.userid }, query] }, {}, option, (response, mails) => {
                //      _.forEach(mails, (article) => {
                //          article.content = null;
                //       });
                Wrapper.SendSuccess(response, mails);
            });
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        get_mail_count(request, response) {
            //           let query: any = JSON.parse(decodeURIComponent(request.params.query));
            let query = Wrapper.Decode(request.params.query);
            Wrapper.Count(response, 2800, AssetModel, { $and: [{ userid: config.systems.userid }, query] }, (response, count) => {
                Wrapper.SendSuccess(response, count);
            });
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        get_mail(request, response) {
            let id = request.params.id;
            Wrapper.FindOne(response, 1400, AssetModel, { $and: [{ _id: id }, { userid: config.systems.userid }] }, (response, mail) => {
                if (mail) {
                    Wrapper.SendSuccess(response, mail);
                }
                else {
                    Wrapper.SendWarn(response, 2, "not found", { code: 2, message: "not found" });
                }
            });
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        delete_mail(request, response) {
            let id = request.params.id;
            Wrapper.FindOne(response, 1300, AssetModel, { $and: [{ _id: id }, { userid: config.systems.userid }] }, (response, mail) => {
                if (mail) {
                    Wrapper.Remove(response, 1200, mail, (response) => {
                        Wrapper.SendSuccess(response, {});
                    });
                }
                else {
                    Wrapper.SendWarn(response, 2, "not found", { code: 2, message: "not found" });
                }
            });
        }
    }
    MailerModule_1.Mailer = Mailer;
})(MailerModule = exports.MailerModule || (exports.MailerModule = {}));
module.exports = MailerModule;
//# sourceMappingURL=mailer_controller.js.map