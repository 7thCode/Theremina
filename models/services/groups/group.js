/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var GroupModule;
(function (GroupModule) {
    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var timestamp = require('../../systems/plugins/timestamp/timestamp');
    var userdata = require('../../systems/plugins/userdata/userdata');
    var Group = new Schema({});
    Group.plugin(timestamp);
    Group.plugin(userdata, {});
    module.exports = mongoose.model('Group', Group);
})(GroupModule || (GroupModule = {}));
//# sourceMappingURL=group.js.map