/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace MailerModule {

    const _: any = require('lodash');

    const core: any = require(process.cwd() + '/gs');
    const share: any = core.share;
    const config: any = share.config;
    const Wrapper: any = share.Wrapper;
    const applications_config: any = share.applications_config;

    const HtmlScannerModule: any = require(share.Server("systems/common/html_scanner/html_scanner"));
    const ScannerBehaviorModule: any = require(share.Server("systems/common/html_scanner/scanner_behavior"));
    const ResourceModel: any = require(share.Models("systems/resources/resource"));

    const url: any = require('url');

    const MailerModule: any = require('../../../systems/common/mailer');

    export class Mailer {

        constructor() {

        }

        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        public send(request: any, response: any): void {
            const inquiry_mail: string = applications_config.mail.inquiry_mail;
            const thanks_mail: string = applications_config.mail.thanks_mail;
            const mail_type: number = applications_config.mail.mail_type;
            const report_title: string = applications_config.mail.report_title;
            const thanks_title: string = applications_config.mail.thanks_title;
            const done_message: string = applications_config.mail.done_message;

            let referer: string = request.headers.referer;
            if (referer) {
                let mailer: any = null;
                let bcc: string | any[] | null = null;
                switch (config.mailer.type) {
                    case "gmail":
                        mailer = new MailerModule.Mailer2(config.mailer.setting, config.mailer.account);
                        bcc = "";
                        if (request.body.content.bcc) {
                            bcc = request.body.content.bcc;
                        }
                        break;
                    case "mailgun":
                        mailer = new MailerModule.MailGun(config.mailer.setting, config.mailer.account);
                        bcc = [];
                        if (request.body.content.bcc) {
                            bcc.push(request.body.content.bcc);
                        }
                        break;
                    default:
                }
                let referer_url: any = url.parse(referer);
                let path: string = referer_url.pathname;
                //          let separated_path = path.split("/");

                let userid: string = request.body.content.userid;
                let namespace: string = request.body.content.namespace;

                if (userid) {
                    if (request.body.content) {
                        if (request.body.content.thanks) {
                            if (request.body.content.report) {
                                let thanks_to:string = request.body.content.thanks;
                                let report_to:string = request.body.content.report;
                                ResourceModel.findOne({$and: [{namespace: namespace},{userid: config.systems.userid},  {name: inquiry_mail}]}).then((record: any): void => {
                                    if (record) {
                                        let datasource:any = new ScannerBehaviorModule.CustomBehavior(inquiry_mail, inquiry_mail, config.systems.userid, namespace, null, true, {});
                                        HtmlScannerModule.Builder.Resolve(record.content.resource, datasource, {
                                            create: "",
                                            modify: "",
                                            content: request.body.content
                                        }, (error: any, doc: string): void => {
                                            if (!error) {
                                                mailer.send(report_to, bcc, report_title, doc, (error: any): void => {
                                                    if (!error) {
                                                        ResourceModel.findOne({$and: [{namespace: namespace}, {userid: config.systems.userid}, {name: thanks_mail}]}).then((record: any): void => {
                                                            if (record) {
                                                                let datasource:any = new ScannerBehaviorModule.CustomBehavior(thanks_mail, thanks_mail, config.systems.userid, namespace, null, true, {});
                                                                HtmlScannerModule.Builder.Resolve(record.content.resource, datasource, {
                                                                    create: "",
                                                                    modify: "",
                                                                    content: request.body.content
                                                                }, (error: any, doc: string): void => {
                                                                    if (!error) {
                                                                        mailer.send(thanks_to, bcc, thanks_title, doc, (error: any): void => {
                                                                            if (!error) {
                                                                                Wrapper.SendSuccess(response, {
                                                                                    code: 0,
                                                                                    message: done_message
                                                                                });
                                                                            } else {
                                                                                Wrapper.SendError(response, 500, error.message, error);
                                                                            }
                                                                        });
                                                                    } else {
                                                                        Wrapper.SendError(response, 300, error.message, error);
                                                                    }
                                                                });
                                                            } else {
                                                                Wrapper.SendError(response, 400, "record not found.", {});
                                                            }
                                                        });
                                                    } else {
                                                        Wrapper.SendError(response, 300, error.message, error);
                                                    }
                                                });
                                            } else {
                                                Wrapper.SendError(response, 300, error.message, error);
                                            }
                                        });
                                    } else {
                                        Wrapper.SendError(response, 200, "record not found.", {});
                                    }
                                });
                            } else {
                                Wrapper.SendError(response, 200, "report_to not found.", {});
                            }
                        } else {
                            Wrapper.SendError(response, 200, "thanks_to not found.", {});
                        }
                    } else {
                        Wrapper.SendError(response, 200, "content not found.", {});
                    }
                } else {
                    Wrapper.SendError(response, 200, "userid not found.", {});
                }
            } else {
                Wrapper.SendError(response, 200, "referer not found.", {});
            }
        }
    }
}

module.exports = MailerModule;
