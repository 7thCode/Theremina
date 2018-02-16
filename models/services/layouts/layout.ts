/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace LayoutModule {
    const mongoose: any = require('mongoose');
    const Schema = mongoose.Schema;
    const timestamp: any = require('../../systems/plugins/timestamp/timestamp');
    const userdata: any = require('../../systems/plugins/userdata/userdata');

    const Layout: any = new Schema({});

    Layout.plugin(timestamp);
    Layout.plugin(userdata, {});

    Layout.index({namespace: 1, name: 1, type: 1, userid: 1}, {unique: true});

    module.exports = mongoose.model('Layout', Layout);
}