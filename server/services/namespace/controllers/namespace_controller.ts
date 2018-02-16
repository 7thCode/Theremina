/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace NamespsceModule {

    const _: any = require('lodash');

    const mongoose: any = require('mongoose');
    mongoose.Promise = global.Promise;

    const core: any = require(process.cwd() + '/gs');
    const share: any = core.share;
    const Wrapper: any = share.Wrapper;

    const FileModule: any = require(share.Server("systems/files/controllers/file_controller"));
    const file: any = new FileModule.Files();

    const ResourcesModule: any = require(share.Server("systems/resources/controllers/resource_controller"));
    const resource: any = new ResourcesModule.Resource;

    const LayoutModule: any = require(share.Server("services/layouts/controllers/layouts_controller"));
    const layout: any = new LayoutModule.Layout;

    const ArticlesModule: any = require(share.Server("services/articles/controllers/article_controller"));
    const Article: any = new ArticlesModule.Article;

    export class Namespsces {

        static userid(request): string {
            return request.user.userid;
        }

        public namespaces(request: any, response: any): void {
            let userid: string = Namespsces.userid(request);
            file.namespaces(userid, (error, files_namespaces): void => {
                if (!error) {
                    resource.namespaces(userid, (error, resource_namespaces): void => {
                        if (!error) {
                            layout.namespaces(userid, (error, layout_namespaces): void => {
                                if (!error) {
                                    Article.namespaces(userid, (error, articles_namespaces): void => {
                                        if (!error) {
                                            Wrapper.SendSuccess(response, _.uniq(_.union(files_namespaces, resource_namespaces, layout_namespaces, articles_namespaces)));
                                        } else {
                                            Wrapper.SendError(response, 200, error.message, error);
                                        }
                                    });
                                } else {
                                    Wrapper.SendError(response, 200, error.message, error);
                                }
                            });
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
