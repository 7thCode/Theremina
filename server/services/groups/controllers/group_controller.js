/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GroupModule;
(function (GroupModule) {
    var fs = require('graceful-fs');
    var Validator = require('jsonschema').Validator;
    var validator = new Validator();
    var _ = require('lodash');
    var mongoose = require('mongoose');
    mongoose.Promise = global.Promise;
    var core = require(process.cwd() + '/gs');
    var share = core.share;
    var Wrapper = share.Wrapper;
    var GroupModel = require(share.Models("services/groups/group"));
    var group_local_schema = {};
    fs.open(share.Models('applications/groups/schema.json'), 'ax+', 384, function (error, fd) {
        if (!error) {
            fs.close(fd, function () {
                group_local_schema = JSON.parse(fs.readFileSync(share.Models('applications/groups/schema.json'), 'utf-8'));
            });
        }
    });
    var definition = { group_content: {} };
    fs.open(share.Models('applications/groups/definition.json'), 'ax+', 384, function (error, fd) {
        if (!error) {
            fs.close(fd, function () {
                definition = JSON.parse(fs.readFileSync(share.Models('applications/groups/definition.json'), 'utf-8'));
            });
        }
    });
    var Group = (function () {
        function Group() {
        }
        /**
         * @param request
         * @returns userid
         */
        Group.userid = function (request) {
            return request.user.userid;
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Group.prototype.own_group = function (request, response) {
            var number = 1000;
            var userid = Group.userid(request);
            var namespace = "";
            var name = request.body.name;
            if (name) {
                if (name.indexOf('/') == -1) {
                    Wrapper.FindOne(response, number, GroupModel, { $and: [{ name: name }, { namespace: namespace }, { userid: userid }] }, function (response, group) {
                        if (!group) {
                            var group_1 = new GroupModel();
                            group_1.userid = userid;
                            group_1.name = name;
                            group_1.content = request.body.content;
                            group_1.open = true;
                            Wrapper.Save(response, number, group_1, function (response, object) {
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
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Group.prototype.create_group = function (request, response) {
            var number = 1000;
            var objectid = new mongoose.Types.ObjectId; // Create new id
            var userid = objectid.toString();
            var namespace = "";
            var name = request.body.name;
            if (name) {
                if (name.indexOf('/') == -1) {
                    Wrapper.FindOne(response, number, GroupModel, { $and: [{ name: name }, { namespace: namespace }, { userid: userid }] }, function (response, group) {
                        if (!group) {
                            var group_2 = new GroupModel();
                            group_2.userid = userid;
                            group_2.name = name;
                            group_2.content = request.body.content;
                            group_2.open = true;
                            Wrapper.Save(response, number, group_2, function (response, object) {
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
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Group.prototype.put_group = function (request, response) {
            var number = 1100;
            var userid = Group.userid(request);
            var namespace = "";
            var id = request.params.id;
            Wrapper.FindOne(response, number, GroupModel, { $and: [{ _id: id }, { namespace: namespace }, { userid: userid }] }, function (response, group) {
                if (group) {
                    var validate_result = validator.validate(request.body.local, group_local_schema);
                    if (validate_result.errors.length === 0) {
                        group.content = request.body.content;
                        group.open = true;
                        Wrapper.Save(response, number, group, function (response, object) {
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
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Group.prototype.delete_group = function (request, response) {
            var number = 1200;
            var userid = Group.userid(request);
            var namespace = "";
            var id = request.params.id;
            Wrapper.FindOne(response, number, GroupModel, { $and: [{ _id: id }, { namespace: namespace }, { userid: userid }] }, function (response, group) {
                if (group) {
                    Wrapper.Remove(response, number, group, function (response) {
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
        Group.prototype.delete_own = function (request, response) {
            var number = 1300;
            var userid = Group.userid(request);
            var namespace = "";
            Wrapper.Delete(response, number, GroupModel, { $and: [{ namespace: namespace }, { userid: userid }] }, function (response) {
                Wrapper.SendSuccess(response, {});
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Group.prototype.get_group = function (request, response) {
            var number = 1400;
            //let userid = Group.userid(request);
            var id = request.params.id;
            Wrapper.FindOne(response, number, GroupModel, { _id: id }, function (response, group) {
                if (group) {
                    Wrapper.SendSuccess(response, group);
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
        Group.prototype.get_group_query_query = function (request, response) {
            var userid = Group.userid(request);
            //let self: any = request.user;
            //      let query: any = JSON.parse(decodeURIComponent(request.params.query));
            //      let option: any = JSON.parse(decodeURIComponent(request.params.option));
            var namespace = "";
            var query = Wrapper.Decode(request.params.query);
            var option = Wrapper.Decode(request.params.option);
            Wrapper.Find(response, 1500, GroupModel, { $and: [{ namespace: namespace }, { userid: userid }, query] }, {}, option, function (response, groups) {
                Wrapper.SendSuccess(response, groups);
            });
        };
        /**
         * @param request
         * @param response
         * @returns none
         */
        Group.prototype.get_group_count = function (request, response) {
            var userid = Group.userid(request);
            var namespace = "";
            //  let query: any = JSON.parse(decodeURIComponent(request.params.query));
            var query = Wrapper.Decode(request.params.query);
            Wrapper.Count(response, 2800, GroupModel, { $and: [{ namespace: namespace }, { userid: userid }, query] }, function (response, count) {
                Wrapper.SendSuccess(response, count);
            });
        };
        return Group;
    }());
    GroupModule.Group = Group;
})(GroupModule = exports.GroupModule || (exports.GroupModule = {}));
module.exports = GroupModule;
//# sourceMappingURL=group_controller.js.map