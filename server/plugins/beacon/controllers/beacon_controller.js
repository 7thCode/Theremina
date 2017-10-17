/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BeaconModule;
(function (BeaconModule) {
    const _ = require('lodash');
    const mongoose = require('mongoose');
    const Grid = require('gridfs-stream');
    const core = require(process.cwd() + '/gs');
    const share = core.share;
    const config = share.config;
    const Cipher = share.Cipher;
    class Beacon {
        constructor() {
        }
        static connect(user) {
            let result = null;
            const options = { useMongoClient: true, keepAlive: 300000, connectTimeoutMS: 1000000 };
            if (user) {
                result = mongoose.createConnection("mongodb://" + config.db.user + ":" + config.db.password + "@" + config.db.address + "/" + config.db.name, options);
            }
            else {
                result = mongoose.createConnection("mongodb://" + config.db.address + "/" + config.db.name, options);
            }
            return result;
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        get_beacon(request, response, next) {
            try {
                let token = {};
                try {
                    token = JSON.parse(Cipher.FixedDecrypt(request.params.token, config.tokensecret));
                }
                catch (e) {
                }
                let conn = Beacon.connect(config.db.user);
                conn.once('open', (error) => {
                    if (!error) {
                        let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                        if (gfs) {
                            conn.db.collection('fs.files', (error, collection) => {
                                if (!error) {
                                    if (collection) {
                                        collection.findOne({ filename: "blank.png" }, (error, item) => {
                                            if (!error) {
                                                if (item) {
                                                    let readstream = gfs.createReadStream({ _id: item._id });
                                                    if (readstream) {
                                                        response.setHeader("Content-Type", item.metadata.type);
                                                        response.setHeader("Cache-Control", "no-cache");
                                                        readstream.on('close', (file) => {
                                                            conn.db.close();
                                                        });
                                                        readstream.on('error', (error) => {
                                                            conn.db.close();
                                                        });
                                                        readstream.pipe(response);
                                                    }
                                                    else {
                                                        conn.db.close();
                                                        next();
                                                    }
                                                }
                                                else {
                                                    conn.db.close();
                                                    next();
                                                }
                                            }
                                            else {
                                                conn.db.close();
                                                next();
                                            }
                                        });
                                    }
                                    else {
                                        conn.db.close();
                                        next();
                                    }
                                }
                                else {
                                    conn.db.close();
                                    next();
                                }
                            });
                        }
                        else {
                            next();
                        }
                    }
                    else {
                        next();
                    }
                });
            }
            catch (e) {
                next();
            }
        }
    }
    BeaconModule.Beacon = Beacon;
})(BeaconModule = exports.BeaconModule || (exports.BeaconModule = {}));
module.exports = BeaconModule;
//# sourceMappingURL=beacon_controller.js.map