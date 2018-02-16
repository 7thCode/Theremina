/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace BeaconModule {

    const _: any = require('lodash');

    const mongodb: any = require('mongodb');
    const MongoClient: any = require('mongodb').MongoClient;

    const core: any = require(process.cwd() + '/gs');
    const share: any = core.share;

    const config: any = share.config;
    const Cipher: any = share.Cipher;

    export class Beacon {

        constructor() {

        }

        static connect(): any {
            return MongoClient.connect("mongodb://" + config.db.user + ":" + config.db.password + "@" + config.db.address + "/" + config.db.name);
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_beacon(request: any, response: any, next: any): void {
            try {
                let token: any = {};
                try {
                    token = JSON.parse(Cipher.FixedDecrypt(request.params.token, config.tokensecret));
                } catch (e) {
                }

                Beacon.connect().then((db) => {

                        let gfs = new mongodb.GridFSBucket(db, {});
                        if (gfs) {
                            db.collection('fs.files', (error: any, collection: any): void => {
                                if (!error) {
                                    if (collection) {
                                        collection.findOne({filename: "blank.png"}, (error: any, item: any): void => {
                                            if (!error) {
                                                if (item) {
                                                    let readstream = gfs.openDownloadStream(item._id);
                                                    if (readstream) {
                                                        response.setHeader("Content-Type", item.metadata.type);
                                                        response.setHeader("Cache-Control", "no-cache");
                                                        readstream.on('end', (file: any): void => {
                                                        });
                                                        readstream.on('error', (error: any): void => {
                                                        });
                                                        readstream.pipe(response);
                                                    } else {
                                                        next();
                                                    }
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

            } catch (e) {
                next();
            }
        }
    }
}

module.exports = BeaconModule;
