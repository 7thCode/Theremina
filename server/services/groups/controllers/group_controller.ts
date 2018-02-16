/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace GroupModule {

    const fs: any = require('graceful-fs');

    const Validator: any = require('jsonschema').Validator;
    const validator: any = new Validator();

    const _: any = require('lodash');

    const mongoose: any = require('mongoose');
    mongoose.Promise = global.Promise;

    const core: any = require(process.cwd() + '/gs');
    const share: any = core.share;
    const Wrapper: any = share.Wrapper;

    const GroupModel: any = require(share.Models("services/groups/group"));

    let group_local_schema: any = {};
    fs.open(share.Models('applications/groups/schema.json'), 'ax+', 384, (error: any, fd: any): void => {
        if (!error) {
            fs.close(fd, () => {
                group_local_schema = JSON.parse(fs.readFileSync(share.Models('applications/groups/schema.json'), 'utf-8'));
            });
        }
    });

    let definition: any = {group_content: {}};
    fs.open(share.Models('applications/groups/definition.json'), 'ax+', 384, (error: any, fd: any): void => {
        if (!error) {
            fs.close(fd, () => {
                definition = JSON.parse(fs.readFileSync(share.Models('applications/groups/definition.json'), 'utf-8'));
            });
        }
    });


    export class Group {

        /**
         * @param request
         * @returns userid
         */
        static userid(request: any): string {
            return request.user.userid;
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public own_group(request: any, response: any): void {
            const number: number = 1000;
            let userid: string = Group.userid(request);
            let namespace: string = "";
            let name: string = request.body.name;
            if (name) {
                if (name.indexOf('/') == -1) {
                    Wrapper.FindOne(response, number, GroupModel, {$and: [{name: name}, {namespace: namespace}, {userid: userid}]}, (response: any, group: any): void => {
                        if (!group) {
                            let group: any = new GroupModel();
                            group.userid = userid;
                            group.name = name;
                            group.content = request.body.content;
                            group.open = true;
                            Wrapper.Save(response, number, group, (response: any, object: any): void => {
                                Wrapper.SendSuccess(response, object);
                            });
                        } else {
                            Wrapper.SendWarn(response, 2, "not found", {code: 2, message: "not found"});
                        }
                    });
                } else {
                    Wrapper.SendError(response, 3, "form name must not contain '/'", {code: 3, message: "form name must not contain '/'"});
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
        public create_group(request: any, response: any): void {
            const number: number = 1000;
            let objectid: any = new mongoose.Types.ObjectId; // Create new id
            let userid: string = objectid.toString();
            let namespace: string = "";
            let name: string = request.body.name;
            if (name) {
                if (name.indexOf('/') == -1) {
                    Wrapper.FindOne(response, number, GroupModel, {$and: [{name: name}, {namespace: namespace}, {userid: userid}]}, (response: any, group: any): void => {
                        if (!group) {
                            let group: any = new GroupModel();
                            group.userid = userid;
                            group.name = name;
                            group.content = request.body.content;
                            group.open = true;
                            Wrapper.Save(response, number, group, (response: any, object: any): void => {
                                Wrapper.SendSuccess(response, object);
                            });
                        } else {
                            Wrapper.SendWarn(response, 2, "not found", {code: 2, message: "not found"});
                        }
                    });
                } else {
                    Wrapper.SendError(response, 3, "form name must not contain '/'", {code: 3, message: "form name must not contain '/'"});
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
        public put_group(request: any, response: any): void {
            const number: number = 1100;
            let userid = Group.userid(request);
            let namespace: string = "";
            let id: string = request.params.id;
            Wrapper.FindOne(response, number, GroupModel, {$and: [{_id: id}, {namespace: namespace}, {userid: userid}]}, (response: any, group: any): void => {
                if (group) {
                    let validate_result = validator.validate(request.body.local, group_local_schema);
                    if (validate_result.errors.length === 0) {
                        group.content = request.body.content;
                        group.open = true;
                        Wrapper.Save(response, number, group, (response: any, object: any): void => {
                            Wrapper.SendSuccess(response, object);
                        });
                    } else {
                        Wrapper.SendError(response, 3, "not valid", validate_result);
                    }
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
        public delete_group(request: any, response: any): void {
            const number: number = 1200;
            let userid: string = Group.userid(request);
            let namespace: string = "";
            let id: string = request.params.id;
            Wrapper.FindOne(response, number, GroupModel, {$and: [{_id: id}, {namespace: namespace}, {userid: userid}]}, (response: any, group: any): void => {
                if (group) {
                    Wrapper.Remove(response, number, group, (response: any): void => {
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
        public delete_own(request: any, response: any): void {
            const number: number = 1300;
            let userid: string = Group.userid(request);
            let namespace: string = "";
            Wrapper.Delete(response, number, GroupModel, {$and: [{namespace: namespace}, {userid: userid}]}, (response: any): void => {
                Wrapper.SendSuccess(response, {});
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_group(request: any, response: any): void {
            const number: number = 1400;
            let id: string = request.params.id;
            Wrapper.FindOne(response, number, GroupModel, {_id: id}, (response: any, group: any): void => {
                if (group) {
                    Wrapper.SendSuccess(response, group);
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
        public get_group_query_query(request: any, response: any): void {
            let userid: string = Group.userid(request);
            let namespace: string = "";
            let query: any = Wrapper.Decode(request.params.query);
            let option: any = Wrapper.Decode(request.params.option);
            Wrapper.Find(response, 1500, GroupModel, {$and: [{namespace: namespace}, {userid: userid}, query]}, {}, option, (response: any, groups: any): any => {
                Wrapper.SendSuccess(response, groups);
            });
        }

        /**
         * @param request
         * @param response
         * @returns none
         */
        public get_group_count(request: any, response: any): void {
            let userid: string = Group.userid(request);
            let namespace: string = "";
            let query: any = Wrapper.Decode(request.params.query);
            Wrapper.Count(response, 2800, GroupModel, {$and: [{namespace: namespace}, {userid: userid}, query]}, (response: any, count: any): any => {
                Wrapper.SendSuccess(response, count);
            });
        }

    }
}

module.exports = GroupModule;
