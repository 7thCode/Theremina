/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ArticleModule;
(function (ArticleModule) {
    var mongoose = require('mongoose');
    // const request = require('request-promise');
    var Schema = mongoose.Schema;
    var timestamp = require('../../systems/plugins/timestamp/timestamp');
    var userdata = require('../../systems/plugins/userdata/userdata');
    var Article = new Schema({
        from: { type: Date },
        to: { type: Date }
    });
    Article.plugin(timestamp);
    Article.plugin(userdata, {});
    Article.index({ _id: 1, userid: 1 }, { unique: true });
    Article.index({ name: 1 }, { unique: false });
    Article.method("GetContent", function (name) {
        return this.content[name];
    });
    Article.method("SetContent", function (name, value, type) {
        if (type === void 0) { type = "quoted"; }
        if (!this.content) {
            this.content = {};
        }
        this.content[name] = { value: value, type: type };
    });
    module.exports = mongoose.model('Article', Article);
})(ArticleModule = exports.ArticleModule || (exports.ArticleModule = {}));
//# sourceMappingURL=article.js.map