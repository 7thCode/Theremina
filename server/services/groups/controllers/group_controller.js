/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GroupModule;
(function (GroupModule) {
    const fs = require('graceful-fs');
    const Validator = require('jsonschema').Validator;
    const validator = new Validator();
    const _ = require('lodash');
    const mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    const core = require(process.cwd() + '/gs');
    const share = core.share;
    const Wrapper = share.Wrapper;
    const GroupModel = require(share.Models("services/groups/group"));
    let group_local_schema = {};
    fs.open(share.Models('applications/groups/schema.json'), 'ax+', 384, (error, fd) => {
        if (!error) {
            fs.close(fd, () => {
                group_local_schema = JSON.parse(fs.readFileSync(share.Models('applications/groups/schema.json'), 'utf-8'));
            });
        }
    });
    let definition = { group_content: {} };
    fs.open(share.Models('applications/groups/definition.json'), 'ax+', 384, (error, fd) => {
        if (!error) {
            fs.close(fd, () => {
                definition = JSON.parse(fs.readFileSync(share.Models('applications/groups/definition.json'), 'utf-8'));
            });
        }
    });
    class Group {
        /**
         * @param request
         * @returns userid
         */
        static userid(request) {
            return request.user.userid;
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        own_group(request, response) {
            const number = 1000;
            let userid = Group.userid(request);
            let namespace = "";
            let name = request.body.name;
            if (name) {
                if (name.indexOf('/') == -1) {
                    Wrapper.FindOne(response, number, GroupModel, { $and: [{ name: name }, { namespace: namespace }, { userid: userid }] }, (response, group) => {
                        if (!group) {
                            let group = new GroupModel();
                            group.userid = userid;
                            group.name = name;
                            group.content = request.body.content;
                            group.open = true;
                            Wrapper.Save(response, number, group, (response, object) => {
                                Wrapper.SendSuccess(response, object);
                            });
                        }
                        else {
                            Wrapper.SendWarn(response, 2, "not found", { code: 2, message: "not found" });
                        }
                    });
                }
                else {
                    Wrapper.SendError(response, 3, "form name must not contain '/'", { code: 3, message: "form name must not contain '/'" });
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
        create_group(request, response) {
            const number = 1000;
            let objectid = new mongoose.Types.ObjectId; // Create new id
            let userid = objectid.toString();
            let namespace = "";
            let name = request.body.name;
            if (name) {
                if (name.indexOf('/') == -1) {
                    Wrapper.FindOne(response, number, GroupModel, { $and: [{ name: name }, { namespace: namespace }, { userid: userid }] }, (response, group) => {
                        if (!group) {
                            let group = new GroupModel();
                            group.userid = userid;
                            group.name = name;
                            group.content = request.body.content;
                            group.open = true;
                            Wrapper.Save(response, number, group, (response, object) => {
                                Wrapper.SendSuccess(response, object);
                            });
                        }
                        else {
                            Wrapper.SendWarn(response, 2, "not found", { code: 2, message: "not found" });
                        }
                    });
                }
                else {
                    Wrapper.SendError(response, 3, "form name must not contain '/'", { code: 3, message: "form name must not contain '/'" });
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
        put_group(request, response) {
            const number = 1100;
            let userid = Group.userid(request);
            let namespace = "";
            let id = request.params.id;
            Wrapper.FindOne(response, number, GroupModel, { $and: [{ _id: id }, { namespace: namespace }, { userid: userid }] }, (response, group) => {
                if (group) {
                    let validate_result = validator.validate(request.body.local, group_local_schema);
                    if (validate_result.errors.length === 0) {
                        group.content = request.body.content;
                        group.open = true;
                        Wrapper.Save(response, number, group, (response, object) => {
                            Wrapper.SendSuccess(response, object);
                        });
                    }
                    else {
                        Wrapper.SendError(response, 3, "not valid", validate_result);
                    }
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
        delete_group(request, response) {
            const number = 1200;
            let userid = Group.userid(request);
            let namespace = "";
            let id = request.params.id;
            Wrapper.FindOne(response, number, GroupModel, { $and: [{ _id: id }, { namespace: namespace }, { userid: userid }] }, (response, group) => {
                if (group) {
                    Wrapper.Remove(response, number, group, (response) => {
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
        delete_own(request, response) {
            const number = 1300;
            let userid = Group.userid(request);
            let namespace = "";
            Wrapper.Delete(response, number, GroupModel, { $and: [{ namespace: namespace }, { userid: userid }] }, (response) => {
                Wrapper.SendSuccess(response, {});
            });
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        get_group(request, response) {
            const number = 1400;
            //let userid = Group.userid(request);
            let id = request.params.id;
            Wrapper.FindOne(response, number, GroupModel, { _id: id }, (response, group) => {
                if (group) {
                    Wrapper.SendSuccess(response, group);
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
        get_group_query_query(request, response) {
            let userid = Group.userid(request);
            //let self: any = request.user;
            //      let query: any = JSON.parse(decodeURIComponent(request.params.query));
            //      let option: any = JSON.parse(decodeURIComponent(request.params.option));
            let namespace = "";
            let query = Wrapper.Decode(request.params.query);
            let option = Wrapper.Decode(request.params.option);
            Wrapper.Find(response, 1500, GroupModel, { $and: [{ namespace: namespace }, { userid: userid }, query] }, {}, option, (response, groups) => {
                Wrapper.SendSuccess(response, groups);
            });
        }
        /**
         * @param request
         * @param response
         * @returns none
         */
        get_group_count(request, response) {
            let userid = Group.userid(request);
            let namespace = "";
            //  let query: any = JSON.parse(decodeURIComponent(request.params.query));
            let query = Wrapper.Decode(request.params.query);
            Wrapper.Count(response, 2800, GroupModel, { $and: [{ namespace: namespace }, { userid: userid }, query] }, (response, count) => {
                Wrapper.SendSuccess(response, count);
            });
        }
    }
    GroupModule.Group = Group;
})(GroupModule = exports.GroupModule || (exports.GroupModule = {}));
module.exports = GroupModule;
//# sourceMappingURL=group_controller.js.map