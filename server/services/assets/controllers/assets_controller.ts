/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace AssetsModule {

    const _ = require('lodash');

    //const mongodb: any = require('mongodb');
    const mongoose: any = require('mongoose');
    mongoose.Promise = global.Promise;

    const core: any = require(process.cwd() + '/gs');
    const share: any = core.share;
    const config: any = share.config;
    const Wrapper: any = share.Wrapper;

    const AssetModel: any = require(share.Models("plugins/asset/asset"));

    //  const validator: any = require('validator');

    export class Asset {

        constructor() {

        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public create(request: any, response: any): void {
            let article: any = new AssetModel();
            article.userid = config.systems.userid;  // Article.userid(request);
            let objectid: any = new mongoose.Types.ObjectId;
            article.name = objectid.toString();
            article.type = 10002;
            article.content = request.body.content;
            article.open = true;
            Wrapper.Save(response, 1000, article, (response: any, object: any): void => {
                Wrapper.SendSuccess(response, object);
            });
        }
    }

}

module.exports = AssetsModule;
