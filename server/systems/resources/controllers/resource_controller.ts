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

        static namespace(name: string): string {
            let result = "";
            if (name) {
                let names = name.split(":");
                let delimmiter = "";
                names.forEach((name, index) => {
                    if (index < (names.length - 1)) {
                        result += delimmiter + name;
                        delimmiter = ":";
                    }
                })
            }
            return result;
        }

        static localname(name: string): string {
            let result = "";
            if (name) {
                let names = name.split(":");
                names.forEach((name, index) => {
                    if (index == (names.length - 1)) {
                        result = name;
                    }
                })
            }
            return result;
        }

        /**
         * @param initresources
         * @returns none
         */
        public create_init_resources(initresources:any[]): void {

            let save = (doc: any): any => {
                return new Promise((resolve: any, reject: any): void => {
                    let path = process.cwd() + '/public/systems/resources/files/';
                    let filename = path + '/' + doc.path + '/' + doc.name;
                    let namespace: string = Resource.namespace(doc.name);
                    let localname: string = Resource.localname(doc.name);
                    let userid = doc.userid;
                    let type: string = doc.type;
                    let content: any = doc.content;
                    let query = {};
                    if (config.structured) {
                        query = {$and: [{userid: userid}, {type: type}, {namespace: namespace}, {name: localname}]};
                    } else {
                        query = {$and: [{userid: userid}, {type: type},  {name: localname}]};
                    }

                    Wrapper.FindOne(null, 1000, ResourceModel, query, (response: any, page: any): void => {
                        if (!page) {
                            let page: any = new ResourceModel();
                            page.userid = userid;
                            page.namespace = namespace;
                            page.name = localname;
                            page.type = type;
                            let resource = "";
                            try {
                                fs.statSync(filename);
                                resource = fs.readFileSync(filename, 'utf-8');
                            } catch (e) {

                            }
                            page.content = {type:content.type,resource:resource};
                            page.open = true;
                            page.save().then(() => {
                                resolve({});
                            }).catch((error): void => {
                                reject(error);
                            });
                        }
                    });
                })
            };

            let docs = initresources;
            Promise.all(docs.map((doc: any): void => {
                return save(doc);
            })).then((results: any[]): void => {

            }).catch((error: any): void => {

            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public create_resource(request: any, response: any): void {
            if (request.body.name) {
                const number: number = 1000;
                let userid = Resource.userid(request);
                let namespace:string = Resource.namespace(request.body.name);
                let localname: string = Resource.localname(request.body.name);
                let type = request.body.type;
                let content = request.body.content;
                if (localname.indexOf('/') == -1) {
                    Wrapper.FindOne(response, number, ResourceModel, {$and: [{name: localname},{namespace:namespace}, {type: type}, {userid: userid}]}, (response: any, exists: any): void => {
                        if (!exists) {
                            let resource: any = new ResourceModel();
                            resource.userid = userid;
                            resource.namespace = namespace;
                            resource.name = localname;
                            resource.type = type;

                            let page = "";
                            if (content.resource) {
                                page = content.resource;
                            }

                            resource.content = {resource : page, type : content.type};
                            //       resource.content = content;
                            resource.open = true;
                            Wrapper.Save(response, number, resource, (response: any, object: any): void => {
                                Wrapper.SendSuccess(response, object);
                            });
                        } else {
                            Wrapper.SendWarn(response, 1, "already", {code:1, message: "already"});
                        }
                    });
                } else {
                    Wrapper.SendError(response, 3, "resource name must not contain ':'", {code:3, message: "resource name must not contain ':'"});
                }
            } else {
                Wrapper.SendError(response, 2, "no form name", {code:2, message: "no form name"});
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
                    Wrapper.SendWarn(response, 2, "not found", {code:2, message:"not found"});
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
                    Wrapper.SendWarn(response, 2, "not found", {code:2, message:"not found"});
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
                    Wrapper.SendWarn(response, 2, "not found", {code:2, message:"not found"});
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
            //  let query: any = JSON.parse(decodeURIComponent(request.params.query));
            //  let option: any = JSON.parse(decodeURIComponent(request.params.option));

            let query: any = Wrapper.Decode(request.params.query);
            let option: any = Wrapper.Decode(request.params.option);

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
            //let query: any = JSON.parse(decodeURIComponent(request.params.query));
            let query: any = Wrapper.Decode(request.params.query);

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

            let namespace:string = Resource.namespace(name);
            let localname: string = Resource.localname(name);

            let _query = {};
            if (config.structured) {
                _query = {$and: [{name: localname}, {namespace: namespace}, {userid: userid}]};
            } else {
                _query = {$and: [{name: localname}, {userid: userid}]};
            }

            let order = {};
            ResourceModel.findOne(_query).then((doc: any): void => {
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

            let namespace:string = Resource.namespace(name);
            let localname: string = Resource.localname(name);

            let _query = {};
            if (config.structured) {
                _query = {$and: [{name: localname}, {namespace: namespace}, {userid: userid}]};
            } else {
                _query = {$and: [{name: localname}, {userid: userid}]};
            }

            let order = {};
            ResourceModel.findOne(_query).then((doc: any): void => {
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