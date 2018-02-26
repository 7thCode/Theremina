/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace FileModule {

    const _: any = require('lodash');
    const fs: any = require('graceful-fs');

    const path: any = require('path');

    const mongodb: any = require('mongodb');
    const MongoClient: any = require('mongodb').MongoClient;

    const share: any = require(process.cwd() + '/server/systems/common/share');
    const config: any = share.config;
    const Wrapper: any = share.Wrapper;
    const event: any = share.Event;

    export class Files {

        constructor() {
        }

        static cache_invalidate(path: string): void {
            event.emitter.emit("cache_invalidate", {path: path});
        };

        static to_mime(request): string {
            let type: string = "image/octet-stream";
            let index: number = request.body.url.indexOf(";");
            if (index > 0) {
                let types = request.body.url.substring(0, index).split(":");
                if (types.length == 2) {
                    type = types[1];
                }
            }
            return type;
        }

        static connect(): any {
            return MongoClient.connect("mongodb://" + config.db.user + ":" + config.db.password + "@" + config.db.address + "/" + config.db.name);
        }

        static namespace(request: any): string {
            let result: string = "";
            if (request.user) {
                if (request.user.data) {
                    result = request.user.data.namespace;
                }
            }
            return result;
        }

        static localname(name: string): string {
            let result: string = "";
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

        static userid(request): string {
            return request.user.userid;
        }

        static username(request): string {
            return request.user.username;
        }

        static from_local(gfs: any, path_from: string, namespace: string, userid: string, key: number, name: string, mimetype: string, callback: (error: any, file: any) => void): void {
            try {
                let writestream: any = gfs.openUploadStream(name,
                    {
                        metadata: {
                            userid: userid,// config.systems.userid,
                            key: key,
                            type: mimetype,
                            namespace: namespace,
                            parent: null
                        }
                    }
                );

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

                let readstream: any = fs.createReadStream(path_from + '/' + name, {encoding: null, bufferSize: 1});

                readstream.on('error', (error: any): void => {
                    callback(error, null);
                });

                writestream.once('finish', (file: any): void => {
                    callback(null, file);
                });

                writestream.on('error', (error: any): void => {
                    callback(error, null);
                });

                readstream.pipe(writestream);

            } catch (e) {
                callback(e, null);
            }
        }

        static result_file(db, gfs, collection, namespace, name, userid, response, next, not_found: () => void) {
            collection.findOne({$and: [{filename: name}, {"metadata.namespace": namespace}, {"metadata.userid": userid}]}, (error: any, item: any): void => {
                if (!error) {
                    if (item) {
                        let readstream: any = gfs.openDownloadStream(item._id);
                        if (readstream) {
                            response.setHeader('Content-Type', item.metadata.type);
                            readstream.on('end', (): void => {
                            });
                            readstream.on('error', (error: any): void => {
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
         *
         * @returns none
         */
        public create_init_files(userid: string, initfiles: any[], callback: (error: any, result: any) => void): void {
            try {
                if (initfiles) {
                    if (initfiles.length > 0) {
                        Files.connect().then((db) => {
                            let gfs: any = new mongodb.GridFSBucket(db, {});
                            if (gfs) {
                                db.collection('fs.files', (error: any, collection: any): void => {
                                    if (!error) {
                                        if (collection) {
                                            // ensureIndex
                                            collection.createIndex({
                                                "filename": 1,
                                                "metadata.namespace": 1,
                                                "metadata.userid": 1
                                            }, (error) => {
                                                if (!error) {
                                                    let save = (doc: any): any => {
                                                        return new Promise((resolve: any, reject: any): void => {
                                                            let path: string = process.cwd() + doc.path;
                                                            let filename: string = doc.name;
                                                            let namespace: string = doc.namespace;
                                                            let mimetype: string = doc.content.type;
                                                            let type: number = doc.type;
                                                            let query: any = {$and: [{filename: filename}, {"metadata.userid": userid}]};

                                                            collection.findOne(query, (error: any, item: any): void => {
                                                                if (!error) {
                                                                    if (!item) {
                                                                        Files.from_local(gfs, path, namespace, userid, type, filename, mimetype, (error: any, file: any): void => {
                                                                            if (!error) {
                                                                                resolve(file);
                                                                            } else {
                                                                                reject(error);
                                                                            }
                                                                        });
                                                                    } else {
                                                                        resolve({});
                                                                    }
                                                                } else {
                                                                    reject(error);
                                                                }
                                                            });
                                                        });
                                                    };

                                                    let docs: any = initfiles;
                                                    Promise.all(docs.map((doc: any): void => {
                                                        return save(doc);
                                                    })).then((results: any[]): void => {
                                                        callback(null, results);
                                                    }).catch((error: any): void => {
                                                        callback(error, null);
                                                    });
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        }).catch((error) => {
                            callback(error, null);
                        });
                    } else {
                        callback(null, null);
                    }
                }
            } catch (e) {
                callback(e, null);
            }
        }

        /**
         *
         * @returns none
         */
        public create_files(userid: string, namespace: string, initfiles: any[], callback: (error: any, result: any) => void): void {
            try {
                if (initfiles) {
                    if (initfiles.length > 0) {
                        Files.connect().then((db) => {
                            let gfs: any = new mongodb.GridFSBucket(db, {});
                            if (gfs) {
                                db.collection('fs.files', (error: any, collection: any): void => {
                                    if (!error) {
                                        if (collection) {
                                            // ensureIndex
                                            collection.createIndex({
                                                "filename": 1,
                                                "metadata.namespace": 1,
                                                "metadata.userid": 1
                                            }, (error) => {
                                                if (!error) {
                                                    let save: any = (doc: any): any => {
                                                        return new Promise((resolve: any, reject: any): void => {
                                                            let path = process.cwd() + doc.path;
                                                            let filename = doc.name;
                                                            let mimetype = doc.content.type;
                                                            let type: number = doc.type;
                                                            let query: any = {$and: [{filename: filename}, {namespace: namespace}, {"metadata.userid": userid}]};

                                                            collection.findOne(query, (error: any, item: any): void => {
                                                                if (!error) {
                                                                    if (!item) {
                                                                        Files.from_local(gfs, path, namespace, userid, type, filename, mimetype, (error: any, file: any): void => {
                                                                            if (!error) {
                                                                                resolve(file);
                                                                            } else {
                                                                                reject(error);
                                                                            }
                                                                        });
                                                                    } else {
                                                                        resolve({});
                                                                    }
                                                                } else {
                                                                    reject(error);
                                                                }
                                                            });
                                                        });
                                                    };

                                                    let docs: any = initfiles;
                                                    Promise.all(docs.map((doc: any): void => {
                                                        return save(doc);
                                                    })).then((results: any[]): void => {
                                                        callback(null, results);
                                                    }).catch((error: any): void => {
                                                        callback(error, null);
                                                    });
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        }).catch((error) => {
                            callback(error, null);
                        });
                    } else {
                        callback(null, null);
                    }
                }
            } catch (e) {
                callback(e, null);
            }
        }

        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        public get_file_query_query(request: any, response: any): void {
            try {
                let number: number = 27000;
                let userid = Files.userid(request);
                let namespace: string = Files.namespace(request);
                Files.connect().then((db) => {
                    db.collection('fs.files', (error: any, collection: any): void => {
                        if (!error) {
                            if (collection) {

                                let query: any = Wrapper.Decode(request.params.query) || {};
                                let option: any = Wrapper.Decode(request.params.option) || {};

                                let limit: number = 10;
                                if (option.limit) {
                                    limit = option.limit;
                                }

                                let skip: number = 0;
                                if (option.skip) {
                                    skip = option.skip;
                                }

                                collection.find({$and: [query, {"metadata.namespace": namespace}, {"metadata.userid": userid}]}).limit(limit).skip(skip).toArray((error: any, docs: any): void => {
                                    if (!error) {
                                        Wrapper.SendSuccess(response, docs);
                                    } else {
                                        Wrapper.SendError(response, error.code, error.message, error);
                                    }
                                });
                            } else {
                                Wrapper.SendFatal(response, number + 30, "no collection", {
                                    code: number + 30,
                                    message: "no collection"
                                });
                            }
                        } else {
                            Wrapper.SendError(response, error.code, error.message, error);
                        }
                    });
                }).catch((error) => {
                    Wrapper.SendError(response, error.code, error.message, error);
                });
            } catch (e) {

            }
        }

        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        public get_file_query_count(request: any, response: any): void {
            try {
                let number: number = 28000;
                let userid: string = Files.userid(request);
                let namespace: string = Files.namespace(request);
                Files.connect().then((db) => {
                    db.collection('fs.files', (error: any, collection: any): void => {
                        if (!error) {
                            if (collection) {
                                let query: any = Wrapper.Decode(request.params.query);
                                collection.find({$and: [query, {"metadata.namespace": namespace}, {"metadata.userid": userid}]}).count((error: any, count: any): void => {
                                    if (!error) {
                                        Wrapper.SendSuccess(response, count);
                                    } else {
                                        Wrapper.SendError(response, error.code, error.message, error);
                                    }
                                });
                            } else {
                                Wrapper.SendFatal(response, number + 30, "no collection", {
                                    code: number + 30,
                                    message: "no collection"
                                });
                            }
                        } else {
                            Wrapper.SendError(response, error.code, error.message, error);
                        }
                    });
                }).catch((error) => {
                    Wrapper.SendError(response, error.code, error.message, error);
                });
            } catch (e) {
                Wrapper.SendFatal(response, e.code, e.message, e);
            }
        }

        /**
         *
         * @param userid
         * @param callback
         */
        public namespaces(userid: string, callback: any): void {
            try {
                Files.connect().then((db) => {
                    db.collection('fs.files', (error: any, collection: any): void => {
                        if (!error) {
                            if (collection) {
                                collection.find({"metadata.userid": userid}, {"metadata.namespace": 1, "_id": 0}).toArray((error: any, docs: any): void => {
                                    if (!error) {
                                        let result: any[] = [];
                                        _.forEach(docs, (page: any) => {
                                            if (page.metadata.namespace) {
                                                result.push(page.metadata.namespace);
                                            }
                                        });
                                        callback(null, _.uniqBy(result));
                                    } else {
                                        callback(error, null);
                                    }
                                });
                            } else {
                                callback({message: "", code: 1}, null);
                            }
                        } else {
                            callback(error, null);
                        }
                    });
                }).catch((error) => {
                    callback(error, null);
                });
            } catch (e) {
                callback(e, null);
            }
        }

        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        public get_file(request: any, response: any, next: any): void {
            try {
                let namespace: string = Files.namespace(request);
                let name: string = Files.localname(request.params.name);
                let userid: string = request.params.userid;

                Files.connect().then((db) => {
                    let gfs: any = new mongodb.GridFSBucket(db, {});
                    if (gfs) {
                        db.collection('fs.files', (error: any, collection: any): void => {
                            if (!error) {
                                if (collection) {
                                    let query: any = {$and: [{filename: name}, {"metadata.namespace": namespace}, {"metadata.userid": userid}]};
                                    collection.findOne(query, (error: any, item: any): void => {
                                        if (!error) {
                                            if (item) {
                                                let readstream: any = gfs.openDownloadStream(item._id);
                                                if (readstream) {
                                                    response.setHeader('Content-Type', item.metadata.type);
                                                    readstream.on('end', (): void => {

                                                    });
                                                    readstream.on('error', (error: any): void => {

                                                    });
                                                    readstream.pipe(response);
                                                } else {
                                                    next();
                                                }
                                            } else {
                                                // NOT FOUND IMAGE.
                                                Files.result_file(db, gfs, collection, config.systems.namespace, "blank.png", config.systems.userid, response, next, () => {
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

        /**
         *
         * @param request
         * @param response
         * @param next
         * @returns none
         */
        public get_file_data_name(request: any, response: any, next: any): void {
            try {
                let namespace: string = Files.namespace(request);
                let name: string = Files.localname(request.params.name);
                let userid: string = Files.userid(request);

                let BinaryToBase64: any = (str) => {
                    return new Buffer(str, 'binary').toString('base64');
                };

                Files.connect().then((db) => {

                    let gfs: any = new mongodb.GridFSBucket(db, {});
                    if (gfs) {
                        db.collection('fs.files', (error: any, collection: any): void => {
                            if (!error) {
                                if (collection) {
                                    let query: any = {$and: [{filename: name}, {"metadata.namespace": namespace}, {"metadata.userid": userid}]};
                                    collection.findOne(query, (error: any, item: any): void => {
                                        if (!error) {
                                            if (item) {
                                                let buffer: any = new Buffer(0);
                                                let readstream: any = gfs.openDownloadStream(item._id);
                                                if (readstream) {
                                                    readstream.on("data", (chunk): void => {
                                                        buffer = Buffer.concat([buffer, new Buffer(chunk)]);
                                                    });
                                                    readstream.on('end', (): void => {
                                                        let dataurl = "data:" + item.metadata.type + ";base64," + BinaryToBase64(buffer);
                                                        Wrapper.SendSuccess(response, dataurl);
                                                    });
                                                    readstream.on('error', (error: any): void => {
                                                        Wrapper.SendError(response, error.code, error.message, error);
                                                    });
                                                } else {
                                                    Wrapper.SendError(response, 10000, "no stream", {
                                                        code: 10000,
                                                        message: "no stream"
                                                    });
                                                }
                                            } else {
                                                Wrapper.SendFatal(response, 10000, "no item", {
                                                    code: 10000,
                                                    message: "no item"
                                                });
                                            }
                                        } else {
                                            Wrapper.SendError(response, error.code, error.message, error);
                                        }
                                    });
                                } else {
                                    Wrapper.SendFatal(response, 10000, "no collection", {
                                        code: 10000,
                                        message: "no collection"
                                    });
                                }
                            } else {
                                Wrapper.SendError(response, error.code, error.message, error);
                            }
                        });
                    } else {
                        Wrapper.SendFatal(response, 10000, "no gfs", {code: 10000, message: "no gfs"});
                    }

                }).catch((error) => {
                    Wrapper.SendError(response, error.code, error.message, error);
                });
            } catch (e) {
                Wrapper.SendFatal(response, e.code, e.message, e);
            }
        }

        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        public post_file_name(request: any, response: any): void {
            try {
                let number: number = 24000;
                let namespace: string = Files.namespace(request);
                let name = Files.localname(request.params.name);
                let key = request.params.key;
                let userid = Files.userid(request);
                let username = Files.username(request);

                if (name) {
                    if (name.indexOf('/') == -1) {
                        Files.connect().then((db) => {
                            let gfs = new mongodb.GridFSBucket(db, {});
                            if (gfs) {
                                db.collection('fs.files', (error: any, collection: any): void => {
                                    if (!error) {
                                        if (collection) {
                                            let query = {$and: [{filename: name}, {"metadata.namespace": namespace}, {"metadata.userid": userid}]};
                                            collection.findOne(query, (error: any, item: any): void => {
                                                if (!error) {
                                                    if (!item) {
                                                        let parseDataURL: any = (dataURL: any): any => {
                                                            let result: any = {
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

                                                        let info: any = parseDataURL(request.body.url);
                                                        let chunk: any = info.isBase64 ? new Buffer(info.data, 'base64') : new Buffer(unescape(info.data), 'binary');

                                                        let writestream: any = gfs.openUploadStream(name,
                                                            {
                                                                metadata: {
                                                                    userid: userid,
                                                                    username: username,
                                                                    key: key * 1,
                                                                    type: Files.to_mime(request),
                                                                    namespace: namespace,
                                                                    parent: null
                                                                }
                                                            }
                                                        );
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
                                                            writestream.once('finish', (file: any): void => {
                                                                //                Files.cache_invalidate(request.url, (error) => {
                                                                //                });
                                                                Wrapper.SendSuccess(response, file);
                                                            });
                                                            writestream.write(chunk);
                                                            writestream.end();
                                                        } else {
                                                            Wrapper.SendFatal(response, number + 40, "stream not open", {
                                                                code: number + 40,
                                                                message: "stream not open"
                                                            });
                                                        }
                                                    } else {
                                                        Wrapper.SendWarn(response, number + 1, "already found", {
                                                            code: number + 1,
                                                            message: "already found"
                                                        });
                                                    }
                                                } else {
                                                    Wrapper.SendError(response, error.code, error.message, error);
                                                }
                                            });
                                        } else {
                                            Wrapper.SendFatal(response, number + 30, "no collection", {
                                                code: number + 30,
                                                message: "no collection"
                                            });
                                        }
                                    } else {
                                        Wrapper.SendError(response, error.code, error.message, error);
                                    }
                                });
                            } else {
                                Wrapper.SendFatal(response, number + 20, "no gfs", {
                                    code: number + 20,
                                    message: "no gfs"
                                });
                            }
                        }).catch((error) => {
                            Wrapper.SendError(response, error.code, error.message, error);
                        });
                    } else {
                        Wrapper.SendError(response, number + 30, "name invalid", {
                            code: number + 30,
                            message: "name invalid"
                        });
                    }
                } else {
                    Wrapper.SendWarn(response, 1, "no name", {code: 1, message: "no name"});
                }
            } catch (e) {
                Wrapper.SendFatal(response, e.code, e.message, e);
            }
        }

        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        public put_file_name(request: any, response: any): void {
            try {
                let number: number = 25000;
                let namespace: string = Files.namespace(request);
                let name = Files.localname(request.params.name);
                let key = request.params.key;
                let userid = Files.userid(request);
                let username = Files.username(request);

                let parseDataURL = (dataURL: any): any => {
                    let result: any = {
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

                Files.connect().then((db) => {
                    let gfs = new mongodb.GridFSBucket(db, {});
                    if (gfs) {
                        db.collection('fs.files', (error: any, collection: any): void => {
                            if (!error) {
                                if (collection) {
                                    let query = {$and: [{filename: name}, {"metadata.namespace": namespace}, {"metadata.userid": userid}]};
                                    collection.findOne(query, (error: any, item: any): void => {
                                        if (!error) {
                                            if (item) {
                                                collection.remove({_id: item._id}, (error) => {
                                                    if (!error) {
                                                        let info = parseDataURL(request.body.url);
                                                        let chunk = info.isBase64 ? new Buffer(info.data, 'base64') : new Buffer(unescape(info.data), 'binary');

                                                        let writestream = gfs.openUploadStream(name,
                                                            {
                                                                metadata: {
                                                                    userid: userid,
                                                                    username: username,
                                                                    key: key * 1,
                                                                    type: Files.to_mime(request),
                                                                    namespace: namespace,
                                                                    parent: null
                                                                }
                                                            }
                                                        );

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
                                                            writestream.once('finish', (file: any): void => {
                                                                Files.cache_invalidate(userid + "/" + namespace + "/doc/img/" + name);
                                                                Wrapper.SendSuccess(response, file);
                                                            });
                                                            writestream.write(chunk);
                                                            writestream.end();
                                                        } else {
                                                            Wrapper.SendFatal(response, number + 40, "stream not open", {
                                                                code: number + 40,
                                                                message: "stream not open"
                                                            });
                                                        }
                                                    }
                                                });
                                            } else {
                                                let info = parseDataURL(request.body.url);
                                                let chunk = info.isBase64 ? new Buffer(info.data, 'base64') : new Buffer(unescape(info.data), 'binary');
                                                let writestream = gfs.openUploadStream(name,
                                                    {
                                                        metadata: {
                                                            userid: userid,
                                                            username: username,
                                                            key: key * 1,
                                                            type: Files.to_mime(request),
                                                            namespace: namespace,
                                                            parent: null
                                                        }
                                                    }
                                                );

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
                                                    writestream.once('finish', (file: any): void => {
                                                        Wrapper.SendSuccess(response, file);
                                                    });
                                                    writestream.write(chunk);
                                                    writestream.end();
                                                } else {
                                                    Wrapper.SendFatal(response, number + 40, "stream not open", {
                                                        code: number + 40,
                                                        message: "stream not open"
                                                    });
                                                }

                                            }
                                        } else {
                                            Wrapper.SendError(response, error.code, error.message, error);
                                        }
                                    });
                                } else {
                                    Wrapper.SendFatal(response, number + 30, "no collection", {
                                        code: number + 30,
                                        message: "no collection"
                                    });
                                }
                            } else {
                                Wrapper.SendError(response, error.code, error.message, error);
                            }
                        });
                    } else {
                        Wrapper.SendFatal(response, number + 20, "no gfs", {code: number + 20, message: "no gfs"});
                    }
                }).catch((error) => {
                    Wrapper.SendError(response, error.code, error.message, error);
                });
            } catch (e) {
                Wrapper.SendFatal(response, e.code, e.message, e);
            }
        }

        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        public delete_file_name(request: any, response: any): void {
            try {
                let number: number = 26000;
                let namespace: string = Files.namespace(request);
                let name = Files.localname(request.params.name);
                let userid = Files.userid(request);
                Files.connect().then((db) => {
                    db.collection('fs.files', (error: any, collection: any): void => {
                        if (!error) {
                            if (collection) {
                                let query = {$and: [{filename: name}, {"metadata.namespace": namespace}, {"metadata.userid": userid}]};
                                collection.findOne(query, (error: any, item: any): void => {
                                    if (!error) {
                                        if (item) {
                                            collection.remove({_id: item._id}, (error): void => {
                                                if (!error) {
                                                    Files.cache_invalidate(userid + "/" + namespace + "/doc/img/" + name);
                                                    Wrapper.SendSuccess(response, {});
                                                } else {
                                                    Wrapper.SendError(response, error.code, error.message, error);
                                                }
                                            });
                                        } else {
                                            Wrapper.SendWarn(response, number + 1, "not found", {
                                                code: number + 1,
                                                message: "not found"
                                            });
                                        }
                                    } else {
                                        Wrapper.SendError(response, error.code, error.message, error);
                                    }
                                });
                            } else {
                                Wrapper.SendFatal(response, number + 30, "no collection", {
                                    code: number + 30,
                                    message: "no collection"
                                });
                            }
                        } else {
                            Wrapper.SendError(response, error.code, error.message, error);
                        }
                    });
                }).catch((error) => {
                    Wrapper.SendError(response, error.code, error.message, error);
                });
            } catch (e) {
                Wrapper.SendFatal(response, e.code, e.message, e);
            }
        }

        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        public delete_own(request: any, response: any): void {
            try {
                let number: number = 29000;
                let userid: string = Files.userid(request);
                Files.connect().then((db) => {
                    db.collection('fs.files', (error: any, collection: any): void => {
                        if (!error) {
                            if (collection) {
                                collection.remove({"metadata.userid": userid}, (error: any): void => {
                                    if (!error) {
                                        Wrapper.SendSuccess(response, {});
                                    } else {
                                        Wrapper.SendError(response, error.code, error.message, error);
                                    }
                                });
                            } else {
                                Wrapper.SendFatal(response, number + 30, "no collection", {
                                    code: number + 30,
                                    message: "no connection"
                                });
                            }
                        } else {
                            Wrapper.SendError(response, error.code, error.message, error);
                        }
                    });
                }).catch((error) => {
                    Wrapper.SendError(response, error.code, error.message, error);
                });
            } catch (e) {
                Wrapper.SendFatal(response, e.code, e.message, e);
            }
        }
    }

    export class TemporaryFiles {

        constructor() {

        }

        static isExistFile(path: string) {
            let result = false;
            try {
                fs.statSync(path);
                result = true;
            }
            catch (e) {
            }
            return result;
        }

        static MkdirIfNotExist(path: string, callback: (error: any) => void): void {
            if (!TemporaryFiles.isExistFile(path)) {
                fs.mkdir(path, '0777', callback);
            } else {
                callback(null);
            }
        }

        public upload(request: any, response: any): void {
            let name = request.params.filename;
            if (name) {
                if (name.indexOf('/') == -1) {
                    let parseDataURL = (dataURL: any): any => {
                        let result: any = {
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

                    TemporaryFiles.MkdirIfNotExist(tmp_path, (error: any): void => {
                        if (!error) {
                            fs.writeFile(tmp_path + tmp_file, chunk, (error: any): void => {
                                if (!error) {
                                    Wrapper.SendSuccess(response, {});
                                } else {
                                    console.log("writeFile : " + error.message);
                                    Wrapper.SendError(response, error.code, error.message, error);
                                }
                            });
                        } else {
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
        public download(request: any, response: any): void {

            let delete_folder_recursive = (path) => {
                fs.readdirSync(path).forEach((file) => {
                    let curPath = path + "/" + file;
                    if (fs.lstatSync(curPath).isDirectory()) { // recurse
                        delete_folder_recursive(curPath);
                    } else {
                        fs.unlinkSync(curPath);
                    }
                });
                fs.rmdirSync(path);
            };

            let tmp_path = '/tmp/' + request.sessionID;
            let tmp_file = '/' + request.params.filename;//  '/noname.xlsx';
            response.download(tmp_path + tmp_file, (error: any): void => {
                if (!error) {
                    fs.unlink(tmp_path + tmp_file, (error: any): void => {
                        if (!error) {
                            delete_folder_recursive(tmp_path);
                        }
                    });
                }
            });
        }
    }

}

module.exports = FileModule;