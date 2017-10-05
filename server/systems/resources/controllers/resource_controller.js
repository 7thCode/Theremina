/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ResourcesModule;
(function (ResourcesModule) {
    const fs = require('graceful-fs');
    const _ = require('lodash');
    const share = require('../../common/share');
    const config = share.config;
    const applications_config = share.applications_config;
    const Wrapper = share.Wrapper;
    const ScannerBehaviorModule = require(share.Server("systems/common/html_scanner/scanner_behavior"));
    const HtmlScannerModule = require(share.Server("systems/common/html_scanner/html_scanner"));
    const ResourceModel = require(share.Models("systems/resources/resource"));
    const ArticleModel = require(share.Models("services/articles/article"));
    const LocalAccount = require(share.Models("systems/accounts/account"));
    class Resource {
        static userid(request) {
            return request.user.userid;
        }
        static namespace(request) {
            let result = "";
            if (request.user.data) {
                result = request.user.data.namespace;
            }
            return result;
        }
        /*
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
        }*/
        static localname(name) {
            let result = "";
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
        static make_query(userid, type, localname, namespace) {
            return { $and: [{ namespace: namespace }, { userid: userid }, { type: type }, { status: 1 }, { open: true }, { name: localname }] };
        }
        /**
         * @param initresources
         * @returns none
         */
        create_init_resources(userid, initresources, callback) {
            if (initresources) {
                if (initresources.length > 0) {
                    let save = (doc) => {
                        return new Promise((resolve, reject) => {
                            let filename = process.cwd() + doc.path + '/' + doc.name;
                            let namespace = doc.namespace; // Resource.namespace(doc.name);
                            let localname = Resource.localname(doc.name);
                            let type = doc.type;
                            let content = doc.content;
                            Wrapper.FindOne(null, 1000, ResourceModel, Resource.make_query(userid, type, localname, namespace), (response, page) => {
                                if (!page) {
                                    let page = new ResourceModel();
                                    page.userid = userid;
                                    page.namespace = namespace;
                                    page.name = localname;
                                    page.type = type;
                                    let resource = "";
                                    try {
                                        fs.statSync(filename);
                                        resource = fs.readFileSync(filename, 'utf-8');
                                    }
                                    catch (e) {
                                        reject(e);
                                    }
                                    page.content = { type: content.type, resource: resource };
                                    page.open = true;
                                    page.save().then(() => {
                                        resolve({});
                                    }).catch((error) => {
                                        reject(error);
                                    });
                                }
                                else {
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
                    let docs = initresources;
                    Promise.all(docs.map((doc) => {
                        return save(doc);
                    })).then((results) => {
                        callback(null, results);
                    }).catch((error) => {
                        callback(error, null);
                    });
                }
                else {
                    callback(null, null);
                }
            }
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        create_resource(request, response) {
            if (request.body.name) {
                const number = 1000;
                let userid = Resource.userid(request);
                let namespace = Resource.namespace(request);
                let localname = Resource.localname(request.body.name);
                let type = request.body.type;
                let content = request.body.content;
                if (localname.indexOf('/') == -1) {
                    Wrapper.FindOne(response, number, ResourceModel, Resource.make_query(userid, type, localname, namespace), (response, exists) => {
                        if (!exists) {
                            let resource = new ResourceModel();
                            resource.userid = userid;
                            resource.namespace = namespace;
                            resource.name = localname;
                            resource.type = type;
                            let page = "";
                            if (content.resource) {
                                page = content.resource;
                            }
                            resource.content = { resource: page, type: content.type };
                            resource.open = true;
                            Wrapper.Save(response, number, resource, (response, object) => {
                                Wrapper.SendSuccess(response, object);
                            });
                        }
                        else {
                            Wrapper.SendWarn(response, 1, "already", { code: 1, message: "already" });
                        }
                    });
                }
                else {
                    Wrapper.SendError(response, 3, "resource name must not contain ':'", {
                        code: 3,
                        message: "resource name must not contain ':'"
                    });
                }
            }
            else {
                Wrapper.SendError(response, 2, "no form name", { code: 2, message: "no form name" });
            }
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        put_resource(request, response) {
            const number = 1100;
            let userid = Resource.userid(request);
            let namespace = Resource.namespace(request);
            let id = request.params.id;
            Wrapper.FindOne(response, number, ResourceModel, { $and: [{ _id: id }, { namespace: namespace }, { userid: userid }] }, (response, page) => {
                if (page) {
                    page.content = request.body.content;
                    page.open = true;
                    Wrapper.Save(response, number, page, (response) => {
                        Wrapper.SendSuccess(response, {});
                    });
                }
                else {
                    Wrapper.SendWarn(response, 2, "not found", { code: 2, message: "not found" });
                }
            });
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        delete_resource(request, response) {
            const number = 1200;
            let userid = Resource.userid(request);
            let namespace = Resource.namespace(request);
            let id = request.params.id;
            Wrapper.FindOne(response, number, ResourceModel, { $and: [{ _id: id }, { namespace: namespace }, { userid: userid }] }, (response, page) => {
                if (page) {
                    Wrapper.Remove(response, number, page, (response) => {
                        Wrapper.SendSuccess(response, {});
                    });
                }
                else {
                    Wrapper.SendWarn(response, 2, "not found", { code: 2, message: "not found" });
                }
            });
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        get_resource(request, response) {
            const number = 1300;
            let userid = Resource.userid(request);
            let namespace = Resource.namespace(request);
            let id = request.params.id;
            Wrapper.FindOne(response, number, ResourceModel, { $and: [{ _id: id }, { namespace: namespace }, { userid: userid }] }, (response, page) => {
                if (page) {
                    Wrapper.SendSuccess(response, page);
                }
                else {
                    Wrapper.SendWarn(response, 2, "not found", { code: 2, message: "not found" });
                }
            });
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        delete_own(request, response) {
            const number = 1200;
            let userid = Resource.userid(request);
            Wrapper.Delete(response, number, ResourceModel, { userid: userid }, (response) => {
                Wrapper.SendSuccess(response, {});
            });
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        get_resource_query(request, response) {
            const number = 1400;
            let userid = Resource.userid(request);
            let namespace = Resource.namespace(request);
            let query = Wrapper.Decode(request.params.query);
            let option = Wrapper.Decode(request.params.option);
            Wrapper.Find(response, number, ResourceModel, { $and: [{ namespace: namespace }, { userid: userid }, query] }, {}, option, (response, pages) => {
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
        get_resource_count(request, response) {
            const number = 2800;
            let userid = Resource.userid(request);
            let namespace = Resource.namespace(request);
            let query = Wrapper.Decode(request.params.query);
            Wrapper.Count(response, number, ResourceModel, { $and: [{ namespace: namespace }, { userid: userid }, query] }, (response, count) => {
                Wrapper.SendSuccess(response, count);
            });
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        namespaces(userid, callback) {
            const number = 1400;
            ResourceModel.find({ userid: userid }, { "namespace": 1, "_id": 0 }, {}).then((pages) => {
                let result = [];
                _.forEach(pages, (page) => {
                    if (page.namespace) {
                        result.push(page.namespace);
                    }
                });
                callback(null, _.uniqBy(result));
            }).catch((error) => {
                callback(error, null);
            });
        }
    }
    ResourcesModule.Resource = Resource;
    const mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    class Pages {
        static connect(user) {
            let result = null;
            const options = { useMongoClient: true, keepAlive: 300000, connectTimeoutMS: 1000000 };
            if (user) {
                result = mongoose.createConnection("mongodb://" + config.db.user + ":" + config.db.password + "@" + config.db.address + "/" + config.db.name, options);
            }
            else {
                result = mongoose.createConnection("mongodb://" + config.db.address + "/" + config.db.name, options);
            }
            return result;
        }
        static userid(request) {
            return request.user.userid;
        }
        static retrieve_account(userid, callback) {
            LocalAccount.findOne({ username: userid }).then((account) => {
                callback(null, account);
            }).catch((error) => {
                callback(error, null);
            });
        }
        render_html(request, callback) {
            let userid = request.params.userid;
            let namespace = request.params.namespace;
            Pages.retrieve_account(userid, (error, account) => {
                if (!error) {
                    if (account) {
                        userid = account.userid;
                    }
                    let page_name = request.params.page;
                    let params = request.query;
                    ResourceModel.findOne({ $and: [{ name: page_name }, { namespace: namespace }, { userid: userid }, { type: 20 }] }).then((doc) => {
                        if (doc) {
                            let content = doc.content.resource;
                            let datasource = new ScannerBehaviorModule.CustomBehavior(page_name, page_name, userid, namespace, params, true, {
                                "Default": ArticleModel,
                                "Account": LocalAccount,
                                "Article": ArticleModel
                            });
                            let query = datasource.ToQueryFormat();
                            let page_datasource = datasource.GetDatasource(query, null);
                            let page_count = datasource.GetCount(query, null);
                            let page_init = {
                                name: "#init",
                                promise: page_datasource,
                                count: page_count,
                                resolved: ""
                            };
                            HtmlScannerModule.Builder.Build(content, datasource, page_init, config, (error, result) => {
                                if (!error) {
                                    callback(null, { content: result, type: doc.content.type });
                                }
                                else {
                                    callback({ code: 10000, message: error.message }, null);
                                }
                            });
                        }
                        else {
                            callback({ code: 10000, message: "page not found." }, null);
                        }
                    }).catch((error) => {
                        callback(error, null);
                    });
                }
                else {
                    callback(error, null);
                }
            });
        }
        render_fragment(request, callback) {
            let userid = request.params.userid;
            let namespace = request.params.namespace;
            Pages.retrieve_account(userid, (error, account) => {
                if (!error) {
                    if (account) {
                        userid = account.userid;
                    }
                    let parent_page_name = request.params.parent;
                    let page_name = request.params.page;
                    let params = request.query;
                    ResourceModel.findOne({ $and: [{ name: page_name }, { userid: userid }, { namespace: namespace }, { type: 20 }] }).then((doc) => {
                        if (doc) {
                            let content = doc.content.resource;
                            let datasource = new ScannerBehaviorModule.CustomBehavior(parent_page_name, page_name, userid, namespace, params, false, {
                                "Default": ArticleModel,
                                "Account": LocalAccount,
                                "Article": ArticleModel
                            });
                            let query = datasource.ToQueryFormat();
                            let page_datasource = datasource.GetDatasource(query, null);
                            let page_count = datasource.GetCount(query, null);
                            let page_init = {
                                name: "#init",
                                promise: page_datasource,
                                count: page_count,
                                resolved: ""
                            };
                            HtmlScannerModule.Builder.Build(content, datasource, page_init, config, (error, result) => {
                                if (!error) {
                                    callback(null, { content: result, type: doc.content.type });
                                }
                                else {
                                    callback({ code: 10000, message: error.message }, null);
                                }
                            });
                        }
                        else {
                            callback({ code: 10000, message: "fragment not found." }, null);
                        }
                    }).catch((error) => {
                        callback(error, null);
                    });
                }
                else {
                    callback(error, null);
                }
            });
        }
        render_direct(request, callback) {
            let userid = request.params.userid;
            let namespace = request.params.namespace;
            Pages.retrieve_account(userid, (error, account) => {
                if (!error) {
                    if (account) {
                        userid = account.userid;
                    }
                    let page_name = request.params.page;
                    ResourceModel.findOne({ $and: [{ name: page_name }, { namespace: namespace }, { userid: userid }, { type: 20 }] }).then((doc) => {
                        if (doc) {
                            callback(null, { content: doc.content.resource, type: doc.content.type });
                        }
                        else {
                            callback({ code: 10000, message: "not found." }, null);
                        }
                    }).catch((error) => {
                        callback(error, null);
                    });
                }
                else {
                    callback(error, null);
                }
            });
        }
        render_object(userid, page_name, object, callback) {
            let namespace = "";
            ResourceModel.findOne({ $and: [{ userid: userid }, { namespace: namespace }, { name: page_name }, { type: 20 }] }).then((doc) => {
                if (doc) {
                    let datasource = new ScannerBehaviorModule.CustomBehavior(page_name, page_name, userid, namespace, null, true, {});
                    HtmlScannerModule.Builder.Resolve(doc.content.resource, datasource, object, (error, result) => {
                        if (!error) {
                            callback(null, { content: result, type: "text/html" });
                        }
                        else {
                            callback({ code: error.code, message: error.message }, null);
                        }
                    });
                }
                else {
                    callback({ code: 10000, message: "not found." }, null);
                }
            }).catch((error) => {
                callback(error, null);
            });
        }
    }
    ResourcesModule.Pages = Pages;
})(ResourcesModule = exports.ResourcesModule || (exports.ResourcesModule = {}));
module.exports = ResourcesModule;
//# sourceMappingURL=resource_controller.js.map