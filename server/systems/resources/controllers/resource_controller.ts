/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace ResourcesModule {

    const fs = require('graceful-fs');
    const _ = require('lodash');

    const share = require('../../common/share');
    const config = share.config;
    const applications_config = share.applications_config;

    const Wrapper = share.Wrapper;

    const ScannerBehaviorModule: any = require(share.Server("systems/common/html_scanner/scanner_behavior"));
    const HtmlScannerModule: any = require(share.Server("systems/common/html_scanner/html_scanner"));

    const ResourceModel: any = require(share.Models("systems/resources/resource"));

    const ArticleModel: any = require(share.Models("services/articles/article"));

    const LocalAccount: any = require(share.Models("systems/accounts/account"));

    export class Resource {

        static userid(request: any): string {
            return request.user.userid;
        }

        static namespace(name: string): string {
            let result = "";
            if (name) {
                let names = name.split("#");
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
                let names = name.split("#");
                names.forEach((name, index) => {
                    if (index == (names.length - 1)) {
                        result = name;
                    }
                })
            }
            return result;
        }

        static make_query(structured: boolean, userid: any, type: any, localname: any, namespace: any) {
            let query = {};
            if (structured) {
                query = {$and: [{userid: userid}, {type: type}, {status: 1}, {open: true}, {name: localname}, {namespace: namespace}]};
            } else {
                query = {$and: [{userid: userid}, {type: type}, {status: 1}, {open: true}, {name: localname}]};
            }
            return query;
        }

        /**
         * @param initresources
         * @returns none
         */
        public create_init_resources(initresources: any[], callback: (error: any, result: any) => void): void {
            if (initresources) {
                if (initresources.length > 0) {
                    let save = (doc: any): any => {
                        return new Promise((resolve: any, reject: any): void => {

                            let filename = process.cwd() + doc.path + '/' + doc.name;
                            let namespace: string = Resource.namespace(doc.name);
                            let localname: string = Resource.localname(doc.name);
                            let userid = doc.userid;
                            let type: string = doc.type;
                            let content: any = doc.content;

                            Wrapper.FindOne(null, 1000, ResourceModel, Resource.make_query(config.structured, userid, type, localname, namespace), (response: any, page: any): void => {
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
                                        reject(e);
                                    }
                                    page.content = {type: content.type, resource: resource};
                                    page.open = true;
                                    page.save().then(() => {
                                        resolve({});
                                    }).catch((error): void => {
                                        reject(error);
                                    });
                                } else {
                                    page.remove().then(() => {
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
                                            reject(e);
                                        }
                                        page.content = {type: content.type, resource: resource};
                                        page.open = true;
                                        page.save().then(() => {
                                            resolve({});
                                        }).catch((error): void => {
                                            reject(error);
                                        });
                                    }).catch((error: any): void => {
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
                        callback(null, results);
                    }).catch((error: any): void => {
                        callback(error, null);
                    });
                } else {
                    callback(null, null);
                }
            }

        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public create_resource(request: { body: { name: string, type: string, content: { resource: any, type: any } } }, response: any): void {
            if (request.body.name) {
                const number: number = 1000;
                let userid: string = Resource.userid(request);
                let namespace: string = Resource.namespace(request.body.name);
                let localname: string = Resource.localname(request.body.name);
                let type: string = request.body.type;
                let content: { resource: any, type: any } = request.body.content;
                if (localname.indexOf('/') == -1) {
                    Wrapper.FindOne(response, number, ResourceModel, Resource.make_query(config.structured, userid, type, localname, namespace), (response: any, exists: any): void => {
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

                            resource.content = {resource: page, type: content.type};
                            resource.open = true;
                            Wrapper.Save(response, number, resource, (response: any, object: any): void => {
                                Wrapper.SendSuccess(response, object);
                            });
                        } else {
                            Wrapper.SendWarn(response, 1, "already", {code: 1, message: "already"});
                        }
                    });
                } else {
                    Wrapper.SendError(response, 3, "resource name must not contain ':'", {
                        code: 3,
                        message: "resource name must not contain ':'"
                    });
                }
            } else {
                Wrapper.SendError(response, 2, "no form name", {code: 2, message: "no form name"});
            }
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public create_savepoint(request: { body: { name: string, type: string, content: { resource: any, type: any } } }, response: any): void {
            if (request.body.name) {
                const number: number = 1000;
                let userid: string = Resource.userid(request);
                let namespace: string = Resource.namespace(request.body.name);
                let localname: string = Resource.localname(request.body.name);
                let type: string = request.body.type;
                let content: { resource: any, type: any } = request.body.content;
                if (localname.indexOf('/') == -1) {
                    Wrapper.FindOne(response, number, ResourceModel, Resource.make_query(config.structured, userid, type, localname, namespace), (response: any, exists: any): void => {
                        if (exists) {
                            Wrapper.Count(response, number, ResourceModel, Resource.make_query(config.structured, userid, type, localname, namespace), (response: any, count: any): any => {

                                let resource: any = new ResourceModel();
                                resource.userid = userid;
                                resource.namespace = namespace;
                                resource.name = localname;
                                resource.type = type;
                                resource.version = count;

                                let page = "";
                                if (content.resource) {
                                    page = content.resource;
                                }

                                resource.content = {resource: page, type: content.type};
                                resource.open = true;
                                Wrapper.Save(response, number, resource, (response: any, object: any): void => {
                                    Wrapper.SendSuccess(response, object);
                                });

                            });
                        } else {
                            Wrapper.SendWarn(response, 1, "not exist", {code: 1, message: "not exist"});
                        }
                    });
                } else {
                    Wrapper.SendError(response, 3, "resource name must not contain ':'", {
                        code: 3,
                        message: "resource name must not contain ':'"
                    });
                }
            } else {
                Wrapper.SendError(response, 2, "no form name", {code: 2, message: "no form name"});
            }
        }


        /**
         * @param request
         * @param response
         * @returns none
         */
        public put_resource(request: { params: { id: string }, body: { name: string, type: string, content: { resource: any, type: any } } }, response: any): void {
            const number: number = 1100;
            let userid: string = Resource.userid(request);
            let id: string = request.params.id;
            Wrapper.FindOne(response, number, ResourceModel, {$and: [{_id: id}, {userid: userid}]}, (response: any, page: any): void => {
                if (page) {
                    page.content = request.body.content;
                    page.open = true;
                    Wrapper.Save(response, number, page, (response: any): void => {
                        Wrapper.SendSuccess(response, {});
                    });
                } else {
                    Wrapper.SendWarn(response, 2, "not found", {code: 2, message: "not found"});
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
            let userid: string = Resource.userid(request);
            let id: string = request.params.id;
            Wrapper.FindOne(response, number, ResourceModel, {$and: [{_id: id}, {userid: userid}]}, (response: any, page: any): void => {
                if (page) {
                    Wrapper.Remove(response, number, page, (response: any): void => {
                        Wrapper.SendSuccess(response, {});
                    });
                } else {
                    Wrapper.SendWarn(response, 2, "not found", {code: 2, message: "not found"});
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
            let userid: string = Resource.userid(request);
            let id: string = request.params.id;
            Wrapper.FindOne(response, number, ResourceModel, {$and: [{_id: id}, {userid: userid}]}, (response: any, page: any): void => {
                if (page) {
                    Wrapper.SendSuccess(response, page);
                } else {
                    Wrapper.SendWarn(response, 2, "not found", {code: 2, message: "not found"});
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
            let userid: string = Resource.userid(request);
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
            let userid: string = Resource.userid(request);
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
            let userid: string = Resource.userid(request);
            let query: any = Wrapper.Decode(request.params.query);

            Wrapper.Count(response, number, ResourceModel, {$and: [{userid: userid}, query]}, (response: any, count: any): any => {
                Wrapper.SendSuccess(response, count);
            });
        }

    }

    const mongoose: any = require('mongoose');
    mongoose.Promise = global.Promise;

    export class Pages {

        static connect(user:any): any {
            let result = null;
            const options = {useMongoClient: true, keepAlive: 300000, connectTimeoutMS: 1000000};
            if (user) {
                result = mongoose.createConnection("mongodb://" + config.db.user + ":" + config.db.password + "@" + config.db.address + "/" + config.db.name, options);
            } else {
                result = mongoose.createConnection("mongodb://" + config.db.address + "/" + config.db.name, options);
            }
            return result;
        }

        static userid(request:{user:{userid:string}}): string {
            return request.user.userid;
        }

        public render_html(request: { params: { userid: string, page: string }, query: any }, callback: (error: {code:number,message:string}, result: any) => void): void {
            let userid: string = request.params.userid;
            let page_name: string = request.params.page;
            let params: any = request.query;
            ResourceModel.findOne({$and: [{name: page_name}, {userid: userid}]}).then((doc: any): void => {
                if (doc) {
                    let content = doc.content.resource;
                    let datasource = new ScannerBehaviorModule.CustomBehavior(page_name, page_name, userid, params, true, {
                        "Default": ArticleModel,
                        "Account": LocalAccount,
                        "Article": ArticleModel
                    });
                    let query = datasource.ToQueryFormat();
                    let page_datasource = datasource.GetDatasource(query, null);
                    let page_count = datasource.GetCount(query, null);
                    let page_init = {name: "#init", promise: page_datasource, count: page_count, resolved: ""};
                    HtmlScannerModule.Builder.Build(content, datasource, page_init, config, (error: any, result: any): void => {
                        if (!error) {
                            callback(null, {content: result, type: doc.content.type})
                        } else {
                            callback({code: 10000, message: error.message}, null);
                        }
                    });
                } else {
                    callback({code: 10000, message: "page not found."}, null);
                }
            }).catch((error: any): void => {
                callback(error, null);
            });
        }

        public render_fragment(request: { params: { userid: string, parent: string, page: string }, query: any }, callback: (error: any, result: any) => void): void {
            let userid: string = request.params.userid;
            let parent_page_name: string = request.params.parent;
            let page_name: string = request.params.page;
            let params: any = request.query;
            ResourceModel.findOne({$and: [{name: page_name}, {userid: userid}]}).then((doc: any): void => {
                if (doc) {
                    let content = doc.content.resource;
                    let datasource = new ScannerBehaviorModule.CustomBehavior(parent_page_name, page_name, userid, params, false, {
                        "Default": ArticleModel,
                        "Account": LocalAccount,
                        "Article": ArticleModel
                    });
                    let query = datasource.ToQueryFormat();
                    let page_datasource = datasource.GetDatasource(query, null);
                    let page_count = datasource.GetCount(query, null);
                    let page_init = {name: "#init", promise: page_datasource, count: page_count, resolved: ""};
                    HtmlScannerModule.Builder.Build(content, datasource, page_init, config, (error: any, result: any): void => {
                        if (!error) {
                            callback(null, {content: result, type: doc.content.type})
                        } else {
                            callback({code: 10000, message: error.message}, null);
                        }
                    });
                } else {
                    callback({code: 10000, message: "fragment not found."}, null);
                }
            }).catch((error: any): void => {
                callback(error, null);
            });
        }

        public render_direct(request: { params: any }, callback: (error: {code:number,message:string}, result: any) => void): void {
            let userid: string = request.params.userid;
            let page_name: string = request.params.page;
            ResourceModel.findOne({$and: [{name: page_name}, {userid: userid}]}).then((doc: any): void => {
                if (doc) {
                    callback(null, {content: doc.content.resource, type: doc.content.type})
                } else {
                    callback({code: 10000, message: "not found."}, null);
                }
            }).catch((error: any): void => {
                callback(error, null);
            });
        }

        public render_object(userid: string, page_name: string, object:any, callback: (error: {code:number,message:string}, result: any) => void): void {
            ResourceModel.findOne({$and: [{userid: userid}, {name: page_name}]}).then((doc: any): void => {
                if (doc) {
                    let datasource = new ScannerBehaviorModule.CustomBehavior(page_name, page_name, userid, null, true, {});
                    HtmlScannerModule.Builder.Resolve(doc.content.resource, datasource, object, (error: {code:number,message:string}, result: string):void => {
                        if (!error) {
                            callback(null, {content: result, type: "text/html"})
                        } else {
                            callback({code: error.code, message: error.message}, null);
                        }
                    });
                } else {
                    callback({code: 10000, message: "not found."}, null);
                }
            }).catch((error: any): void => {
                callback(error, null);
            });

        }
    }

}

module.exports = ResourcesModule;