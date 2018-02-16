/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace AssetModule {

    const mongoose: any = require('mongoose');
    //   const request = require('request-promise');
    const Schema: any = mongoose.Schema;
    const timestamp: any = require('../../systems/plugins/timestamp/timestamp');
    const userdata: any = require('../../systems/plugins/userdata/userdata');

    const Asset = new Schema({
        from: {type: Date},
        to: {type: Date}
    });

    Asset.plugin(timestamp);
    Asset.plugin(userdata, {});

    module.exports = mongoose.model('Asset', Asset);
}