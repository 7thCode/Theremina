/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ResourcesModule;
(function (ResourcesModule) {
    var fs = require('graceful-fs');
    var _ = require('lodash');
    var share = require('../../common/share');
    var config = share.config;
    var applications_config = share.applications_config;
    var Wrapper = share.Wrapper;
    var ScannerBehaviorModule = require(share.Server("systems/common/html_scanner/scanner_behavior"));
    var HtmlScannerModule = require(share.Server("systems/common/html_scanner/html_scanner"));
    var ResourceModel = require(share.Models("systems/resources/resource"));
    var ArticleModel = require(share.Models("services/articles/article"));
    var LocalAccount = require(share.Models("systems/accounts/account"));
    var Resource = (function () {
        function Resource() {
        }
        Resource.userid = function (request) {
            return request.user.userid;
        };
        Resource.namespace = function (request) {
            var result = "";
            if (request.user.data) {
                result = request.user.data.namespace;
            }
            return result;
        };
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
        Resource.localname = function (name) {
            var result = "";
            if (name) {
                var names_1 = name.split("#");
                names_1.forEach(function (name, index) {
                    if (index == (names_1.length - 1)) {
                        result = name;
                    }
                });
            }
            return result;
        };
        Resource.make_query = function (userid, type, localname, namespace) {
            return { $and: [{ namespace: namespace }, { userid: userid }, { type: type }, { status: 1 }, { open: true }, { name: localname }] };
        };
        /**
         * @param initresources
         * @returns none
         */
        Resource.prototype.create_init_resources = function (userid, initresources, callback) {
            if (initresources) {
                if (initresources.length > 0) {
                    var save_1 = function (doc) {
                        return new Promise(function (resolve, reject) {
                            var filename = process.cwd() + doc.path + '/' + doc.name;
                            var namespace = doc.namespace; // Resource.namespace(doc.name);
                            var localname = Resource.localname(doc.name);
                            var type = doc.type;
                            var content = doc.content;
                            Wrapper.FindOne(null, 1000, ResourceModel, Resource.make_query(userid, type, localname, namespace), function (response, page) {
                                if (!page) {
                                    var page_1 = new ResourceModel();
                                    page_1.userid = userid;
                                    page_1.namespace = namespace;
                                    page_1.name = localname;
                                    page_1.type = type;
                                    var resource = "";
                                    try {
                                        fs.statSync(filename);
                                        resource = fs.readFileSync(filename, 'utf-8');
                                    }
                                    catch (e) {
                                        reject(e);
                                    }
                                    page_1.content = { type: content.type, resource: resource };
                                    page_1.open = true;
                                    page_1.save().then(function () {
                                        resolve({});
                                    }).catch(function (error) {
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
                    var docs = initresources;
                    Promise.all(docs.map(function (doc) {
                        return save_1(doc);
                    })).then(function (results) {
                        callback(null, results);
                    }).catch(function (error) {
                        callback(error, null);
                    });
                }
                else {
                    callback(null, null);
                }
            }
        };
        /**
         * @param initresources
         * @returns none
         */
        Resource.prototype.create_resources = function (userid, namespace, initresources, callback) {
            if (initresources) {
                if (initresources.length > 0) {
                    var save_2 = function (doc) {
                        return new Promise(function (resolve, reject) {
                            var filename = process.cwd() + doc.path + '/' + doc.name;
                            //    let namespace: string = doc.namespace;// Resource.namespace(doc.name);
                            var localname = Resource.localname(doc.name);
                            var type = doc.type;
                            var content = doc.content;
                            Wrapper.FindOne(null, 1000, ResourceModel, Resource.make_query(userid, type, localname, namespace), function (response, page) {
                                if (!page) {
                                    var page_2 = new ResourceModel();
                                    page_2.userid = userid;
                                    page_2.namespace = namespace;
                                    page_2.name = localname;
                                    page_2.type = type;
                                    var resource = "";
                                    try {
                                        fs.statSync(filename);
                                        resource = fs.readFileSync(filename, 'utf-8');
                                    }
                                    catch (e) {
                                        reject(e);
                                    }
                                    page_2.content = { type: content.type, resource: resource };
                                    page_2.open = true;
                                    page_2.save().then(function () {
                                        resolve({});
                                    }).catch(function (error) {
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
                    var docs = initresources;
                    Promise.all(docs.map(function (doc) {
                        return save_2(doc);
                    })).then(function (results) {
                        callback(null, results);
                    }).catch(function (error) {
                        callback(error, null);
                    });
                }
                else {
                    callback(null, null);
                }
            }
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Resource.prototype.create_resource = function (request, response) {
            if (request.body.name) {
                var number_1 = 1000;
                var userid_1 = Resource.userid(request);
                var namespace_1 = Resource.namespace(request);
                var localname_1 = Resource.localname(request.body.name);
                var type_1 = request.body.type;
                var content_1 = request.body.content;
                if (localname_1.indexOf('/') == -1) {
                    Wrapper.FindOne(response, number_1, ResourceModel, Resource.make_query(userid_1, type_1, localname_1, namespace_1), function (response, exists) {
                        if (!exists) {
                            var resource = new ResourceModel();
                            resource.userid = userid_1;
                            resource.namespace = namespace_1;
                            resource.name = localname_1;
                            resource.type = type_1;
                            var page = "";
                            if (content_1.resource) {
                                page = content_1.resource;
                            }
                            resource.content = { resource: page, type: content_1.type };
                            resource.open = true;
                            Wrapper.Save(response, number_1, resource, function (response, object) {
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
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Resource.prototype.put_resource = function (request, response) {
            var number = 1100;
            var userid = Resource.userid(request);
            var namespace = Resource.namespace(request);
            var id = request.params.id;
            Wrapper.FindOne(response, number, ResourceModel, { $and: [{ _id: id }, { namespace: namespace }, { userid: userid }] }, function (response, page) {
                if (page) {
                    page.content = request.body.content;
                    page.open = true;
                    Wrapper.Save(response, number, page, function (response) {
                        Wrapper.SendSuccess(response, {});
                    });
                }
                else {
                    Wrapper.SendWarn(response, 2, "not found", { code: 2, message: "not found" });
                }
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Resource.prototype.delete_resource = function (request, response) {
            var number = 1200;
            var userid = Resource.userid(request);
            var namespace = Resource.namespace(request);
            var id = request.params.id;
            Wrapper.FindOne(response, number, ResourceModel, { $and: [{ _id: id }, { namespace: namespace }, { userid: userid }] }, function (response, page) {
                if (page) {
                    Wrapper.Remove(response, number, page, function (response) {
                        Wrapper.SendSuccess(response, {});
                    });
                }
                else {
                    Wrapper.SendWarn(response, 2, "not found", { code: 2, message: "not found" });
                }
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Resource.prototype.get_resource = function (request, response) {
            var number = 1300;
            var userid = Resource.userid(request);
            var namespace = Resource.namespace(request);
            var id = request.params.id;
            Wrapper.FindOne(response, number, ResourceModel, { $and: [{ _id: id }, { namespace: namespace }, { userid: userid }] }, function (response, page) {
                if (page) {
                    Wrapper.SendSuccess(response, page);
                }
                else {
                    Wrapper.SendWarn(response, 2, "not found", { code: 2, message: "not found" });
                }
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Resource.prototype.delete_own = function (request, response) {
            var number = 1200;
            var userid = Resource.userid(request);
            Wrapper.Delete(response, number, ResourceModel, { userid: userid }, function (response) {
                Wrapper.SendSuccess(response, {});
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Resource.prototype.get_resource_query = function (request, response) {
            var number = 1400;
            var userid = Resource.userid(request);
            var namespace = Resource.namespace(request);
            var query = Wrapper.Decode(request.params.query);
            var option = Wrapper.Decode(request.params.option);
            Wrapper.Find(response, number, ResourceModel, { $and: [{ namespace: namespace }, { userid: userid }, query] }, {}, option, function (response, pages) {
                _.forEach(pages, function (page) {
                    if (page.content) {
                        if (page.content.resource) {
                            page.content.resource = null;
                        }
                    }
                });
                Wrapper.SendSuccess(response, pages);
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Resource.prototype.get_resource_count = function (request, response) {
            var number = 2800;
            var userid = Resource.userid(request);
            var namespace = Resource.namespace(request);
            var query = Wrapper.Decode(request.params.query);
            Wrapper.Count(response, number, ResourceModel, { $and: [{ namespace: namespace }, { userid: userid }, query] }, function (response, count) {
                Wrapper.SendSuccess(response, count);
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Resource.prototype.namespaces = function (userid, callback) {
            var number = 1400;
            ResourceModel.find({ userid: userid }, { "namespace": 1, "_id": 0 }, {}).then(function (pages) {
                var result = [];
                _.forEach(pages, function (page) {
                    if (page.namespace) {
                        result.push(page.namespace);
                    }
                });
                callback(null, _.uniqBy(result));
            }).catch(function (error) {
                callback(error, null);
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Resource.prototype.get_all_mimetypes = function (request, response) {
            var number = 2800;
            var userid = Resource.userid(request);
            var namespace = Resource.namespace(request);
            ResourceModel.find({ $and: [{ namespace: namespace }, { userid: userid }] }, {
                "content.type": 1,
                "_id": 0
            }, {}).then(function (pages) {
                var result = [];
                _.forEach(pages, function (page) {
                    if (page.content.type) {
                        result.push(page.content.type);
                    }
                });
                Wrapper.SendSuccess(response, _.uniqBy(result));
            }).catch(function (error) {
                Wrapper.SendError(response, 2, "mimetype", error);
            });
        };
        return Resource;
    }());
    ResourcesModule.Resource = Resource;
    var mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    var Pages = (function () {
        function Pages() {
        }
        Pages.connect = function (user) {
            var result = null;
            var options = { useMongoClient: true, keepAlive: 300000, connectTimeoutMS: 1000000 };
            if (user) {
                result = mongoose.createConnection("mongodb://" + config.db.user + ":" + config.db.password + "@" + config.db.address + "/" + config.db.name, options);
            }
            else {
                result = mongoose.createConnection("mongodb://" + config.db.address + "/" + config.db.name, options);
            }
            return result;
        };
        Pages.userid = function (request) {
            return request.user.userid;
        };
        Pages.retrieve_account = function (userid, callback) {
            LocalAccount.findOne({ username: userid }).then(function (account) {
                callback(null, account);
            }).catch(function (error) {
                callback(error, null);
            });
        };
        Pages.prototype.render_html = function (request, callback) {
            var userid = request.params.userid;
            var namespace = request.params.namespace;
            Pages.retrieve_account(userid, function (error, account) {
                if (!error) {
                    if (account) {
                        userid = account.userid;
                    }
                    var page_name_1 = request.params.page;
                    var params_1 = request.query;
                    ResourceModel.findOne({ $and: [{ name: page_name_1 }, { namespace: namespace }, { userid: userid }, { type: 20 }] }).then(function (doc) {
                        if (doc) {
                            var content = doc.content.resource;
                            var datasource = new ScannerBehaviorModule.CustomBehavior(page_name_1, page_name_1, userid, namespace, params_1, true, {
                                "Default": ArticleModel,
                                "Article": ArticleModel
                            });
                            var query = datasource.ToQueryFormat();
                            var page_datasource = datasource.GetDatasource(query, null);
                            var page_count = datasource.GetCount(query, null);
                            var page_init = {
                                name: "#init",
                                promise: page_datasource,
                                count: page_count,
                                resolved: ""
                            };
                            HtmlScannerModule.Builder.Build(content, datasource, page_init, config, function (error, result) {
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
                    }).catch(function (error) {
                        callback(error, null);
                    });
                }
                else {
                    callback(error, null);
                }
            });
        };
        Pages.prototype.render_fragment = function (request, callback) {
            var userid = request.params.userid;
            var namespace = request.params.namespace;
            Pages.retrieve_account(userid, function (error, account) {
                if (!error) {
                    if (account) {
                        userid = account.userid;
                    }
                    var parent_page_name_1 = request.params.parent;
                    var page_name_2 = request.params.page;
                    var params_2 = request.query;
                    ResourceModel.findOne({ $and: [{ name: page_name_2 }, { userid: userid }, { namespace: namespace }, { type: 20 }] }).then(function (doc) {
                        if (doc) {
                            var content = doc.content.resource;
                            var datasource = new ScannerBehaviorModule.CustomBehavior(parent_page_name_1, page_name_2, userid, namespace, params_2, false, {
                                "Default": ArticleModel,
                                //      "Account": LocalAccount,
                                "Article": ArticleModel
                            });
                            var query = datasource.ToQueryFormat();
                            var page_datasource = datasource.GetDatasource(query, null);
                            var page_count = datasource.GetCount(query, null);
                            var page_init = {
                                name: "#init",
                                promise: page_datasource,
                                count: page_count,
                                resolved: ""
                            };
                            HtmlScannerModule.Builder.Build(content, datasource, page_init, config, function (error, result) {
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
                    }).catch(function (error) {
                        callback(error, null);
                    });
                }
                else {
                    callback(error, null);
                }
            });
        };
        Pages.prototype.render_direct = function (request, callback) {
            var userid = request.params.userid;
            var namespace = request.params.namespace;
            Pages.retrieve_account(userid, function (error, account) {
                if (!error) {
                    if (account) {
                        userid = account.userid;
                    }
                    var page_name = request.params.page;
                    ResourceModel.findOne({ $and: [{ name: page_name }, { namespace: namespace }, { userid: userid }, { type: 20 }] }).then(function (doc) {
                        if (doc) {
                            callback(null, { content: doc.content.resource, type: doc.content.type });
                        }
                        else {
                            callback({ code: 10000, message: "not found." }, null);
                        }
                    }).catch(function (error) {
                        callback(error, null);
                    });
                }
                else {
                    callback(error, null);
                }
            });
        };
        Pages.prototype.render_object = function (userid, page_name, object, callback) {
            var namespace = "";
            ResourceModel.findOne({ $and: [{ userid: userid }, { namespace: namespace }, { name: page_name }, { type: 20 }] }).then(function (doc) {
                if (doc) {
                    var datasource = new ScannerBehaviorModule.CustomBehavior(page_name, page_name, userid, namespace, null, true, {});
                    HtmlScannerModule.Builder.Resolve(doc.content.resource, datasource, object, function (error, result) {
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
            }).catch(function (error) {
                callback(error, null);
            });
        };
        return Pages;
    }());
    ResourcesModule.Pages = Pages;
})(ResourcesModule = exports.ResourcesModule || (exports.ResourcesModule = {}));
module.exports = ResourcesModule;
//# sourceMappingURL=resource_controller.js.map