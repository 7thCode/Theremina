/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var ResourceModule;
(function (ResourceModule) {
    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;
    const timestamp = require('../../systems/plugins/timestamp/timestamp');
    const userdata = require('../../systems/plugins/userdata/userdata');
    const Resource = new Schema({});
    Resource.plugin(timestamp);
    Resource.plugin(userdata, {});
    Resource.index({ namespace: 1, name: 1, userid: 1, type: 1, status: 1, version: 1 }, { unique: true, index: true });
    module.exports = mongoose.model('Resource', Resource);
})(ResourceModule || (ResourceModule = {}));
//# sourceMappingURL=resource.js.map