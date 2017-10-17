/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace NamespsceModule {

    const _ = require('lodash');

    const mongodb: any = require('mongodb');
    const mongoose: any = require('mongoose');
    mongoose.Promise = global.Promise;

    const archiver: any = require('archiver');

    const sharp = require("sharp");

    const core: any = require(process.cwd() + '/gs');
    const share: any = core.share;
    const Wrapper: any = share.Wrapper;

    const validator: any = require('validator');

    const FileModule: any = require(share.Server("systems/files/controllers/file_controller"));
    const file: any = new FileModule.Files();

    const ResourcesModule = require(share.Server("systems/resources/controllers/resource_controller"));
    const resource = new ResourcesModule.Resource;

    export class Namespsces {

        static userid(request): string {
            return request.user.userid;
        }

        public namespaces(request: any, response: any): void {
            let userid = Namespsces.userid(request);
            file.namespaces(userid, (error, files_namespaces): void => {
                if (!error) {
                    resource.namespaces(userid, (error, resource_namespaces): void => {
                        if (!error) {
                            Wrapper.SendSuccess(response, _.uniq(_.union(files_namespaces, resource_namespaces)));
                        } else {
                            Wrapper.SendError(response, 200, error.message, error);
                        }
                    });
                } else {
                    Wrapper.SendError(response, 200, error.message, error);
                }
            });
        }

    }

}

module.exports = NamespsceModule;