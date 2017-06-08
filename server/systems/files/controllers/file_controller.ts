/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace FileModule {

    const _ = require('lodash');

    const fs = require('fs');

    const mongoose = require('mongoose');
    const Grid = require('gridfs-stream');

    const share = require(process.cwd() + '/server/systems/common/share');
    const config = share.config;
    const Wrapper = share.Wrapper;
    const logger = share.logger;

    const result = require(share.Server('systems/common/result'));

    export class Files {

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

        static connect(user): any {
            let result = null;
            if (user) {
                result = mongoose.createConnection("mongodb://" + config.db.user + ":" + config.db.password + "@" + config.db.address + "/" + config.db.name);
            } else {
                result = mongoose.createConnection("mongodb://" + config.db.address + "/" + config.db.name);
            }
            return result;
        }

        static namespace(name: string): string {
            let result = "";
            if (name) {
                let names = name.split(":");
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

        static localname(name: string): string {
            let result = "";
            if (name) {
                let names = name.split(":");
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

        static from_local(gfs: any, path_from: string, namespace: string, name: string, mimetype: string, callback: (error: any, file: any) => void): void {
            try {
                let writestream = gfs.createWriteStream({
                    filename: name,
                    metadata: {
                        userid: config.systems.userid,
                        key: 0,
                        type: mimetype,
                        namespace: namespace,
                        parent: null
                    }
                });

                let readstream = fs.createReadStream(path_from + '/' + name, {encoding: null, bufferSize: 1});

                readstream.pipe(writestream);

                writestream.on('data', function (chunk) {

                });

                writestream.on('end', function (filen) {
                    callback(null, filen);
                });

                writestream.on('error', function (error) {
                    callback(error, null);
                });

            } catch (e) {
            }
        }

        static result_file(conn, gfs, collection, namespace, name, userid, response, next, not_found: () => void) {
            collection.findOne({$and: [{filename: name}, {"metadata.namespace": namespace}, {"metadata.userid": userid}]}, (error: any, item: any): void => {
                if (!error) {
                    if (item) {
                        let readstream = gfs.createReadStream({_id: item._id});
                        if (readstream) {
                            response.setHeader('Content-Type', item.metadata.type);
                            readstream.pipe(response);
                            readstream.on('close', (): void => {
                                conn.db.close();
                            });
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
         * @returns none
         */
        public create_init_files(): void {
            let conn = Files.connect(config.db.user);
            if (conn) {
                conn.once('open', (error: any): void => {
                    if (!error) {
                        let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                        if (gfs) {
                            conn.db.collection('fs.files', (error: any, collection: any): void => {
                                if (!error) {
                                    if (collection) {
                                        collection.ensureIndex({
                                            "filename": 1,
                                            "metadata.namespace": 1,
                                            "metadata.userid": 1
                                        }, (error) => {
                                            if (!error) {
                                                let save = (doc: any): any => {
                                                    return new Promise((resolve: any, reject: any): void => {
                                                        let path = process.cwd() + '/public/systems/files/files/';
                                                        let filename = doc.filename;
                                                        let mimetype = doc.mimetype;
                                                        let query = {};
                                                        if (config.structured) {
                                                            query = {$and: [{filename: filename}, {"metadata.namespace": ""}, {"metadata.userid": config.systems.userid}]};
                                                        } else {
                                                            query = {$and: [{filename: filename}, {"metadata.userid": config.systems.userid}]};
                                                        }
                                                        collection.findOne(query, (error: any, item: any): void => {
                                                            if (!error) {
                                                                if (!item) {
                                                                    Files.from_local(gfs, path, "", filename, mimetype, (error: any, file: any): void => {
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

                                                let docs = config.initfiles;
                                                Promise.all(docs.map((doc: any): void => {
                                                    return save(doc);
                                                })).then((results: any[]): void => {
                                                    conn.db.close();
                                                }).catch((error: any): void => {
                                                    conn.db.close();
                                                });
                                            }
                                        });
                                    } else {
                                        conn.db.close();
                                    }
                                } else {
                                    conn.db.close();
                                }
                            });
                        } else {
                            conn.db.close();
                        }
                    } else {
                        conn.db.close();
                    }
                });
            }
        }

        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        public get_file_query_query(request: any, response: any): void {
            let number: number = 27000;
            let conn = Files.connect(config.db.user);
            let userid = Files.userid(request);
            //  let username = Files.username(request);

            if (conn) {
                conn.once('open', (error: any): void => {
                    if (!error) {
                        let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                        if (gfs) {
                            conn.db.collection('fs.files', (error: any, collection: any): void => {
                                if (!error) {
                                    if (collection) {
                                        //         let query: any = JSON.parse(decodeURIComponent(request.params.query));
                                        //         let option: any = JSON.parse(decodeURIComponent(request.params.option));

                                        let query: any = Wrapper.Decode(request.params.query);
                                        let option: any = Wrapper.Decode(request.params.option);

                                        let limit = 10;
                                        if (option.limit) {
                                            limit = option.limit;
                                        }

                                        let skip = 0;
                                        if (option.skip) {
                                            skip = option.skip;
                                        }

                                        collection.find({$and: [query, {"metadata.userid": userid}]}).limit(limit).skip(skip).toArray((error: any, docs: any): void => {
                                            if (!error) {
                                                conn.db.close();
                                                Wrapper.SendSuccess(response, docs);
                                            } else {
                                                conn.db.close();
                                                Wrapper.SendError(response, error.code, error.message, error);
                                            }
                                        });
                                    } else {
                                        conn.db.close();
                                        Wrapper.SendFatal(response, number + 30, "no collection", {
                                            code: number + 30,
                                            message: "no collection"
                                        });
                                    }
                                } else {
                                    conn.db.close();
                                    Wrapper.SendError(response, error.code, error.message, error);
                                }
                            });
                        } else {
                            conn.db.close();
                            Wrapper.SendFatal(response, number + 20, "gfs error", {
                                code: number + 20,
                                message: "gfs error"
                            });
                        }
                    } else {
                        conn.db.close();
                        Wrapper.SendError(response, error.code, error.message, error);
                    }
                });
            } else {
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
        public get_file_query_count(request: any, response: any): void {
            let number: number = 28000;
            let conn = Files.connect(config.db.user);
            let userid = Files.userid(request);
            //let username = Files.username(request);

            if (conn) {
                conn.once('open', (error: any): void => {
                    if (!error) {
                        let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                        if (gfs) {
                            conn.db.collection('fs.files', (error: any, collection: any): void => {
                                if (!error) {
                                    if (collection) {
                                        //                     let query: any = JSON.parse(decodeURIComponent(request.params.query));
                                        let query: any = Wrapper.Decode(request.params.query);

                                        collection.find({$and: [query, {"metadata.userid": userid}]}).count((error: any, count: any): void => {
                                            if (!error) {
                                                conn.db.close();
                                                Wrapper.SendSuccess(response, count);
                                            } else {
                                                conn.db.close();
                                                Wrapper.SendError(response, error.code, error.message, error);
                                            }
                                        });
                                    } else {
                                        conn.db.close();
                                        Wrapper.SendFatal(response, number + 30, "no collection", {
                                            code: number + 30,
                                            message: "no collection"
                                        });
                                    }
                                } else {
                                    conn.db.close();
                                    Wrapper.SendError(response, error.code, error.message, error);
                                }
                            });
                        } else {
                            conn.db.close();
                            Wrapper.SendFatal(response, number + 20, "gfs error", {
                                code: number + 20,
                                message: "gfs error"
                            });
                        }
                    } else {
                        conn.db.close();
                        Wrapper.SendError(response, error.code, error.message, error);
                    }
                });
            } else {
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
        public get_file_name(request: any, response: any, next: any): void {
            try {
                let conn = Files.connect(config.db.user);
                let namespace = Files.namespace(request.params.name);
                let name = Files.localname(request.params.name);
                let userid = request.params.userid;

                conn.once('open', (error: any): void => {
                    if (!error) {
                        let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                        if (gfs) {
                            conn.db.collection('fs.files', (error: any, collection: any): void => {
                                if (!error) {
                                    if (collection) {
                                        //        let query = {$and: [{filename: name}, {"metadata.namespace": namespace}, {"metadata.userid": userid}]};
                                        //    let query = {$and: [{filename: name},  {"metadata.userid": userid}]};

                                        let query = {};
                                        if (config.structured) {
                                            query = {$and: [{filename: name}, {"metadata.namespace": namespace}, {"metadata.userid": userid}]};
                                        } else {
                                            query = {$and: [{filename: name}, {"metadata.userid": userid}]};
                                        }

                                        collection.findOne(query, (error: any, item: any): void => {
                                            if (!error) {
                                                if (item) {
                                                    let readstream = gfs.createReadStream({_id: item._id});
                                                    if (readstream) {
                                                        response.setHeader('Content-Type', item.metadata.type);
                                                        readstream.pipe(response);
                                                        readstream.on('close', (): void => {
                                                            conn.db.close();
                                                        });
                                                    } else {
                                                        conn.db.close();
                                                        next();
                                                    }
                                                } else {
                                                    // NOT FOUND IMAGE.
                                                    Files.result_file(conn, gfs, collection, "", "blank.png", config.systems.userid, response, next, () => {
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

        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        public post_file_name(request: any, response: any): void {
            let number: number = 24000;
            let conn = Files.connect(config.db.user);
            let namespace = Files.namespace(request.params.name);
            let name = Files.localname(request.params.name);
            let key = request.params.key;
            let userid = Files.userid(request);
            let username = Files.username(request);

            if (name) {
                if (name.indexOf('/') == -1) {
                    if (conn) {
                        conn.once('open', (error: any): void => {
                            if (!error) {
                                let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                                if (gfs) {
                                    conn.db.collection('fs.files', (error: any, collection: any): void => {
                                        if (!error) {
                                            if (collection) {
                                                //       let query = {$and: [{filename: name}, {"metadata.userid": userid}]};
                                                //        let query = {$and: [{filename: name}, {"metadata.namespace": namespace}, {"metadata.userid": userid}]};


                                                let query = {};
                                                if (config.structured) {
                                                    query = {$and: [{filename: name}, {"metadata.namespace": namespace}, {"metadata.userid": userid}]};
                                                } else {
                                                    query = {$and: [{filename: name}, {"metadata.userid": userid}]};
                                                }

                                                collection.findOne(query, (error: any, item: any): void => {
                                                    if (!error) {
                                                        if (!item) {
                                                            let parseDataURL = (dataURL: any): any => {
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
                                                                writestream.on('close', (file: any): void => {
                                                                    conn.db.close();
                                                                    Wrapper.SendSuccess(response, file);
                                                                });
                                                                writestream.end();
                                                            } else {
                                                                conn.db.close();
                                                                Wrapper.SendFatal(response, number + 40, "stream not open", {
                                                                    code: number + 40,
                                                                    message: "stream not open"
                                                                });
                                                            }
                                                        } else {
                                                            conn.db.close();
                                                            Wrapper.SendWarn(response, number + 1, "already found", {
                                                                code: number + 1,
                                                                message: "already found"
                                                            });
                                                        }
                                                    } else {
                                                        conn.db.close();
                                                        Wrapper.SendError(response, error.code, error.message, error);
                                                    }
                                                });
                                            } else {
                                                conn.db.close();
                                                Wrapper.SendFatal(response, number + 30, "no collection", {
                                                    code: number + 30,
                                                    message: "no collection"
                                                });
                                            }
                                        } else {
                                            conn.db.close();
                                            Wrapper.SendError(response, error.code, error.message, error);
                                        }
                                    });
                                } else {
                                    conn.db.close();
                                    Wrapper.SendFatal(response, number + 20, "no gfs", {
                                        code: number + 20,
                                        message: "no gfs"
                                    });
                                }
                            } else {
                                conn.db.close();
                                Wrapper.SendError(response, error.code, error.message, error);
                            }
                        });
                    } else {
                        Wrapper.SendError(response, number + 10, "connection error", {
                            code: number + 10,
                            message: "connection error"
                        });
                    }
                } else {
                    Wrapper.SendError(response, number + 30, "name invalid", {
                        code: number + 30,
                        message: "name invalid"
                    });
                }
            } else {
                Wrapper.SendWarn(response, 1, "no name", {code: 1, message: "no name"});
            }
        }

        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        public put_file_name(request: any, response: any): void {
            let number: number = 25000;
            let conn = Files.connect(config.db.user);
            let namespace = Files.namespace(request.params.name);
            let name = Files.localname(request.params.name);
            let key = request.params.key;
            let userid = Files.userid(request);
            let username = Files.username(request);

            let parseDataURL = (dataURL: any): any => {
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
                conn.once('open', (error: any): void => {
                    if (!error) {
                        let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                        if (gfs) {
                            conn.db.collection('fs.files', (error: any, collection: any): void => {
                                if (!error) {
                                    if (collection) {
                                        //  let query = {$and: [{filename: name}, {"metadata.userid": userid}]};
                                        //        let query = {$and: [{filename: name}, {"metadata.namespace": namespace}, {"metadata.userid": userid}]};

                                        let query = {};
                                        if (config.structured) {
                                            query = {$and: [{filename: name}, {"metadata.namespace": namespace}, {"metadata.userid": userid}]};
                                        } else {
                                            query = {$and: [{filename: name}, {"metadata.userid": userid}]};
                                        }
                                        collection.findOne(query, (error: any, item: any): void => {
                                            if (!error) {
                                                if (item) {
                                                    collection.remove({_id: item._id}, (error) => {
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
                                                                writestream.on('close', (file: any): void => {
                                                                    conn.db.close();
                                                                    Wrapper.SendSuccess(response, file);
                                                                });
                                                                writestream.end();
                                                            } else {
                                                                conn.db.close();
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
                                                        writestream.on('close', (file: any): void => {
                                                            conn.db.close();
                                                            Wrapper.SendSuccess(response, file);
                                                        });
                                                        writestream.end();
                                                    } else {
                                                        conn.db.close();
                                                        Wrapper.SendFatal(response, number + 40, "stream not open", {
                                                            code: number + 40,
                                                            message: "stream not open"
                                                        });
                                                    }

                                                }
                                            } else {
                                                conn.db.close();
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
                                    conn.db.close();
                                    Wrapper.SendError(response, error.code, error.message, error);
                                }
                            });
                        } else {
                            conn.db.close();
                            Wrapper.SendFatal(response, number + 20, "no gfs", {code: number + 20, message: "no gfs"});
                        }
                    } else {
                        conn.db.close();
                        Wrapper.SendError(response, error.code, error.message, error);
                    }
                });
            } else {
                Wrapper.SendError(response, number + 10, "connection error", {
                    code: number + 10,
                    message: "connection error"
                });
            }
        }

        /*
         public put_file_name(request: any, response: any): void {
         let number: number = 25000;
         let conn = Files.connect(config.db.user);
         let name = request.params.name;
         let key = request.params.key;
         let userid = Files.userid(request);
         let username = Files.username(request);

         if (conn) {
         conn.once('open', (error: any): void => {
         if (!error) {
         let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
         if (gfs) {
         conn.db.collection('fs.files', (error: any, collection: any): void => {
         if (!error) {
         if (collection) {
         collection.findOne({$and: [{filename: name}, {"metadata.userid": userid}]}, (error: any, item: any): void => {
         if (!error) {
         if (item) {
         collection.remove({filename: name, metadata: {userid: userid, type: Files.to_mime(request)}}, () => {
         let parseDataURL = (dataURL: any): any => {
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
         let writestream = gfs.createWriteStream({filename: name,username: username, metadata: {userid: userid, key: key * 1, type: Files.to_mime(request), parent:null}});
         if (writestream) {
         writestream.write(chunk);
         writestream.on('close', (file: any): void => {
         conn.db.close();
         Wrapper.SendSuccess(response, file);
         });
         writestream.end();
         } else {
         conn.db.close();
         Wrapper.SendFatal(response, number + 40, "stream not open", {});
         }
         });
         } else {
         conn.db.close();
         Wrapper.SendWarn(response, number + 1, "not found", {});
         }
         } else {
         conn.db.close();
         Wrapper.SendError(response, number + 100, error.message, error);
         }
         });
         } else {
         Wrapper.SendFatal(response, number + 30, "no collection", {});
         }
         } else {
         conn.db.close();
         Wrapper.SendError(response, number + 100, error.message, error);
         }
         });
         } else {
         conn.db.close();
         Wrapper.SendFatal(response, number + 20, "no gfs", {});
         }
         } else {
         conn.db.close();
         Wrapper.SendError(response, number + 100, error.message, error);
         }
         });
         } else {
         Wrapper.SendError(response, number + 10, "connection error", {});
         }
         }
         */

        /**
         *
         * @param request
         * @param response
         * @returns none
         */
        public delete_file_name(request: any, response: any): void {
            let number: number = 26000;
            let conn = Files.connect(config.db.user);
            let namespace = Files.namespace(request.params.name);
            let name = Files.localname(request.params.name);

            //let key = request.params.key;
            let userid = Files.userid(request);
            //let username = Files.username(request);

            if (conn) {
                conn.once('open', (error: any): void => {
                    if (!error) {
                        let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                        if (gfs) {
                            conn.db.collection('fs.files', (error: any, collection: any): void => {
                                if (!error) {
                                    if (collection) {
                                        //let query = {$and: [{filename: name}, {"metadata.userid": userid}]};
                                        //        let query = {$and: [{filename: name}, {"metadata.namespace": namespace}, {"metadata.userid": userid}]};

                                        let query = {};
                                        if (config.structured) {
                                            query = {$and: [{filename: name}, {"metadata.namespace": namespace}, {"metadata.userid": userid}]};
                                        } else {
                                            query = {$and: [{filename: name}, {"metadata.userid": userid}]};
                                        }
                                        collection.findOne(query, (error: any, item: any): void => {
                                            if (!error) {
                                                if (item) {
                                                    collection.remove({_id: item._id}, (error): void => {
                                                        if (!error) {
                                                            conn.db.close();
                                                            Wrapper.SendSuccess(response, {});
                                                        } else {
                                                            conn.db.close();
                                                            Wrapper.SendError(response, error.code, error.message, error);
                                                        }
                                                    });
                                                } else {
                                                    conn.db.close();
                                                    Wrapper.SendWarn(response, number + 1, "not found", {
                                                        code: number + 1,
                                                        message: "not found"
                                                    });
                                                }
                                            } else {
                                                conn.db.close();
                                                Wrapper.SendError(response, error.code, error.message, error);
                                            }
                                        });
                                    } else {
                                        conn.db.close();
                                        Wrapper.SendFatal(response, number + 30, "no collection", {
                                            code: number + 30,
                                            message: "no collection"
                                        });
                                    }
                                } else {
                                    conn.db.close();
                                    Wrapper.SendError(response, error.code, error.message, error);
                                }
                            });
                        } else {
                            conn.db.close();
                            Wrapper.SendFatal(response, number + 20, "gfs error", {
                                code: number + 20,
                                message: "gfs error"
                            });
                        }
                    } else {
                        conn.db.close();
                        Wrapper.SendError(response, error.code, error.message, error);
                    }
                });
            } else {
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
        public delete_own(request: any, response: any): void {
            let number: number = 29000;
            let conn: any = Files.connect(config.db.user);
            let userid: string = Files.userid(request);
            //let username = Files.username(request);

            if (conn) {
                conn.once('open', (error: any): void => {
                    if (!error) {
                        let gfs = Grid(conn.db, mongoose.mongo); //missing parameter
                        if (gfs) {
                            conn.db.collection('fs.files', (error: any, collection: any): void => {
                                if (!error) {
                                    if (collection) {
                                        collection.remove({"metadata.userid": userid}, (error: any): void => {
                                            if (!error) {
                                                conn.db.close();
                                                Wrapper.SendSuccess(response, {});
                                            } else {
                                                conn.db.close();
                                                Wrapper.SendError(response, error.code, error.message, error);
                                            }
                                        });
                                    } else {
                                        conn.db.close();
                                        Wrapper.SendFatal(response, number + 30, "no collection", {
                                            code: number + 30,
                                            message: "no connection"
                                        });
                                    }
                                } else {
                                    conn.db.close();
                                    Wrapper.SendError(response, error.code, error.message, error);
                                }
                            });
                        } else {
                            conn.db.close();
                            Wrapper.SendFatal(response, number + 20, "gfs error", {
                                code: number + 20,
                                message: "gfs error"
                            });
                        }
                    } else {
                        conn.db.close();
                        Wrapper.SendError(response, error.code, error.message, error);
                    }
                });
            } else {
                Wrapper.SendError(response, number + 10, "connection error", {
                    code: number + 10,
                    message: "connection error"
                });
            }
        }
    }
}

module.exports = FileModule;