/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FormsModule;
(function (FormsModule) {
    const fs = require('graceful-fs');
    const _ = require('lodash');
    const core = require(process.cwd() + '/gs');
    const share = core.share;
    const config = share.config;
    const Wrapper = share.Wrapper;
    const builder_userid = config.systems.userid; // template maker user id
    const FormModel = require(share.Models("services/forms/form"));
    class Form {
        static userid(request) {
            return request.user.userid;
        }
        static namespace(name) {
            let result = "";
            if (name) {
                let names = name.split("#");
                let delimmiter = "";
                names.forEach((name, index) => {
                    if (index < (names.length - 1)) {
                        result += delimmiter + name;
                        delimmiter = ":";
                    }
                });
            }
            return result;
        }
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
        create_init_forms(initforms) {
            let docs = initforms;
            if (docs) {
                let save = (doc) => {
                    return new Promise((resolve, reject) => {
                        let namespace = Form.namespace(doc.name);
                        let localname = Form.localname(doc.name);
                        let userid = doc.userid;
                        let type = doc.type;
                        let content = doc.content;
                        let query = { $and: [{ userid: userid }, { type: type }, { status: 1 }, { open: true }, { name: localname }] };
                        Wrapper.FindOne(null, 1000, FormModel, query, (response, page) => {
                            if (!page) {
                                let page = new FormModel();
                                page.userid = userid;
                                page.namespace = namespace;
                                page.name = localname;
                                page.type = type;
                                page.content = content;
                                page.open = true;
                                page.save().then(() => {
                                    resolve({});
                                }).catch((error) => {
                                    reject(error);
                                });
                            }
                        });
                    });
                };
                Promise.all(docs.map((doc) => {
                    return save(doc);
                })).then((results) => {
                }).catch((error) => {
                });
            }
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        create_form(request, response) {
            const number = 1000;
            let userid = builder_userid;
            let name = request.body.name;
            let type = request.body.type;
            if (name) {
                if (name.indexOf('/') == -1) {
                    Wrapper.FindOne(response, number, FormModel, { $and: [{ name: name }, { type: type }, { userid: userid }] }, (response, exists) => {
                        if (!exists) {
                            let page = new FormModel();
                            page.userid = userid;
                            page.name = name;
                            page.type = type;
                            page.content = [];
                            page.open = true;
                            Wrapper.Save(response, number, page, (response, object) => {
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
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        put_form(request, response) {
            const number = 1100;
            let userid = builder_userid;
            let id = request.params.id;
            Wrapper.FindOne(response, number, FormModel, { $and: [{ _id: id }, { userid: userid }] }, (response, page) => {
                if (page) {
                    page.content = request.body.content;
                    page.open = true;
                    Wrapper.Save(response, number, page, (response, object) => {
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
        delete_form(request, response) {
            const number = 1200;
            let userid = builder_userid;
            let id = request.params.id;
            Wrapper.FindOne(response, number, FormModel, { $and: [{ _id: id }, { userid: userid }] }, (response, page) => {
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
        get_form(request, response) {
            const number = 1300;
            let userid = builder_userid;
            let id = request.params.id;
            Wrapper.FindOne(response, number, FormModel, { $and: [{ _id: id }, { userid: userid }] }, (response, page) => {
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
            let userid = builder_userid;
            Wrapper.Delete(response, number, FormModel, { userid: userid }, (response) => {
                Wrapper.SendSuccess(response, {});
            });
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        get_form_query(request, response) {
            const number = 1400;
            let userid = builder_userid;
            let query = Wrapper.Decode(request.params.query);
            let option = Wrapper.Decode(request.params.option);
            Wrapper.Find(response, number, FormModel, { $and: [{ userid: userid }, query] }, {}, option, (response, pages) => {
                _.forEach(pages, (page) => {
                    page.content = null;
                });
                Wrapper.SendSuccess(response, pages);
            });
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        get_form_count(request, response) {
            const number = 2800;
            let userid = builder_userid;
            let query = Wrapper.Decode(request.params.query);
            Wrapper.Count(response, number, FormModel, { $and: [{ userid: userid }, query] }, (response, count) => {
                Wrapper.SendSuccess(response, count);
            });
        }
    }
    FormsModule.Form = Form;
})(FormsModule = exports.FormsModule || (exports.FormsModule = {}));
module.exports = FormsModule;
//# sourceMappingURL=forms_controller.js.map