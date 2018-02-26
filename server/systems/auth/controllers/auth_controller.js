/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AuthModule;
(function (AuthModule) {
    var _ = require('lodash');
    var fs = require('graceful-fs');
    var mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    var passport = require('passport');
    var crypto = require('crypto');
    var share = require('../../common/share');
    var config = share.config;
    var applications_config = share.applications_config;
    var message = config.message;
    var Wrapper = share.Wrapper;
    var logger = share.logger;
    var Cipher = share.Cipher;
    var event = share.Event;
    var MailerModule = require('../../common/mailer');
    var HtmlScannerModule = require("../../common/html_scanner/html_scanner");
    var ScannerBehaviorModule = require("../../common/html_scanner/scanner_behavior");
    var _mailer = null;
    var bcc = "";
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
            _mailer = new MailerModule.Mailer2(config.mailer.setting, config.mailer.account);
            bcc = "";
            break;
    }
    var LocalAccount = require(share.Models("systems/accounts/account"));
    var ResourceModel = require(share.Models("systems/resources/resource"));
    var definition = { account_content: { mails: [], nickname: "", tokens: {} } };
    fs.open(share.Models('applications/accounts/definition.json'), 'ax+', 384, function (error, fd) {
        if (!error) {
            fs.close(fd, function () {
                var addition = JSON.parse(fs.readFileSync(share.Models('applications/accounts/definition.json'), 'utf-8'));
                definition = _.merge(definition, addition.account_content);
            });
        }
    });
    var use_publickey = config.use_publickey;
    var Auth = /** @class */ (function () {
        function Auth() {
        }
        /*
                public create_init_user(initusers: any[]): void {
                    if (initusers) {
                        _.forEach(initusers, (user) => {
                            let type: string = user.type;
                            let auth: number = user.auth;
                            let username: string = user.username;
                            let userid: string = user.userid;
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

        */
        Auth.prototype.create_init_user = function (initusers) {
            if (initusers) {
                var promises_1 = [];
                _.forEach(initusers, function (user) {
                    promises_1.push(new Promise(function (resolve, reject) {
                        if (user) {
                            var type_1 = user.type;
                            var auth_1 = user.auth;
                            var username_1 = user.username;
                            var userid_1 = user.userid;
                            var passphrase_1 = Cipher.FixedCrypt(userid_1, config.key2);
                            var rootpassword_1 = user.password;
                            Wrapper.FindOne(null, 1000, LocalAccount, { username: username_1 }, function (response, account) {
                                if (!account) {
                                    var _promise = new Promise(function (_resolve, _reject) {
                                        var content = { "mails": [], "nickname": "", "group": "" }; // definition.account_content;
                                        content.mails.push(username_1);
                                        content.nickname = user.displayName;
                                        LocalAccount.register(new LocalAccount({
                                            userid: userid_1,
                                            username: username_1,
                                            type: type_1,
                                            auth: auth_1,
                                            passphrase: passphrase_1,
                                            publickey: Cipher.PublicKey(passphrase_1),
                                            local: content
                                        }), rootpassword_1, function (error) {
                                            if (!error) {
                                                _resolve({});
                                            }
                                            else {
                                                _reject(error);
                                            }
                                        });
                                    });
                                    _promise.then(function (results) {
                                        resolve({});
                                    }).catch(function (error) {
                                        reject(error);
                                    });
                                }
                            });
                        }
                        else {
                            reject({});
                        }
                    }));
                });
                promises_1.reduce(function (prev, current, index, array) {
                    return prev.then(current);
                }, Promise.resolve()).then(function () {
                }).catch(function (error) {
                });
            }
        };
        Auth.auth_event = function (type, param) {
            switch (type) {
                case "register:local":
                    event.emitter.emit("register", { type: type, user: param });
                    break;
                default:
                    event.emitter.emit("auth", { type: type, token: param });
            }
        };
        ;
        Auth._role = function (user) {
            var result = { guest: true, categoly: 0 };
            if (user) {
                switch (user.auth) {
                    case 1:
                        result.system = true;
                    case 100:
                    case 101:
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
        };
        Auth.prototype.role = function (user) {
            var result = { guest: true, categoly: 0 };
            if (user) {
                switch (user.auth) {
                    case 1:
                        result.system = true;
                    case 100:
                    case 101:
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
        };
        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        Auth.prototype.page_valid = function (request, response, next) {
            var user = request.user;
            if (user) {
                if (user.enabled) {
                    next();
                }
                else {
                    response.status(403).render('error', { status: 403, message: "Forbidden...", url: request.url });
                }
            }
            else {
                response.status(403).render('error', { status: 403, message: "Forbidden...", url: request.url });
            }
        };
        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        Auth.prototype.page_is_system = function (request, response, next) {
            var user = request.user;
            if (user) {
                if (Auth._role(user).system) {
                    next();
                }
                else {
                    response.status(403).render('error', { status: 403, message: "Forbidden...", url: request.url });
                }
            }
            else {
                response.status(403).render('error', { status: 403, message: "Forbidden...", url: request.url });
            }
        };
        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        Auth.prototype.is_system = function (request, response, next) {
            var user = request.user;
            if (user) {
                if (Auth._role(user).system) {
                    next();
                }
                else {
                    Wrapper.SendError(response, 403, "Forbidden.", { code: 403, message: "Forbidden." });
                }
            }
            else {
                Wrapper.SendError(response, 403, "Forbidden.", { code: 403, message: "Forbidden." });
            }
        };
        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        Auth.prototype.page_is_user = function (request, response, next) {
            var user = request.user;
            if (user) {
                if (Auth._role(user).user) {
                    next();
                }
                else {
                    response.status(403).render('error', { status: 403, message: "Forbidden...", url: request.url });
                }
            }
            else {
                response.status(403).render('error', { status: 403, message: "Forbidden...", url: request.url });
            }
        };
        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        Auth.prototype.is_user = function (request, response, next) {
            var user = request.user;
            if (user) {
                if (Auth._role(user).user) {
                    next();
                }
                else {
                    Wrapper.SendError(response, 403, "Forbidden.", { code: 403, message: "Forbidden." });
                }
            }
            else {
                Wrapper.SendError(response, 403, "Forbidden.", { code: 403, message: "Forbidden." });
            }
        };
        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        Auth.prototype.is_enabled_regist_user = function (request, response, next) {
            var user = request.user;
            if (user) {
                if (Auth._role(user).system) {
                    next();
                }
                else {
                    Wrapper.SendError(response, 403, "Forbidden.", { code: 403, message: "Forbidden." });
                }
            }
            else {
                if (config.regist.user) {
                    next();
                }
                else {
                    Wrapper.SendError(response, 403, "Forbidden.", { code: 403, message: "Forbidden." });
                }
            }
        };
        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        Auth.prototype.is_enabled_regist_member = function (request, response, next) {
            var user = request.user;
            if (user) {
                if (config.regist.member) {
                    next();
                }
                else {
                    Wrapper.SendError(response, 403, "Forbidden.", { code: 403, message: "Forbidden." });
                }
            }
        };
        /**
         * アカウント作成
         * @param request
         * @param response
         * @returns none
         */
        Auth.prototype.post_local_register = function (request, response) {
            var number = 15000;
            var username = request.body.username;
            var password = request.body.password;
            var systempassphrase = request.session.id;
            if (use_publickey) {
                username = Cipher.PublicKeyDecrypt(systempassphrase, username).plaintext;
                password = Cipher.PublicKeyDecrypt(systempassphrase, password).plaintext;
            }
            Wrapper.FindOne(response, 100, LocalAccount, { $and: [{ provider: "local" }, { username: username }] }, function (response, account) {
                if (!account) {
                    try {
                        var metadata = {};
                        if (request.body.metadata) {
                            metadata = request.body.metadata;
                        }
                        var tokenValue = {
                            username: username,
                            password: password,
                            displayName: request.body.displayName,
                            metadata: metadata,
                            auth: 100,
                            timestamp: Date.now()
                        };
                        var token = Cipher.FixedCrypt(JSON.stringify(tokenValue), config.tokensecret);
                        var link_1 = config.protocol + "://" + config.domain + "/auth/register/" + token;
                        var beacon_1 = config.protocol + "://" + config.domain + "/beacon/api/" + token;
                        ResourceModel.findOne({ $and: [{ userid: config.systems.userid }, { name: "regist_mail.html" }, { "type": 12 }] }).then(function (record) {
                            if (record) {
                                var datasource = new ScannerBehaviorModule.CustomBehavior("regist_mail.html", "regist_mail.html", config.systems.userid, "", null, true, {});
                                HtmlScannerModule.Builder.Resolve(record.content.resource, datasource, { "link": link_1, "beacon": beacon_1 }, function (error, doc) {
                                    if (!error) {
                                        _mailer.send(username, bcc, message.registconfirmtext, doc, function (error) {
                                            if (!error) {
                                                Wrapper.SendSuccess(response, { code: 0, message: "" });
                                            }
                                            else {
                                                Wrapper.SendError(response, error.code, error.message, error);
                                            }
                                        });
                                    }
                                });
                            }
                            else {
                                Wrapper.SendError(response, number + 200, "not found.", { code: number + 200, message: "not found." });
                            }
                        }).catch(function (error) {
                            Wrapper.SendFatal(response, error.code, error.message, error);
                        });
                    }
                    catch (e) {
                        Wrapper.SendFatal(response, e.code, e.message, e);
                    }
                }
                else {
                    Wrapper.SendWarn(response, number + 1, message.usernamealreadyregist, { code: number + 1, message: message.usernamealreadyregist });
                }
            });
        };
        /**
         * レジスタートークンでユーザ登録
         * @param request
         * @param response
         * @returns none
         */
        Auth.prototype.get_register_token = function (request, response) {
            Wrapper.Exception(request, response, function (request, response) {
                var token = Wrapper.Parse(Cipher.FixedDecrypt(request.params.token, config.tokensecret));
                var tokenDateTime = token.timestamp;
                var nowDate = Date.now();
                if ((tokenDateTime - nowDate) < (config.regist.expire * 60 * 1000)) {
                    LocalAccount.findOne({ username: token.username }, function (error, account_data) {
                        if (!error) {
                            if (!account_data) {
                                var shasum = crypto.createHash('sha1');
                                shasum.update(token.username);
                                var userid = shasum.digest('hex');
                                var passphrase = Cipher.FixedCrypt(userid, config.key2);
                                var content = definition.account_content;
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
                                }), token.password, function (error) {
                                    if (!error) {
                                        var user = request.body;
                                        user.username = token.username;
                                        user.password = token.password;
                                        passport.authenticate('local', function (error, user) {
                                            if (!error) {
                                                if (user) {
                                                    Auth.auth_event("register:local", user);
                                                    request.login(user, function (error) {
                                                        if (!error) {
                                                            Auth.auth_event("auth:local", request.params.token);
                                                            response.redirect("/");
                                                        }
                                                        else {
                                                            response.status(500).render('error', {
                                                                status: 500,
                                                                message: ""
                                                            });
                                                        }
                                                    });
                                                }
                                                else {
                                                    response.status(500).render('error', {
                                                        status: 500,
                                                        message: ""
                                                    });
                                                }
                                            }
                                            else {
                                                response.status(500).render('error', {
                                                    status: 500,
                                                    message: ""
                                                });
                                            }
                                        })(request, response);
                                    }
                                    else {
                                        response.status(500).render('error', {
                                            status: 500,
                                            message: "unknown error."
                                        });
                                    }
                                });
                            }
                            else {
                                response.redirect("/");
                            }
                        }
                        else {
                            response.status(500).render('error', { status: 500, message: "unknown error" });
                        }
                    });
                }
                else {
                    response.status(500).render('error', { status: 500, message: "timeout" });
                }
            });
        };
        /**
         * アカウント作成
         * @param request
         * @param response
         * @returns none
         */
        Auth.prototype.post_member_register = function (request, response) {
            var number = 15000;
            var username = request.body.username;
            var password = request.body.password;
            var systempassphrase = request.session.id;
            if (use_publickey) {
                username = Cipher.PublicKeyDecrypt(systempassphrase, username).plaintext;
                password = Cipher.PublicKeyDecrypt(systempassphrase, password).plaintext;
            }
            Wrapper.FindOne(response, 100, LocalAccount, { $and: [{ provider: "local" }, { username: username }] }, function (response, account) {
                if (!account) {
                    try {
                        var metadata = { userid: request.user.userid };
                        if (request.body.metadata) {
                            metadata = request.body.metadata;
                            metadata.userid = request.user.userid;
                        }
                        var tokenValue = {
                            username: username,
                            password: password,
                            displayName: request.body.displayName,
                            metadata: metadata,
                            auth: 101,
                            timestamp: Date.now()
                        };
                        var token = Cipher.FixedCrypt(JSON.stringify(tokenValue), config.tokensecret);
                        var link_2 = config.protocol + "://" + config.domain + "/auth/member/" + token;
                        var beacon_2 = config.protocol + "://" + config.domain + "/beacon/api/" + token;
                        ResourceModel.findOne({ $and: [{ userid: config.systems.userid }, { name: "regist_member_mail.html" }, { "type": 12 }] }).then(function (record) {
                            if (record) {
                                var datasource = new ScannerBehaviorModule.CustomBehavior("regist_member_mail.html", "regist_member_mail.html", config.systems.userid, "", null, true, {});
                                HtmlScannerModule.Builder.Resolve(record.content.resource, datasource, { "link": link_2, "beacon": beacon_2 }, function (error, doc) {
                                    if (!error) {
                                        _mailer.send(username, bcc, message.memberconfirmtext, doc, function (error) {
                                            if (!error) {
                                                Wrapper.SendSuccess(response, { code: 0, message: "" });
                                            }
                                            else {
                                                Wrapper.SendError(response, error.code, error.message, error);
                                            }
                                        });
                                    }
                                });
                            }
                            else {
                                Wrapper.SendError(response, number + 200, "not found.", { code: number + 200, message: "not found." });
                            }
                        }).catch(function (error) {
                            Wrapper.SendFatal(response, error.code, error.message, error);
                        });
                    }
                    catch (e) {
                        Wrapper.SendFatal(response, e.code, e.message, e);
                    }
                }
                else {
                    Wrapper.SendWarn(response, number + 1, message.usernamealreadyregist, { code: number + 1, message: message.usernamealreadyregist });
                }
            });
        };
        /**
         * レジスタートークンでユーザ登録
         * @param request
         * @param response
         * @returns none
         */
        Auth.prototype.get_member_token = function (request, response) {
            Wrapper.Exception(request, response, function (request, response) {
                var token = Wrapper.Parse(Cipher.FixedDecrypt(request.params.token, config.tokensecret));
                var tokenDateTime = token.timestamp;
                var nowDate = Date.now();
                if ((tokenDateTime - nowDate) < (config.regist.expire * 60 * 1000)) {
                    LocalAccount.findOne({ username: token.username }, function (error, account_data) {
                        if (!error) {
                            if (!account_data) {
                                var content = definition.account_content;
                                content.mails.push(token.username);
                                content.nickname = token.displayName;
                                var userid = "";
                                if (token.metadata.userid) {
                                    userid = token.metadata.userid;
                                }
                                else {
                                    var shasum = crypto.createHash('sha1');
                                    shasum.update(token.username);
                                    userid = shasum.digest('hex');
                                }
                                var passphrase = Cipher.FixedCrypt(userid, config.key2);
                                LocalAccount.register(new LocalAccount({
                                    userid: userid,
                                    username: token.username,
                                    passphrase: passphrase,
                                    publickey: Cipher.PublicKey(passphrase),
                                    auth: token.auth,
                                    local: content
                                }), token.password, function (error) {
                                    if (!error) {
                                        var user = request.body;
                                        user.username = token.username;
                                        user.password = token.password;
                                        passport.authenticate('local', function (error, user) {
                                            if (!error) {
                                                if (user) {
                                                    request.login(user, function (error) {
                                                        if (!error) {
                                                            Auth.auth_event("auth:member", request.params.token);
                                                            response.redirect("/");
                                                        }
                                                        else {
                                                            response.status(500).render('error', {
                                                                status: 500,
                                                                message: ""
                                                            });
                                                        }
                                                    });
                                                }
                                                else {
                                                    response.status(500).render('error', {
                                                        status: 500,
                                                        message: ""
                                                    });
                                                }
                                            }
                                            else {
                                                response.status(500).render('error', {
                                                    status: 500,
                                                    message: ""
                                                });
                                            }
                                        })(request, response);
                                    }
                                    else {
                                        response.status(500).render('error', {
                                            status: 500,
                                            message: "unknown error."
                                        });
                                    }
                                });
                            }
                            else {
                                response.redirect("/");
                            }
                        }
                        else {
                            response.status(500).render('error', { status: 500, message: "unknown error" });
                        }
                    });
                }
                else {
                    response.status(500).render('error', { status: 500, message: "timeout" });
                }
            });
        };
        /**
         * レジスタートークン発行
         * @param request
         * @param response
         * @returns none
         */
        Auth.prototype.post_local_username = function (request, response) {
            var number = 19000;
            var username = request.body.username;
            var password = request.body.password;
            var newusername = request.body.newusername;
            var systempassphrase = request.session.id;
            if (use_publickey) {
                username = Cipher.PublicKeyDecrypt(systempassphrase, username).plaintext;
                password = Cipher.PublicKeyDecrypt(systempassphrase, password).plaintext;
            }
            Wrapper.FindOne(response, number, LocalAccount, { $and: [{ provider: "local" }, { username: username }] }, function (response, account) {
                if (account) {
                    Wrapper.FindOne(response, number, LocalAccount, { $and: [{ provider: "local" }, { username: newusername }] }, function (response, account) {
                        if (!account) {
                            try {
                                var tokenValue = {
                                    username: username,
                                    password: password,
                                    newusername: newusername,
                                    timestamp: Date.now()
                                };
                                var token = Cipher.FixedCrypt(JSON.stringify(tokenValue), config.tokensecret);
                                var link_3 = config.protocol + "://" + config.domain + "/auth/username/" + token;
                                var beacon_3 = config.protocol + "://" + config.domain + "/beacon/api/" + token;
                                ResourceModel.findOne({ $and: [{ userid: config.systems.userid }, { name: "username_mail.html" }, { "type": 12 }] }).then(function (record) {
                                    if (record) {
                                        var datasource = new ScannerBehaviorModule.CustomBehavior("username_mail.html", "username_mail.html", config.systems.userid, "", null, true, {});
                                        HtmlScannerModule.Builder.Resolve(record.content.resource, datasource, { "link": link_3, "beacon": beacon_3 }, function (error, doc) {
                                            if (!error) {
                                                _mailer.send(username, bcc, message.usernameconfirmtext, doc, function (error) {
                                                    if (!error) {
                                                        Wrapper.SendSuccess(response, { code: 0, message: "" });
                                                    }
                                                    else {
                                                        Wrapper.SendError(response, error.code, error.message, error);
                                                    }
                                                });
                                            }
                                        });
                                    }
                                    else {
                                        Wrapper.SendError(response, number + 200, "not found.", { code: number + 200, message: "not found." });
                                    }
                                }).catch(function (error) {
                                    Wrapper.SendFatal(response, error.code, error.message, error);
                                });
                            }
                            catch (e) {
                                Wrapper.SendFatal(response, e.code, e.message, e);
                            }
                        }
                        else {
                            Wrapper.SendWarn(response, number + 2, message.usernamealreadyregist, { code: number + 2, message: message.usernamealreadyregist });
                        }
                    });
                }
                else {
                    Wrapper.SendWarn(response, number + 3, message.usernamenotfound, { code: number + 3, message: message.usernamenotfound });
                }
            });
        };
        /**
         * ユーザ名トークンでユーザ名変更（多分使用しない)
         * @param request
         * @param response
         * @returns none
         */
        Auth.prototype.get_username_token = function (request, response) {
            Wrapper.Exception(request, response, function (request, response) {
                var token = Wrapper.Parse(Cipher.FixedDecrypt(request.params.token, config.tokensecret));
                var tokenDateTime = token.timestamp;
                var nowDate = Date.now();
                if ((tokenDateTime - nowDate) < (config.regist.expire * 60 * 1000)) {
                    LocalAccount.findOne({ username: token.username }, function (error, account) {
                        if (!error) {
                            if (account) {
                                var number = 83000;
                                account.username = token.newusername;
                                if (!error) {
                                    Wrapper.Save(response, number, account, function () {
                                        response.redirect("/");
                                    });
                                }
                                else {
                                    response.status(400).render("error", { message: "unknown error", status: 400 }); // already
                                }
                            }
                            else {
                                response.status(400).render("error", { message: "already", status: 400 }); // already
                            }
                        }
                        else {
                            response.status(500).render("error", { message: "unknown error", status: 500 }); // timeout
                        }
                    });
                }
                else {
                    response.status(400).render("error", { message: "timeout", status: 400 }); // timeout
                }
            });
        };
        /**
         * パスワードトークン発行
         * @param request
         * @param response
         * @returns none
         */
        Auth.prototype.post_local_password = function (request, response) {
            var number = 21000;
            var username = request.body.username;
            var password = request.body.password;
            var systempassphrase = request.session.id;
            if (use_publickey) {
                username = Cipher.PublicKeyDecrypt(systempassphrase, username).plaintext;
                password = Cipher.PublicKeyDecrypt(systempassphrase, password).plaintext;
            }
            Wrapper.FindOne(response, number, LocalAccount, { $and: [{ provider: "local" }, { username: username }] }, function (response, account) {
                if (account) {
                    try {
                        var tokenValue = {
                            username: username,
                            password: password,
                            timestamp: Date.now()
                        };
                        var token = Cipher.FixedCrypt(JSON.stringify(tokenValue), config.tokensecret);
                        var link_4 = config.protocol + "://" + config.domain + "/auth/password/" + token;
                        var beacon_4 = config.protocol + "://" + config.domain + "/beacon/api/" + token;
                        ResourceModel.findOne({ $and: [{ userid: config.systems.userid }, { name: "password_mail.html" }, { "type": 12 }] }).then(function (record) {
                            if (record) {
                                var datasource = new ScannerBehaviorModule.CustomBehavior("password_mail.html", "password_mail.html", config.systems.userid, "", null, true, {});
                                HtmlScannerModule.Builder.Resolve(record.content.resource, datasource, { "link": link_4, "beacon": beacon_4 }, function (error, doc) {
                                    if (!error) {
                                        _mailer.send(username, bcc, message.passwordconfirmtext, doc, function (error) {
                                            if (!error) {
                                                Wrapper.SendSuccess(response, { code: 0, message: "" });
                                            }
                                            else {
                                                Wrapper.SendError(response, error.code, error.message, error);
                                            }
                                        });
                                    }
                                });
                            }
                            else {
                                Wrapper.SendError(response, number + 200, "not found.", { code: number + 200, message: "not found." });
                            }
                        }).catch(function (error) {
                            Wrapper.SendFatal(response, error.code, error.message, error);
                        });
                    }
                    catch (e) {
                        Wrapper.SendFatal(response, e.code, e.message, e);
                    }
                }
                else {
                    Wrapper.SendWarn(response, number + 1, message.usernamenotfound, { code: number + 1, message: message.usernamenotfound });
                }
            });
        };
        /**
         * パスワードトークンからパスワード変更
         * @param request
         * @param response
         * @returns none
         */
        Auth.prototype.get_password_token = function (request, response) {
            var number = 22000;
            Wrapper.Exception(request, response, function (request, response) {
                var token = Wrapper.Parse(Cipher.FixedDecrypt(request.params.token, config.tokensecret));
                var tokenDateTime = token.timestamp;
                var nowDate = Date.now();
                if ((tokenDateTime - nowDate) < (config.regist.expire * 60 * 1000)) {
                    LocalAccount.findOne({ username: token.username }, function (error, account) {
                        if (!error) {
                            if (account) {
                                account.setPassword(token.password, function (error) {
                                    if (!error) {
                                        Wrapper.Save(response, number, account, function () {
                                            response.redirect("/");
                                        });
                                    }
                                    else {
                                        response.status(400).render("error", { message: "unknown", status: 400 }); // already
                                    }
                                });
                            }
                            else {
                                response.status(400).render("error", { message: "already", status: 400 }); // already
                            }
                        }
                        else {
                            response.status(500).render("error", { message: "unknown error", status: 500 }); // timeout
                        }
                    });
                }
                else {
                    response.status(400).render("error", { message: "timeout", status: 400 }); // timeout
                }
            });
        };
        /**
         * ログイン
         * @param request
         * @param response
         * @returns none
         */
        Auth.prototype.post_local_login = function (request, response) {
            var number = 23000;
            var systempassphrase = request.session.id;
            if (request.body.username) {
                if (request.body.password) {
                    if (use_publickey) {
                        request.body.username = Cipher.PublicKeyDecrypt(systempassphrase, request.body.username).plaintext;
                        request.body.password = Cipher.PublicKeyDecrypt(systempassphrase, request.body.password).plaintext;
                    }
                    passport.authenticate("local", function (error, user) {
                        if (!error) {
                            if (user) {
                                Wrapper.Guard(request, response, function (request, response) {
                                    request.login(user, function (error) {
                                        if (!error) {
                                            Auth.auth_event("login:local", request.body.username);
                                            Wrapper.SendSuccess(response, {});
                                        }
                                        else {
                                            Wrapper.SendError(response, error.code, error.message, error);
                                        }
                                    });
                                });
                            }
                            else {
                                Wrapper.SendError(response, number + 2, message.wrongusername, { code: number + 2, message: message.wrongusername });
                            }
                        }
                        else {
                            Wrapper.SendError(response, error.code, error.message, error);
                        }
                    })(request, response);
                }
                else {
                    Wrapper.SendError(response, number + 4, "", { code: number + 4, message: "" });
                }
            }
            else {
                Wrapper.SendError(response, number + 5, "", { code: number + 5, message: "" });
            }
        };
        /**
         * ログイン（facebook)
         * @param request
         * @param response
         * @returns none
         */
        Auth.prototype.auth_facebook_callback = function (request, response) {
            Wrapper.FindOne(response, 1000, LocalAccount, { userid: request.user.username }, function (response, account) {
                if (!account) {
                    var userid = request.user.id; //facebook
                    var passphrase = Cipher.FixedCrypt(userid, config.key2);
                    var new_account_1 = new LocalAccount();
                    new_account_1.provider = "facebook";
                    new_account_1.userid = userid;
                    new_account_1.username = request.user.username;
                    new_account_1.passphrase = passphrase;
                    new_account_1.publickey = Cipher.PublicKey(passphrase);
                    new_account_1.local = { mails: [], nickname: request.user.displayName, tokens: {} };
                    //new_account.local = definition.account_content;
                    new_account_1.registerDate = Date.now();
                    new_account_1.save(function (error) {
                        if (!error) {
                            Auth.auth_event("auth:facebook", new_account_1);
                            response.redirect("/");
                        }
                    });
                }
                else {
                    Auth.auth_event("login:facebook", request.user.username);
                    response.redirect("/");
                }
            });
        };
        /**
         * ログイン（twitter)
         * @param request
         * @param response
         * @returns none
         */
        Auth.prototype.auth_twitter_callback = function (request, response) {
            Wrapper.FindOne(response, 1000, LocalAccount, { userid: request.user.username }, function (response, account) {
                if (!account) {
                    var userid = request.user.id; //twitter
                    var passphrase = Cipher.FixedCrypt(userid, config.key2);
                    var new_account_2 = new LocalAccount();
                    new_account_2.provider = "twitter";
                    new_account_2.userid = userid;
                    new_account_2.username = request.user.username;
                    new_account_2.passphrase = passphrase;
                    new_account_2.publickey = Cipher.PublicKey(passphrase);
                    new_account_2.local = definition.account_content;
                    new_account_2.registerDate = Date.now(); // Legacy of v1
                    new_account_2.save(function (error) {
                        if (!error) {
                            Auth.auth_event("auth:twitter", new_account_2);
                            response.redirect("/");
                        }
                    });
                }
                else {
                    Auth.auth_event("login:twitter", request.user.username);
                    response.redirect("/");
                }
            });
        };
        /**
         * ログイン（instagram)
         * @param request
         * @param response
         * @returns none
         */
        Auth.prototype.auth_instagram_callback = function (request, response) {
            Wrapper.FindOne(response, 1000, LocalAccount, { userid: request.user.username }, function (response, account) {
                if (!account) {
                    var userid = request.user.id;
                    var passphrase = Cipher.FixedCrypt(userid, config.key2);
                    var new_account_3 = new LocalAccount();
                    new_account_3.provider = "instagram";
                    new_account_3.userid = userid;
                    new_account_3.username = request.user.username;
                    new_account_3.passphrase = passphrase;
                    new_account_3.publickey = Cipher.PublicKey(passphrase);
                    new_account_3.local = definition.account_content;
                    new_account_3.registerDate = Date.now(); // Legacy of v1
                    new_account_3.save(function (error) {
                        if (!error) {
                            Auth.auth_event("auth:instagram", new_account_3);
                            response.redirect("/");
                        }
                    });
                }
                else {
                    Auth.auth_event("login:instagram", request.user.username);
                    response.redirect("/");
                }
            });
        };
        /**
         * ログイン（instagram)
         * @param request
         * @param response
         * @returns none
         */
        Auth.prototype.auth_line_callback = function (request, response) {
            Wrapper.FindOne(response, 1000, LocalAccount, { userid: request.user.username }, function (response, account) {
                if (!account) {
                    var userid = request.user.id;
                    var passphrase = Cipher.FixedCrypt(userid, config.key2);
                    var new_account_4 = new LocalAccount();
                    new_account_4.provider = "line";
                    new_account_4.userid = userid;
                    new_account_4.username = userid;
                    new_account_4.passphrase = passphrase;
                    new_account_4.publickey = Cipher.PublicKey(passphrase);
                    new_account_4.local = { mails: [], nickname: request.user.displayName, tokens: {} };
                    new_account_4.registerDate = Date.now(); // Legacy of v1
                    new_account_4.save(function (error) {
                        if (!error) {
                            Auth.auth_event("auth:line", new_account_4);
                            response.redirect("/");
                        }
                    });
                }
                else {
                    Auth.auth_event("login:line", request.user.username);
                    response.redirect("/");
                }
            });
        };
        /**
         * ログアウト
         * @param request
         * @param response
         * @returns none
         */
        Auth.prototype.logout = function (request, response) {
            Auth.auth_event("logout:", request.user);
            request.logout();
            Wrapper.SendSuccess(response, { code: 0, message: "" });
        };
        /**
         * サーバ時間
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        Auth.prototype.get_server_date = function (request, response, next) {
            Wrapper.SendSuccess(response, new Date());
        };
        return Auth;
    }());
    AuthModule.Auth = Auth;
})(AuthModule = exports.AuthModule || (exports.AuthModule = {}));
module.exports = AuthModule;
//# sourceMappingURL=auth_controller.js.map