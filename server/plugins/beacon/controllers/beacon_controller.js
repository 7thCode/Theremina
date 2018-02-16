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
    var mongodb = require('mongodb');
    var MongoClient = require('mongodb').MongoClient;
    var core = require(process.cwd() + '/gs');
    var share = core.share;
    var config = share.config;
    var Cipher = share.Cipher;
    var Beacon = /** @class */ (function () {
        function Beacon() {
        }
        Beacon.connect = function () {
            return MongoClient.connect("mongodb://" + config.db.user + ":" + config.db.password + "@" + config.db.address + "/" + config.db.name);
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
                Beacon.connect().then(function (db) {
                    var gfs = new mongodb.GridFSBucket(db, {});
                    if (gfs) {
                        db.collection('fs.files', function (error, collection) {
                            if (!error) {
                                if (collection) {
                                    collection.findOne({ filename: "blank.png" }, function (error, item) {
                                        if (!error) {
                                            if (item) {
                                                var readstream = gfs.openDownloadStream(item._id);
                                                if (readstream) {
                                                    response.setHeader("Content-Type", item.metadata.type);
                                                    response.setHeader("Cache-Control", "no-cache");
                                                    readstream.on('end', function (file) {
                                                    });
                                                    readstream.on('error', function (error) {
                                                    });
                                                    readstream.pipe(response);
                                                }
                                                else {
                                                    next();
                                                }
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
                                else {
                                    next();
                                }
                            }
                            else {
                                next();
                            }
                        });
                    }
                    else {
                        next();
                    }
                }).catch(function (error) {
                    next();
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