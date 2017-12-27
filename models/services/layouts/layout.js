/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var LayoutModule;
(function (LayoutModule) {
    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var timestamp = require('../../systems/plugins/timestamp/timestamp');
    var userdata = require('../../systems/plugins/userdata/userdata');
    var Layout = new Schema({});
    Layout.plugin(timestamp);
    Layout.plugin(userdata, {});
    Layout.index({ name: 1, type: 1, userid: 1 }, { unique: true });
    module.exports = mongoose.model('Layout', Layout);
})(LayoutModule || (LayoutModule = {}));
//# sourceMappingURL=layout.js.map