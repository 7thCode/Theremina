/**
 Copyright (c) 2017 7thCode.
 This software is released under the MIT License.
 http://opensource.org/licenses/mit-license.php
 */

"use strict";

namespace DataSource {

    const mongoose: any = require("mongoose");
    mongoose.Promise = global.Promise;
    const Article: any = require("../articles/article");

    const DataSource = new mongoose.Schema({});

    DataSource.static("find", function (query: any) {
        this.query = query;
        return this;
    });

    DataSource.static("limit", function (limit: any) {
        this.limit = limit;
        return this;
    });

    DataSource.static("skip", function (skip: any) {
        this.skip = skip;
        return this;
    });

    DataSource.static("sort", function (sort: any) {
        this.sort = sort;
        return this;
    });

    DataSource.static("exec", function () {
        let result_promise = Article.find(this.query).limit(this.limit).skip(this.skip).sort(this.sort).exec();
        return result_promise
    });


    module.exports = mongoose.model("DataSource", DataSource);
}