/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace FrontModule {

    const _: _.LoDashStatic = require('lodash');
    const fs: any = require('graceful-fs');

    const path: any = require('path');

    const mongodb: any = require('mongodb');
    const mongoose: any = require('mongoose');
    mongoose.Promise = require('q').Promise;

    const archiver: any = require('archiver');

    const core: any = require(process.cwd() + '/core');
    const share: any = core.share;
    const config: any = share.config;
    const applications_config: any = share.applications_config;
    const Wrapper: any = share.Wrapper;
    const logger: any = share.logger;

//    const ResourcesModule = require(share.Server("systems/resources/controllers/resource_controller"));
//    const resource = new ResourcesModule.Resource;

    const HtmlEditModule: any = require(share.Server("systems/common/html_edit/html_edit"));
    const ResourceModel: any = require(share.Models("systems/resources/resource"));
    const ArticleModel: any = require(share.Models("services/articles/article"));
    const AssetModel: any = require(share.Models("plugins/asset/asset"));
    const validator: any = require('validator');
    const url: any = require('url');

    export class Pages {

        static connect(user): any {
            let result = null;
            if (user) {
                result = mongoose.createConnection("mongodb://" + config.db.user + ":" + config.db.password + "@" + config.db.address + "/" + config.db.name);
            } else {
                result = mongoose.createConnection("mongodb://" + config.db.address + "/" + config.db.name);
            }
            return result;
        }

        static userid(request): string {
            return request.user.userid;
        }

        /**
         * @param userid
         * @param name
         * @param record
         * @param records
         * @param callback
         * @returns none
         */
        public render(userid: string, name: string, record: any, records: any[], query: any, order: any, callback: (error: any, result: any) => void): void {
            ResourceModel.findOne({$and: [{name: name}, {userid: userid}]}).then((doc: any): void => {
                if (doc) {
                    let content = doc.content;

                    switch (content.type) {
                        case "text/html":
                            let scanner = new HtmlEditModule.Scanner(userid, order);
                            scanner.ScanHtml(content.resource, record, records, 0, (error: any, resource: any): void => {
                                if (!error) {
                                    content.resource = resource;
                                    callback(null, content);
                                } else {
                                    callback(error, null);
                                }
                            });
                            break;
                        case "text/css":
                        case "text/javascript":
                            callback(null, content);
                            break;
                        default:
                            callback(null, content);
                            break;
                    }

                } else {
                    callback({code: 10000, message: ""}, null);
                }
            }).catch((error: any): void => {
                callback(error, null);
            });
        }

        /**
         * @param userid
         * @param name
         * @param record
         * @param records
         * @param callback
         * @returns none
         */
        public no_render(userid: string, name: string, callback: (error: any, result: any) => void): void {
            ResourceModel.findOne({$and: [{name: name}, {userid: userid}]}).then((doc: any): void => {
                if (doc) {
                    let content = doc.content;
                    callback(null, content);
                } else {
                    callback({code: 10000, message: ""}, null);
                }
            }).catch((error: any): void => {
                callback(error, null);
            });
        }

        /**
         * @param userid
         * @param page_name
         * @param article_name
         * @param query
         * @param callback
         * @returns none
         */
        public render_pages(userid: string, page_name: string, article_name: string, query_field: any, callback: (error: any, result: string) => void): void {
            let query = {};
            if (query_field.q) {
                try {
                    let native_query = JSON.parse(query_field.q);
                    Object.keys(native_query).forEach((key) => {
                        query["content." + key + ".value"] = native_query[key];
                    });
                } catch (e) {
                }
            }

            let order = {skip: 0};
            if (query_field.o) {
                try {
                    order = JSON.parse(query_field.o);
                } catch (e) {
                }
            }

            let sort = {};
            if (query_field.s) {
                try {
                    sort = {sort: JSON.parse(query_field.s)};
                } catch (e) {
                }
            }

            if (article_name) {
                ArticleModel.find({$and: [query, {userid: userid}, {open: true}, {type: 0}]}, {}, sort).then((docs: any): void => {
                    ArticleModel.findOne({$and: [{name: article_name}, {userid: userid}, {open: true}, {type: 0}]}).then((doc: any): void => {
                        this.render(userid, page_name, doc, docs, query, order, callback);
                    }).catch((error: any): void => {
                        callback(error, null);
                    });
                }).catch((error: any): void => {
                    callback(error, null);
                });
            } else {
                ArticleModel.find({$and: [query, {userid: userid}, {open: true}, {type: 0}]}, {}, sort).then((docs: any): void => {
                    this.render(userid, page_name, null, docs, query, order, callback);
                }).catch((error: any): void => {
                    callback(error, null);
                });
            }

        }

        /**
         *  let userid = Pages.userid(request);
         *  request.sessionID;
         *  let tmp_path = '/tmp/' + sessionid;
         * @param userid
         * @param tmp_path
         * @param callback
         * @returns none
         */
        static get_file_all(userid: string, tmp_path: string, callback: (error) => void): void {

            let number: number = 27000;
            let conn = Pages.connect(config.db.user);

            if (conn) {
                conn.once('open', (error: any): void => {
                    if (!error) {
                        let uri = "mongodb://" + config.db.user + ":" + config.db.password + "@" + config.db.address + "/" + config.db.name;
                        mongodb.MongoClient.connect(uri, (error, db): void => {
                            if (!error) {
                                let bucket = new mongodb.GridFSBucket(db, {});
                                conn.db.collection('fs.files', (error: any, collection: any): void => {
                                    if (!error) {
                                        if (collection) {
                                            collection.find({"metadata.userid": userid}).toArray((error: any, docs: any): void => {
                                                if (!error) {
                                                    let promises = [];
                                                    let save = (doc: any): any => {
                                                        return new Promise((resolve: any, reject: any): void => {
                                                            if (doc) {
                                                                bucket.openDownloadStreamByName(doc.filename)
                                                                    .pipe(fs.createWriteStream(path.join(tmp_path, doc.filename)))
                                                                    .on('error', (error): void => {
                                                                        reject(error);
                                                                    })
                                                                    .on('finish', (): void => {
                                                                        resolve({});
                                                                    });
                                                            }
                                                        });
                                                    };

                                                    Promise.all(docs.map((doc: any): void => {
                                                        return save(doc);
                                                    })).then((results: any[]): void => {
                                                        callback(null);
                                                        conn.db.close();
                                                    }).catch((error: any): void => {
                                                        callback(error);
                                                        conn.db.close();
                                                    });

                                                } else {
                                                    callback({code: number + 100, message: error.message});
                                                    conn.db.close();
                                                }
                                            });
                                        } else {
                                            callback({code: number + 20, message: "gfs error"});
                                            conn.db.close();
                                        }
                                    } else {
                                        callback({code: number + 100, message: error.message});
                                        conn.db.close();
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }

        /**
         *  let userid = Pages.userid(request);
         * @param userid
         * @param tmp_path
         * @param callback
         * @returns none
         */
        static get_article_all(userid: string, tmp_path: string, callback: (error) => void): void {
            ArticleModel.find({userid: userid}, {}, {}).then((docs: any): void => {
                fs.writeFile(tmp_path, JSON.stringify(docs), (error) => {
                    callback(error);
                });
            }).catch((error: any): void => {
                callback(error);
            });
        }

        /**
         *  let userid = Pages.userid(request);
         * @param userid
         * @param tmp_path
         * @param callback
         * @returns none
         */
        static get_resource_all(userid: string, tmp_path: string, callback: (error) => void): void {
            ResourceModel.find({userid: userid}, {}, {}).then((docs: any): void => {
                fs.writeFile(tmp_path, JSON.stringify(docs), (error) => {
                    callback(error);
                });
            }).catch((error: any): void => {
                callback(error);
            });
        }

        /**
         *  let userid = Pages.userid(request);
         * @param work
         * @param target
         * @param callback
         * @returns none
         */
        static zip(work: string, target: string, callback: (error) => void) {
            let zip_file_name = work + "/" + target + ".zip";
            let archive = archiver.create('zip', {});
            let output = fs.createWriteStream(zip_file_name);

            let carrent = process.cwd();

            output.on("close", () => {
                process.chdir(carrent);
                callback(null);
            });

            archive.on('error', (error) => {
                process.chdir(carrent);
                callback(error);
            });

            process.chdir(work);
            archive.pipe(output);
            archive.glob("data/*");
            archive.finalize();
        }

        /**
         *  let userid = Pages.userid(request);
         * @param request
         * @param response
         * @returns none
         */
        public get_all(request: any, response: any): void {
            let userid = Pages.userid(request);
            let tmp_path = path.join("/tmp", request.sessionID);
            fs.mkdir(tmp_path, (error): void => {
                if (!error) {
                    fs.mkdir(path.join(tmp_path, "data"), (error): void => {
                        if (!error) {
                            Pages.get_file_all(userid, path.join(tmp_path, "data"), (error: any): void => {
                                if (!error) {
                                    Pages.get_article_all(userid, path.join(tmp_path, "data/articles.txt"), (error: any): void => {
                                        if (!error) {
                                            Pages.get_resource_all(userid, path.join(tmp_path, "data/resources.txt"), (error: any): void => {
                                                if (!error) {
                                                    Pages.zip(tmp_path, "data", (error: any): void => {
                                                        if (!error) {
                                                            response.download(path.join(tmp_path, "data.zip"), (error: any): void => {
                                                                if (!error) {
                                                                    let exec = require('child_process').exec;
                                                                    exec('rm -r ' + tmp_path, (error, stdout, stderr) => {

                                                                    });
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }

        /**
         *  let userid = Pages.userid(request);
         * @param request
         * @param response
         * @returns none
         */
        public create_init_user_resources(user: any): void {

            ResourceModel.find({$and: [{userid: config.systems.userid}, {$and: [{type: {$gte: 20}}, {type: {$lt: 30}}]}]}, {}, {}).then((docs: any): void => {
                _.forEach(docs, (doc) => {
                    let name: string = doc.name;
                    let userid = user.userid;
                    let type: string = doc.type;
                    let content: any = doc.content;
                    ResourceModel.findOne({$and: [{userid: userid}, {type: type}, {name: name}]}).then((found: any): void => {
                        if (!found) {
                            let page: any = new ResourceModel();
                            page.userid = userid;
                            page.name = name;
                            page.type = type;
                            page.content = content;
                            page.open = true;
                            page.save().then(() => {

                            }).catch((): void => {

                            });
                        }
                    });
                });
            })

        }
    }

    const MailerModule: any = require('../../../systems/common/mailer');

    export class Asset {

        constructor() {

        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public create(request: any, response: any): void {
            let article: any = new AssetModel();
            article.userid = config.systems.userid;  // Article.userid(request);
            let objectid: any = new mongoose.Types.ObjectId;
            article.name = objectid.toString();
            article.type = 10002;
            article.content = request.body.content;
            article.open = true;
            Wrapper.Save(response, 1000, article, (response: any, object: any): void => {
                Wrapper.SendSuccess(response, object);
            });
        }
    }

    export class Mailer {

        constructor() {

        }

        /**
         *
         * @param request
         * @param response
         * @param next
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
                let userid = separated_path[2];
                if (userid) {
                    if (request.body.content) {
                        if (request.body.content.thanks) {
                            if (request.body.content.report) {
                                let thanks_to = request.body.content.thanks;
                                let report_to = request.body.content.report;

                                let content = {};
                                Object.keys(request.body.content).forEach((key) => {
                                    content[key] = {"value": request.body.content[key], "type": "quoted"};
                                });
                                ResourceModel.findOne({$and: [{userid: userid}, {name: inquiry_mail}, {"type": mail_type}]}).then((record: any): void => {
                                    if (record) {
                                        let scanner = new HtmlEditModule.Scanner("", {});
                                        scanner.ScanHtml(record.content.resource, {
                                            create: "",
                                            modify: "",
                                            content: content
                                        }, [], 0, (error: any, doc: any) => {
                                            if (!error) {
                                                mailer.send(report_to, report_title, doc, (error: any) => {
                                                    if (!error) {
                                                        ResourceModel.findOne({$and: [{userid: userid}, {name: thanks_mail}, {"type": mail_type}]}).then((record: any): void => {
                                                            if (record) {
                                                                let scanner = new HtmlEditModule.Scanner("", {});
                                                                scanner.ScanHtml(record.content.resource, {
                                                                    create: "",
                                                                    modify: "",
                                                                    content: content
                                                                }, [], 0, (error: any, doc: any) => {
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
                                            } else {
                                                Wrapper.SendError(response, 200, error.message, error);
                                            }
                                        }).catch((error: any): void => {
                                            Wrapper.SendFatal(response, 100, error.message, error);
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

    const LocalAccount: any = require(share.Models("systems/accounts/account"));

    export class Members {

        static userid(request: any): string {
            return request.user.userid;
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_member(request: any, response: any): void {
            let userid = Members.userid(request);
            let query: any = {username: request.params.username};
            let query2 = {$and: [query, {userid: userid}]};

            Wrapper.FindOne(response, 1000, LocalAccount, query2, (response: any, account: any): void => {
                if (account) {
                    Wrapper.SendSuccess(response, account.local);
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
        public put_member(request: any, response: any): void {
            let userid = Members.userid(request);
            let query: any = {username: request.params.username};
            let query2 = {$and: [query, {userid: userid}]};

            Wrapper.FindOne(response, 1100, LocalAccount, query2, (response: any, account: any): void => {
                if (account) {
                    account.local = request.body.local;
                    account.open = true;
                    Wrapper.Save(response, 1200, account, (response: any, object: any): void => {
                        Wrapper.SendSuccess(response, object.local);
                    });
                } else {
                    Wrapper.SendWarn(response, 2, "not found", {});
                }
            });
        }

        /**
         * アカウント検索
         * @param request
         * @param response
         * @returns none
         */
        public get_member_query_query(request: any, response: any): void {
            let userid = Members.userid(request);
            let query: any = JSON.parse(decodeURIComponent(request.params.query));
            let option: any = JSON.parse(decodeURIComponent(request.params.option));
            let query2 = {$and: [query, {userid: userid}]};

            Wrapper.Find(response, 5000, LocalAccount, query2, {}, option, (response: any, accounts: any): any => {
                Wrapper.SendSuccess(response, accounts);
            });

        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_member_count(request: any, response: any): void {
            let userid = Members.userid(request);
            let query: any = JSON.parse(decodeURIComponent(request.params.query));
            let query2 = {$and: [query, {userid: userid}]};

            Wrapper.Count(response, 2800, LocalAccount, query2, (response: any, count: any): any => {
                Wrapper.SendSuccess(response, count);
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public delete_own(request: any, response: any): void {
            let userid = Members.userid(request);
            let query: any = {userid: userid};

            Wrapper.FindOne(response, 5100, LocalAccount, query, (response: any, page: any): void => {
                if (page) {
                    Wrapper.Remove(response, 5100, page, (response: any): void => {
                        Wrapper.SendSuccess(response, {});
                    });
                } else {
                    Wrapper.SendWarn(response, 2, "not found", {});
                }
            });
        }

    }

}

module.exports = FrontModule;
