/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace FrontModule {

    const _ = require('lodash');
    const fs: any = require('graceful-fs');

    const Grid = require('gridfs-stream');

    const path: any = require('path');

    const mongodb: any = require('mongodb');
    const mongoose: any = require('mongoose');
    mongoose.Promise = global.Promise;

    const archiver: any = require('archiver');

    const sharp = require("sharp");

    const core: any = require(process.cwd() + '/gs');
    const share: any = core.share;
    const config: any = share.config;
    const applications_config: any = share.applications_config;
    const Wrapper: any = share.Wrapper;

    const HtmlScannerModule: any = require(share.Server("systems/common/html_scanner/html_scanner"));
    const ScannerBehaviorModule: any = require(share.Server("systems/common/html_scanner/scanner_behavior"));
    const ResourceModel: any = require(share.Models("systems/resources/resource"));
    const LocalAccount: any = require(share.Models("systems/accounts/account"));
    const ArticleModel: any = require(share.Models("services/articles/article"));
    const AssetModel: any = require(share.Models("plugins/asset/asset"));
    const validator: any = require('validator');
    const url: any = require('url');

    // type 20   page
    // type 21   stamp
    // type 30   template(system only)

    export class Pages {

        static connect(user): any {
            let result = null;
            const options = {useMongoClient: true, keepAlive: 300000, connectTimeoutMS: 1000000};
            if (user) {
                result = mongoose.createConnection("mongodb://" + config.db.user + ":" + config.db.password + "@" + config.db.address + "/" + config.db.name,options);
            } else {
                result = mongoose.createConnection("mongodb://" + config.db.address + "/" + config.db.name,options);
            }
            return result;
        }

        static userid(request): string {
            return request.user.userid;
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
                        let bucket = new mongodb.GridFSBucket(conn.db, {});
                        conn.db.collection('fs.files', (error: any, collection: any): void => {
                            if (!error) {
                                if (collection) {
                                    collection.find({"metadata.userid": userid}).toArray((error: any, docs: any): void => {
                                        if (!error) {
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
                                            callback({code: error.code, message: error.message});
                                            conn.db.close();
                                        }
                                    });
                                } else {
                                    callback({code: number + 20, message: "gfs error"});
                                    conn.db.close();
                                }
                            } else {
                                callback({code: error.code, message: error.message});
                                conn.db.close();
                            }
                        });
                    } else {
                        callback({code: error.code, message: error.message});
                    }
                });
            } else {
                callback({code: number + 40, message: "db error"});
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
                                                                        //        Wrapper.SendSuccess(response, {code: 0, message: ""});
                                                                    });
                                                                } else {
                                                                    Wrapper.SendError(response, error.code, error.message, error);
                                                                }
                                                            });
                                                        } else {
                                                            Wrapper.SendError(response, error.code, error.message, error);
                                                        }
                                                    });
                                                } else {
                                                    Wrapper.SendError(response, error.code, error.message, error);
                                                }
                                            });
                                        } else {
                                            Wrapper.SendError(response, error.code, error.message, error);
                                        }
                                    });
                                } else {
                                    Wrapper.SendError(response, error.code, error.message, error);
                                }
                            });
                        } else {
                            Wrapper.SendError(response, error.code, error.message, error);
                        }
                    });
                } else {
                    Wrapper.SendError(response, error.code, error.message, error);
                }
            });
        }

        public put_all(request: any, response: any): void {


        }

        /**
         * ユーザ登録時に作成されるデフォルトリソース。
         * ユーザ登録時、システムのリソースをコピー。
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

                            }).catch((e): void => {

                            });
                        }
                    });
                });
            })

        }

        /**
         * ユーザ登録時に作成されるデフォルトアーティクル。
         * ユーザ登録時、システムのアーティクルをコピー。
         *  let userid = Pages.userid(request);
         * @param request
         * @param response
         * @returns none
         */
        public create_init_user_articles(user: any): void {

            ArticleModel.find({userid: config.systems.userid}, {}, {}).then((docs: any): void => {
                _.forEach(docs, (doc) => {
                    let name: string = doc.name;
                    let userid = user.userid;
                    let type: string = doc.type;
                    let content: any = doc.content;
                    ArticleModel.findOne({$and: [{userid: userid}, {type: type}, {name: name}]}).then((found: any): void => {
                        if (!found) {
                            let page: any = new ArticleModel();
                            page.userid = userid;
                            page.name = name;
                            page.type = type;
                            page.content = content;
                            page.open = true;
                            page.save().then(() => {
                                let a = 1;
                            }).catch((e): void => {
                                let error = e;
                            });
                        }
                    });
                });
            })

        }

        /**
         * @param userid
         * @param name
         * @param record
         * @param records
         * @param callback
         * @returns none
         */
        public build(request: any, response: any): void {
            let userid = Pages.userid(request);
            let name = request.params.name;

            let sites = {
                "paper": {
                    "resources": [
                        {type: "resource", original: "paper-index.html", target: "index.html"},
                        {type: "resource", original: "paper-contact.html", target: "contact.html"},
                        {type: "resource", original: "paper-about.html", target: "about.html"},
                        {type: "resource", original: "paper-blog.html", target: "blog.html"},
                        {type: "resource", original: "paper-main.js", target: "main.js"},
                        {type: "resource", original: "paper-style.css", target: "style.css"}
                    ]
                },
                "shape": {
                    "resources": [
                        {type: "resource", original: "shape-index.html", target: "index.html"},
                        {type: "resource", original: "shape-work.html", target: "work.html"},
                        {type: "resource", original: "shape-services.html", target: "services.html"},
                        {type: "resource", original: "shape-contact.html", target: "contact.html"},
                        {type: "resource", original: "shape-blog.html", target: "blog.html"},
                        {type: "resource", original: "shape-about.html", target: "about.html"},
                        {type: "resource", original: "shape-main.js", target: "main.js"},
                        {
                            type: "resource",
                            original: "shape-magnific-popup-options.js",
                            target: "magnific-popup-options.js"
                        },
                        {type: "resource", original: "shape-style.css", target: "style.css"}
                    ]
                }

            };

            let site = sites[name];

            let resources = site.resources;
            let copy = (resourcename: any): any => {

                let copy_resource = (resolve: any, reject: any): void => {
                    ResourceModel.findOne({$and: [{userid: config.systems.userid}, {name: resourcename.original}, {type: 30}]}, {}, {}).then((doc: any): void => {
                        if (doc) {
                            let name: string = resourcename.target;
                            let content: any = doc.content;
                            ResourceModel.findOne({$and: [{userid: userid}, {type: 20}, {name: name}]}).then((found: any): void => {
                                if (!found) {
                                    let page: any = new ResourceModel();
                                    page.userid = userid;
                                    page.name = name;
                                    page.type = 20;
                                    page.content = content;
                                    page.open = true;
                                    page.save().then((): void => {
                                        resolve({});
                                    }).catch((error): void => {
                                        reject(error);
                                    });
                                } else {
                                    found.remove().then(() => {
                                        let page: any = new ResourceModel();
                                        page.userid = userid;
                                        page.name = name;
                                        page.type = 20;
                                        page.content = content;
                                        page.open = true;
                                        page.save().then(() => {
                                            resolve({});
                                        }).catch((error): void => {
                                            reject(error);
                                        });
                                    }).catch((error: any): void => {
                                        reject(error);
                                    });
                                }

                            });
                        } else {
                            resolve({});
                        }
                    })
                };

                let copy_article = (resolve: any, reject: any): void => {
                    ArticleModel.findOne({$and: [{userid: config.systems.userid}, {name: resourcename.original}]}, {}, {}).then((doc: any): void => {
                        if (doc) {
                            let name: string = resourcename.target;
                            let content: any = doc.content;
                            ArticleModel.findOne({$and: [{userid: userid}, {name: name}]}).then((found: any): void => {
                                if (!found) {
                                    let article: any = new ArticleModel();
                                    article.userid = userid;
                                    article.name = name;
                                    article.type = doc.type;
                                    article.content = content;
                                    article.open = true;
                                    article.save().then((): void => {
                                        resolve({});
                                    }).catch((error): void => {
                                        reject(error);
                                    });
                                } else {
                                    resolve({});
                                }
                            });
                        }
                    })
                };

                let copy_file = (resolve: any, reject: any): void => {

                    let name: string = resourcename.target;
                    let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                    if (gfs) {
                        let query = {};
                        if (config.structured) {
                            query = {$and: [{filename: resourcename.original}, {"metadata.namespace": ""}, {"metadata.userid": config.systems.userid}]};
                        } else {
                            query = {$and: [{filename: resourcename.original}, {"metadata.userid": config.systems.userid}]};
                        }

                        gfs.findOne(query, (error: any, item: any): void => {
                            if (!error) {
                                if (item) {
                                    let readstream = gfs.createReadStream({_id: item._id});
                                    let writestream = gfs.createWriteStream({
                                        filename: name,
                                        contentType: item.contentType,
                                        metadata: {
                                            userid: userid,
                                            username: "",
                                            key: item.metadata.key,
                                            type: item.metadata.type,
                                            namespace: item.metadata.namespace,
                                            parent: null
                                        }
                                    });

                                    if (writestream) {
                                        writestream.on('close', (file: any): void => {
                                            resolve(file);
                                        });
                                        readstream.on('error', (error: any): void => {
                                            reject(error);
                                        });
                                        readstream.pipe(writestream);
                                    } else {
                                        reject({});
                                    }
                                } else {
                                    resolve({}); // continue even if there is no file
                                }
                            } else {
                                reject(error);
                            }
                        });
                    }
                };

                return new Promise((resolve: any, reject: any): void => {
                    if (resourcename) {
                        switch (resourcename.type) {
                            case "resource":
                                copy_resource(resolve, reject);
                                break;
                            case "article":
                                copy_article(resolve, reject);
                                break;
                            case "file":
                                copy_file(resolve, reject);
                                break;
                            default:
                        }
                    }
                });
            };

            let conn = Pages.connect(config.db.user);
            let collection = null;
            let bucket = null;
            if (conn) {
                conn.once('open', (error: any): void => {
                    if (!error) {
                        conn.db.collection('fs.files', (error: any, collection: any): void => {
                            collection = collection;
                            Promise.all(resources.map((pagename: any): void => {
                                return copy(pagename);
                            })).then((results: any[]): void => {
                                conn.db.close();
                                Wrapper.SendSuccess(response, {code: 0, message: ""});
                            }).catch((error: any): void => {
                                conn.db.close();
                                Wrapper.SendError(response, error.code, error.message, error);
                            });
                        });
                    }
                });
            }

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
                                        let datasource = new ScannerBehaviorModule.CustomBehavior(inquiry_mail, inquiry_mail, config.systems.userid, null, true, {});
                                        HtmlScannerModule.Builder.Resolve(record.content.resource, datasource, {
                                            create: "",
                                            modify: "",
                                            content: content
                                        },(error: any, doc: string) => {
                                            if (!error) {
                                                mailer.send(report_to, report_title, doc, (error: any) => {
                                                    if (!error) {
                                                        ResourceModel.findOne({$and: [{userid: userid}, {name: thanks_mail}, {"type": mail_type}]}).then((record: any): void => {
                                                            if (record) {
                                                                let datasource = new ScannerBehaviorModule.CustomBehavior(thanks_mail, thanks_mail, config.systems.userid, null, true, {});
                                                                HtmlScannerModule.Builder.Resolve(record.content.resource, datasource, {
                                                                    create: "",
                                                                    modify: "",
                                                                    content: content
                                                                },(error: any, doc: string) => {
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

            Wrapper.Count(response, 2800, LocalAccount, {$and: [query, {userid: userid}]}, (response: any, count: any): any => {
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

    export class Pictures {

        static connect(user): any {
            let result = null;
            const options = {useMongoClient: true, keepAlive: 300000, connectTimeoutMS: 1000000};
            if (user) {
                result = mongoose.createConnection("mongodb://" + config.db.user + ":" + config.db.password + "@" + config.db.address + "/" + config.db.name, options);
            } else {
                result = mongoose.createConnection("mongodb://" + config.db.address + "/" + config.db.name, options);
            }
            return result;
        }

        static namespace(name: string): string {
            let result = "";
            if (name) {
                let names = name.split("#");
                let delimmiter = "";
                names.forEach((name, index) => {
                    if (index < (names.length - 1)) {
                        result += delimmiter + name;
                        delimmiter = ":";
                    }
                })
            }
            return result;
        }

        static localname(name: string): string {
            let result = "";
            if (name) {
                let names = name.split("#");
                names.forEach((name, index) => {
                    if (index == (names.length - 1)) {
                        result = name;
                    }
                })
            }
            return result;
        }

        static userid(request): string {
            return request.user.userid;
        }

        static username(request): string {
            return request.user.username;
        }

        static result_file(conn, gfs, collection, namespace, name, userid, response, next, not_found: () => void) {
            collection.findOne({$and: [{filename: name}, {"metadata.namespace": namespace}, {"metadata.userid": userid}]}, (error: any, item: any): void => {
                if (!error) {
                    if (item) {
                        let readstream = gfs.createReadStream({_id: item._id});
                        if (readstream) {
                            response.setHeader("Content-Type", item.metadata.type);
                            response.setHeader("Cache-Control", "no-cache");
                            readstream.on('close', (): void => {
                                conn.db.close();
                            });
                            readstream.on('error', (error: any): void => {
                                conn.db.close();
                            });
                            readstream.pipe(response);
                        } else {
                            conn.db.close();
                            next();
                        }
                    } else {
                        not_found();
                    }
                } else {
                    conn.db.close();
                    next();
                }
            });
        }

        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        public get_photo(request: any, response: any, next: any): void {
            try {
                let conn = Pictures.connect(config.db.user);
                let namespace = Pictures.namespace(request.params.name);
                let name = Pictures.localname(request.params.name);
                let userid = request.params.userid;
                let size = request.query;

                conn.once('open', (error: any): void => {
                    if (!error) {
                        let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                        if (gfs) {
                            conn.db.collection('fs.files', (error: any, collection: any): void => {
                                if (!error) {
                                    if (collection) {

                                        let query = {};
                                        if (config.structured) {
                                            query = {$and: [{filename: name}, {"metadata.namespace": namespace}, {"metadata.userid": userid}]};
                                        } else {
                                            query = {$and: [{filename: name}, {"metadata.userid": userid}]};
                                        }

                                        collection.findOne(query, (error: any, item: any): void => {
                                            if (!error) {
                                                if (item) {
                                                    let readstream = gfs.createReadStream({_id: item._id});
                                                    if (readstream) {
                                                        let type = item.metadata.type;
                                                        response.setHeader("Content-Type", type);
                                                        response.setHeader("Cache-Control", config.cache);
                                                        readstream.on('close', (): void => {
                                                            conn.db.close();
                                                        });

                                                        readstream.on('error', (error: any): void => {
                                                            conn.db.close();
                                                        });

                                                        try {
                                                            if (type == "image/jpeg" || type == "image/png" || type == "image/gif") {
                                                                if (size.w && size.h) {
                                                                    if (size.l && size.t) {
                                                                        /*
                                                                        // todo: "clipping" occurs unknown exception at invalid param. if fix that, require original size.
                                                                        let extractor = sharp().extract({
                                                                            left: parseInt(size.l),
                                                                            top: parseInt(size.t),
                                                                            width: parseInt(size.w),
                                                                            height: parseInt(size.h)
                                                                        });
                                                                        readstream = readstream.pipe(extractor);
                                                                        */
                                                                    }
                                                                    let resizer = sharp().resize(parseInt(size.w), parseInt(size.h)).ignoreAspectRatio();
                                                                    readstream = readstream.pipe(resizer);
                                                                }
                                                            }
                                                            readstream.pipe(response);
                                                        } catch (e) {
                                                            // NOT FOUND IMAGE.
                                                            Pictures.result_file(conn, gfs, collection, "", "blank.png", config.systems.userid, response, next, () => {
                                                                conn.db.close();
                                                                next();
                                                            });
                                                        }
                                                    } else {
                                                        conn.db.close();
                                                        next();
                                                    }
                                                } else {
                                                    // NOT FOUND IMAGE.
                                                    Pictures.result_file(conn, gfs, collection, "", "blank.png", config.systems.userid, response, next, () => {
                                                        conn.db.close();
                                                        next();
                                                    });
                                                }
                                            } else {
                                                conn.db.close();
                                                next();
                                            }
                                        });
                                    } else {
                                        conn.db.close();
                                        next();
                                    }
                                } else {
                                    conn.db.close();
                                    next();
                                }
                            });
                        } else {
                            conn.db.close();
                            next();
                        }
                    } else {
                        conn.db.close();
                        next();
                    }
                });
            } catch (e) {
                next();
            }
        }

    }


}

module.exports = FrontModule;
