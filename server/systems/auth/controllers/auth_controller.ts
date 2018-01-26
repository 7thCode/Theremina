/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace AuthModule {

    const _ = require('lodash');

    const fs = require('graceful-fs');

    const mongoose: any = require('mongoose');
    mongoose.Promise = global.Promise;

    const passport: any = require('passport');

    const crypto = require('crypto');

    const share = require('../../common/share');
    const config = share.config;
    const applications_config = share.applications_config;

    let message = config.message;

    const Wrapper: any = share.Wrapper;
    const logger: any = share.logger;
    const Cipher: any = share.Cipher;
    const event: any = share.Event;

    const MailerModule: any = require('../../common/mailer');

    const HtmlScannerModule: any = require("../../common/html_scanner/html_scanner");
    const ScannerBehaviorModule: any = require("../../common/html_scanner/scanner_behavior");

    let _mailer = null;
    let bcc = null;
    switch (config.mailer.type) {
        case "mail":
            _mailer = new MailerModule.Mailer(config.mailer.setting, config.mailer.account);
            bcc = "";
            break;
        case "gmail":
            _mailer = new MailerModule.Mailer2(config.mailer.setting, config.mailer.account);
            bcc = "";
            break;
        case "mailgun":
            _mailer = new MailerModule.MailGun(config.mailer.setting, config.mailer.account);
            bcc = [];
            break;
        default:
    }

    const LocalAccount: any = require(share.Models("systems/accounts/account"));

    const ResourceModel: any = require(share.Models("systems/resources/resource"));

    interface PasswordToken {
        username: string;
        password: string;
        displayName: string;
        metadata: {},
        timestamp: any;
    }

    interface UserToken {
        username: string;
        password: string;
        newusername: string;
        timestamp: any;
    }

    let definition = {account_content: {mails: [], nickname: "", tokens: {}}};
    fs.open(share.Models('applications/accounts/definition.json'), 'ax+', 384, (error, fd) => {
        if (!error) {
            fs.close(fd, () => {
                let addition = JSON.parse(fs.readFileSync(share.Models('applications/accounts/definition.json'), 'utf-8'));
                definition = _.merge(definition, addition.account_content);
            });
        }
    });

    const use_publickey = config.use_publickey;

    export class Auth {

        constructor() {

        }

        public create_init_user(initusers: any[]): void {
            if (initusers) {
                _.forEach(initusers, (user) => {
                    let type: string = user.type;
                    let auth: number = user.auth;
                    let username: string = user.username;
                    let userid = user.userid;
                    let passphrase: string = Cipher.FixedCrypt(userid, config.key2);

                    let rootpassword: string = user.password;
                    Wrapper.FindOne(null, 1000, LocalAccount, {username: username}, (response: any, account: any): void => {
                        if (!account) {

                            let content: any = definition.account_content;
                            content.mails.push(username);
                            content.nickname = user.displayName;

                            LocalAccount.register(new LocalAccount({
                                    userid: userid,
                                    username: username,
                                    type: type,
                                    auth: auth,
                                    passphrase: passphrase,
                                    publickey: Cipher.PublicKey(passphrase),
                                    local: content
                                }),
                                rootpassword,
                                (error: any) => {
                                    if (error) {
                                        logger.error(error.message);
                                    }
                                });
                        }
                    });
                });
            }
        }

        static auth_event(type: string, param: any): void {
            switch (type) {
                case "register:local":
                    event.emitter.emit("register", {type: type, user: param});
                    break;
                default:
                    event.emitter.emit("auth", {type: type, token: param});
            }
        };

    /*    static isSystem(user: any): boolean {
            //           let result: boolean = (user.type == "System");
            let result: boolean = false;
            if (user.auth) {
                result = (user.auth == 1);
            }
            return result;
        }
   */

        static _role(user: any): any {
            let result: any = {guest:true,categoly: 0};
            if (user) {
                switch (user.auth) {
                    case 1:
                        result.system = true;
                    case 100:
                        result.user = true;
                    case 10000:
                        result.guest = true;
                    default:
                }

                switch (user.provider) {
                    case "local":
                        result.categoly = 0;
                        break;
                    default:
                        result.categoly = 1;
                }
            }
            return result;
        }

        public role(user: any): any {
            let result: any = {guest:true,categoly: 0};
            if (user) {
                switch (user.auth) {
                    case 1:
                        result.system = true;
                    case 100:
                        result.user = true;
                    case 10000:
                        result.guest = true;
                    default:
                }

                switch (user.provider) {
                    case "local":
                        result.categoly = 0;
                        break;
                    default:
                        result.categoly = 1;
                }
            }
            return result;
        }

        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        public page_valid(request: any, response: any, next: any): void {
            let user = request.user;
            if (user) {
                if (user.enabled) {
                    next();
                } else {
                    response.status(403).render('error', {status: 403, message: "Forbidden...", url: request.url});
                }
            } else {
                response.status(403).render('error', {status: 403, message: "Forbidden...", url: request.url});
            }
        }

        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        public page_is_system(request: any, response: any, next: any): void {
            let user = request.user;
            if (user) {
                if (Auth._role(user).system) {
                    next();
                } else {
                    response.status(403).render('error', {status: 403, message: "Forbidden...", url: request.url});
                }
            } else {
                response.status(403).render('error', {status: 403, message: "Forbidden...", url: request.url});
            }
        }

        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        public is_system(request: any, response: any, next: any): void {
            let user = request.user;
            if (user) {
                if (Auth._role(user).system) {
                    next();
                } else {
                    Wrapper.SendError(response, 403, "Forbidden.", {code: 403, message: "Forbidden."});
                }
            } else {
                Wrapper.SendError(response, 403, "Forbidden.", {code: 403, message: "Forbidden."});
            }
        }

        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        public is_enabled_regist_user(request: any, response: any, next: any): void {
            let user = request.user;
            if (user) {
                if (Auth._role(user).system) {
                    next();
                } else {
                    Wrapper.SendError(response, 403, "Forbidden.", {code: 403, message: "Forbidden."});
                }
            } else {
                if (config.regist.user) {
                    next();
                } else {
                    Wrapper.SendError(response, 403, "Forbidden.", {code: 403, message: "Forbidden."});
                }
            }
        }

        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        public is_enabled_regist_member(request: any, response: any, next: any): void {
            let user = request.user;
            if (user) {
                if (config.regist.member) {
                    next();
                } else {
                    Wrapper.SendError(response, 403, "Forbidden.", {code: 403, message: "Forbidden."});
                }
            }
        }

        /**
         * アカウント作成
         * @param request
         * @param response
         * @returns none
         */
        public post_local_register(request: any, response: any): void {
            const number: number = 15000;
            let username: string = request.body.username;
            let password: string = request.body.password;
            let systempassphrase: string = request.session.id;

            if (use_publickey) {
                username = Cipher.PublicKeyDecrypt(systempassphrase, username).plaintext;
                password = Cipher.PublicKeyDecrypt(systempassphrase, password).plaintext;
            }

            Wrapper.FindOne(response, 100, LocalAccount, {$and: [{provider: "local"}, {username: username}]},
                (response: any, account: any): void => {
                    if (!account) {
                        try {

                            let metadata = {};
                            if (request.body.metadata) {
                                metadata = request.body.metadata;
                            }

                            let tokenValue = {
                                username: username,
                                password: password,
                                displayName: request.body.displayName,
                                metadata: metadata,
                                auth: 100,
                                timestamp: Date.now()
                            };

                            let token: string = Cipher.FixedCrypt(JSON.stringify(tokenValue), config.tokensecret);
                            let link = config.protocol + "://" + config.domain + "/auth/register/" + token;
                            let beacon = config.protocol + "://" + config.domain + "/beacon/api/" + token;
                            ResourceModel.findOne({$and: [{userid: config.systems.userid}, {name: "regist_mail.html"}, {"type": 12}]}).then((record: any): void => {
                                if (record) {

                                    let datasource = new ScannerBehaviorModule.CustomBehavior("regist_mail.html", "regist_mail.html", config.systems.userid, "", null, true, {});
                                    HtmlScannerModule.Builder.Resolve(record.content.resource, datasource, {"link": link, "beacon": beacon}, (error: any, doc: string) => {
                                        if (!error) {
                                            _mailer.send(username, bcc, message.registconfirmtext, doc, (error: any) => {
                                                if (!error) {
                                                    Wrapper.SendSuccess(response, {code: 0, message: ""});
                                                } else {
                                                    Wrapper.SendError(response, error.code, error.message, error);
                                                }
                                            });
                                        }
                                    });

                                } else {
                                    Wrapper.SendError(response, number + 200, "not found.", {code: number + 200, message: "not found."});
                                }
                            }).catch((error: any): void => {
                                Wrapper.SendFatal(response, error.code, error.message, error);
                            });

                        } catch (e) {
                            Wrapper.SendFatal(response, e.code, e.message, e);
                        }
                    } else {
                        Wrapper.SendWarn(response, number + 1, message.usernamealreadyregist, {code: number + 1, message: message.usernamealreadyregist});
                    }
                }
            );
        }

        /**
         * レジスタートークンでユーザ登録
         * @param request
         * @param response
         * @returns none
         */
        public get_register_token(request: any, response: any): void {

            Wrapper.Exception(request, response, (request: any, response: any): void => {
                let token = Wrapper.Parse(Cipher.FixedDecrypt(request.params.token, config.tokensecret));
                let tokenDateTime: any = token.timestamp;
                let nowDate: any = Date.now();
                if ((tokenDateTime - nowDate) < (config.regist.expire * 60 * 1000)) {
                    LocalAccount.findOne({username: token.username}, (error: any, account_data: any): void => {
                        if (!error) {
                            if (!account_data) {

                                const shasum = crypto.createHash('sha1');
                                shasum.update(token.username);
                                let userid: string = shasum.digest('hex');

                                let passphrase: string = Cipher.FixedCrypt(userid, config.key2);

                                let content: any = definition.account_content;
                                content.mails.push(token.username);
                                content.nickname = token.displayName;

                                if (token.metadata.userid) {
                                    userid = token.metadata.userid;
                                }

                                LocalAccount.register(new LocalAccount({
                                        userid: userid,
                                        username: token.username,
                                        passphrase: passphrase,
                                        publickey: Cipher.PublicKey(passphrase),
                                        auth: token.auth,
                                        local: content
                                    }),
                                    token.password,
                                    (error: any): void => {
                                        if (!error) {
                                            let user: { username: string; password: string } = request.body;
                                            user.username = token.username;
                                            user.password = token.password;
                                            passport.authenticate('local', (error: any, user: any): void => {
                                                if (!error) {
                                                    if (user) {
                                                        Auth.auth_event("register:local", user);
                                                        request.login(user, (error: any): void => {
                                                            if (!error) {
                                                                Auth.auth_event("auth:local", request.params.token);
                                                                response.redirect("/");
                                                            } else {
                                                                response.status(500).render('error', {
                                                                    status: 500,
                                                                    message: ""
                                                                });
                                                            }
                                                        });
                                                    } else {
                                                        response.status(500).render('error', {
                                                            status: 500,
                                                            message: ""
                                                        });
                                                    }
                                                } else {
                                                    response.status(500).render('error', {
                                                        status: 500,
                                                        message: ""
                                                    });
                                                }
                                            })(request, response);
                                        } else {
                                            response.status(500).render('error', {
                                                status: 500,
                                                message: "unknown error."
                                            });
                                        }
                                    });
                            } else {
                                response.redirect("/");
                            }
                        } else {
                            response.status(500).render('error', {status: 500, message: "unknown error"});
                        }
                    });
                } else {
                    response.status(500).render('error', {status: 500, message: "timeout"});
                }
            });
        }

        /**
         * アカウント作成
         * @param request
         * @param response
         * @returns none
         */
        public post_member_register(request: any, response: any): void {

            const number: number = 15000;
            let username: string = request.body.username;
            let password: string = request.body.password;
            let systempassphrase: string = request.session.id;

            if (use_publickey) {
                username = Cipher.PublicKeyDecrypt(systempassphrase, username).plaintext;
                password = Cipher.PublicKeyDecrypt(systempassphrase, password).plaintext;
            }

            Wrapper.FindOne(response, 100, LocalAccount, {$and: [{provider: "local"}, {username: username}]},
                (response: any, account: any): void => {
                    if (!account) {
                        try {

                            let metadata = {userid: request.user.userid};
                            if (request.body.metadata) {
                                metadata = request.body.metadata;
                                metadata.userid = request.user.userid;
                            }

                            let tokenValue = {
                                username: username,
                                password: password,
                                displayName: request.body.displayName,
                                metadata: metadata,
                                auth: 101,
                                timestamp: Date.now()
                            };

                            let token: string = Cipher.FixedCrypt(JSON.stringify(tokenValue), config.tokensecret);
                            let link = config.protocol + "://" + config.domain + "/auth/member/" + token;
                            let beacon = config.protocol + "://" + config.domain + "/beacon/api/" + token;
                            ResourceModel.findOne({$and: [{userid: config.systems.userid}, {name: "regist_member_mail.html"}, {"type": 12}]}).then((record: any): void => {
                                if (record) {

                                    let datasource = new ScannerBehaviorModule.CustomBehavior("regist_member_mail.html", "regist_member_mail.html", config.systems.userid, "", null, true, {});
                                    HtmlScannerModule.Builder.Resolve(record.content.resource, datasource, {"link": link, "beacon": beacon}, (error: any, doc: string) => {
                                        if (!error) {
                                            _mailer.send(username, bcc, message.memberconfirmtext, doc, (error: any) => {
                                                if (!error) {
                                                    Wrapper.SendSuccess(response, {code: 0, message: ""});
                                                } else {
                                                    Wrapper.SendError(response, error.code, error.message, error);
                                                }
                                            });
                                        }
                                    });

                                } else {
                                    Wrapper.SendError(response, number + 200, "not found.", {code: number + 200, message: "not found."});
                                }
                            }).catch((error: any): void => {
                                Wrapper.SendFatal(response, error.code, error.message, error);
                            });
                        } catch (e) {
                            Wrapper.SendFatal(response, e.code, e.message, e);
                        }
                    } else {
                        Wrapper.SendWarn(response, number + 1, message.usernamealreadyregist, {code: number + 1, message: message.usernamealreadyregist});
                    }
                }
            );
        }

        /**
         * レジスタートークンでユーザ登録
         * @param request
         * @param response
         * @returns none
         */
        public get_member_token(request: any, response: any): void {
            Wrapper.Exception(request, response, (request: any, response: any): void => {
                let token = Wrapper.Parse(Cipher.FixedDecrypt(request.params.token, config.tokensecret));
                let tokenDateTime: any = token.timestamp;
                let nowDate: any = Date.now();
                if ((tokenDateTime - nowDate) < (config.regist.expire * 60 * 1000)) {
                    LocalAccount.findOne({username: token.username}, (error: any, account_data: any): void => {
                        if (!error) {
                            if (!account_data) {

                                let content = definition.account_content;
                                content.mails.push(token.username);
                                content.nickname = token.displayName;

                                let userid: string = "";
                                if (token.metadata.userid) {
                                    userid = token.metadata.userid;
                                } else {
                                    const shasum = crypto.createHash('sha1');
                                    shasum.update(token.username);
                                    userid = shasum.digest('hex');
                                }

                                let passphrase: string = Cipher.FixedCrypt(userid, config.key2);

                                LocalAccount.register(new LocalAccount({
                                        userid: userid,
                                        username: token.username,
                                        passphrase: passphrase,
                                        publickey: Cipher.PublicKey(passphrase),
                                        auth: token.auth,
                                        local: content
                                    }),
                                    token.password,
                                    (error: any): void => {
                                        if (!error) {
                                            let user: { username: string; password: string } = request.body;
                                            user.username = token.username;
                                            user.password = token.password;
                                            passport.authenticate('local', (error: any, user: any): void => {
                                                if (!error) {
                                                    if (user) {
                                                        request.login(user, (error: any): void => {
                                                            if (!error) {
                                                                Auth.auth_event("auth:member", request.params.token);
                                                                response.redirect("/");
                                                            } else {
                                                                response.status(500).render('error', {
                                                                    status: 500,
                                                                    message: ""
                                                                });
                                                            }
                                                        });
                                                    } else {
                                                        response.status(500).render('error', {
                                                            status: 500,
                                                            message: ""
                                                        });
                                                    }
                                                } else {
                                                    response.status(500).render('error', {
                                                        status: 500,
                                                        message: ""
                                                    });
                                                }
                                            })(request, response);
                                        } else {
                                            response.status(500).render('error', {
                                                status: 500,
                                                message: "unknown error."
                                            });
                                        }
                                    });
                            } else {
                                response.redirect("/");
                            }
                        } else {
                            response.status(500).render('error', {status: 500, message: "unknown error"});
                        }
                    });
                } else {
                    response.status(500).render('error', {status: 500, message: "timeout"});
                }
            });
        }

        /**
         * レジスタートークン発行
         * @param request
         * @param response
         * @returns none
         */
        public post_local_username(request: any, response: any): void {
            const number: number = 19000;
            let username: string = request.body.username;
            let password: string = request.body.password;
            let newusername: string = request.body.newusername;
            let systempassphrase: string = request.session.id;

            if (use_publickey) {
                username = Cipher.PublicKeyDecrypt(systempassphrase, username).plaintext;
                password = Cipher.PublicKeyDecrypt(systempassphrase, password).plaintext;
            }

            Wrapper.FindOne(response, number, LocalAccount, {$and: [{provider: "local"}, {username: username}]}, (response: any, account: any): void => {
                if (account) {
                    Wrapper.FindOne(response, number, LocalAccount, {$and: [{provider: "local"}, {username: newusername}]}, (response: any, account: any): void => {
                        if (!account) {
                            try {

                                let tokenValue: UserToken = {
                                    username: username,
                                    password: password,
                                    newusername: newusername,
                                    timestamp: Date.now()
                                };

                                let token: string = Cipher.FixedCrypt(JSON.stringify(tokenValue), config.tokensecret);
                                let link = config.protocol + "://" + config.domain + "/auth/username/" + token;
                                let beacon = config.protocol + "://" + config.domain + "/beacon/api/" + token;
                                ResourceModel.findOne({$and: [{userid: config.systems.userid}, {name: "username_mail.html"}, {"type": 12}]}).then((record: any): void => {
                                    if (record) {

                                        let datasource = new ScannerBehaviorModule.CustomBehavior("username_mail.html", "username_mail.html", config.systems.userid, "", null, true, {});
                                        HtmlScannerModule.Builder.Resolve(record.content.resource, datasource, {"link": link, "beacon": beacon}, (error: any, doc: string) => {
                                            if (!error) {
                                                _mailer.send(username, bcc, message.usernameconfirmtext, doc, (error: any) => {
                                                    if (!error) {
                                                        Wrapper.SendSuccess(response, {code: 0, message: ""});
                                                    } else {
                                                        Wrapper.SendError(response, error.code, error.message, error);
                                                    }
                                                });
                                            }
                                        });

                                    } else {
                                        Wrapper.SendError(response, number + 200, "not found.", {code: number + 200, message: "not found."});
                                    }
                                }).catch((error: any): void => {
                                    Wrapper.SendFatal(response, error.code, error.message, error);
                                });
                            } catch (e) {
                                Wrapper.SendFatal(response, e.code, e.message, e);
                            }
                        } else {
                            Wrapper.SendWarn(response, number + 2, message.usernamealreadyregist, {code: number + 2, message: message.usernamealreadyregist});
                        }
                    });
                } else {
                    Wrapper.SendWarn(response, number + 3, message.usernamenotfound, {code: number + 3, message: message.usernamenotfound});
                }
            });
        }

        /**
         * ユーザ名トークンでユーザ名変更（多分使用しない)
         * @param request
         * @param response
         * @returns none
         */
        public get_username_token(request: any, response: any): void {
            Wrapper.Exception(request, response, (request: any, response: any): void => {
                let token = Wrapper.Parse(Cipher.FixedDecrypt(request.params.token, config.tokensecret));
                let tokenDateTime: any = token.timestamp;
                let nowDate: any = Date.now();
                if ((tokenDateTime - nowDate) < (config.regist.expire * 60 * 1000)) {
                    LocalAccount.findOne({username: token.username}, (error: any, account: any): void => {
                        if (!error) {
                            if (account) {
                                let number: number = 83000;
                                account.username = token.newusername;
                                if (!error) {
                                    Wrapper.Save(response, number, account, (): void => {
                                        response.redirect("/");
                                    });
                                } else {
                                    response.status(400).render("error", {message: "unknown error", status: 400}); // already
                                }
                            } else {
                                response.status(400).render("error", {message: "already", status: 400}); // already
                            }
                        } else {
                            response.status(500).render("error", {message: "unknown error", status: 500}); // timeout
                        }
                    });
                } else {
                    response.status(400).render("error", {message: "timeout", status: 400}); // timeout
                }
            });
        }

        /**
         * パスワードトークン発行
         * @param request
         * @param response
         * @returns none
         */
        public post_local_password(request: any, response: any): void {
            const number: number = 21000;
            let username: string = request.body.username;
            let password: string = request.body.password;
            let systempassphrase: string = request.session.id;

            if (use_publickey) {
                username = Cipher.PublicKeyDecrypt(systempassphrase, username).plaintext;
                password = Cipher.PublicKeyDecrypt(systempassphrase, password).plaintext;
            }

            Wrapper.FindOne(response, number, LocalAccount, {$and: [{provider: "local"}, {username: username}]}, (response: any, account: any): void => {
                if (account) {
                    try {

                        let tokenValue = {
                            username: username,
                            password: password,
                            timestamp: Date.now()
                        };

                        let token: any = Cipher.FixedCrypt(JSON.stringify(tokenValue), config.tokensecret);
                        let link = config.protocol + "://" + config.domain + "/auth/password/" + token;
                        let beacon = config.protocol + "://" + config.domain + "/beacon/api/" + token;
                        ResourceModel.findOne({$and: [{userid: config.systems.userid}, {name: "password_mail.html"}, {"type": 12}]}).then((record: any): void => {
                            if (record) {

                                let datasource = new ScannerBehaviorModule.CustomBehavior("password_mail.html", "password_mail.html", config.systems.userid, "", null, true, {});
                                HtmlScannerModule.Builder.Resolve(record.content.resource, datasource, {"link": link, "beacon": beacon}, (error: any, doc: string) => {
                                    if (!error) {
                                        _mailer.send(username, bcc, message.passwordconfirmtext, doc, (error: any) => {
                                            if (!error) {
                                                Wrapper.SendSuccess(response, {code: 0, message: ""});
                                            } else {
                                                Wrapper.SendError(response, error.code, error.message, error);
                                            }
                                        });
                                    }
                                });

                            } else {
                                Wrapper.SendError(response, number + 200, "not found.", {code: number + 200, message: "not found."});
                            }
                        }).catch((error: any): void => {
                            Wrapper.SendFatal(response, error.code, error.message, error);
                        });
                    } catch (e) {
                        Wrapper.SendFatal(response, e.code, e.message, e);
                    }
                } else {
                    Wrapper.SendWarn(response, number + 1, message.usernamenotfound, {code: number + 1, message: message.usernamenotfound});
                }
            });
        }

        /**
         * パスワードトークンからパスワード変更
         * @param request
         * @param response
         * @returns none
         */
        public get_password_token(request: any, response: any): void {
            const number: number = 22000;
            Wrapper.Exception(request, response, (request: any, response: any): void => {
                let token = Wrapper.Parse(Cipher.FixedDecrypt(request.params.token, config.tokensecret));
                let tokenDateTime: any = token.timestamp;
                let nowDate: any = Date.now();
                if ((tokenDateTime - nowDate) < (config.regist.expire * 60 * 1000)) {
                    LocalAccount.findOne({username: token.username}, (error: any, account: any): void => {
                        if (!error) {
                            if (account) {
                                account.setPassword(token.password, (error: any): void => {
                                    if (!error) {
                                        Wrapper.Save(response, number, account, (): void => {
                                            response.redirect("/");
                                        });
                                    } else {
                                        response.status(400).render("error", {message: "unknown", status: 400}); // already
                                    }
                                });
                            } else {
                                response.status(400).render("error", {message: "already", status: 400}); // already
                            }
                        } else {
                            response.status(500).render("error", {message: "unknown error", status: 500}); // timeout
                        }
                    });
                } else {
                    response.status(400).render("error", {message: "timeout", status: 400}); // timeout
                }
            });
        }

        /**
         * ログイン
         * @param request
         * @param response
         * @returns none
         */
        public post_local_login(request: any, response: any): void {
            const number: number = 23000;
            let systempassphrase: string = request.session.id;
            if (request.body.username) {
                if (request.body.password) {

                    if (use_publickey) {
                        request.body.username = Cipher.PublicKeyDecrypt(systempassphrase, request.body.username).plaintext;
                        request.body.password = Cipher.PublicKeyDecrypt(systempassphrase, request.body.password).plaintext;
                    }

                    passport.authenticate("local", (error: any, user: any): void => {
                        if (!error) {
                            if (user) {
                                Wrapper.Guard(request, response, (request: any, response: any): void => {
                                    request.login(user, (error: any): void => {
                                        if (!error) {
                                            Auth.auth_event("login:local", request.body.username);
                                            Wrapper.SendSuccess(response, {});
                                        } else {
                                            Wrapper.SendError(response, error.code, error.message, error);
                                        }
                                    });
                                });
                            } else {
                                Wrapper.SendError(response, number + 2, message.wrongusername, {code: number + 2, message: message.wrongusername});
                            }
                        } else {
                            Wrapper.SendError(response, error.code, error.message, error);
                        }
                    })(request, response);
                } else {
                    Wrapper.SendError(response, number + 4, "", {code: number + 4, message: ""});
                }
            } else {
                Wrapper.SendError(response, number + 5, "", {code: number + 5, message: ""});
            }
        }

        /**
         * ログイン（facebook)
         * @param request
         * @param response
         * @returns none
         */
        public auth_facebook_callback(request: any, response: any): void {
            Wrapper.FindOne(response, 1000, LocalAccount, {userid: request.user.username}, (response: any, account: any): void => {
                if (!account) {
                    let userid = request.user.id;  //facebook
                    let passphrase: string = Cipher.FixedCrypt(userid, config.key2);

                    let new_account: any = new LocalAccount();
                    new_account.provider = "facebook";
                    new_account.userid = userid;
                    new_account.username = request.user.username;
                    new_account.passphrase = passphrase;
                    new_account.publickey = Cipher.PublicKey(passphrase);
                    new_account.local = {mails: [], nickname: request.user.displayName, tokens: {}};
                    //new_account.local = definition.account_content;

                    new_account.registerDate = Date.now();
                    new_account.save((error: any): void => {
                        if (!error) {
                            Auth.auth_event("auth:facebook", new_account);
                            response.redirect("/");
                        }
                    });
                } else {
                    Auth.auth_event("login:facebook", request.user.username);
                    response.redirect("/");
                }
            });
        }

        /**
         * ログイン（twitter)
         * @param request
         * @param response
         * @returns none
         */
        public auth_twitter_callback(request: any, response: any): void {
            Wrapper.FindOne(response, 1000, LocalAccount, {userid: request.user.username}, (response: any, account: any): void => {
                if (!account) {
                    let userid = request.user.id;  //twitter
                    let passphrase: string = Cipher.FixedCrypt(userid, config.key2);

                    let new_account: any = new LocalAccount();
                    new_account.provider = "twitter";
                    new_account.userid = userid;
                    new_account.username = request.user.username;
                    new_account.passphrase = passphrase;
                    new_account.publickey = Cipher.PublicKey(passphrase);
                    new_account.local = definition.account_content;
                    new_account.registerDate = Date.now();              // Legacy of v1
                    new_account.save((error: any): void => {
                        if (!error) {
                            Auth.auth_event("auth:twitter", new_account);
                            response.redirect("/");
                        }
                    });
                } else {
                    Auth.auth_event("login:twitter", request.user.username);
                    response.redirect("/");
                }
            });
        }

        /**
         * ログイン（instagram)
         * @param request
         * @param response
         * @returns none
         */
        public auth_instagram_callback(request: any, response: any): void {
            Wrapper.FindOne(response, 1000, LocalAccount, {userid: request.user.username}, (response: any, account: any): void => {
                if (!account) {
                    let userid = request.user.id;
                    let passphrase: string = Cipher.FixedCrypt(userid, config.key2);

                    let new_account: any = new LocalAccount();
                    new_account.provider = "instagram";
                    new_account.userid = userid;
                    new_account.username = request.user.username;
                    new_account.passphrase = passphrase;
                    new_account.publickey = Cipher.PublicKey(passphrase);
                    new_account.local = definition.account_content;
                    new_account.registerDate = Date.now();              // Legacy of v1
                    new_account.save((error: any): void => {
                        if (!error) {
                            Auth.auth_event("auth:instagram", new_account);
                            response.redirect("/");
                        }
                    });
                } else {
                    Auth.auth_event("login:instagram", request.user.username);
                    response.redirect("/");
                }
            });
        }

        /**
         * ログイン（instagram)
         * @param request
         * @param response
         * @returns none
         */
        public auth_line_callback(request: any, response: any): void {
            Wrapper.FindOne(response, 1000, LocalAccount, {userid: request.user.username}, (response: any, account: any): void => {
                if (!account) {
                    let userid = request.user.id;
                    let passphrase: string = Cipher.FixedCrypt(userid, config.key2);

                    let new_account: any = new LocalAccount();
                    new_account.provider = "line";
                    new_account.userid = userid;
                    new_account.username = userid;
                    new_account.passphrase = passphrase;
                    new_account.publickey = Cipher.PublicKey(passphrase);
                    new_account.local = {mails: [], nickname: request.user.displayName, tokens: {}};
                    new_account.registerDate = Date.now();              // Legacy of v1
                    new_account.save((error: any): void => {
                        if (!error) {
                            Auth.auth_event("auth:line", new_account);
                            response.redirect("/");
                        }
                    });
                } else {
                    Auth.auth_event("login:line", request.user.username);
                    response.redirect("/");
                }
            });
        }

        /**
         * ログアウト
         * @param request
         * @param response
         * @returns none
         */
        public logout(request: any, response: any): void {
            Auth.auth_event("logout:", request.user);
            request.logout();
            Wrapper.SendSuccess(response, {code: 0, message: ""});
        }

        /**
         * サーバ時間
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        public get_server_date(request: any, response: any, next: any): void {
            Wrapper.SendSuccess(response, new Date());
        }
    }
}

module.exports = AuthModule;