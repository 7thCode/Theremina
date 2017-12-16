/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace ContextModule {

    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;

    const Context = new Schema({
        type: {type: String, default: "line"},
        userid:{type: String},
        context:{}
    });

    Context.index({type:1,userid: 1}, {unique: true});

    module.exports = mongoose.model('Context', Context);
}