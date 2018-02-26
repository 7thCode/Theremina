/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace PicturesModule {

    const _: any = require('lodash');

    const mongodb: any = require('mongodb');
    const MongoClient: any = require('mongodb').MongoClient;

    const sharp: any = require('sharp');

    const core: any = require(process.cwd() + '/gs');
    const share: any = core.share;
    const config: any = share.config;
    const event: any = share.Event;
    const logger: any = share.logger;

    const file_utility: any = share.Utility;

    const LocalAccount: any = require(share.Models("systems/accounts/account"));

    export class Pictures {

        static connect(): any {
            return MongoClient.connect("mongodb://" + config.db.user + ":" + config.db.password + "@" + config.db.address + "/" + config.db.name);
        }

        static localname(name: string): string {
            let result: string = "";
            if (name) {
                let names: string[] = name.split("#");
                names.forEach((name, index) => {
                    if (index == (names.length - 1)) {
                        result = name;
                    }
                });
            }
            return result;
        }

        static userid(request): string {
            return request.user.userid;
        }

        static username(request): string {
            return request.user.username;
        }

        static cache_write(path: string[], content: string): void {
            event.emitter.emit("cache_write", {path: path, stream: content});
        };

        static retrieve_account(userid: string, callback: (error: { code: number, message: string } | null, result: any) => void): void {
            LocalAccount.findOne({username: userid}).then((account: any): void => {
                callback(null, account);
            }).catch((error: any): void => {
                callback(error, null);
            });
        }

        static result_file(gfs: any, collection: any, namespace: string, name: string, userid: string, response: any, next: any, not_found: () => void): void {
            collection.findOne({$and: [{filename: name}, {"metadata.namespace": namespace}, {"metadata.userid": userid}]}, (error: any, item: any): void => {
                if (!error) {
                    if (item) {
                        let readstream: any = gfs.openDownloadStream(item._id);
                        if (readstream) {
                            response.setHeader("Content-Type", item.metadata.type);
                            response.setHeader("Cache-Control", "no-cache");
                            readstream.on('end', (): void => {
                            });
                            readstream.on('error', (error: any): void => {
                                logger.error(error.message);
                            });
                            readstream.pipe(response);
                        } else {
                            next();
                        }
                    } else {
                        not_found();
                    }
                } else {
                    next();
                }
            });
        }

        /**
         * public
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        public get_picture(request: { params: { userid: string, name: string, namespace: string }, query: any }, response: any, next: any): void {
            try {
                let userid: string = request.params.userid;
                let namespace: string = request.params.namespace;
                let name: string = Pictures.localname(request.params.name);
                let size: any = request.query;

                let error_handler = (error: any): void => {
                    logger.error(error.message);
                };

                let cache_file = process.cwd() + "/tmp/" + userid + "/" + namespace + "/doc/img/" + name;
                file_utility.exists(cache_file, () => {
                    file_utility.read_stream(cache_file).pipe(response); // hit in cache.
                }, (error) => {
                    Pictures.connect().then((db) => { //　miss in cache.
                        let gfs = new mongodb.GridFSBucket(db, {});
                        if (gfs) {
                            db.collection('fs.files', (error: any, collection: any): void => {
                                if (!error) {
                                    if (collection) {
                                        Pictures.retrieve_account(userid, (error: any, account: any): void => {
                                            if (!error) {
                                                if (account) {
                                                    userid = account.userid;
                                                }

                                                let query: any = {$and: [{filename: name}, {"metadata.namespace": namespace}, {"metadata.userid": userid}]};
                                                collection.findOne(query, (error: any, item: any): void => {
                                                    if (!error) {
                                                        if (item) {
                                                            let readstream: any = gfs.openDownloadStream(item._id);
                                                            if (readstream) {
                                                                let type = item.metadata.type;
                                                                response.setHeader("Content-Type", type);
                                                                response.setHeader("Cache-Control", config.cache);
                                                                readstream.on('end', (): void => {});
                                                                readstream.on('error', error_handler);

                                                                try {
                                                                    if (type == "image/jpg" || type == "image/jpeg" || type == "image/png" || type == "image/gif") {
                                                                        if (size.w && size.h) {　// 加工
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
                                                                            let resizer: any = sharp().resize(parseInt(size.w), parseInt(size.h)).ignoreAspectRatio();
                                                                            readstream = readstream.pipe(resizer);
                                                                        } else { //加工しないならばコピー。
                                                                            let copystream: any = gfs.openDownloadStream(item._id);
                                                                            let path: string[] = [];
                                                                            path.push(userid);
                                                                            path.push(namespace);
                                                                            path.push("doc"); // todo: いまいちやろこれは。
                                                                            path.push("img"); // todo: いまいちやろこれは。
                                                                            path.push(name);
                                                                            Pictures.cache_write(path, copystream);
                                                                        }
                                                                    }
                                                                    readstream.pipe(response);
                                                                } catch (e) {
                                                                    // NOT FOUND IMAGE.
                                                                    Pictures.result_file(gfs, collection, config.systems.namespace, "blank.png", config.systems.userid, response, next, () => {
                                                                        next();
                                                                    });
                                                                }
                                                            } else {
                                                                next();
                                                            }
                                                        } else {
                                                            // NOT FOUND IMAGE.
                                                            Pictures.result_file(gfs, collection, config.systems.namespace, "blank.png", config.systems.userid, response, next, () => {
                                                                next();
                                                            });
                                                        }
                                                    } else {
                                                        next();
                                                    }
                                                });
                                            } else {
                                                next();
                                            }
                                        });
                                    } else {
                                        next();
                                    }
                                } else {
                                    next();
                                }
                            });
                        } else {
                            next();
                        }
                    }).catch((error) => {
                        next();
                    });
                });
            } catch (e) {
                next();
            }
        }
    }

}

module.exports = PicturesModule;
