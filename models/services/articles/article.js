/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ArticleModule;
(function (ArticleModule) {
    const mongoose = require('mongoose');
    const request = require('request-promise');
    const Schema = mongoose.Schema;
    const timestamp = require('../../systems/plugins/timestamp/timestamp');
    const userdata = require('../../systems/plugins/userdata/userdata');
    const Article = new Schema({
        from: { type: Date },
        to: { type: Date }
    });
    Article.plugin(timestamp);
    Article.plugin(userdata, {});
    Article.index({ _id: 1, userid: 1 }, { unique: true, index: true });
    Article.index({ name: 1 }, { unique: true, index: true });
    Article.method("GetContent", function (name) {
        return this.content[name];
    });
    Article.method("SetContent", function (name, value, type = "quoted") {
        if (!this.content) {
            this.content = {};
        }
        this.content[name] = { value: value, type: type };
    });
    module.exports = mongoose.model('Article', Article);
})(ArticleModule = exports.ArticleModule || (exports.ArticleModule = {}));
//# sourceMappingURL=article.js.map