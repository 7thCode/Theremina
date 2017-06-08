/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace ArticleModule {
    const mongoose = require('mongoose');
    const request = require('request-promise');
    const Schema = mongoose.Schema;
    const timestamp: any = require('../../systems/plugins/timestamp/timestamp');
    const userdata: any = require('../../systems/plugins/userdata/userdata');

    const Article = new Schema({
        version: {type: Number, default: 1},
        status: {type: Number, default: 10},
        from: {type: Date},
        to: {type: Date}
    });

    Article.plugin(timestamp);
    Article.plugin(userdata, {});

    Article.method("GetContent", function (name: string): void {
        return this.content[name];
    });

    Article.method("SetContent", function (name: string, value: any, type: string = "quoted"): void {

        if (!this.content) {
            this.content = {};
        }

        this.content[name] = {value: value, type: type};
    });

    module.exports = mongoose.model('Article', Article);
}