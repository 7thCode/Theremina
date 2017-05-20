/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace MailerModule {

    const _: _.LoDashStatic = require('lodash');

    const mongoose = require('mongoose');
    const Grid = require('gridfs-stream');

    const core = require(process.cwd() + '/core');
    const share: any = core.share;

    const config = share.config;
    const Cipher = share.Cipher;
    const Wrapper = share.Wrapper;
    const logger = share.logger;

    const ArticleModel: any = require(share.Models("services/articles/article"));

    const MailerModule: any = require('../../../systems/common/mailer');

    const validator = require('validator');

    export class Mailer {

        constructor() {

        }

        /**
         * @param request
         * @returns userid
         */
        static userid(request: any): string {
            return request.user.userid;
        }

        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        public send(request: any, response: any, next: any): void {

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

            mailer.send(to, subject, html, (error: any) => {
                if (!error) {

                    let content = {};
                    content["from"] = [{name:"",address:""}];
                    content["to"] = [{name:"",address:to}];
                    content["headers"] = {};
                    content["html"] = "<!DOCTYPE html><html><head><meta charset='utf-8'></head><body>" + html + "</body></html>";
                    content["subject"] = subject;

                    let article: any = new ArticleModel();
                    article.userid = config.systems.userid;
                    let objectid: any = new mongoose.Types.ObjectId;
                    article.name = objectid.toString();
                    article.content = content;
                    article.type = 10000;
                    article.open = false;
                    Wrapper.Save(response, 1000, article, (response: any, object: any): void => {
                        Wrapper.SendSuccess(response, {code: 0, message: ""});
                    });
                } else {
                    Wrapper.SendError(response, 200, error.message, error);
                }
            });
        }

        public receive(mail: any): void {

            let content = {};
            content["from"] = mail.body.from.value;
            content["to"] = mail.body.to.value;
            content["headers"] = mail.body.headers;
            content["html"] = mail.body.html;
            content["subject"] = mail.body.subject;

            let article: any = new ArticleModel();
            article.userid = config.systems.userid;
            let objectid: any = new mongoose.Types.ObjectId;
            article.name = objectid.toString();
            article.content = content;
            article.type = 10001;
            article.open = false;
            Wrapper.Save(null, 1000, article, (response: any, object: any): void => {

            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_mail_query_query(request: any, response: any): void {
            let userid = Mailer.userid(request);
            let query: any = JSON.parse(decodeURIComponent(request.params.query));
            let option: any = JSON.parse(decodeURIComponent(request.params.option));
            Wrapper.Find(response, 1400, ArticleModel, {$and: [{userid: config.systems.userid}, query]}, {}, option, (response: any, mails: any): any => {

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
        public get_mail_count(request: any, response: any): void {
            let query: any = JSON.parse(decodeURIComponent(request.params.query));
            Wrapper.Count(response, 2800, ArticleModel, {$and: [{userid: config.systems.userid}, query]}, (response: any, count: any): any => {
                Wrapper.SendSuccess(response, count);
            });
        }


        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_mail(request: any, response: any): void {
            let id = request.params.id;
            Wrapper.FindOne(response, 1400, ArticleModel, {$and: [{_id: id}, {userid: config.systems.userid}]}, (response: any, mail: any): void => {
                if (mail) {
                    Wrapper.SendSuccess(response, mail);
                } else {
                    Wrapper.SendWarn(response, 2, "not found", {});
                }
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public delete_mail(request: any, response: any): void {
            let id = request.params.id;
            Wrapper.FindOne(response, 1300, ArticleModel, {$and: [{_id: id}, {userid: config.systems.userid}]}, (response: any, mail: any): void => {
                if (mail) {
                    Wrapper.Remove(response, 1200, mail, (response: any): void => {
                        Wrapper.SendSuccess(response, {});
                    });
                } else {
                    Wrapper.SendWarn(response, 2, "not found", {});
                }
            });
        }

    }
}

module.exports = MailerModule;
