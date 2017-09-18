/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FileModule;
(function (FileModule) {
    const _ = require('lodash');
    const fs = require('fs');
    const mongoose = require('mongoose');
    const Grid = require('gridfs-stream');
    const share = require(process.cwd() + '/server/systems/common/share');
    const config = share.config;
    const Wrapper = share.Wrapper;
    const logger = share.logger;
    const result = require(share.Server('systems/common/result'));
    class Files {
        constructor() {
        }
        static to_mime(request) {
            let type = "image/octet-stream";
            let index = request.body.url.indexOf(";");
            if (index > 0) {
                let types = request.body.url.substring(0, index).split(":");
                if (types.length == 2) {
                    type = types[1];
                }
            }
            return type;
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
        static namespace(name) {
            let result = "";
            if (name) {
                let names = name.split("#");
                let delimmiter = "";
                names.forEach((name, index) => {
                    if (index < (names.length - 1)) {
                        result += delimmiter + name;
                        delimmiter = ":";
                    }
                });
            }
            return result;
        }
        static localname(name) {
            let result = "";
            if (name) {
                let names = name.split("#");
                names.forEach((name, index) => {
                    if (index == (names.length - 1)) {
                        result = name;
                    }
                });
            }
            return result;
        }
        static userid(request) {
            return request.user.userid;
        }
        static username(request) {
            return request.user.username;
        }
        static from_local(gfs, path_from, namespace, key, name, mimetype, callback) {
            try {
                let writestream = gfs.createWriteStream({
                    filename: name,
                    metadata: {
                        userid: config.systems.userid,
                        key: key,
                        type: mimetype,
                        namespace: namespace,
                        parent: null
                    }
                });
                let readstream = fs.createReadStream(path_from + '/' + name, { encoding: null, bufferSize: 1 });
                readstream.on('error', (error) => {
                    callback(error, null);
                });
                writestream.on('close', (file) => {
                    callback(null, file);
                });
                writestream.on('error', (error) => {
                    callback(error, null);
                });
                readstream.pipe(writestream);
            }
            catch (e) {
                callback(e, null);
            }
        }
        static result_file(conn, gfs, collection, namespace, name, userid, response, next, not_found) {
            collection.findOne({ $and: [{ filename: name }, { "metadata.namespace": namespace }, { "metadata.userid": userid }] }, (error, item) => {
                if (!error) {
                    if (item) {
                        let readstream = gfs.createReadStream({ _id: item._id });
                        if (readstream) {
                            response.setHeader('Content-Type', item.metadata.type);
                            //    response.setHeader("Cache-Control", "no-cache");
                            readstream.on('close', () => {
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
                        not_found();
                    }
                }
                else {
                    conn.db.close();
                    next();
                }
            });
        }
        /**
         *
         * @returns none
         */
        create_init_files(initfiles, callback) {
            if (initfiles) {
                if (initfiles.length > 0) {
                    let conn = Files.connect(config.db.user);
                    if (conn) {
                        conn.once('open', (error) => {
                            if (!error) {
                                let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                                if (gfs) {
                                    conn.db.collection('fs.files', (error, collection) => {
                                        if (!error) {
                                            if (collection) {
                                                collection.ensureIndex({
                                                    "filename": 1,
                                                    "metadata.namespace": 1,
                                                    "metadata.userid": 1
                                                }, (error) => {
                                                    if (!error) {
                                                        let save = (doc) => {
                                                            return new Promise((resolve, reject) => {
                                                                let path = process.cwd() + doc.path;
                                                                let filename = doc.name;
                                                                let namespace = doc.namespace;
                                                                let mimetype = doc.content.type;
                                                                let type = doc.type;
                                                                let query = {};
                                                                if (config.structured) {
                                                                    query = { $and: [{ filename: filename }, { "metadata.namespace": "" }, { "metadata.userid": config.systems.userid }] };
                                                                }
                                                                else {
                                                                    query = { $and: [{ filename: filename }, { "metadata.userid": config.systems.userid }] };
                                                                }
                                                                collection.findOne(query, (error, item) => {
                                                                    if (!error) {
                                                                        if (!item) {
                                                                            Files.from_local(gfs, path, namespace, type, filename, mimetype, (error, file) => {
                                                                                if (!error) {
                                                                                    resolve(file);
                                                                                }
                                                                                else {
                                                                                    reject(error);
                                                                                }
                                                                            });
                                                                        }
                                                                        else {
                                                                            collection.remove({ _id: item._id }, (error, result) => {
                                                                                if (!error) {
                                                                                    Files.from_local(gfs, path, namespace, type, filename, mimetype, (error, file) => {
                                                                                        if (!error) {
                                                                                            resolve(file);
                                                                                        }
                                                                                        else {
                                                                                            reject(error);
                                                                                        }
                                                                                    });
                                                                                }
                                                                            });
                                                                        }
                                                                    }
                                                                    else {
                                                                        reject(error);
                                                                    }
                                                                });
                                                            });
                                                        };
                                                        let docs = initfiles;
                                                        Promise.all(docs.map((doc) => {
                                                            return save(doc);
                                                        })).then((results) => {
                                                            conn.db.close();
                                                            callback(null, results);
                                                        }).catch((error) => {
                                                            conn.db.close();
                                                            callback(error, null);
                                                        });
                                                    }
                                                });
                                            }
                                            else {
                                                conn.db.close();
                                            }
                                        }
                                        else {
                                            conn.db.close();
                                        }
                                    });
                                }
                                else {
                                    conn.db.close();
                                }
                            }
                            else {
                                conn.db.close();
                            }
                        });
                    }
                }
                else {
                    callback(null, null);
                }
            }
        }
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        get_file_query_query(request, response) {
            let number = 27000;
            let conn = Files.connect(config.db.user);
            let userid = Files.userid(request);
            if (conn) {
                conn.once('open', (error) => {
                    if (!error) {
                        let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                        if (gfs) {
                            conn.db.collection('fs.files', (error, collection) => {
                                if (!error) {
                                    if (collection) {
                                        let query = Wrapper.Decode(request.params.query);
                                        let option = Wrapper.Decode(request.params.option);
                                        let limit = 10;
                                        if (option.limit) {
                                            limit = option.limit;
                                        }
                                        let skip = 0;
                                        if (option.skip) {
                                            skip = option.skip;
                                        }
                                        collection.find({ $and: [query, { "metadata.userid": userid }] }).limit(limit).skip(skip).toArray((error, docs) => {
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
                            Wrapper.SendFatal(response, number + 20, "gfs error", {
                                code: number + 20,
                                message: "gfs error"
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
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        get_file_query_count(request, response) {
            let number = 28000;
            let conn = Files.connect(config.db.user);
            let userid = Files.userid(request);
            if (conn) {
                conn.once('open', (error) => {
                    if (!error) {
                        let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                        if (gfs) {
                            conn.db.collection('fs.files', (error, collection) => {
                                if (!error) {
                                    if (collection) {
                                        let query = Wrapper.Decode(request.params.query);
                                        collection.find({ $and: [query, { "metadata.userid": userid }] }).count((error, count) => {
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
                            Wrapper.SendFatal(response, number + 20, "gfs error", {
                                code: number + 20,
                                message: "gfs error"
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
        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        get_file(request, response, next) {
            try {
                let conn = Files.connect(config.db.user);
                let namespace = Files.namespace(request.params.name);
                let name = Files.localname(request.params.name);
                let userid = request.params.userid;
                conn.once('open', (error) => {
                    if (!error) {
                        let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                        if (gfs) {
                            conn.db.collection('fs.files', (error, collection) => {
                                if (!error) {
                                    if (collection) {
                                        let query = {};
                                        if (config.structured) {
                                            query = { $and: [{ filename: name }, { "metadata.namespace": namespace }, { "metadata.userid": userid }] };
                                        }
                                        else {
                                            query = { $and: [{ filename: name }, { "metadata.userid": userid }] };
                                        }
                                        collection.findOne(query, (error, item) => {
                                            if (!error) {
                                                if (item) {
                                                    let readstream = gfs.createReadStream({ _id: item._id });
                                                    if (readstream) {
                                                        response.setHeader('Content-Type', item.metadata.type);
                                                        //         response.setHeader("Cache-Control", "no-cache");
                                                        readstream.on('close', () => {
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
                                                    // NOT FOUND IMAGE.
                                                    Files.result_file(conn, gfs, collection, "", "blank.png", config.systems.userid, response, next, () => {
                                                        conn.db.close();
                                                        next();
                                                    });
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
            catch (e) {
                next();
            }
        }
        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        get_file_data_name(request, response, next) {
            try {
                let conn = Files.connect(config.db.user);
                let namespace = Files.namespace(request.params.name);
                let name = Files.localname(request.params.name);
                let userid = Files.userid(request);
                let BinaryToBase64 = (str) => {
                    return new Buffer(str, 'binary').toString('base64');
                };
                conn.once('open', (error) => {
                    if (!error) {
                        let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                        if (gfs) {
                            conn.db.collection('fs.files', (error, collection) => {
                                if (!error) {
                                    if (collection) {
                                        let query = {};
                                        if (config.structured) {
                                            query = { $and: [{ filename: name }, { "metadata.namespace": namespace }, { "metadata.userid": userid }] };
                                        }
                                        else {
                                            query = { $and: [{ filename: name }, { "metadata.userid": userid }] };
                                        }
                                        collection.findOne(query, (error, item) => {
                                            if (!error) {
                                                if (item) {
                                                    let buffer = new Buffer(0);
                                                    let readstream = gfs.createReadStream({ _id: item._id });
                                                    if (readstream) {
                                                        readstream.on("data", (chunk) => {
                                                            buffer = Buffer.concat([buffer, new Buffer(chunk)]);
                                                        });
                                                        readstream.on('close', () => {
                                                            conn.db.close();
                                                            let dataurl = "data:" + item.metadata.type + ";base64," + BinaryToBase64(buffer);
                                                            Wrapper.SendSuccess(response, dataurl);
                                                        });
                                                        readstream.on('error', (error) => {
                                                            conn.db.close();
                                                            Wrapper.SendError(response, error.code, error.message, error);
                                                        });
                                                    }
                                                    else {
                                                        conn.db.close();
                                                        Wrapper.SendError(response, 10000, "no stream", { code: 10000, message: "no stream" });
                                                    }
                                                }
                                                else {
                                                    conn.db.close();
                                                    Wrapper.SendFatal(response, 10000, "no item", { code: 10000, message: "no item" });
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
                                        Wrapper.SendFatal(response, 10000, "no collection", { code: 10000, message: "no collection" });
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
                            Wrapper.SendFatal(response, 10000, "no gfs", { code: 10000, message: "no gfs" });
                        }
                    }
                    else {
                        conn.db.close();
                        Wrapper.SendError(response, error.code, error.message, error);
                    }
                });
            }
            catch (e) {
                Wrapper.SendFatal(response, e.code, e.message, e);
            }
        }
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        post_file_name(request, response) {
            let number = 24000;
            let conn = Files.connect(config.db.user);
            let namespace = Files.namespace(request.params.name);
            let name = Files.localname(request.params.name);
            let key = request.params.key;
            let userid = Files.userid(request);
            let username = Files.username(request);
            if (name) {
                if (name.indexOf('/') == -1) {
                    if (conn) {
                        conn.once('open', (error) => {
                            if (!error) {
                                let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                                if (gfs) {
                                    conn.db.collection('fs.files', (error, collection) => {
                                        if (!error) {
                                            if (collection) {
                                                let query = {};
                                                if (config.structured) {
                                                    query = { $and: [{ filename: name }, { "metadata.namespace": namespace }, { "metadata.userid": userid }] };
                                                }
                                                else {
                                                    query = { $and: [{ filename: name }, { "metadata.userid": userid }] };
                                                }
                                                collection.findOne(query, (error, item) => {
                                                    if (!error) {
                                                        if (!item) {
                                                            let parseDataURL = (dataURL) => {
                                                                let result = {
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
                                                            let info = parseDataURL(request.body.url);
                                                            let chunk = info.isBase64 ? new Buffer(info.data, 'base64') : new Buffer(unescape(info.data), 'binary');
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
                                                            if (writestream) {
                                                                writestream.write(chunk);
                                                                writestream.on('close', (file) => {
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
        }
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        put_file_name(request, response) {
            let number = 25000;
            let conn = Files.connect(config.db.user);
            let namespace = Files.namespace(request.params.name);
            let name = Files.localname(request.params.name);
            let key = request.params.key;
            let userid = Files.userid(request);
            let username = Files.username(request);
            let parseDataURL = (dataURL) => {
                let result = {
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
                conn.once('open', (error) => {
                    if (!error) {
                        let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                        if (gfs) {
                            conn.db.collection('fs.files', (error, collection) => {
                                if (!error) {
                                    if (collection) {
                                        let query = {};
                                        if (config.structured) {
                                            query = { $and: [{ filename: name }, { "metadata.namespace": namespace }, { "metadata.userid": userid }] };
                                        }
                                        else {
                                            query = { $and: [{ filename: name }, { "metadata.userid": userid }] };
                                        }
                                        collection.findOne(query, (error, item) => {
                                            if (!error) {
                                                if (item) {
                                                    collection.remove({ _id: item._id }, (error) => {
                                                        if (!error) {
                                                            let info = parseDataURL(request.body.url);
                                                            let chunk = info.isBase64 ? new Buffer(info.data, 'base64') : new Buffer(unescape(info.data), 'binary');
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
                                                            if (writestream) {
                                                                writestream.write(chunk);
                                                                writestream.on('close', (file) => {
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
                                                    let info = parseDataURL(request.body.url);
                                                    let chunk = info.isBase64 ? new Buffer(info.data, 'base64') : new Buffer(unescape(info.data), 'binary');
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
                                                    if (writestream) {
                                                        writestream.write(chunk);
                                                        writestream.on('close', (file) => {
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
        }
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        delete_file_name(request, response) {
            let number = 26000;
            let conn = Files.connect(config.db.user);
            let namespace = Files.namespace(request.params.name);
            let name = Files.localname(request.params.name);
            let userid = Files.userid(request);
            if (conn) {
                conn.once('open', (error) => {
                    if (!error) {
                        let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                        if (gfs) {
                            conn.db.collection('fs.files', (error, collection) => {
                                if (!error) {
                                    if (collection) {
                                        let query = {};
                                        if (config.structured) {
                                            query = { $and: [{ filename: name }, { "metadata.namespace": namespace }, { "metadata.userid": userid }] };
                                        }
                                        else {
                                            query = { $and: [{ filename: name }, { "metadata.userid": userid }] };
                                        }
                                        collection.findOne(query, (error, item) => {
                                            if (!error) {
                                                if (item) {
                                                    collection.remove({ _id: item._id }, (error) => {
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
                            Wrapper.SendFatal(response, number + 20, "gfs error", {
                                code: number + 20,
                                message: "gfs error"
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
        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        delete_own(request, response) {
            let number = 29000;
            let conn = Files.connect(config.db.user);
            let userid = Files.userid(request);
            if (conn) {
                conn.once('open', (error) => {
                    if (!error) {
                        let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                        if (gfs) {
                            conn.db.collection('fs.files', (error, collection) => {
                                if (!error) {
                                    if (collection) {
                                        collection.remove({ "metadata.userid": userid }, (error) => {
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
                            Wrapper.SendFatal(response, number + 20, "gfs error", {
                                code: number + 20,
                                message: "gfs error"
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
    }
    FileModule.Files = Files;
    class TemporaryFiles {
        constructor() {
        }
        static isExistFile(path) {
            let result = false;
            try {
                fs.statSync(path);
                result = true;
            }
            catch (e) {
            }
            return result;
        }
        static MkdirIfNotExist(path, callback) {
            if (!TemporaryFiles.isExistFile(path)) {
                fs.mkdir(path, '0777', callback);
            }
            else {
                callback(null);
            }
        }
        upload(request, response) {
            let name = request.params.filename;
            if (name) {
                if (name.indexOf('/') == -1) {
                    let parseDataURL = (dataURL) => {
                        let result = {
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
                    let info = parseDataURL(request.body.url);
                    let chunk = info.isBase64 ? new Buffer(info.data, 'base64') : new Buffer(unescape(info.data), 'binary');
                    let tmp_path = '/tmp/' + request.sessionID;
                    let tmp_file = '/' + name;
                    let original_mask = process.umask(0);
                    TemporaryFiles.MkdirIfNotExist(tmp_path, (error) => {
                        if (!error) {
                            fs.writeFile(tmp_path + tmp_file, chunk, (error) => {
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
                        process.umask(original_mask);
                    });
                }
            }
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        download(request, response) {
            let delete_folder_recursive = (path) => {
                fs.readdirSync(path).forEach((file) => {
                    let curPath = path + "/" + file;
                    if (fs.lstatSync(curPath).isDirectory()) {
                        delete_folder_recursive(curPath);
                    }
                    else {
                        fs.unlinkSync(curPath);
                    }
                });
                fs.rmdirSync(path);
            };
            let tmp_path = '/tmp/' + request.sessionID;
            let tmp_file = '/' + request.params.filename; //  '/noname.xlsx';
            response.download(tmp_path + tmp_file, (error) => {
                if (!error) {
                    fs.unlink(tmp_path + tmp_file, (error) => {
                        if (!error) {
                            delete_folder_recursive(tmp_path);
                        }
                    });
                }
            });
        }
    }
    FileModule.TemporaryFiles = TemporaryFiles;
})(FileModule = exports.FileModule || (exports.FileModule = {}));
module.exports = FileModule;
//# sourceMappingURL=file_controller.js.map