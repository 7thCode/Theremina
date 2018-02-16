/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

//import {Pages} from "../../../services/pages/controllers/pages_controller";

//import {Files} from "../../files/controllers/file_controller";

export namespace ResourcesModule {

    const _: any = require('lodash');
    const fs: any = require('graceful-fs');

    const share: any = require('../../common/share');
    const config: any = share.config;
    const event: any = share.Event;

    const applications_config: any = share.applications_config;

    const Wrapper: any = share.Wrapper;

    const ScannerBehaviorModule: any = require(share.Server("systems/common/html_scanner/scanner_behavior"));
    const HtmlScannerModule: any = require(share.Server("systems/common/html_scanner/html_scanner"));

    const ResourceModel: any = require(share.Models("systems/resources/resource"));

    const ArticleModel: any = require(share.Models("services/articles/article"));

    const LocalAccount: any = require(share.Models("systems/accounts/account"));

    export class Resource {

        static userid(request: any): string {
            return request.user.userid;
        }

        static namespace(request: any): string {
            let result: string = "";
            if (request.user) {
                if (request.user.data) {
                    result = request.user.data.namespace;
                }
            }
            return result;
        }


        static localname(name: string): string {
            let result: string = "";
            if (name) {
                let names = name.split("#");
                names.forEach((name, index) => {
                    if (index == (names.length - 1)) {
                        result = name;
                    }
                });
            }
            return result;
        }

        static make_query(userid: any, type: any, localname: any, namespace: any) {
            return {$and: [{namespace: namespace}, {userid: userid}, {type: type}, {status: 1}, {open: true}, {name: localname}]};
        }

        static cache_write(path: string[], content: string): void {
            event.emitter.emit("cache_write", {path: path, string: content});
        };

        static cache_invalidate(path: string): void {
            event.emitter.emit("cache_invalidate", {path: path});
        };

        /**
         * @param initresources
         * @returns none
         */
        public create_init_resources(userid: string, initresources: any[], callback: (error: any, result: any) => void): void {
            if (initresources) {
                if (initresources.length > 0) {
                    let save = (doc: any): any => {
                        return new Promise((resolve: any, reject: any): void => {

                            let filename = process.cwd() + doc.path + '/' + doc.name;
                            let namespace: string = doc.namespace;// Resource.namespace(doc.name);
                            let localname: string = Resource.localname(doc.name);
                            let type: string = doc.type;
                            let content: any = doc.content;

                            Wrapper.FindOne(null, 1000, ResourceModel, Resource.make_query(userid, type, localname, namespace), (response: any, page: any): void => {
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
                                    resolve({});
                                }

                                /*      else {
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
                                      }*/
                            });
                        });
                    };
                    let docs: any = initresources;
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
         * @param initresources
         * @returns none
         */
        public create_resources(userid: string, namespace: string, initresources: any[], callback: (error: any, result: any) => void): void {
            if (initresources) {
                if (initresources.length > 0) {
                    let save = (doc: any): any => {
                        return new Promise((resolve: any, reject: any): void => {

                            let filename: string = process.cwd() + doc.path + '/' + doc.name;
                            //    let namespace: string = doc.namespace;// Resource.namespace(doc.name);
                            let localname: string = Resource.localname(doc.name);
                            let type: string = doc.type;
                            let content: any = doc.content;

                            Wrapper.FindOne(null, 1000, ResourceModel, Resource.make_query(userid, type, localname, namespace), (response: any, page: any): void => {
                                if (!page) {
                                    let page: any = new ResourceModel();
                                    page.userid = userid;
                                    page.namespace = namespace;
                                    page.name = localname;
                                    page.type = type;
                                    let resource: string = "";
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
                                    resolve({});
                                }

                                /*      else {
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
                                      }*/
                            });
                        });
                    };
                    let docs: any = initresources;
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
                let namespace: string = Resource.namespace(request);
                let localname: string = Resource.localname(request.body.name);
                let type: string = request.body.type;
                let content: { resource: any, type: any } = request.body.content;
                if (localname.indexOf('/') == -1) {
                    Wrapper.FindOne(response, number, ResourceModel, Resource.make_query(userid, type, localname, namespace), (response: any, exists: any): void => {
                        if (!exists) {
                            let resource: any = new ResourceModel();
                            resource.userid = userid;
                            resource.namespace = namespace;
                            resource.name = localname;
                            resource.type = type;

                            let page: string = "";
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
        public put_resource(request: { params: { id: string }, body: { name: string, type: string, content: { resource: any, type: any } } }, response: Express.Response): void {
            const number: number = 1100;
            let userid: string = Resource.userid(request);
            let namespace: string = Resource.namespace(request);
            let id: string = request.params.id;
            Wrapper.FindOne(response, number, ResourceModel, {$and: [{_id: id}, {namespace: namespace}, {userid: userid}]}, (response: any, page: any): void => {
                if (page) {
                    page.content = request.body.content;
                    page.open = true;
                    let name = page.name;
                    Wrapper.Save(response, number, page, (response: any): void => {
                        Resource.cache_invalidate(userid + "/" + namespace);
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
        public delete_resource(request: any, response: Express.Response): void {
            const number: number = 1200;
            let userid: string = Resource.userid(request);
            let namespace: string = Resource.namespace(request);
            let id: string = request.params.id;
            Wrapper.FindOne(response, number, ResourceModel, {$and: [{_id: id}, {namespace: namespace}, {userid: userid}]}, (response: any, page: any): void => {
                if (page) {
                    let name = page.name;
                    Wrapper.Remove(response, number, page, (response: any): void => {
                        Resource.cache_invalidate(userid + "/" + namespace);
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
        public get_resource(request: any, response: Express.Response): void {
            const number: number = 1300;
            let userid: string = Resource.userid(request);
            let namespace: string = Resource.namespace(request);
            let id: string = request.params.id;
            Wrapper.FindOne(response, number, ResourceModel, {$and: [{_id: id}, {namespace: namespace}, {userid: userid}]}, (response: any, page: any): void => {
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
        public delete_own(request: any, response: Express.Response): void {
            const number: number = 1200;
            let userid: string = Resource.userid(request);
            Wrapper.Delete(response, number, ResourceModel, {userid: userid}, (response: Express.Response): void => {
                Wrapper.SendSuccess(response, {});
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_resource_query(request: any, response: Express.Response): void {
            const number: number = 1400;
            let userid: string = Resource.userid(request);
            let namespace: string = Resource.namespace(request);
            let query: any = Wrapper.Decode(request.params.query);
            let option: any = Wrapper.Decode(request.params.option);
            Wrapper.Find(response, number, ResourceModel, {$and: [{namespace: namespace}, {userid: userid}, query]}, {}, option, (response: any, pages: any): any => {
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
            let namespace: string = Resource.namespace(request);
            let query: any = Wrapper.Decode(request.params.query);

            Wrapper.Count(response, number, ResourceModel, {$and: [{namespace: namespace}, {userid: userid}, query]}, (response: any, count: any): any => {
                Wrapper.SendSuccess(response, count);
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public namespaces(userid: string, callback: any): void {
            const number: number = 1400;
            ResourceModel.find({userid: userid}, {"namespace": 1, "_id": 0}, {}).then((pages: any): void => {
                let result: string[] = [];
                _.forEach(pages, (page) => {
                    if (page.namespace) {
                        result.push(page.namespace);
                    }
                });
                callback(null, _.uniqBy(result));
            }).catch((error: any): void => {
                callback(error, null);
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_all_mimetypes(request: any, response: any): void {
            const number: number = 2800;
            let userid: string = Resource.userid(request);
            let namespace: string = Resource.namespace(request);
            ResourceModel.find({$and: [{namespace: namespace}, {userid: userid}]}, {
                "content.type": 1,
                "_id": 0
            }, {}).then((pages: any): void => {
                let result: string[] = [];
                _.forEach(pages, (page) => {
                    if (page.content.type) {
                        result.push(page.content.type);
                    }
                });
                Wrapper.SendSuccess(response, _.uniqBy(result));
            }).catch((error: any): void => {
                Wrapper.SendError(response, 2, "mimetype", error);
            });
        }

    }

    const mongoose: any = require('mongoose');
    mongoose.Promise = global.Promise;

    export class Pages {

        //static connect(callback: (error, db) => void): any {
        //     MongoClient.connect("mongodb://" + config.db.user + ":" + config.db.password + "@" + config.db.address + "/" + config.db.name, callback);
        // }

        static userid(request: { user: { userid: string } }): string {
            return request.user.userid;
        }

        static retrieve_account(userid, callback: (error: { code: number, message: string } | null, result: any) => void) {
            LocalAccount.findOne({username: userid}).then((account: any): void => {
                callback(null, account);
            }).catch((error: any): void => {
                callback(error, null);
            });
        }

        public render_html(request: { params: { userid: string, page: string, namespace: string }, query: any }, callback: (error: { code: number, message: string } | null, result: any) => void): void {
            let userid: string = request.params.userid;
            let namespace: string = request.params.namespace;
            Pages.retrieve_account(userid, (error, account) => {
                if (!error) {
                    if (account) {
                        userid = account.userid;
                    }
                    let page_name: string = request.params.page;
                    let params: any = request.query;
                    ResourceModel.findOne({$and: [{name: page_name}, {namespace: namespace}, {userid: userid}, {type: 20}]}).then((doc: any): void => {
                        if (doc) {
                            let content: any = doc.content.resource;
                            let datasource: any = new ScannerBehaviorModule.CustomBehavior(page_name, page_name, userid, namespace, params, true, {
                                "Default": ArticleModel,
                                "Article": ArticleModel
                            });
                            let query: any = datasource.ToQueryFormat();
                            let page_datasource: any = datasource.GetDatasource(query, null);
                            let page_count: number = datasource.GetCount(query, null);
                            let page_init: any = {
                                name: "#init",
                                promise: page_datasource,
                                count: page_count,
                                resolved: ""
                            };
                            HtmlScannerModule.Builder.Build(content, datasource, page_init, config, (error: any, result: any): void => {
                                if (!error) {
                                    //              cache_write(request.url, result);
                                    callback(null, {content: result, type: doc.content.type});
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
                } else {
                    callback(error, null);
                }
            });
        }

        public render_fragment(request: { params: { userid: string, parent: string, page: string, namespace: string }, query: any }, callback: (error: any, result: any) => void): void {
            let userid: string = request.params.userid;
            let namespace: string = request.params.namespace;
            Pages.retrieve_account(userid, (error, account) => {
                if (!error) {
                    if (account) {
                        userid = account.userid;
                    }
                    let parent_page_name: string = request.params.parent;
                    let page_name: string = request.params.page;
                    let params: any = request.query;
                    ResourceModel.findOne({$and: [{name: page_name}, {userid: userid}, {namespace: namespace}, {type: 20}]}).then((doc: any): void => {
                        if (doc) {
                            let content: any = doc.content.resource;
                            let datasource: any = new ScannerBehaviorModule.CustomBehavior(parent_page_name, page_name, userid, namespace, params, false, {
                                "Default": ArticleModel,
                                //      "Account": LocalAccount,
                                "Article": ArticleModel
                            });
                            let query: any = datasource.ToQueryFormat();
                            let page_datasource: any = datasource.GetDatasource(query, null);
                            let page_count: number = datasource.GetCount(query, null);
                            let page_init: any = {
                                name: "#init",
                                promise: page_datasource,
                                count: page_count,
                                resolved: ""
                            };
                            HtmlScannerModule.Builder.Build(content, datasource, page_init, config, (error: any, result: any): void => {
                                if (!error) {
                                    callback(null, {content: result, type: doc.content.type});
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
                } else {
                    callback(error, null);
                }
            });
        }

        public render_direct(request: { params: { userid: string, page: string, namespace: string } }, sub_path: string[], callback: (error: { code: number, message: string } | null, result: any) => void): void {
            let userid: string = request.params.userid;
            let namespace: string = request.params.namespace;
            Pages.retrieve_account(userid, (error, account) => {
                if (!error) {
                    if (account) {
                        userid = account.userid;
                    }
                    let page_name: string = request.params.page;
                    ResourceModel.findOne({$and: [{name: page_name}, {namespace: namespace}, {userid: userid}, {type: 20}]}).then((doc: any): void => {
                        if (doc) {

                            let path: string[] = [];
                            path.push(userid);
                            path.push(namespace);
                            sub_path.forEach(path_name => {
                                path.push(path_name);
                            });
                            path.push(page_name);

                            Resource.cache_write(path, doc.content.resource);
                            callback(null, {content: doc.content.resource, type: doc.content.type});
                        } else {
                            callback({code: 10000, message: "not found."}, null);
                        }
                    }).catch((error: any): void => {
                        callback(error, null);
                    });
                } else {
                    callback(error, null);
                }
            });
        }

        public render_object(userid: string, page_name: string, object: any, callback: (error: { code: number, message: string } | null, result: any) => void): void {
            let namespace: string = "";
            ResourceModel.findOne({$and: [{userid: userid}, {namespace: namespace}, {name: page_name}, {type: 20}]}).then((doc: any): void => {
                if (doc) {
                    let datasource = new ScannerBehaviorModule.CustomBehavior(page_name, page_name, userid, namespace, null, true, {});
                    HtmlScannerModule.Builder.Resolve(doc.content.resource, datasource, object, (error: { code: number, message: string }, result: string): void => {
                        if (!error) {
                            callback(null, {content: result, type: "text/html"});
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