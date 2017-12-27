/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var ResourceModule;
(function (ResourceModule) {
    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var timestamp = require('../../systems/plugins/timestamp/timestamp');
    var userdata = require('../../systems/plugins/userdata/userdata');
    var Resource = new Schema({});
    Resource.plugin(timestamp);
    Resource.plugin(userdata, {});
    Resource.index({ namespace: 1, name: 1, userid: 1, type: 1, status: 1, version: 1 }, { unique: true });
    module.exports = mongoose.model('Resource', Resource);
})(ResourceModule || (ResourceModule = {}));
//# sourceMappingURL=resource.js.map