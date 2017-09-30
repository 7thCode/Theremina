/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace FileModule {

    const Mongoose = require('mongoose');
    const Schema = Mongoose.Schema;

    const options = {useMongoClient: true, keepAlive: 300000, connectTimeoutMS: 1000000};
    const mongoose = Mongoose.connect("mongodb://localhost/blog0_1", options);


    const File = new Schema({
        filename: {type: String},
        contentType: {type: String},
        length: {type: Number},
        md5: {type: String},
        uploadDate: {type: Date},
        metadata: Schema.Types.Mixed
    }, {strict: false});

    File.static("writeStream", function (filename:string, options:any):any {
        let bucket = new Mongoose.mongo.GridFSBucket(mongoose.connection.db);
        return bucket.openUploadStream(filename, options);
    });

    File.method("readStream", function ():any {
        let bucket = new Mongoose.mongo.GridFSBucket(mongoose.connection.db);
        return bucket.openDownloadStream(this._id);
    });

    File.method("unlink", function (callback:(error:any) => void):void {
        let bucket = new Mongoose.mongo.GridFSBucket(mongoose.connection.db);
        bucket.delete(this._id, function (err) {
            callback(err);
        });
    });

    module.exports = Mongoose.model('File', File, 'fs.files');
}