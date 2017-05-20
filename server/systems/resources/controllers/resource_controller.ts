/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace ResourcesModule {

    const fs = require('graceful-fs');
    const _ = require('lodash');

    const core = require(process.cwd() + '/core');

    const share = require('../../common/share');
    const config = share.config;
    const applications_config = share.applications_config;

    const Wrapper = share.Wrapper;

    const HtmlEditModule: any = require(share.Server("systems/common/html_edit/html_edit"));

    const ResourceModel: any = require(share.Models("systems/resources/resource"));

    export class Resource {

        static userid(request: any): string {
            return request.user.userid;
        }

        /**
         * @param initresources
         * @returns none
         */
        public create_init_resources(initresources: any[]): void {
            _.forEach(initresources, (resource) => {
                let name: string = resource.name;
                let userid = resource.userid;
                let type: string = resource.type;
                let content: any = resource.content;
                Wrapper.FindOne(null, 1000, ResourceModel, {$and: [{userid: userid}, {type: type}, {name: name}]}, (response: any, page: any): void => {
                    if (!page) {
                        let page: any = new ResourceModel();
                        page.userid = userid;
                        page.name = name;
                        page.type = type;
                        page.content = content;
                        page.open = true;
                        page.save().then(() => {
                        }).catch((): void => {
                        });
                    }
                });
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public create_resource(request: any, response: any): void {
            if (request.body.name.indexOf(':') == -1) {
                const number: number = 1000;
                let userid = Resource.userid(request);
                let name = request.body.name;
                let type = request.body.type;
                let content = request.body.content;
                Wrapper.FindOne(response, number, ResourceModel, {$and: [{name: name}, {type: type}, {userid: userid}]}, (response: any, exists: any): void => {
                    if (!exists) {
                        let resource: any = new ResourceModel();
                        resource.userid = userid;
                        resource.name = name;
                        resource.type = type;
                        resource.content = content;
                        resource.open = true;
                        Wrapper.Save(response, number, resource, (response: any, object: any): void => {
                            Wrapper.SendSuccess(response, object);
                        });
                    } else {
                        Wrapper.SendWarn(response, 1, "already", {});
                    }
                });
            } else {
                Wrapper.SendError(response, 3, "resource name must not contain ':'", {});
            }
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public put_resource(request: any, response: any): void {
            const number: number = 1100;
            let userid = Resource.userid(request);
            let id = request.params.id;
            Wrapper.FindOne(response, number, ResourceModel, {$and: [{_id: id}, {userid: userid}]}, (response: any, page: any): void => {
                if (page) {
                    page.content = request.body.content;
                    page.open = true;
                    Wrapper.Save(response, number, page, (response: any): void => {
                        Wrapper.SendSuccess(response, {});
                    });
                } else {
                    Wrapper.SendWarn(response, 2, "not found", {});
                }
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public delete_resource(request: any, response: any): void {
            const number: number = 1200;
            let userid = Resource.userid(request);
            let id = request.params.id;
            Wrapper.FindOne(response, number, ResourceModel, {$and: [{_id: id}, {userid: userid}]}, (response: any, page: any): void => {
                if (page) {
                    Wrapper.Remove(response, number, page, (response: any): void => {
                        Wrapper.SendSuccess(response, {});
                    });
                } else {
                    Wrapper.SendWarn(response, 2, "not found", {});
                }
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_resource(request: any, response: any): void {
            const number: number = 1300;
            let userid = Resource.userid(request);
            let id = request.params.id;
            Wrapper.FindOne(response, number, ResourceModel, {$and: [{_id: id}, {userid: userid}]}, (response: any, page: any): void => {
                if (page) {
                    Wrapper.SendSuccess(response, page);
                } else {
                    Wrapper.SendWarn(response, 2, "not found", {});
                }
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public delete_own(request: any, response: any): void {
            const number: number = 1200;
            let userid = Resource.userid(request);
            Wrapper.Delete(response, number, ResourceModel, {userid: userid}, (response: any): void => {
                Wrapper.SendSuccess(response, {});
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_resource_query(request: any, response: any): void {
            const number: number = 1400;
            let userid = Resource.userid(request);
            let query: any = JSON.parse(decodeURIComponent(request.params.query));
            let option: any = JSON.parse(decodeURIComponent(request.params.option));
            Wrapper.Find(response, number, ResourceModel, {$and: [{userid: userid}, query]}, {}, option, (response: any, pages: any): any => {

                _.forEach(pages, (page) => {
                    if (page.content) {
                        if (page.content.resource) {
                            page.content.resource = null;
                        }
                    }
                });
                Wrapper.SendSuccess(response, pages);
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_resource_count(request: any, response: any): void {
            const number: number = 2800;
            //let userid = Resource.userid(request);
            let query: any = JSON.parse(decodeURIComponent(request.params.query));
            Wrapper.Count(response, number, ResourceModel, query, (response: any, count: any): any => {
                Wrapper.SendSuccess(response, count);
            });
        }

        /**
         * @param userid
         * @param name
         * @param record
         * @param records
         * @param callback
         * @returns none
         */
        public render(userid: string, name: string, record: any, records: any[], query: any, callback: (error: any, result: any) => void): void {

            let order = {};
            ResourceModel.findOne({$and: [{name: name}, {userid: userid}]}).then((doc: any): void => {
                if (doc) {
                    let content = doc.content;
                    if (records) {
                        switch (content.type) {
                            case "text/html":
                                let scanner = new HtmlEditModule.Scanner(userid, order);
                                scanner.ScanHtml(content.resource, record, records, 0, (error: any, resource: any): void => {
                                    if (!error) {
                                        content.resource = resource;
                                        callback(null, content);
                                    } else {
                                        callback(error, null);
                                    }
                                });
                                break;
                            case "text/css":
                            case "text/javascript":
                                callback(null, content);
                                break;
                            default:
                                callback(null, content);
                                break;
                        }
                    } else {
                        callback(null, content);
                    }
                } else {
                    callback({code: 10000, message: ""}, null);
                }
            }).catch((error: any): void => {
                callback(error, null);
            });
        }

        /**
         * @param userid
         * @param name
         * @param record
         * @param records
         * @param callback
         * @returns none
         */
        public render_fragment(userid: string, name: string, record: any, records: any[], query: any, callback: (error: any, result: any) => void): void {

            let order = {};
            ResourceModel.findOne({$and: [{name: name}, {userid: userid}]}).then((doc: any): void => {
                if (doc) {
                    let content = doc.content;
                    if (records) {
                        switch (content.type) {
                            case "text/html":
                                let scanner = new HtmlEditModule.Scanner(userid, order);
                                scanner.ScanHtmlFragment(content.resource, record, records, 0, (error: any, resource: any): void => {
                                    if (!error) {
                                        content.resource = resource;
                                        callback(null, content);
                                    } else {
                                        callback(error, null);
                                    }
                                });
                                break;
                            case "text/css":
                            case "text/javascript":
                                callback(null, content);
                                break;
                            default:
                                callback(null, content);
                                break;
                        }
                    } else {
                        callback(null, content);
                    }
                } else {
                    callback({code: 10000, message: ""}, null);
                }
            }).catch((error: any): void => {
                callback(error, null);
            });
        }

    }
}

module.exports = ResourcesModule;