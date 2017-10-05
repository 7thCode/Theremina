/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MailerModule;
(function (MailerModule) {
    const _ = require('lodash');
    class Mailer {
        constructor(mailsetting, mailaccount) {
            this.mailer = require('nodemailer');
            this.account = mailaccount;
            this.mailsetting = mailsetting;
        }
        send(mail_address, title, message, callback) {
            this.smtpUser = this.mailer.createTransport('SMTP', this.mailsetting); //SMTPの接続
            if (this.smtpUser) {
                let resultMail = {
                    from: this.account,
                    to: mail_address,
                    bcc: this.account,
                    subject: title,
                    html: message
                };
                try {
                    this.smtpUser.sendMail(resultMail, (error) => {
                        if (!error) {
                            callback(error);
                        }
                        else {
                            callback(error);
                        }
                        this.smtpUser.close();
                    });
                }
                catch (e) {
                    callback(e);
                }
            }
            else {
                callback({});
            }
        }
    }
    MailerModule.Mailer = Mailer;
    class Mailer2 {
        constructor(mailsetting, mailaccount) {
            let mailer = require('nodemailer');
            this.account = mailaccount;
            this.smtpUser = mailer.createTransport(mailsetting);
        }
        send(mail_address, title, message, callback) {
            if (this.smtpUser) {
                let resultMail = {
                    from: this.account,
                    to: mail_address,
                    bcc: this.account,
                    subject: title,
                    html: message
                };
                try {
                    this.smtpUser.sendMail(resultMail, (error) => {
                        if (!error) {
                            callback(error);
                        }
                        else {
                            callback(error);
                        }
                        this.smtpUser.close();
                    });
                }
                catch (e) {
                    callback(e);
                }
            }
            else {
                callback({});
            }
        }
    }
    MailerModule.Mailer2 = Mailer2;
    class MailGun {
        constructor(mailsetting, mailaccount) {
            this.account = mailaccount;
            this.api_key = mailsetting.api_key;
            this.domain = mailsetting.domain;
            this.mailgun = require('mailgun-js')({ apiKey: this.api_key, domain: this.domain });
        }
        send(mail_address, title, message, callback) {
            let data = {
                from: this.account,
                to: mail_address,
                bcc: this.account,
                subject: title,
                html: message
            };
            this.mailgun.messages().send(data, (error, body) => {
                if (!error) {
                    callback(null);
                }
                else {
                    callback(error);
                }
            });
        }
    }
    MailerModule.MailGun = MailGun;
    class MailReceiver {
        constructor() {
            let iconv = require('iconv');
            this.conv = new iconv.Iconv("UTF-8", "UTF-8");
            this.inbox = require('inbox');
        }
        connect(receiver_setting, connect, receive) {
            let imap;
            if (receiver_setting.type == "imap") {
                imap = this.inbox.createConnection(false, receiver_setting.address, {
                    secureConnection: true,
                    auth: receiver_setting.auth
                });
                imap.on('connect', () => {
                    imap.openMailbox('INBOX', (error) => {
                        connect(error);
                    });
                });
                imap.on('new', (message) => {
                    let stream = imap.createMessageStream(message.UID);
                    let simpleParser = require("mailparser").simpleParser;
                    simpleParser(stream).then((mail) => {
                        receive(message, mail);
                    }).catch((error) => {
                        let a = error;
                    });
                });
                imap.connect();
            }
        }
    }
    MailerModule.MailReceiver = MailReceiver;
})(MailerModule = exports.MailerModule || (exports.MailerModule = {}));
module.exports = MailerModule;
//# sourceMappingURL=mailer.js.map