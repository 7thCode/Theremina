/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MailerModule;
(function (MailerModule_1) {
    var _ = require('lodash');
    var mongoose = require('mongoose');
    var core = require(process.cwd() + '/gs');
    var share = core.share;
    var config = share.config;
    var Wrapper = share.Wrapper;
    var AssetModel = require(share.Models("plugins/asset/asset"));
    var MailerModule = require('../../../systems/common/mailer');
    var validator = require('validator');
    var Mailer = (function () {
        function Mailer() {
        }
        /**
         * @param request
         * @returns userid
         */
        Mailer.userid = function (request) {
            return request.user.userid;
        };
        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        Mailer.prototype.send = function (request, response, next) {
            var mailer = null;
            switch (config.mailer.type) {
                case "gmail":
                    mailer = new MailerModule.Mailer2(config.mailer.setting, config.mailer.account);
                    break;
                case "mailgun":
                    mailer = new MailerModule.MailGun(config.mailer.setting, config.mailer.account);
                    break;
                default:
            }
            var to = request.body.content.to;
            var subject = request.body.content.subject;
            var html = request.body.content.html;
            mailer.send(to, subject, html, function (error) {
                if (!error) {
                    var content = {};
                    content["from"] = [{ name: "", address: "" }];
                    content["to"] = [{ name: "", address: to }];
                    content["headers"] = {};
                    content["html"] = "<!DOCTYPE html><html><head><meta charset='utf-8'></head><body>" + html + "</body></html>";
                    content["subject"] = subject;
                    var article = new AssetModel();
                    article.userid = config.systems.userid;
                    var objectid = new mongoose.Types.ObjectId;
                    article.name = objectid.toString();
                    article.content = content;
                    article.type = 10000;
                    article.open = false;
                    Wrapper.Save(response, 1000, article, function (response, object) {
                        Wrapper.SendSuccess(response, { code: 0, message: "" });
                    });
                }
                else {
                    Wrapper.SendError(response, error.code, error.message, error);
                }
            });
        };
        Mailer.prototype.receive = function (mail) {
            var content = {};
            content["from"] = mail.body.from.value;
            content["to"] = mail.body.to.value;
            content["headers"] = mail.body.headers;
            content["html"] = mail.body.html;
            content["subject"] = mail.body.subject;
            var article = new AssetModel();
            article.userid = config.systems.userid;
            var objectid = new mongoose.Types.ObjectId;
            article.name = objectid.toString();
            article.content = content;
            article.type = 10001;
            article.open = false;
            Wrapper.Save(null, 1000, article, function (response, object) {
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Mailer.prototype.get_mail_query_query = function (request, response) {
            var userid = Mailer.userid(request);
            //   let query: any = JSON.parse(decodeURIComponent(request.params.query));
            //   let option: any = JSON.parse(decodeURIComponent(request.params.option));
            var query = Wrapper.Decode(request.params.query);
            var option = Wrapper.Decode(request.params.option);
            Wrapper.Find(response, 1400, AssetModel, { $and: [{ userid: config.systems.userid }, query] }, {}, option, function (response, mails) {
                //      _.forEach(mails, (article) => {
                //          article.content = null;
                //       });
                Wrapper.SendSuccess(response, mails);
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Mailer.prototype.get_mail_count = function (request, response) {
            //           let query: any = JSON.parse(decodeURIComponent(request.params.query));
            var query = Wrapper.Decode(request.params.query);
            Wrapper.Count(response, 2800, AssetModel, { $and: [{ userid: config.systems.userid }, query] }, function (response, count) {
                Wrapper.SendSuccess(response, count);
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Mailer.prototype.get_mail = function (request, response) {
            var id = request.params.id;
            Wrapper.FindOne(response, 1400, AssetModel, { $and: [{ _id: id }, { userid: config.systems.userid }] }, function (response, mail) {
                if (mail) {
                    Wrapper.SendSuccess(response, mail);
                }
                else {
                    Wrapper.SendWarn(response, 2, "not found", { code: 2, message: "not found" });
                }
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Mailer.prototype.delete_mail = function (request, response) {
            var id = request.params.id;
            Wrapper.FindOne(response, 1300, AssetModel, { $and: [{ _id: id }, { userid: config.systems.userid }] }, function (response, mail) {
                if (mail) {
                    Wrapper.Remove(response, 1200, mail, function (response) {
                        Wrapper.SendSuccess(response, {});
                    });
                }
                else {
                    Wrapper.SendWarn(response, 2, "not found", { code: 2, message: "not found" });
                }
            });
        };
        return Mailer;
    }());
    MailerModule_1.Mailer = Mailer;
})(MailerModule = exports.MailerModule || (exports.MailerModule = {}));
module.exports = MailerModule;
//# sourceMappingURL=mailer_controller.js.map