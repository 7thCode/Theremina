/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace MailerModule {

    const _ = require('lodash');
    const fs: any = require('graceful-fs');

    const path: any = require('path');

    const core: any = require(process.cwd() + '/gs');
    const share: any = core.share;
    const config: any = share.config;
    const Wrapper: any = share.Wrapper;

    const HtmlScannerModule: any = require(share.Server("systems/common/html_scanner/html_scanner"));
    const ScannerBehaviorModule: any = require(share.Server("systems/common/html_scanner/scanner_behavior"));
    const ResourceModel: any = require(share.Models("systems/resources/resource"));

    const validator: any = require('validator');
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
            const inquiry_mail: string = "inquiry_mail.html";
            const thanks_mail: string = "thanks_mail.html";
            const mail_type: number = 20;
            const report_title: string = "お問い合わせいただきました";
            const thanks_title: string = "ありがとうございます";
            const done_message: string = "お問い合わせありがとうございます";

            let referer = request.headers.referer;
            if (referer) {
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
                let referer_url = url.parse(referer);
                let path = referer_url.pathname;
                let separated_path = path.split("/");
                let userid = separated_path[1];
                let namespace = separated_path[2];

                if (userid) {
                    if (request.body.content) {
                        if (request.body.content.thanks) {
                            if (request.body.content.report) {
                                let thanks_to = request.body.content.thanks;
                                let report_to = request.body.content.report;

                                ResourceModel.findOne({$and: [{namespace: namespace}, {userid: userid}, {name: inquiry_mail}, {"type": mail_type}]}).then((record: any): void => {
                                    if (record) {
                                        let datasource = new ScannerBehaviorModule.CustomBehavior(inquiry_mail, inquiry_mail, config.systems.userid, namespace, null, true, {});
                                        HtmlScannerModule.Builder.Resolve(record.content.resource, datasource, {
                                            create: "",
                                            modify: "",
                                            content: request.body.content
                                        }, (error: any, doc: string) => {
                                            if (!error) {
                                                mailer.send(report_to, report_title, doc, (error: any): void => {
                                                    if (!error) {
                                                        ResourceModel.findOne({$and: [{namespace: namespace}, {userid: userid}, {name: thanks_mail}, {"type": mail_type}]}).then((record: any): void => {
                                                            if (record) {
                                                                let datasource = new ScannerBehaviorModule.CustomBehavior(thanks_mail, thanks_mail, config.systems.userid, namespace, null, true, {});
                                                                HtmlScannerModule.Builder.Resolve(record.content.resource, datasource, {
                                                                    create: "",
                                                                    modify: "",
                                                                    content: request.body.content
                                                                }, (error: any, doc: string): void => {
                                                                    if (!error) {
                                                                        mailer.send(thanks_to, thanks_title, doc, (error: any) => {
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
