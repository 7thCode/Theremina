/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace PicturesModule {

    const _ = require('lodash');

    const Grid = require('gridfs-stream');

    const mongoose: any = require('mongoose');
    mongoose.Promise = global.Promise;

    const sharp = require('sharp');

    const core: any = require(process.cwd() + '/gs');
    const share: any = core.share;
    const config: any = share.config;

    const LocalAccount: any = require(share.Models("systems/accounts/account"));

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

        static retrieve_account(userid, callback: (error: { code: number, message: string }, result: any) => void) {
            LocalAccount.findOne({username: userid}).then((account: any): void => {
                callback(null, account);
            }).catch((error: any): void => {
                callback(error, null);
            });
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
        public get_picture(request: { params: { userid: string, name: string, namespace: string }, query: any }, response: any, next: any): void {
            try {
                let conn = Pictures.connect(config.db.user);
                let namespace: string = request.params.namespace;
                let name = Pictures.localname(request.params.name);
                let size = request.query;

                conn.once('open', (error: any): void => {
                    if (!error) {
                        let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                        if (gfs) {
                            conn.db.collection('fs.files', (error: any, collection: any): void => {
                                if (!error) {
                                    if (collection) {
                                        let userid: string = request.params.userid;
                                        Pictures.retrieve_account(userid, (error: any, account: any): void => {
                                            if (!error) {
                                                if (account) {
                                                    userid = account.userid;
                                                }

                                                let query = {$and: [{filename: name}, {"metadata.namespace": namespace}, {"metadata.userid": userid}]};
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
                                                                    if (type == "image/jpg" || type == "image/jpeg" || type == "image/png" || type == "image/gif") {
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
                                                                    Pictures.result_file(conn, gfs, collection, config.systems.namespace, "blank.png", config.systems.userid, response, next, () => {
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
                                                            Pictures.result_file(conn, gfs, collection, config.systems.namespace, "blank.png", config.systems.userid, response, next, () => {
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

module.exports = PicturesModule;
