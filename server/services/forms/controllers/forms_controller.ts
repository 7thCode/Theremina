/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace FormsModule {

    const fs = require('graceful-fs');
    const _ = require('lodash');

    //const mongoose = require('mongoose');

    const core = require(process.cwd() + '/core');
    const share: any = core.share;
    const config = share.config;
    const Wrapper = share.Wrapper;
    const event: any = share.Event;

    const builder_userid = config.systems.userid;// template maker user id

    const HtmlEditModule: any = require(share.Server("systems/common/html_edit/html_edit"));

    const FormModel: any = require(share.Models("services/forms/form"));

    export class Form {

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

        public create_init_forms(initforms:any[]): void {

            let save = (doc: any): any => {
                return new Promise((resolve: any, reject: any): void => {

                    let namespace: string = Form.namespace(doc.name);
                    let localname: string = Form.localname(doc.name);
                    let userid = doc.userid;
                    let type: string = doc.type;
                    let content: any = doc.content;
                    let query = {};
                    if (config.structured) {
                        query = {$and: [{userid: userid}, {type: type}, {namespace: namespace}, {name: localname}]};
                    } else {
                        query = {$and: [{userid: userid}, {type: type},  {name: localname}]};
                    }

                    Wrapper.FindOne(null, 1000, FormModel, query, (response: any, page: any): void => {
                        if (!page) {
                            let page: any = new FormModel();
                            page.userid = userid;
                            page.namespace = namespace;
                            page.name = localname;
                            page.type = type;
                            page.content = content;
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

            let docs = initforms;
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
        public create_form(request: any, response: any): void {
            const number: number = 1000;
            // let userid = Form.userid(request);
            let userid = builder_userid;
            let name = request.body.name;
            let type = request.body.type;
            if (name) {
                if (name.indexOf('/') == -1) {
                    Wrapper.FindOne(response, number, FormModel, {$and: [{name: name}, {type: type}, {userid: userid}]}, (response: any, exists: any): void => {
                        if (!exists) {
                            let page: any = new FormModel();
                            page.userid = userid;
                            page.name = name;
                            page.type = type;
                            page.content = [];
                            page.open = true;
                            Wrapper.Save(response, number, page, (response: any, object: any): void => {
                                Wrapper.SendSuccess(response, object);
                            });
                        } else {
                            Wrapper.SendWarn(response, 1, "already", {code:1, message:"already"});
                        }
                    });
                } else {
                    Wrapper.SendError(response, 3, "form name must not contain '/'", {code:3, message:"form name must not contain '/'"});
                }
            } else {
                Wrapper.SendError(response, 2, "no form name", {code:2, message:"no form name"});
            }
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public put_form(request: any, response: any): void {
            const number: number = 1100;
            //     let userid = Form.userid(request);
            let userid = builder_userid;
            let id = request.params.id;
            Wrapper.FindOne(response, number, FormModel, {$and: [{_id: id}, {userid: userid}]}, (response: any, page: any): void => {
                if (page) {
                    page.content = request.body.content;
                    page.open = true;
                    Wrapper.Save(response, number, page, (response: any, object: any): void => {
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
        public delete_form(request: any, response: any): void {
            const number: number = 1200;
            //     let userid = Form.userid(request);
            let userid = builder_userid;
            let id = request.params.id;
            Wrapper.FindOne(response, number, FormModel, {$and: [{_id: id}, {userid: userid}]}, (response: any, page: any): void => {
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
        public get_form(request: any, response: any): void {
            const number: number = 1300;
            //     let userid = Form.userid(request);
            let userid = builder_userid;
            let id = request.params.id;
            Wrapper.FindOne(response, number, FormModel, {$and: [{_id: id}, {userid: userid}]}, (response: any, page: any): void => {
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
            //       let userid = Form.userid(request);
            let userid = builder_userid;
            Wrapper.Delete(response, number, FormModel, {userid: userid}, (response: any): void => {
                Wrapper.SendSuccess(response, {});
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_form_query(request: any, response: any): void {
            const number: number = 1400;
            //     let userid = Form.userid(request);
            let userid = builder_userid;
            //      let query: any = JSON.parse(decodeURIComponent(request.params.query));
            //      let option: any = JSON.parse(decodeURIComponent(request.params.option));

            let query: any = Wrapper.Decode(request.params.query);
            let option: any = Wrapper.Decode(request.params.option);

            Wrapper.Find(response, number, FormModel, {$and: [{userid: userid}, query]}, {}, option, (response: any, pages: any): any => {

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
        public get_form_count(request: any, response: any): void {
            const number: number = 2800;
            //       let userid = Form.userid(request);
            let userid = builder_userid;
//            let query: any = JSON.parse(decodeURIComponent(request.params.query));

            let query: any = Wrapper.Decode(request.params.query);

            Wrapper.Count(response, number, FormModel, query, (response: any, count: any): any => {
                Wrapper.SendSuccess(response, count);
            });
        }

        /**
         * @param userid
         * @param name
         * @param record
         * @param callback
         * @returns none
         */
        public render(userid: string, name: string, record: any, callback: (error: any, result: string) => void): void {
            FormModel.findOne({$and: [{name: name}, {userid: userid}]}).then((doc: any): void => {
                if (doc) {
                    HtmlEditModule.Render.docToHtml(doc, record, callback);
                } else {
                    callback({code: 10000, message: ""}, null);
                }
            }).catch((error: any): void => {
                callback(error, null);
            });
        }

    }
}

module.exports = FormsModule;