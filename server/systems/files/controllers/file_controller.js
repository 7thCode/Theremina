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
    var mongoose = require('mongoose');
    var Grid = require('gridfs-stream');
    var share = require(process.cwd() + '/server/systems/common/share');
    var config = share.config;
    var Wrapper = share.Wrapper;
    //  const logger = share.logger;
    var result = require(share.Server('systems/common/result'));
    var Files = (function () {
        function Files() {
        }
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
        Files.connect = function (user) {
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
        /*
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
        */
        Files.namespace = function (request) {
            var result = "";
            if (request.user.data) {
                result = request.user.data.namespace;
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
                /*
                                let bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db);
                
                                let writestream = bucket.openUploadStream(name, {
                                    contentType: "binary/octet-stream",
                                    metadata: {
                                        userid: config.systems.userid,
                                        key: key,
                                        type: mimetype,
                                        namespace: namespace,
                                        parent: null
                                    }
                                });
                */
                var writestream = gfs.createWriteStream({
                    filename: name,
                    metadata: {
                        userid: userid,
                        key: key,
                        type: mimetype,
                        namespace: namespace,
                        parent: null
                    }
                });
                var readstream = fs.createReadStream(path_from + '/' + name, { encoding: null, bufferSize: 1 });
                readstream.on('error', function (error) {
                    callback(error, null);
                });
                writestream.on('close', function (file) {
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
        Files.result_file = function (conn, gfs, collection, namespace, name, userid, response, next, not_found) {
            collection.findOne({ $and: [{ filename: name }, { "metadata.namespace": namespace }, { "metadata.userid": userid }] }, function (error, item) {
                if (!error) {
                    if (item) {
                        var readstream = gfs.createReadStream({ _id: item._id });
                        if (readstream) {
                            response.setHeader('Content-Type', item.metadata.type);
                            //    response.setHeader("Cache-Control", "no-cache");
                            readstream.on('close', function () {
                                conn.db.close();
                            });
                            readstream.on('error', function (error) {
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
                        not_found();
                    }
                }
                else {
                    conn.db.close();
                    next();
                }
            });
        };
        /**
         *
         * @returns none
         */
        Files.prototype.create_init_files = function (userid, initfiles, callback) {
            if (initfiles) {
                if (initfiles.length > 0) {
                    var conn_1 = Files.connect(config.db.user);
                    if (conn_1) {
                        conn_1.once('open', function (error) {
                            if (!error) {
                                var gfs_1 = Grid(conn_1.db, mongoose.mongo); //missing parameter
                                if (gfs_1) {
                                    conn_1.db.collection('fs.files', function (error, collection) {
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
                                                                            Files.from_local(gfs_1, path, namespace, userid, type, filename, mimetype, function (error, file) {
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
                                                            conn_1.db.close();
                                                            callback(null, results);
                                                        }).catch(function (error) {
                                                            conn_1.db.close();
                                                            callback(error, null);
                                                        });
                                                    }
                                                });
                                            }
                                            else {
                                                conn_1.db.close();
                                            }
                                        }
                                        else {
                                            conn_1.db.close();
                                        }
                                    });
                                }
                                else {
                                    conn_1.db.close();
                                }
                            }
                            else {
                                conn_1.db.close();
                            }
                        });
                    }
                }
                else {
                    callback(null, null);
                }
            }
        };
        /**
         *
         * @returns none
         */
        Files.prototype.create_files = function (userid, namespace, initfiles, callback) {
            if (initfiles) {
                if (initfiles.length > 0) {
                    var conn_2 = Files.connect(config.db.user);
                    if (conn_2) {
                        conn_2.once('open', function (error) {
                            if (!error) {
                                var gfs_2 = Grid(conn_2.db, mongoose.mongo); //missing parameter
                                if (gfs_2) {
                                    conn_2.db.collection('fs.files', function (error, collection) {
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
                                                                            Files.from_local(gfs_2, path, namespace, userid, type, filename, mimetype, function (error, file) {
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
                                                            conn_2.db.close();
                                                            callback(null, results);
                                                        }).catch(function (error) {
                                                            conn_2.db.close();
                                                            callback(error, null);
                                                        });
                                                    }
                                                });
                                            }
                                            else {
                                                conn_2.db.close();
                                            }
                                        }
                                        else {
                                            conn_2.db.close();
                                        }
                                    });
                                }
                                else {
                                    conn_2.db.close();
                                }
                            }
                            else {
                                conn_2.db.close();
                            }
                        });
                    }
                }
                else {
                    callback(null, null);
                }
            }
        };
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        Files.prototype.get_file_query_query = function (request, response) {
            var number = 27000;
            var conn = Files.connect(config.db.user);
            var userid = Files.userid(request);
            var namespace = Files.namespace(request);
            if (conn) {
                conn.once('open', function (error) {
                    if (!error) {
                        conn.db.collection('fs.files', function (error, collection) {
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
                                    collection.find({ $and: [query, { "metadata.namespace": namespace }, { "metadata.userid": userid }] }).limit(limit).skip(skip).toArray(function (error, docs) {
                                        if (!error) {
                                            conn.db.close();
                                            Wrapper.SendSuccess(response, docs);
                                        }
                                        else {
                                            conn.db.close();
                                            Wrapper.SendError(response, error.code, error.message, error);
                                        }
                                    });
                                }
                                else {
                                    conn.db.close();
                                    Wrapper.SendFatal(response, number + 30, "no collection", {
                                        code: number + 30,
                                        message: "no collection"
                                    });
                                }
                            }
                            else {
                                conn.db.close();
                                Wrapper.SendError(response, error.code, error.message, error);
                            }
                        });
                    }
                    else {
                        conn.db.close();
                        Wrapper.SendError(response, error.code, error.message, error);
                    }
                });
            }
            else {
                Wrapper.SendError(response, number + 10, "connection error", {
                    code: number + 10,
                    message: "connection error"
                });
            }
        };
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        Files.prototype.get_file_query_count = function (request, response) {
            var number = 28000;
            var conn = Files.connect(config.db.user);
            var userid = Files.userid(request);
            var namespace = Files.namespace(request);
            if (conn) {
                conn.once('open', function (error) {
                    if (!error) {
                        conn.db.collection('fs.files', function (error, collection) {
                            if (!error) {
                                if (collection) {
                                    var query = Wrapper.Decode(request.params.query);
                                    collection.find({ $and: [query, { "metadata.namespace": namespace }, { "metadata.userid": userid }] }).count(function (error, count) {
                                        if (!error) {
                                            conn.db.close();
                                            Wrapper.SendSuccess(response, count);
                                        }
                                        else {
                                            conn.db.close();
                                            Wrapper.SendError(response, error.code, error.message, error);
                                        }
                                    });
                                }
                                else {
                                    conn.db.close();
                                    Wrapper.SendFatal(response, number + 30, "no collection", {
                                        code: number + 30,
                                        message: "no collection"
                                    });
                                }
                            }
                            else {
                                conn.db.close();
                                Wrapper.SendError(response, error.code, error.message, error);
                            }
                        });
                    }
                    else {
                        conn.db.close();
                        Wrapper.SendError(response, error.code, error.message, error);
                    }
                });
            }
            else {
                Wrapper.SendError(response, number + 10, "connection error", {
                    code: number + 10,
                    message: "connection error"
                });
            }
        };
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        Files.prototype.namespaces = function (userid, callback) {
            var number = 27000;
            var conn = Files.connect(config.db.user);
            if (conn) {
                conn.once('open', function (error) {
                    if (!error) {
                        conn.db.collection('fs.files', function (error, collection) {
                            if (!error) {
                                if (collection) {
                                    collection.find({ "metadata.userid": userid }, { "metadata.namespace": 1, "_id": 0 }).toArray(function (error, docs) {
                                        if (!error) {
                                            conn.db.close();
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
                                            conn.db.close();
                                        }
                                    });
                                }
                                else {
                                    callback({ message: "", code: 1 }, null);
                                    conn.db.close();
                                }
                            }
                            else {
                                callback(error, null);
                                conn.db.close();
                            }
                        });
                    }
                    else {
                        callback(error, null);
                        conn.db.close();
                    }
                });
            }
            else {
                callback({ message: "2", code: 1 }, null);
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
                var conn_3 = Files.connect(config.db.user);
                var namespace_1 = Files.namespace(request);
                var name_1 = Files.localname(request.params.name);
                var userid_1 = request.params.userid;
                conn_3.once('open', function (error) {
                    if (!error) {
                        var gfs_3 = Grid(conn_3.db, mongoose.mongo); //missing parameter
                        if (gfs_3) {
                            conn_3.db.collection('fs.files', function (error, collection) {
                                if (!error) {
                                    if (collection) {
                                        var query = { $and: [{ filename: name_1 }, { "metadata.namespace": namespace_1 }, { "metadata.userid": userid_1 }] };
                                        collection.findOne(query, function (error, item) {
                                            if (!error) {
                                                if (item) {
                                                    var readstream = gfs_3.createReadStream({ _id: item._id });
                                                    if (readstream) {
                                                        response.setHeader('Content-Type', item.metadata.type);
                                                        //         response.setHeader("Cache-Control", "no-cache");
                                                        readstream.on('close', function () {
                                                            conn_3.db.close();
                                                        });
                                                        readstream.on('error', function (error) {
                                                            conn_3.db.close();
                                                        });
                                                        readstream.pipe(response);
                                                    }
                                                    else {
                                                        conn_3.db.close();
                                                        next();
                                                    }
                                                }
                                                else {
                                                    // NOT FOUND IMAGE.
                                                    Files.result_file(conn_3, gfs_3, collection, "", "blank.png", config.systems.userid, response, next, function () {
                                                        conn_3.db.close();
                                                        next();
                                                    });
                                                }
                                            }
                                            else {
                                                conn_3.db.close();
                                                next();
                                            }
                                        });
                                    }
                                    else {
                                        conn_3.db.close();
                                        next();
                                    }
                                }
                                else {
                                    conn_3.db.close();
                                    next();
                                }
                            });
                        }
                        else {
                            conn_3.db.close();
                            next();
                        }
                    }
                    else {
                        conn_3.db.close();
                        next();
                    }
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
                var conn_4 = Files.connect(config.db.user);
                // let namespace: string = request.params.namespace;
                var namespace_2 = Files.namespace(request);
                var name_2 = Files.localname(request.params.name);
                var userid_2 = Files.userid(request);
                var BinaryToBase64_1 = function (str) {
                    return new Buffer(str, 'binary').toString('base64');
                };
                conn_4.once('open', function (error) {
                    if (!error) {
                        var gfs_4 = Grid(conn_4.db, mongoose.mongo); //missing parameter
                        if (gfs_4) {
                            conn_4.db.collection('fs.files', function (error, collection) {
                                if (!error) {
                                    if (collection) {
                                        var query = { $and: [{ filename: name_2 }, { "metadata.namespace": namespace_2 }, { "metadata.userid": userid_2 }] };
                                        collection.findOne(query, function (error, item) {
                                            if (!error) {
                                                if (item) {
                                                    var buffer_1 = new Buffer(0);
                                                    var readstream = gfs_4.createReadStream({ _id: item._id });
                                                    if (readstream) {
                                                        readstream.on("data", function (chunk) {
                                                            buffer_1 = Buffer.concat([buffer_1, new Buffer(chunk)]);
                                                        });
                                                        readstream.on('close', function () {
                                                            conn_4.db.close();
                                                            var dataurl = "data:" + item.metadata.type + ";base64," + BinaryToBase64_1(buffer_1);
                                                            Wrapper.SendSuccess(response, dataurl);
                                                        });
                                                        readstream.on('error', function (error) {
                                                            conn_4.db.close();
                                                            Wrapper.SendError(response, error.code, error.message, error);
                                                        });
                                                    }
                                                    else {
                                                        conn_4.db.close();
                                                        Wrapper.SendError(response, 10000, "no stream", {
                                                            code: 10000,
                                                            message: "no stream"
                                                        });
                                                    }
                                                }
                                                else {
                                                    conn_4.db.close();
                                                    Wrapper.SendFatal(response, 10000, "no item", {
                                                        code: 10000,
                                                        message: "no item"
                                                    });
                                                }
                                            }
                                            else {
                                                conn_4.db.close();
                                                Wrapper.SendError(response, error.code, error.message, error);
                                            }
                                        });
                                    }
                                    else {
                                        conn_4.db.close();
                                        Wrapper.SendFatal(response, 10000, "no collection", {
                                            code: 10000,
                                            message: "no collection"
                                        });
                                    }
                                }
                                else {
                                    conn_4.db.close();
                                    Wrapper.SendError(response, error.code, error.message, error);
                                }
                            });
                        }
                        else {
                            conn_4.db.close();
                            Wrapper.SendFatal(response, 10000, "no gfs", { code: 10000, message: "no gfs" });
                        }
                    }
                    else {
                        conn_4.db.close();
                        Wrapper.SendError(response, error.code, error.message, error);
                    }
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
            var number = 24000;
            var conn = Files.connect(config.db.user);
            var namespace = Files.namespace(request);
            var name = Files.localname(request.params.name);
            var key = request.params.key;
            var userid = Files.userid(request);
            var username = Files.username(request);
            if (name) {
                if (name.indexOf('/') == -1) {
                    if (conn) {
                        conn.once('open', function (error) {
                            if (!error) {
                                var gfs_5 = Grid(conn.db, mongoose.mongo); //missing parameter
                                if (gfs_5) {
                                    conn.db.collection('fs.files', function (error, collection) {
                                        if (!error) {
                                            if (collection) {
                                                var query = { $and: [{ filename: name }, { "metadata.namespace": namespace }, { "metadata.userid": userid }] };
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
                                                            var writestream = gfs_5.createWriteStream({
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
                                                            if (writestream) {
                                                                writestream.write(chunk);
                                                                writestream.on('close', function (file) {
                                                                    conn.db.close();
                                                                    Wrapper.SendSuccess(response, file);
                                                                });
                                                                writestream.end();
                                                            }
                                                            else {
                                                                conn.db.close();
                                                                Wrapper.SendFatal(response, number + 40, "stream not open", {
                                                                    code: number + 40,
                                                                    message: "stream not open"
                                                                });
                                                            }
                                                        }
                                                        else {
                                                            conn.db.close();
                                                            Wrapper.SendWarn(response, number + 1, "already found", {
                                                                code: number + 1,
                                                                message: "already found"
                                                            });
                                                        }
                                                    }
                                                    else {
                                                        conn.db.close();
                                                        Wrapper.SendError(response, error.code, error.message, error);
                                                    }
                                                });
                                            }
                                            else {
                                                conn.db.close();
                                                Wrapper.SendFatal(response, number + 30, "no collection", {
                                                    code: number + 30,
                                                    message: "no collection"
                                                });
                                            }
                                        }
                                        else {
                                            conn.db.close();
                                            Wrapper.SendError(response, error.code, error.message, error);
                                        }
                                    });
                                }
                                else {
                                    conn.db.close();
                                    Wrapper.SendFatal(response, number + 20, "no gfs", {
                                        code: number + 20,
                                        message: "no gfs"
                                    });
                                }
                            }
                            else {
                                conn.db.close();
                                Wrapper.SendError(response, error.code, error.message, error);
                            }
                        });
                    }
                    else {
                        Wrapper.SendError(response, number + 10, "connection error", {
                            code: number + 10,
                            message: "connection error"
                        });
                    }
                }
                else {
                    Wrapper.SendError(response, number + 30, "name invalid", {
                        code: number + 30,
                        message: "name invalid"
                    });
                }
            }
            else {
                Wrapper.SendWarn(response, 1, "no name", { code: 1, message: "no name" });
            }
        };
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        Files.prototype.put_file_name = function (request, response) {
            var number = 25000;
            var conn = Files.connect(config.db.user);
            var namespace = Files.namespace(request);
            var name = Files.localname(request.params.name);
            var key = request.params.key;
            var userid = Files.userid(request);
            var username = Files.username(request);
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
            if (conn) {
                conn.once('open', function (error) {
                    if (!error) {
                        var gfs_6 = Grid(conn.db, mongoose.mongo); //missing parameter
                        if (gfs_6) {
                            conn.db.collection('fs.files', function (error, collection) {
                                if (!error) {
                                    if (collection) {
                                        var query = { $and: [{ filename: name }, { "metadata.namespace": namespace }, { "metadata.userid": userid }] };
                                        collection.findOne(query, function (error, item) {
                                            if (!error) {
                                                if (item) {
                                                    collection.remove({ _id: item._id }, function (error) {
                                                        if (!error) {
                                                            var info = parseDataURL(request.body.url);
                                                            var chunk = info.isBase64 ? new Buffer(info.data, 'base64') : new Buffer(unescape(info.data), 'binary');
                                                            var writestream = gfs_6.createWriteStream({
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
                                                            if (writestream) {
                                                                writestream.write(chunk);
                                                                writestream.on('close', function (file) {
                                                                    conn.db.close();
                                                                    Wrapper.SendSuccess(response, file);
                                                                });
                                                                writestream.end();
                                                            }
                                                            else {
                                                                conn.db.close();
                                                                Wrapper.SendFatal(response, number + 40, "stream not open", {
                                                                    code: number + 40,
                                                                    message: "stream not open"
                                                                });
                                                            }
                                                        }
                                                    });
                                                }
                                                else {
                                                    var info = parseDataURL(request.body.url);
                                                    var chunk = info.isBase64 ? new Buffer(info.data, 'base64') : new Buffer(unescape(info.data), 'binary');
                                                    var writestream = gfs_6.createWriteStream({
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
                                                    if (writestream) {
                                                        writestream.write(chunk);
                                                        writestream.on('close', function (file) {
                                                            conn.db.close();
                                                            Wrapper.SendSuccess(response, file);
                                                        });
                                                        writestream.end();
                                                    }
                                                    else {
                                                        conn.db.close();
                                                        Wrapper.SendFatal(response, number + 40, "stream not open", {
                                                            code: number + 40,
                                                            message: "stream not open"
                                                        });
                                                    }
                                                }
                                            }
                                            else {
                                                conn.db.close();
                                                Wrapper.SendError(response, error.code, error.message, error);
                                            }
                                        });
                                    }
                                    else {
                                        Wrapper.SendFatal(response, number + 30, "no collection", {
                                            code: number + 30,
                                            message: "no collection"
                                        });
                                    }
                                }
                                else {
                                    conn.db.close();
                                    Wrapper.SendError(response, error.code, error.message, error);
                                }
                            });
                        }
                        else {
                            conn.db.close();
                            Wrapper.SendFatal(response, number + 20, "no gfs", { code: number + 20, message: "no gfs" });
                        }
                    }
                    else {
                        conn.db.close();
                        Wrapper.SendError(response, error.code, error.message, error);
                    }
                });
            }
            else {
                Wrapper.SendError(response, number + 10, "connection error", {
                    code: number + 10,
                    message: "connection error"
                });
            }
        };
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        Files.prototype.delete_file_name = function (request, response) {
            var number = 26000;
            var conn = Files.connect(config.db.user);
            var namespace = Files.namespace(request);
            var name = Files.localname(request.params.name);
            var userid = Files.userid(request);
            if (conn) {
                conn.once('open', function (error) {
                    if (!error) {
                        conn.db.collection('fs.files', function (error, collection) {
                            if (!error) {
                                if (collection) {
                                    var query = { $and: [{ filename: name }, { "metadata.namespace": namespace }, { "metadata.userid": userid }] };
                                    collection.findOne(query, function (error, item) {
                                        if (!error) {
                                            if (item) {
                                                collection.remove({ _id: item._id }, function (error) {
                                                    if (!error) {
                                                        conn.db.close();
                                                        Wrapper.SendSuccess(response, {});
                                                    }
                                                    else {
                                                        conn.db.close();
                                                        Wrapper.SendError(response, error.code, error.message, error);
                                                    }
                                                });
                                            }
                                            else {
                                                conn.db.close();
                                                Wrapper.SendWarn(response, number + 1, "not found", {
                                                    code: number + 1,
                                                    message: "not found"
                                                });
                                            }
                                        }
                                        else {
                                            conn.db.close();
                                            Wrapper.SendError(response, error.code, error.message, error);
                                        }
                                    });
                                }
                                else {
                                    conn.db.close();
                                    Wrapper.SendFatal(response, number + 30, "no collection", {
                                        code: number + 30,
                                        message: "no collection"
                                    });
                                }
                            }
                            else {
                                conn.db.close();
                                Wrapper.SendError(response, error.code, error.message, error);
                            }
                        });
                    }
                    else {
                        conn.db.close();
                        Wrapper.SendError(response, error.code, error.message, error);
                    }
                });
            }
            else {
                Wrapper.SendError(response, number + 10, "connection error", {
                    code: number + 10,
                    message: "connection error"
                });
            }
        };
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        Files.prototype.delete_own = function (request, response) {
            var number = 29000;
            var conn = Files.connect(config.db.user);
            var userid = Files.userid(request);
            if (conn) {
                conn.once('open', function (error) {
                    if (!error) {
                        conn.db.collection('fs.files', function (error, collection) {
                            if (!error) {
                                if (collection) {
                                    collection.remove({ "metadata.userid": userid }, function (error) {
                                        if (!error) {
                                            conn.db.close();
                                            Wrapper.SendSuccess(response, {});
                                        }
                                        else {
                                            conn.db.close();
                                            Wrapper.SendError(response, error.code, error.message, error);
                                        }
                                    });
                                }
                                else {
                                    conn.db.close();
                                    Wrapper.SendFatal(response, number + 30, "no collection", {
                                        code: number + 30,
                                        message: "no connection"
                                    });
                                }
                            }
                            else {
                                conn.db.close();
                                Wrapper.SendError(response, error.code, error.message, error);
                            }
                        });
                    }
                    else {
                        conn.db.close();
                        Wrapper.SendError(response, error.code, error.message, error);
                    }
                });
            }
            else {
                Wrapper.SendError(response, number + 10, "connection error", {
                    code: number + 10,
                    message: "connection error"
                });
            }
        };
        return Files;
    }());
    FileModule.Files = Files;
    var TemporaryFiles = (function () {
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