/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

import * as core from "express-serve-static-core";
import {RouterOptions} from "express";

export namespace PagesModule {

    const _: any = require('lodash');
    const fs: any = require('graceful-fs');
    const path: any = require('path');
    const exec: any = require('child_process').exec;

    const mongodb: any = require('mongodb');
    const MongoClient: any = require('mongodb').MongoClient;
    const mongoose: any = require('mongoose');
    mongoose.Promise = global.Promise;

    const moment: any = require("moment");
    const archiver: any = require('archiver');

    const core: any = require(process.cwd() + '/gs');
    const share: any = core.share;
    const config: any = share.config;
    const Wrapper: any = share.Wrapper;

    const ResourceModel: any = require(share.Models("systems/resources/resource"));

    const ArticleModel: any = require(share.Models("services/articles/article"));

    // type 20   page
    // type 21   stamp
    // type 30   template(system only)

    export class Pages {

        static connect(): any {
            return MongoClient.connect("mongodb://" + config.db.user + ":" + config.db.password + "@" + config.db.address + "/" + config.db.name);
        }

        static userid(request:Express.Request): string {
            return request.user.userid;
        }

        static namespace(request: Express.Request): string {
            let result: string = "";
            if (request.user) {
                if (request.user.data) {
                    result = request.user.data.namespace;
                }
            }
            return result;
        }

        /**
         *  let userid = Pages.userid(request);
         *  request.sessionID;
         *  let tmp_path = '/tmp/' + sessionid;
         * @param userid
         * @param tmp_path
         * @param namespace
         * @param sub_path
         * @param callback
         * @returns none
         */
        static get_file_all(tmp_path: string, userid: string, namespace: string, sub_path: string, callback: (error) => void): void {
            try {
                let number: number = 27000;
                Pages.connect().then((db) => {
                    let bucket = new mongodb.GridFSBucket(db, {});
                    db.collection('fs.files', (error: any, collection: any): void => {
                        if (!error) {
                            if (collection) {
                                collection.find({$and: [{"metadata.namespace": namespace}, {"metadata.userid": userid}]}).toArray((error: any, docs: any): void => {
                                    if (!error) {
                                        let save = (doc: any): any => {
                                            return new Promise((resolve: any, reject: any): void => {
                                                if (doc) {
                                                    let read_db = bucket.openDownloadStreamByName(doc.filename)
                                                        .on('error', (error): void => {
                                                            reject(error);
                                                        })
                                                        .on('end', (): void => {
                                                            resolve({});
                                                        });
                                                    let write_file = fs.createWriteStream(path.join(path.join(path.join(tmp_path, namespace), sub_path), doc.filename));
                                                    read_db.pipe(write_file);
                                                }
                                            });
                                        };

                                        Promise.all(docs.map((doc: any): void => {
                                            return save(doc);
                                        })).then((results: any[]): void => {
                                            callback(null);
                                        }).catch((error: any): void => {
                                            callback(error);
                                        });
                                    } else {
                                        callback({code: error.code, message: error.message});
                                    }
                                });
                            } else {
                                callback({code: number + 20, message: "gfs error"});
                            }
                        } else {
                            callback({code: error.code, message: error.message});
                        }
                    });
                }).catch((error) => {
                    callback({code: error.code, message: error.message});
                });
            } catch (e) {
                callback({code: e.code, message: e.message});
            }
        }

        /**
         *  let userid = Pages.userid(request);
         * @param userid
         * @param tmp_path
         * @param callback
         * @returns none
         */
        static get_article_all(tmp_path: string, userid: string, namespace: string, sub_path: string, callback: (error: any) => void): void {
            try {
                ArticleModel.find({$and: [{"namespace": namespace}, {"userid": userid}]}, {}, {}).then((docs: any): void => {
                    fs.writeFile(path.join(path.join(path.join(tmp_path, namespace), sub_path), "/articles.json"), JSON.stringify(docs), (error: any) => {
                        callback(error);
                    });
                }).catch((error: any): void => {
                    callback(error);
                });
            } catch (e) {
                callback(e);
            }
        }

        /**
         *  let userid = Pages.userid(request);
         * @param userid
         * @param tmp_path
         * @param callback
         * @returns none
         */
        static get_resource_all(tmp_path: string, userid: string, namespace: string, sub_path: string, callback: (error: any) => void): void {
            ResourceModel.find({$and: [{"namespace": namespace}, {"userid": userid}]}, {}, {}).then((docs: any): void => {
                let save = (doc: any): any => {
                    return new Promise((resolve: any, reject: any): void => {
                        if (doc) {
                            let write_path: string = path.join(path.join(tmp_path, namespace), doc.name);
                            switch (doc.content.type) {
                                case "text/css":
                                    write_path = path.join(path.join(path.join(tmp_path, namespace), "css"), doc.name);
                                    break;
                                case "text/javascript":
                                    write_path = path.join(path.join(path.join(tmp_path, namespace), "js"), doc.name);
                                    break;
                                default:
                            }
                            fs.writeFile(write_path, doc.content.resource, (error) => {
                                if (!error) {
                                    resolve({});
                                } else {
                                    reject(error);
                                }
                            });
                        }
                    });
                };

                Promise.all(docs.map((doc: any): void => {
                    return save(doc);
                })).then((results: any[]): void => {
                    callback(null);
                }).catch((error: any): void => {
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
         * @param filename
         * @param callback
         * @returns none
         */
        static zip(work: string, target: string, filename: string, callback: (error: any) => void) {
            let zip_file_name: string = path.join(work, filename);
            let archive: any = archiver.create('zip', {});
            let output: any = fs.createWriteStream(zip_file_name);

            let carrent: string = process.cwd();

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
            archive.glob(target + "/**");
            archive.finalize();
        }

        /**
         *  let userid = Pages.userid(request);
         * @param request
         * @param response
         * @returns none
         */
        public get_all(request: any, response: Express.Response): void {
            let userid: string = Pages.userid(request);
            let namespace: string = Pages.namespace(request);
            let tmp_path: string = path.join("/tmp", request.sessionID);

            let error_handler = (error: any): void => {
                Wrapper.SendError(response, error.code, error.message, error);
            };

            let rm = (tmp_path: string, callback: (error) => void): void => {
                exec('rm -r ' + tmp_path, (error, stdout, stderr) => {
                    callback(error);
                });
            };

            let make_file = (): void => {
                Pages.get_file_all(tmp_path, userid, namespace, "img", (error: any): void => {
                    if (!error) {
                        Pages.get_article_all(tmp_path, userid, namespace, "articles", (error: any): void => {
                            if (!error) {
                                Pages.get_resource_all(tmp_path, userid, namespace, "pages", (error: any): void => {
                                    if (!error) {
                                        let date: any = moment();
                                        let datestring = date.format("YY_MM_DD_HH_mm_ss_");
                                        let filename = datestring + namespace + ".zip";
                                        Pages.zip(tmp_path, namespace, filename, (error: any): void => {
                                            if (!error) {
                                                response.download(path.join(tmp_path, filename), (error: any): void => {
                                                    if (!error) {
                                                        rm(tmp_path, (error) => {

                                                        });
                                                    } else {
                                                        error_handler(error);
                                                    }
                                                });
                                            } else {
                                                error_handler(error);
                                            }
                                        });
                                    } else {
                                        error_handler(error);
                                    }
                                });
                            } else {
                                error_handler(error);
                            }
                        });
                    } else {
                        error_handler(error);
                    }
                });
            };
            /*
                        let make_data = (path, callback:() => void, error:(_error) => void) => {
                            fs.mkdir(path, (_error): void => {
                                if (!_error) {
                                    callback();
                                } else {
                                    if (_error.code == "EEXIST") {
                                        rm(path, (_error) => {
                                            if (!_error) {
                                                callback();
                                            } else {
                                                error(_error);
                                            }
                                        });
                                    } else {
                                        error(_error);
                                    }
                                }
                            });
                        };
            */
            let make_dir = (path, callback: () => void, error: (_error) => void): void => {
                fs.mkdir(path, (_error): void => {
                    if (!_error) {
                        callback();
                    } else {
                        if (_error.code == "EEXIST") {
                            rm(path, (_error) => {
                                if (!_error) {
                                    callback();
                                } else {
                                    error(_error);
                                }
                            });
                        } else {
                            error(_error);
                        }
                    }
                });
            };

            make_dir(tmp_path, () => {
                make_dir(path.join(tmp_path, namespace), () => {
                    make_dir(path.join(path.join(tmp_path, namespace), "img"), () => {
                        make_dir(path.join(path.join(tmp_path, namespace), "articles"), () => {
                            make_dir(path.join(path.join(tmp_path, namespace), "js"), () => {
                                make_dir(path.join(path.join(tmp_path, namespace), "css"), () => {
                                    make_file();
                                }, error_handler);
                            }, error_handler);
                        }, error_handler);
                    }, error_handler);
                }, error_handler);
            }, error_handler);
        }

        public put_all(request: Express.Request, response: Express.Response): void {
        }

        public create_init_user_file(user: any): void {
            try {
                let userid = user.userid;
                Pages.connect().then((db) => {
                    db.collection('fs.files', (error: any, collection: any): void => {
                        let query = {"metadata.userid": config.systems.userid};
                        collection.find(query, (error: any, items: any): void => {
                            if (!error) {
                                items.toArray((error, items) => {
                                    if (!error) {
                                        let promises: any = [];
                                        _.forEach(items, (item) => {
                                            promises.push(new Promise((resolve: any, reject: any): void => {
                                                if (item) {
                                                    let bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db);
                                                    let readstream = bucket.openDownloadStream(item._id);

                                                    let meta = item.metadata;
                                                    meta.userid = userid;

                                                    let writestream = bucket.openUploadStream(item.filename, {
                                                        contentType: item.contentType,
                                                        metadata: meta
                                                    });

                                                    if (writestream) {
                                                        writestream.once('finish', (file: any): void => {
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
                                                    reject({});
                                                }
                                            }));
                                        });

                                        Promise.all(promises).then((results: any[]): void => {

                                        }).catch((error: any): void => {

                                        });
                                    } else {

                                    }
                                });
                            } else {
                            }
                        });
                    });
                }).catch((error) => {

                });
            } catch (e) {

            }
        }

        /**
         * ユーザ登録時に作成されるデフォルトリソース。
         * ユーザ登録時、システムのリソースをコピー。
         *  let userid = Pages.userid(request);
         * @param user
         * @returns none
         */
        public create_init_user_resources(user: any): void {
            ResourceModel.find({$and: [{userid: config.systems.userid}, {$and: [{type: {$gte: 20}}, {type: {$lt: 30}}]}]}, {}, {}).then((docs: any): void => {
                _.forEach(docs, (doc) => {
                    let name: string = doc.name;
                    let userid: string = user.userid;
                    let namespace: string = doc.namespace;
                    let type: string = doc.type;
                    let content: any = doc.content;
                    ResourceModel.findOne({$and: [{namespace: namespace}, {userid: userid}, {type: type}, {name: name}]}).then((found: any): void => {
                        if (!found) {
                            let page: any = new ResourceModel();
                            page.userid = userid;
                            page.name = name;
                            page.namespace = namespace;
                            page.type = type;
                            page.content = content;
                            page.open = true;
                            page.save().then(() => {

                            }).catch((e): void => {

                            });
                        }
                    });
                });
            });
        }

        /**
         * ユーザ登録時に作成されるデフォルトアーティクル。
         * ユーザ登録時、システムのアーティクルをコピー。
         *  let userid = Pages.userid(request);
         * @param user
         * @returns none
         */
        public create_init_user_articles(user: any): void {
            ArticleModel.find({userid: config.systems.userid}, {}, {}).then((docs: any): void => {
                _.forEach(docs, (doc) => {
                    let name: string = doc.name;
                    let userid: string = user.userid;
                    let namespace: string = "";
                    let type: string = doc.type;
                    let content: any = doc.content;
                    ArticleModel.findOne({$and: [{namespace: namespace}, {userid: userid}, {type: type}, {name: name}]}).then((found: any): void => {
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
            });
        }
    }

}

module.exports = PagesModule;
