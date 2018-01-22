/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace PagesModule {

    const _ = require('lodash');
    const fs: any = require('graceful-fs');

    const path: any = require('path');

    const mongodb: any = require('mongodb');
    const mongoose: any = require('mongoose');
    mongoose.Promise = global.Promise;

    const archiver: any = require('archiver');

    //const sharp = require("sharp");

    const core: any = require(process.cwd() + '/gs');
    const share: any = core.share;
    const config: any = share.config;
    const Wrapper: any = share.Wrapper;

    const ResourceModel: any = require(share.Models("systems/resources/resource"));

    const ArticleModel: any = require(share.Models("services/articles/article"));

    //const validator: any = require('validator');
    //const url: any = require('url');

 //   const ResourcesModule = require(share.Server("systems/resources/controllers/resource_controller"));
 //   const resource = new ResourcesModule.Resource;

    // type 20   page
    // type 21   stamp
    // type 30   template(system only)

    export class Pages {

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

        static userid(request): string {
            return request.user.userid;
        }

        static namespace(request: any): string {
            let result = "";
            if (request.user.data) {
                result = request.user.data.namespace;
            }
            return result;
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
        static get_file_all(userid: string,namespace: string, tmp_path: string, callback: (error) => void): void {

            let number: number = 27000;
            let conn = Pages.connect(config.db.user);
            if (conn) {
                conn.once('open', (error: any): void => {
                    if (!error) {
                        let bucket = new mongodb.GridFSBucket(conn.db, {});
                        conn.db.collection('fs.files', (error: any, collection: any): void => {
                            if (!error) {
                                if (collection) {
                                    collection.find({$and:[{"metadata.namespace": namespace}, {"metadata.userid": userid}]}).toArray((error: any, docs: any): void => {
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
        static get_article_all(userid: string,namespace:string, tmp_path: string, callback: (error) => void): void {
            ArticleModel.find({$and:[{"namespace": namespace}, {"userid": userid}]}, {}, {}).then((docs: any): void => {
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
        static get_resource_all(userid: string,namespace:string, tmp_path: string, callback: (error) => void): void {
            ResourceModel.find({$and:[{"namespace": namespace}, {"userid": userid}]}, {}, {}).then((docs: any): void => {
                let save = (doc: any): any => {
                    return new Promise((resolve: any, reject: any): void => {
                        if (doc) {
                            fs.writeFile(path.join(tmp_path, doc.name), doc.content.resource, (error) => {
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
         * @param callback
         * @returns none
         */
        static zip(work: string, target: string, callback: (error) => void) {
            let zip_file_name = path.join(work, target + ".zip");
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
            archive.glob(target + "/*");
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
            let namespace = Pages.namespace(request);
            let tmp_path = path.join("/tmp", request.sessionID);

            let rm = (tmp_path, callback) => {
                let exec = require('child_process').exec;
                exec('rm -r ' + tmp_path, (error, stdout, stderr) => {
                    callback(error);
                    //        Wrapper.SendSuccess(response, {code: 0, message: ""});
                });
            };

            let make_file = (tmp_path,userid) => {
                Pages.get_file_all(userid,namespace, path.join(tmp_path, namespace), (error: any): void => {
                            if (!error) {
                                Pages.get_article_all(userid,namespace, path.join(tmp_path, namespace + "/articles.txt"), (error: any): void => {
                                    if (!error) {
                                        Pages.get_resource_all(userid,namespace, path.join(tmp_path, namespace), (error: any): void => {
                                            if (!error) {
                                                Pages.zip(tmp_path, namespace, (error: any): void => {
                                                    if (!error) {
                                                        response.download(path.join(tmp_path, namespace + ".zip"), (error: any): void => {
                                                            if (!error) {
                                                                rm(tmp_path, (error) => {

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
            };

            let make_data = (tmp_path,userid) => {
                fs.mkdir(path.join(tmp_path, namespace), (error): void => {
                    if (!error) {
                        make_file(tmp_path,userid);
                    } else {
                        if (error.code == "EEXIST") {
                            rm(tmp_path, (error) => {
                                make_file(tmp_path,userid);
                            });
                        } else {
                            Wrapper.SendError(response, error.code, error.message, error);
                        }
                    }
                });
            };

            fs.mkdir(tmp_path, (error): void => {
                if (!error) {
                    make_data(tmp_path,userid);
                } else {
                    if (error.code == "EEXIST") {
                        make_data(tmp_path,userid);
                    } else {
                        Wrapper.SendError(response, error.code, error.message, error);
                    }
                }
            });
        }

        public put_all(request: any, response: any): void {
        }

        public create_init_user_file(user: any): void {
            let userid = user.userid;
            let conn = Pages.connect(config.db.user);
            if (conn) {
                conn.once('open', (error: any): void => {
                    if (!error) {
                        conn.db.collection('fs.files', (error: any, collection: any): void => {
                            let query = {"metadata.userid": config.systems.userid};
                            collection.find(query, (error: any, items: any): void => {
                                if (!error) {
                                    items.toArray((error, items) => {
                                        if (!error) {
                                            let promises = [];
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
                                                        reject({});
                                                    }
                                                }));
                                            });

                                            Promise.all(promises).then((results: any[]): void => {
                                                conn.db.close();
                                            }).catch((error: any): void => {
                                                conn.db.close();
                                            });
                                        } else {
                                        }
                                    });
                                } else {
                                }
                            });
                        });
                    } else {
                    }
                });
            } else {
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
                    let userid = user.userid;
                    let namespace = doc.namespace;
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
            })

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
                    let userid = user.userid;
                    let namespace = "";
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
            })

        }

        /**
         * @param request
         * @param response
         * @returns none
         */
/*
        public build(request: any, response: any): void {
            let userid = Pages.userid(request);
            let name = request.params.name;

            const core = require(process.cwd() + '/gs');
            const file: any = core.file;
            const resource: any = core.resource;

            let all_resource_set = applications_config.sites;
            if (all_resource_set) {
                let target_resource_set = all_resource_set[name];
                if (target_resource_set) {
                    file.create_init_files(userid, target_resource_set.files, (error: any, result: any): void => {
                        if (!error) {
                            resource.create_init_resources(userid, target_resource_set.resources, (error: any, result: any): void => {
                                if (!error) {
                                    Wrapper.SendSuccess(response, {code: 0, message: ""});
                                } else {
                                    Wrapper.SendError(response, error.code, error.message, error);
                                }
                            });
                        } else {
                            Wrapper.SendError(response, error.code, error.message, error);
                        }
                    });
                }
            }
        }
*/
    }

}

module.exports = PagesModule;
