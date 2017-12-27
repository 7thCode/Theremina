/**
 Copyright (c) 2017 7thCode.
 This software is released under the MIT License.
 http://opensource.org/licenses/mit-license.php
 */
"use strict";
var DataSource;
(function (DataSource_1) {
    var mongoose = require("mongoose");
    mongoose.Promise = global.Promise;
    var Article = require("../articles/article");
    var DataSource = new mongoose.Schema({});
    DataSource.static("find", function (query) {
        this.query = query;
        return this;
    });
    DataSource.static("limit", function (limit) {
        this.limit = limit;
        return this;
    });
    DataSource.static("skip", function (skip) {
        this.skip = skip;
        return this;
    });
    DataSource.static("sort", function (sort) {
        this.sort = sort;
        return this;
    });
    DataSource.static("exec", function () {
        var result_promise = Article.find(this.query).limit(this.limit).skip(this.skip).sort(this.sort).exec();
        return result_promise;
    });
    module.exports = mongoose.model("DataSource", DataSource);
})(DataSource || (DataSource = {}));
//# sourceMappingURL=datasource.js.map