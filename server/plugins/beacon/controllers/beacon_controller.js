/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BeaconModule;
(function (BeaconModule) {
    var _ = require('lodash');
    var mongoose = require('mongoose');
    var Grid = require('gridfs-stream');
    var core = require(process.cwd() + '/gs');
    var share = core.share;
    var config = share.config;
    var Cipher = share.Cipher;
    var Beacon = (function () {
        function Beacon() {
        }
        Beacon.connect = function (user) {
            var result = null;
            var options = { useMongoClient: true, keepAlive: 300000, connectTimeoutMS: 1000000 };
            if (user) {
                result = mongoose.createConnection("mongodb://" + config.db.user + ":" + config.db.password + "@" + config.db.address + "/" + config.db.name, options);
            }
            else {
                result = mongoose.createConnection("mongodb://" + config.db.address + "/" + config.db.name, options);
            }
            return result;
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Beacon.prototype.get_beacon = function (request, response, next) {
            try {
                var token = {};
                try {
                    token = JSON.parse(Cipher.FixedDecrypt(request.params.token, config.tokensecret));
                }
                catch (e) {
                }
                var conn_1 = Beacon.connect(config.db.user);
                conn_1.once('open', function (error) {
                    if (!error) {
                        var gfs_1 = Grid(conn_1.db, mongoose.mongo); //missing parameter
                        if (gfs_1) {
                            conn_1.db.collection('fs.files', function (error, collection) {
                                if (!error) {
                                    if (collection) {
                                        collection.findOne({ filename: "blank.png" }, function (error, item) {
                                            if (!error) {
                                                if (item) {
                                                    var readstream = gfs_1.createReadStream({ _id: item._id });
                                                    if (readstream) {
                                                        response.setHeader("Content-Type", item.metadata.type);
                                                        response.setHeader("Cache-Control", "no-cache");
                                                        readstream.on('close', function (file) {
                                                            conn_1.db.close();
                                                        });
                                                        readstream.on('error', function (error) {
                                                            conn_1.db.close();
                                                        });
                                                        readstream.pipe(response);
                                                    }
                                                    else {
                                                        conn_1.db.close();
                                                        next();
                                                    }
                                                }
                                                else {
                                                    conn_1.db.close();
                                                    next();
                                                }
                                            }
                                            else {
                                                conn_1.db.close();
                                                next();
                                            }
                                        });
                                    }
                                    else {
                                        conn_1.db.close();
                                        next();
                                    }
                                }
                                else {
                                    conn_1.db.close();
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
        };
        return Beacon;
    }());
    BeaconModule.Beacon = Beacon;
})(BeaconModule = exports.BeaconModule || (exports.BeaconModule = {}));
module.exports = BeaconModule;
//# sourceMappingURL=beacon_controller.js.map