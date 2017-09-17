/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var GroupModule;
(function (GroupModule) {
    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;
    const timestamp = require('../../systems/plugins/timestamp/timestamp');
    const userdata = require('../../systems/plugins/userdata/userdata');
    const Group = new Schema({});
    Group.plugin(timestamp);
    Group.plugin(userdata, {});
    module.exports = mongoose.model('Group', Group);
})(GroupModule || (GroupModule = {}));
//# sourceMappingURL=group.js.map