/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FileModule;
(function (FileModule) {
    var _ = require('lodash');
    var fs = require('graceful-fs');
    var path = require('path');
    var mongodb = require('mongodb');
    var MongoClient = require('mongodb').MongoClient;
    var share = require(process.cwd() + '/server/systems/common/share');
    var config = share.config;
    var Wrapper = share.Wrapper;
    var event = share.Event;
    var Files = /** @class */ (function () {
        function Files() {
        }
        Files.cache_invalidate = function (path) {
            event.emitter.emit("cache_invalidate", { path: path });
        };
        ;
        Files.to_mime = function (request) {
            var type = "image/octet-stream";
            var index = request.body.url.indexOf(";");
            if (index > 0) {
                var types = request.body.url.substring(0, index).split(":");
                if (types.length == 2) {
                    type = types[1];
                }
            }
            return type;
        };
        Files.connect = function () {
            return MongoClient.connect("mongodb://" + config.db.user + ":" + config.db.password + "@" + config.db.address + "/" + config.db.name);
        };
        Files.namespace = function (request) {
            var result = "";
            if (request.user) {
                if (request.user.data) {
                    result = request.user.data.namespace;
                }
            }
            return result;
        };
        Files.localname = function (name) {
            var result = "";
            if (name) {
                var names_1 = name.split("#");
                names_1.forEach(function (name, index) {
                    if (index == (names_1.length - 1)) {
                        result = name;
                    }
                });
            }
            return result;
        };
        Files.userid = function (request) {
            return request.user.userid;
        };
        Files.username = function (request) {
            return request.user.username;
        };
        Files.from_local = function (gfs, path_from, namespace, userid, key, name, mimetype, callback) {
            try {
                var writestream = gfs.openUploadStream(name, {
                    metadata: {
                        userid: userid,
                        key: key,
                        type: mimetype,
                        namespace: namespace,
                        parent: null
                    }
                });
                /*
                              let writestream = gfs.createWriteStream({
                                  filename: name,
                                  metadata: {
                                      userid: userid,// config.systems.userid,
                                      key: key,
                                      type: mimetype,
                                      namespace: namespace,
                                      parent: null
                                  }
                              });
              */
                var readstream = fs.createReadStream(path_from + '/' + name, { encoding: null, bufferSize: 1 });
                readstream.on('error', function (error) {
                    callback(error, null);
                });
                writestream.once('finish', function (file) {
                    callback(null, file);
                });
                writestream.on('error', function (error) {
                    callback(error, null);
                });
                readstream.pipe(writestream);
            }
            catch (e) {
                callback(e, null);
            }
        };
        Files.result_file = function (db, gfs, collection, namespace, name, userid, response, next, not_found) {
            collection.findOne({ $and: [{ filename: name }, { "metadata.namespace": namespace }, { "metadata.userid": userid }] }, function (error, item) {
                if (!error) {
                    if (item) {
                        var readstream = gfs.openDownloadStream(item._id);
                        if (readstream) {
                            response.setHeader('Content-Type', item.metadata.type);
                            readstream.on('end', function () {
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
                        not_found();
                    }
                }
                else {
                    next();
                }
            });
        };
        /**
         *
         * @returns none
         */
        Files.prototype.create_init_files = function (userid, initfiles, callback) {
            try {
                if (initfiles) {
                    if (initfiles.length > 0) {
                        Files.connect().then(function (db) {
                            var gfs = new mongodb.GridFSBucket(db, {});
                            if (gfs) {
                                db.collection('fs.files', function (error, collection) {
                                    if (!error) {
                                        if (collection) {
                                            // ensureIndex
                                            collection.createIndex({
                                                "filename": 1,
                                                "metadata.namespace": 1,
                                                "metadata.userid": 1
                                            }, function (error) {
                                                if (!error) {
                                                    var save_1 = function (doc) {
                                                        return new Promise(function (resolve, reject) {
                                                            var path = process.cwd() + doc.path;
                                                            var filename = doc.name;
                                                            var namespace = doc.namespace;
                                                            var mimetype = doc.content.type;
                                                            var type = doc.type;
                                                            var query = { $and: [{ filename: filename }, { "metadata.userid": userid }] };
                                                            collection.findOne(query, function (error, item) {
                                                                if (!error) {
                                                                    if (!item) {
                                                                        Files.from_local(gfs, path, namespace, userid, type, filename, mimetype, function (error, file) {
                                                                            if (!error) {
                                                                                resolve(file);
                                                                            }
                                                                            else {
                                                                                reject(error);
                                                                            }
                                                                        });
                                                                    }
                                                                    else {
                                                                        resolve({});
                                                                    }
                                                                }
                                                                else {
                                                                    reject(error);
                                                                }
                                                            });
                                                        });
                                                    };
                                                    var docs = initfiles;
                                                    Promise.all(docs.map(function (doc) {
                                                        return save_1(doc);
                                                    })).then(function (results) {
                                                        callback(null, results);
                                                    }).catch(function (error) {
                                                        callback(error, null);
                                                    });
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        }).catch(function (error) {
                            callback(error, null);
                        });
                    }
                    else {
                        callback(null, null);
                    }
                }
            }
            catch (e) {
                callback(e, null);
            }
        };
        /**
         *
         * @returns none
         */
        Files.prototype.create_files = function (userid, namespace, initfiles, callback) {
            try {
                if (initfiles) {
                    if (initfiles.length > 0) {
                        Files.connect().then(function (db) {
                            var gfs = new mongodb.GridFSBucket(db, {});
                            if (gfs) {
                                db.collection('fs.files', function (error, collection) {
                                    if (!error) {
                                        if (collection) {
                                            // ensureIndex
                                            collection.createIndex({
                                                "filename": 1,
                                                "metadata.namespace": 1,
                                                "metadata.userid": 1
                                            }, function (error) {
                                                if (!error) {
                                                    var save_2 = function (doc) {
                                                        return new Promise(function (resolve, reject) {
                                                            var path = process.cwd() + doc.path;
                                                            var filename = doc.name;
                                                            var mimetype = doc.content.type;
                                                            var type = doc.type;
                                                            var query = { $and: [{ filename: filename }, { namespace: namespace }, { "metadata.userid": userid }] };
                                                            collection.findOne(query, function (error, item) {
                                                                if (!error) {
                                                                    if (!item) {
                                                                        Files.from_local(gfs, path, namespace, userid, type, filename, mimetype, function (error, file) {
                                                                            if (!error) {
                                                                                resolve(file);
                                                                            }
                                                                            else {
                                                                                reject(error);
                                                                            }
                                                                        });
                                                                    }
                                                                    else {
                                                                        resolve({});
                                                                    }
                                                                }
                                                                else {
                                                                    reject(error);
                                                                }
                                                            });
                                                        });
                                                    };
                                                    var docs = initfiles;
                                                    Promise.all(docs.map(function (doc) {
                                                        return save_2(doc);
                                                    })).then(function (results) {
                                                        callback(null, results);
                                                    }).catch(function (error) {
                                                        callback(error, null);
                                                    });
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        }).catch(function (error) {
                            callback(error, null);
                        });
                    }
                    else {
                        callback(null, null);
                    }
                }
            }
            catch (e) {
                callback(e, null);
            }
        };
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        Files.prototype.get_file_query_query = function (request, response) {
            try {
                var number_1 = 27000;
                var userid_1 = Files.userid(request);
                var namespace_1 = Files.namespace(request);
                Files.connect().then(function (db) {
                    db.collection('fs.files', function (error, collection) {
                        if (!error) {
                            if (collection) {
                                var query = Wrapper.Decode(request.params.query) || {};
                                var option = Wrapper.Decode(request.params.option) || {};
                                var limit = 10;
                                if (option.limit) {
                                    limit = option.limit;
                                }
                                var skip = 0;
                                if (option.skip) {
                                    skip = option.skip;
                                }
                                collection.find({ $and: [query, { "metadata.namespace": namespace_1 }, { "metadata.userid": userid_1 }] }).limit(limit).skip(skip).toArray(function (error, docs) {
                                    if (!error) {
                                        Wrapper.SendSuccess(response, docs);
                                    }
                                    else {
                                        Wrapper.SendError(response, error.code, error.message, error);
                                    }
                                });
                            }
                            else {
                                Wrapper.SendFatal(response, number_1 + 30, "no collection", {
                                    code: number_1 + 30,
                                    message: "no collection"
                                });
                            }
                        }
                        else {
                            Wrapper.SendError(response, error.code, error.message, error);
                        }
                    });
                }).catch(function (error) {
                    Wrapper.SendError(response, error.code, error.message, error);
                });
            }
            catch (e) {
            }
        };
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        Files.prototype.get_file_query_count = function (request, response) {
            try {
                var number_2 = 28000;
                var userid_2 = Files.userid(request);
                var namespace_2 = Files.namespace(request);
                Files.connect().then(function (db) {
                    db.collection('fs.files', function (error, collection) {
                        if (!error) {
                            if (collection) {
                                var query = Wrapper.Decode(request.params.query);
                                collection.find({ $and: [query, { "metadata.namespace": namespace_2 }, { "metadata.userid": userid_2 }] }).count(function (error, count) {
                                    if (!error) {
                                        Wrapper.SendSuccess(response, count);
                                    }
                                    else {
                                        Wrapper.SendError(response, error.code, error.message, error);
                                    }
                                });
                            }
                            else {
                                Wrapper.SendFatal(response, number_2 + 30, "no collection", {
                                    code: number_2 + 30,
                                    message: "no collection"
                                });
                            }
                        }
                        else {
                            Wrapper.SendError(response, error.code, error.message, error);
                        }
                    });
                }).catch(function (error) {
                    Wrapper.SendError(response, error.code, error.message, error);
                });
            }
            catch (e) {
                Wrapper.SendFatal(response, e.code, e.message, e);
            }
        };
        /**
         *
         * @param userid
         * @param callback
         */
        Files.prototype.namespaces = function (userid, callback) {
            try {
                Files.connect().then(function (db) {
                    db.collection('fs.files', function (error, collection) {
                        if (!error) {
                            if (collection) {
                                collection.find({ "metadata.userid": userid }, { "metadata.namespace": 1, "_id": 0 }).toArray(function (error, docs) {
                                    if (!error) {
                                        var result_1 = [];
                                        _.forEach(docs, function (page) {
                                            if (page.metadata.namespace) {
                                                result_1.push(page.metadata.namespace);
                                            }
                                        });
                                        callback(null, _.uniqBy(result_1));
                                    }
                                    else {
                                        callback(error, null);
                                    }
                                });
                            }
                            else {
                                callback({ message: "", code: 1 }, null);
                            }
                        }
                        else {
                            callback(error, null);
                        }
                    });
                }).catch(function (error) {
                    callback(error, null);
                });
            }
            catch (e) {
                callback(e, null);
            }
        };
        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        Files.prototype.get_file = function (request, response, next) {
            try {
                var namespace_3 = Files.namespace(request);
                var name_1 = Files.localname(request.params.name);
                var userid_3 = request.params.userid;
                Files.connect().then(function (db) {
                    var gfs = new mongodb.GridFSBucket(db, {});
                    if (gfs) {
                        db.collection('fs.files', function (error, collection) {
                            if (!error) {
                                if (collection) {
                                    var query = { $and: [{ filename: name_1 }, { "metadata.namespace": namespace_3 }, { "metadata.userid": userid_3 }] };
                                    collection.findOne(query, function (error, item) {
                                        if (!error) {
                                            if (item) {
                                                var readstream = gfs.openDownloadStream(item._id);
                                                if (readstream) {
                                                    response.setHeader('Content-Type', item.metadata.type);
                                                    readstream.on('end', function () {
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
                                                // NOT FOUND IMAGE.
                                                Files.result_file(db, gfs, collection, config.systems.namespace, "blank.png", config.systems.userid, response, next, function () {
                                                    next();
                                                });
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
        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        Files.prototype.get_file_data_name = function (request, response, next) {
            try {
                var namespace_4 = Files.namespace(request);
                var name_2 = Files.localname(request.params.name);
                var userid_4 = Files.userid(request);
                var BinaryToBase64_1 = function (str) {
                    return new Buffer(str, 'binary').toString('base64');
                };
                Files.connect().then(function (db) {
                    var gfs = new mongodb.GridFSBucket(db, {});
                    if (gfs) {
                        db.collection('fs.files', function (error, collection) {
                            if (!error) {
                                if (collection) {
                                    var query = { $and: [{ filename: name_2 }, { "metadata.namespace": namespace_4 }, { "metadata.userid": userid_4 }] };
                                    collection.findOne(query, function (error, item) {
                                        if (!error) {
                                            if (item) {
                                                var buffer_1 = new Buffer(0);
                                                var readstream = gfs.openDownloadStream(item._id);
                                                if (readstream) {
                                                    readstream.on("data", function (chunk) {
                                                        buffer_1 = Buffer.concat([buffer_1, new Buffer(chunk)]);
                                                    });
                                                    readstream.on('end', function () {
                                                        var dataurl = "data:" + item.metadata.type + ";base64," + BinaryToBase64_1(buffer_1);
                                                        Wrapper.SendSuccess(response, dataurl);
                                                    });
                                                    readstream.on('error', function (error) {
                                                        Wrapper.SendError(response, error.code, error.message, error);
                                                    });
                                                }
                                                else {
                                                    Wrapper.SendError(response, 10000, "no stream", {
                                                        code: 10000,
                                                        message: "no stream"
                                                    });
                                                }
                                            }
                                            else {
                                                Wrapper.SendFatal(response, 10000, "no item", {
                                                    code: 10000,
                                                    message: "no item"
                                                });
                                            }
                                        }
                                        else {
                                            Wrapper.SendError(response, error.code, error.message, error);
                                        }
                                    });
                                }
                                else {
                                    Wrapper.SendFatal(response, 10000, "no collection", {
                                        code: 10000,
                                        message: "no collection"
                                    });
                                }
                            }
                            else {
                                Wrapper.SendError(response, error.code, error.message, error);
                            }
                        });
                    }
                    else {
                        Wrapper.SendFatal(response, 10000, "no gfs", { code: 10000, message: "no gfs" });
                    }
                }).catch(function (error) {
                    Wrapper.SendError(response, error.code, error.message, error);
                });
            }
            catch (e) {
                Wrapper.SendFatal(response, e.code, e.message, e);
            }
        };
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        Files.prototype.post_file_name = function (request, response) {
            try {
                var number_3 = 24000;
                var namespace_5 = Files.namespace(request);
                var name_3 = Files.localname(request.params.name);
                var key_1 = request.params.key;
                var userid_5 = Files.userid(request);
                var username_1 = Files.username(request);
                if (name_3) {
                    if (name_3.indexOf('/') == -1) {
                        Files.connect().then(function (db) {
                            var gfs = new mongodb.GridFSBucket(db, {});
                            if (gfs) {
                                db.collection('fs.files', function (error, collection) {
                                    if (!error) {
                                        if (collection) {
                                            var query = { $and: [{ filename: name_3 }, { "metadata.namespace": namespace_5 }, { "metadata.userid": userid_5 }] };
                                            collection.findOne(query, function (error, item) {
                                                if (!error) {
                                                    if (!item) {
                                                        var parseDataURL = function (dataURL) {
                                                            var result = {
                                                                mediaType: null,
                                                                encoding: null,
                                                                isBase64: null,
                                                                data: null
                                                            };
                                                            if (/^data:([^;]+)(;charset=([^,;]+))?(;base64)?,(.*)/.test(dataURL)) {
                                                                result.mediaType = RegExp.$1 || 'text/plain';
                                                                result.encoding = RegExp.$3 || 'US-ASCII';
                                                                result.isBase64 = String(RegExp.$4) === ';base64';
                                                                result.data = RegExp.$5;
                                                            }
                                                            return result;
                                                        };
                                                        var info = parseDataURL(request.body.url);
                                                        var chunk = info.isBase64 ? new Buffer(info.data, 'base64') : new Buffer(unescape(info.data), 'binary');
                                                        var writestream = gfs.openUploadStream(name_3, {
                                                            metadata: {
                                                                userid: userid_5,
                                                                username: username_1,
                                                                key: key_1 * 1,
                                                                type: Files.to_mime(request),
                                                                namespace: namespace_5,
                                                                parent: null
                                                            }
                                                        });
                                                        /*
                                                        let writestream = gfs.createWriteStream({
                                                            filename: name,
                                                            metadata: {
                                                                userid: userid,
                                                                username: username,
                                                                key: key * 1,
                                                                type: Files.to_mime(request),
                                                                namespace: namespace,
                                                                parent: null
                                                            }
                                                        });
                                                        */
                                                        if (writestream) {
                                                            writestream.once('finish', function (file) {
                                                                //                Files.cache_invalidate(request.url, (error) => {
                                                                //                });
                                                                Wrapper.SendSuccess(response, file);
                                                            });
                                                            writestream.write(chunk);
                                                            writestream.end();
                                                        }
                                                        else {
                                                            Wrapper.SendFatal(response, number_3 + 40, "stream not open", {
                                                                code: number_3 + 40,
                                                                message: "stream not open"
                                                            });
                                                        }
                                                    }
                                                    else {
                                                        Wrapper.SendWarn(response, number_3 + 1, "already found", {
                                                            code: number_3 + 1,
                                                            message: "already found"
                                                        });
                                                    }
                                                }
                                                else {
                                                    Wrapper.SendError(response, error.code, error.message, error);
                                                }
                                            });
                                        }
                                        else {
                                            Wrapper.SendFatal(response, number_3 + 30, "no collection", {
                                                code: number_3 + 30,
                                                message: "no collection"
                                            });
                                        }
                                    }
                                    else {
                                        Wrapper.SendError(response, error.code, error.message, error);
                                    }
                                });
                            }
                            else {
                                Wrapper.SendFatal(response, number_3 + 20, "no gfs", {
                                    code: number_3 + 20,
                                    message: "no gfs"
                                });
                            }
                        }).catch(function (error) {
                            Wrapper.SendError(response, error.code, error.message, error);
                        });
                    }
                    else {
                        Wrapper.SendError(response, number_3 + 30, "name invalid", {
                            code: number_3 + 30,
                            message: "name invalid"
                        });
                    }
                }
                else {
                    Wrapper.SendWarn(response, 1, "no name", { code: 1, message: "no name" });
                }
            }
            catch (e) {
                Wrapper.SendFatal(response, e.code, e.message, e);
            }
        };
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        Files.prototype.put_file_name = function (request, response) {
            try {
                var number_4 = 25000;
                var namespace_6 = Files.namespace(request);
                var name_4 = Files.localname(request.params.name);
                var key_2 = request.params.key;
                var userid_6 = Files.userid(request);
                var username_2 = Files.username(request);
                var parseDataURL_1 = function (dataURL) {
                    var result = {
                        mediaType: null,
                        encoding: null,
                        isBase64: null,
                        data: null
                    };
                    if (/^data:([^;]+)(;charset=([^,;]+))?(;base64)?,(.*)/.test(dataURL)) {
                        result.mediaType = RegExp.$1 || 'text/plain';
                        result.encoding = RegExp.$3 || 'US-ASCII';
                        result.isBase64 = String(RegExp.$4) === ';base64';
                        result.data = RegExp.$5;
                    }
                    return result;
                };
                Files.connect().then(function (db) {
                    var gfs = new mongodb.GridFSBucket(db, {});
                    if (gfs) {
                        db.collection('fs.files', function (error, collection) {
                            if (!error) {
                                if (collection) {
                                    var query = { $and: [{ filename: name_4 }, { "metadata.namespace": namespace_6 }, { "metadata.userid": userid_6 }] };
                                    collection.findOne(query, function (error, item) {
                                        if (!error) {
                                            if (item) {
                                                collection.remove({ _id: item._id }, function (error) {
                                                    if (!error) {
                                                        var info = parseDataURL_1(request.body.url);
                                                        var chunk = info.isBase64 ? new Buffer(info.data, 'base64') : new Buffer(unescape(info.data), 'binary');
                                                        var writestream = gfs.openUploadStream(name_4, {
                                                            metadata: {
                                                                userid: userid_6,
                                                                username: username_2,
                                                                key: key_2 * 1,
                                                                type: Files.to_mime(request),
                                                                namespace: namespace_6,
                                                                parent: null
                                                            }
                                                        });
                                                        /*
                                                        let writestream = gfs.createWriteStream({
                                                            filename: name,
                                                            username: username,
                                                            metadata: {
                                                                userid: userid,
                                                                key: key * 1,
                                                                type: Files.to_mime(request),
                                                                namespace: namespace,
                                                                parent: null
                                                            }
                                                        });
                                                        */
                                                        if (writestream) {
                                                            writestream.once('finish', function (file) {
                                                                Files.cache_invalidate(userid_6 + "/" + namespace_6);
                                                                Wrapper.SendSuccess(response, file);
                                                            });
                                                            writestream.write(chunk);
                                                            writestream.end();
                                                        }
                                                        else {
                                                            Wrapper.SendFatal(response, number_4 + 40, "stream not open", {
                                                                code: number_4 + 40,
                                                                message: "stream not open"
                                                            });
                                                        }
                                                    }
                                                });
                                            }
                                            else {
                                                var info = parseDataURL_1(request.body.url);
                                                var chunk = info.isBase64 ? new Buffer(info.data, 'base64') : new Buffer(unescape(info.data), 'binary');
                                                var writestream = gfs.openUploadStream(name_4, {
                                                    metadata: {
                                                        userid: userid_6,
                                                        username: username_2,
                                                        key: key_2 * 1,
                                                        type: Files.to_mime(request),
                                                        namespace: namespace_6,
                                                        parent: null
                                                    }
                                                });
                                                /*
                                                let writestream = gfs.createWriteStream({
                                                    filename: name,
                                                    username: username,
                                                    metadata: {
                                                        userid: userid,
                                                        key: key * 1,
                                                        type: Files.to_mime(request),
                                                        namespace: namespace,
                                                        parent: null
                                                    }
                                                });
                                                */
                                                if (writestream) {
                                                    writestream.once('finish', function (file) {
                                                        Wrapper.SendSuccess(response, file);
                                                    });
                                                    writestream.write(chunk);
                                                    writestream.end();
                                                }
                                                else {
                                                    Wrapper.SendFatal(response, number_4 + 40, "stream not open", {
                                                        code: number_4 + 40,
                                                        message: "stream not open"
                                                    });
                                                }
                                            }
                                        }
                                        else {
                                            Wrapper.SendError(response, error.code, error.message, error);
                                        }
                                    });
                                }
                                else {
                                    Wrapper.SendFatal(response, number_4 + 30, "no collection", {
                                        code: number_4 + 30,
                                        message: "no collection"
                                    });
                                }
                            }
                            else {
                                Wrapper.SendError(response, error.code, error.message, error);
                            }
                        });
                    }
                    else {
                        Wrapper.SendFatal(response, number_4 + 20, "no gfs", { code: number_4 + 20, message: "no gfs" });
                    }
                }).catch(function (error) {
                    Wrapper.SendError(response, error.code, error.message, error);
                });
            }
            catch (e) {
                Wrapper.SendFatal(response, e.code, e.message, e);
            }
        };
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        Files.prototype.delete_file_name = function (request, response) {
            try {
                var number_5 = 26000;
                var namespace_7 = Files.namespace(request);
                var name_5 = Files.localname(request.params.name);
                var userid_7 = Files.userid(request);
                Files.connect().then(function (db) {
                    db.collection('fs.files', function (error, collection) {
                        if (!error) {
                            if (collection) {
                                var query = { $and: [{ filename: name_5 }, { "metadata.namespace": namespace_7 }, { "metadata.userid": userid_7 }] };
                                collection.findOne(query, function (error, item) {
                                    if (!error) {
                                        if (item) {
                                            collection.remove({ _id: item._id }, function (error) {
                                                if (!error) {
                                                    Files.cache_invalidate(userid_7 + "/" + namespace_7);
                                                    Wrapper.SendSuccess(response, {});
                                                }
                                                else {
                                                    Wrapper.SendError(response, error.code, error.message, error);
                                                }
                                            });
                                        }
                                        else {
                                            Wrapper.SendWarn(response, number_5 + 1, "not found", {
                                                code: number_5 + 1,
                                                message: "not found"
                                            });
                                        }
                                    }
                                    else {
                                        Wrapper.SendError(response, error.code, error.message, error);
                                    }
                                });
                            }
                            else {
                                Wrapper.SendFatal(response, number_5 + 30, "no collection", {
                                    code: number_5 + 30,
                                    message: "no collection"
                                });
                            }
                        }
                        else {
                            Wrapper.SendError(response, error.code, error.message, error);
                        }
                    });
                }).catch(function (error) {
                    Wrapper.SendError(response, error.code, error.message, error);
                });
            }
            catch (e) {
                Wrapper.SendFatal(response, e.code, e.message, e);
            }
        };
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        Files.prototype.delete_own = function (request, response) {
            try {
                var number_6 = 29000;
                var userid_8 = Files.userid(request);
                Files.connect().then(function (db) {
                    db.collection('fs.files', function (error, collection) {
                        if (!error) {
                            if (collection) {
                                collection.remove({ "metadata.userid": userid_8 }, function (error) {
                                    if (!error) {
                                        Wrapper.SendSuccess(response, {});
                                    }
                                    else {
                                        Wrapper.SendError(response, error.code, error.message, error);
                                    }
                                });
                            }
                            else {
                                Wrapper.SendFatal(response, number_6 + 30, "no collection", {
                                    code: number_6 + 30,
                                    message: "no connection"
                                });
                            }
                        }
                        else {
                            Wrapper.SendError(response, error.code, error.message, error);
                        }
                    });
                }).catch(function (error) {
                    Wrapper.SendError(response, error.code, error.message, error);
                });
            }
            catch (e) {
                Wrapper.SendFatal(response, e.code, e.message, e);
            }
        };
        return Files;
    }());
    FileModule.Files = Files;
    var TemporaryFiles = /** @class */ (function () {
        function TemporaryFiles() {
        }
        TemporaryFiles.isExistFile = function (path) {
            var result = false;
            try {
                fs.statSync(path);
                result = true;
            }
            catch (e) {
            }
            return result;
        };
        TemporaryFiles.MkdirIfNotExist = function (path, callback) {
            if (!TemporaryFiles.isExistFile(path)) {
                fs.mkdir(path, '0777', callback);
            }
            else {
                callback(null);
            }
        };
        TemporaryFiles.prototype.upload = function (request, response) {
            var name = request.params.filename;
            if (name) {
                if (name.indexOf('/') == -1) {
                    var parseDataURL = function (dataURL) {
                        var result = {
                            mediaType: null,
                            encoding: null,
                            isBase64: null,
                            data: null
                        };
                        if (/^data:([^;]+)(;charset=([^,;]+))?(;base64)?,(.*)/.test(dataURL)) {
                            result.mediaType = RegExp.$1 || 'text/plain';
                            result.encoding = RegExp.$3 || 'US-ASCII';
                            result.isBase64 = String(RegExp.$4) === ';base64';
                            result.data = RegExp.$5;
                        }
                        return result;
                    };
                    var info = parseDataURL(request.body.url);
                    var chunk_1 = info.isBase64 ? new Buffer(info.data, 'base64') : new Buffer(unescape(info.data), 'binary');
                    var tmp_path_1 = '/tmp/' + request.sessionID;
                    var tmp_file_1 = '/' + name;
                    var original_mask_1 = process.umask(0);
                    TemporaryFiles.MkdirIfNotExist(tmp_path_1, function (error) {
                        if (!error) {
                            fs.writeFile(tmp_path_1 + tmp_file_1, chunk_1, function (error) {
                                if (!error) {
                                    Wrapper.SendSuccess(response, {});
                                }
                                else {
                                    console.log("writeFile : " + error.message);
                                    Wrapper.SendError(response, error.code, error.message, error);
                                }
                            });
                        }
                        else {
                            console.log("mkdir : " + error.message);
                            Wrapper.SendError(response, error.code, error.message, error);
                        }
                        process.umask(original_mask_1);
                    });
                }
            }
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        TemporaryFiles.prototype.download = function (request, response) {
            var delete_folder_recursive = function (path) {
                fs.readdirSync(path).forEach(function (file) {
                    var curPath = path + "/" + file;
                    if (fs.lstatSync(curPath).isDirectory()) {
                        delete_folder_recursive(curPath);
                    }
                    else {
                        fs.unlinkSync(curPath);
                    }
                });
                fs.rmdirSync(path);
            };
            var tmp_path = '/tmp/' + request.sessionID;
            var tmp_file = '/' + request.params.filename; //  '/noname.xlsx';
            response.download(tmp_path + tmp_file, function (error) {
                if (!error) {
                    fs.unlink(tmp_path + tmp_file, function (error) {
                        if (!error) {
                            delete_folder_recursive(tmp_path);
                        }
                    });
                }
            });
        };
        return TemporaryFiles;
    }());
    FileModule.TemporaryFiles = TemporaryFiles;
})(FileModule = exports.FileModule || (exports.FileModule = {}));
module.exports = FileModule;
//# sourceMappingURL=file_controller.js.map