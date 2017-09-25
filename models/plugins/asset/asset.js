/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AssetModule;
(function (AssetModule) {
    const mongoose = require('mongoose');
    const request = require('request-promise');
    const Schema = mongoose.Schema;
    const timestamp = require('../../systems/plugins/timestamp/timestamp');
    const userdata = require('../../systems/plugins/userdata/userdata');
    const Asset = new Schema({
        from: { type: Date },
        to: { type: Date }
    });
    Asset.plugin(timestamp);
    Asset.plugin(userdata, {});
    module.exports = mongoose.model('Asset', Asset);
})(AssetModule = exports.AssetModule || (exports.AssetModule = {}));
//# sourceMappingURL=asset.js.map