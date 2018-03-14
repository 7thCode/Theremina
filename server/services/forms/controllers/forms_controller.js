/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FormsModule;
(function (FormsModule) {
    var _ = require('lodash');
    var core = require(process.cwd() + '/gs');
    var share = core.share;
    var config = share.config;
    var Wrapper = share.Wrapper;
    var builder_userid = config.systems.userid; // template maker user id
    var FormModel = require(share.Models("services/forms/form"));
    var Form = /** @class */ (function () {
        function Form() {
        }
        Form.userid = function (request) {
            return request.user.userid;
        };
        Form.namespace = function (name) {
            var result = "";
            if (name) {
                var names_1 = name.split("#");
                var delimmiter_1 = "";
                names_1.forEach(function (name, index) {
                    if (index < (names_1.length - 1)) {
                        result += delimmiter_1 + name;
                        delimmiter_1 = ":";
                    }
                });
            }
            return result;
        };
        Form.localname = function (name) {
            var result = "";
            if (name) {
                var names_2 = name.split("#");
                names_2.forEach(function (name, index) {
                    if (index == (names_2.length - 1)) {
                        result = name;
                    }
                });
            }
            return result;
        };
        Form.prototype.create_init_forms = function (initforms) {
            var docs = initforms;
            if (docs) {
                var save_1 = function (doc) {
                    return new Promise(function (resolve, reject) {
                        var localname = Form.localname(doc.name);
                        var userid = doc.userid;
                        var namespace = "";
                        var type = doc.type;
                        var content = doc.content;
                        var query = { $and: [{ namespace: namespace }, { userid: userid }, { type: type }, { status: 1 }, { open: true }, { name: localname }] };
                        Wrapper.FindOne(null, 1000, FormModel, query, function (response, page) {
                            if (!page) {
                                var page_1 = new FormModel();
                                page_1.userid = userid;
                                page_1.namespace = namespace;
                                page_1.name = localname;
                                page_1.type = type;
                                page_1.content = content;
                                page_1.open = true;
                                page_1.save().then(function () {
                                    resolve({});
                                }).catch(function (error) {
                                    reject(error);
                                });
                            }
                        });
                    });
                };
                Promise.all(docs.map(function (doc) {
                    return save_1(doc);
                })).then(function (results) {
                }).catch(function (error) {
                });
            }
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Form.prototype.create_form = function (request, response) {
            var number = 1000;
            var userid = builder_userid;
            var namespace = "";
            var name = request.body.name;
            var type = request.body.type;
            if (name) {
                if (name.indexOf('/') == -1) {
                    Wrapper.FindOne(response, number, FormModel, { $and: [{ name: name }, { type: type }, { namespace: namespace }, { userid: userid }] }, function (response, exists) {
                        if (!exists) {
                            var page = new FormModel();
                            page.userid = userid;
                            page.name = name;
                            page.type = type;
                            page.content = [];
                            page.open = true;
                            Wrapper.Save(response, number, page, function (response, object) {
                                Wrapper.SendSuccess(response, object);
                            });
                        }
                        else {
                            Wrapper.SendWarn(response, 1, "already", { code: 1, message: "already" });
                        }
                    });
                }
                else {
                    Wrapper.SendError(response, 3, "form name must not contain '/'", {
                        code: 3,
                        message: "form name must not contain '/'"
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
        Form.prototype.put_form = function (request, response) {
            var number = 1100;
            var userid = builder_userid;
            var namespace = "";
            var id = request.params.id;
            Wrapper.FindOne(response, number, FormModel, { $and: [{ _id: id }, { namespace: namespace }, { userid: userid }] }, function (response, page) {
                if (page) {
                    page.content = request.body.content;
                    page.open = true;
                    Wrapper.Save(response, number, page, function (response, object) {
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
        Form.prototype.delete_form = function (request, response) {
            var number = 1200;
            var userid = builder_userid;
            var namespace = "";
            var id = request.params.id;
            Wrapper.FindOne(response, number, FormModel, { $and: [{ _id: id }, { namespace: namespace }, { userid: userid }] }, function (response, page) {
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
        Form.prototype.get_form = function (request, response) {
            var number = 1300;
            var userid = builder_userid;
            var namespace = "";
            var id = request.params.id;
            Wrapper.FindOne(response, number, FormModel, { $and: [{ _id: id }, { namespace: namespace }, { userid: userid }] }, function (response, page) {
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
        Form.prototype.delete_own = function (request, response) {
            var number = 1200;
            var userid = builder_userid;
            var namespace = "";
            Wrapper.Delete(response, number, FormModel, { $and: [{ namespace: namespace }, { userid: userid }] }, function (response) {
                Wrapper.SendSuccess(response, {});
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Form.prototype.get_form_query = function (request, response) {
            var number = 1400;
            var userid = builder_userid;
            var namespace = "";
            var query = Wrapper.Decode(request.params.query);
            var option = Wrapper.Decode(request.params.option);
            Wrapper.Find(response, number, FormModel, { $and: [{ userid: userid }, { namespace: namespace }, query] }, {}, option, function (response, pages) {
                _.forEach(pages, function (page) {
                    page.content = null;
                });
                Wrapper.SendSuccess(response, pages);
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Form.prototype.get_form_count = function (request, response) {
            var number = 2800;
            var userid = builder_userid;
            var namespace = "";
            var query = Wrapper.Decode(request.params.query);
            Wrapper.Count(response, number, FormModel, { $and: [{ userid: userid }, { namespace: namespace }, query] }, function (response, count) {
                Wrapper.SendSuccess(response, count);
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Form.prototype.get_form_json = function (request, response) {
            var userid = builder_userid;
            var namespace = "";
            var name = request.params.name;
            Wrapper.Find(response, 1400, FormModel, { $and: [{ namespace: namespace }, { userid: userid }, { name: name }] }, { "_id": 0, "__v": 0 }, {}, function (response, forms) {
                Wrapper.SendSuccess(response, forms);
            });
        };
        return Form;
    }());
    FormsModule.Form = Form;
})(FormsModule = exports.FormsModule || (exports.FormsModule = {}));
module.exports = FormsModule;
//# sourceMappingURL=forms_controller.js.map