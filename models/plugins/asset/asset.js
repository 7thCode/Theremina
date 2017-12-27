/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AssetModule;
(function (AssetModule) {
    var mongoose = require('mongoose');
    var request = require('request-promise');
    var Schema = mongoose.Schema;
    var timestamp = require('../../systems/plugins/timestamp/timestamp');
    var userdata = require('../../systems/plugins/userdata/userdata');
    var Asset = new Schema({
        from: { type: Date },
        to: { type: Date }
    });
    Asset.plugin(timestamp);
    Asset.plugin(userdata, {});
    module.exports = mongoose.model('Asset', Asset);
})(AssetModule = exports.AssetModule || (exports.AssetModule = {}));
//# sourceMappingURL=asset.js.map