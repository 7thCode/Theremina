/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
/// <reference path="./cipher.ts" />
/// <reference path="./result.ts" />
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Promised;
(function (Promised) {
    const fs = require('graceful-fs');
    const _ = require("lodash");
    const result = require("./result");
    const config = JSON.parse(fs.readFileSync("./config/systems/config.json", 'utf-8'));
    const log4js = require('log4js');
    log4js.configure("./config/systems/logs.json");
    const logger = log4js.getLogger('request');
    logger.setLevel(config.loglevel);
    class Wrapper {
        BasicHeader(response, session) {
            response.header("Access-Control-Allow-Origin", "*");
            response.header("Pragma", "no-cache");
            response.header("Cache-Control", "no-cache");
            response.contentType("application/json");
            return response;
        }
        Exception(req, res, callback) {
            try {
                callback(req, res);
            }
            catch (e) {
                this.SendFatal(res, e.code, e.message, e);
            }
        }
        Guard(req, res, callback) {
            if (req.headers["x-requested-with"] === "XMLHttpRequest") {
                res = this.BasicHeader(res, "");
                callback(req, res);
            }
            else {
                this.SendError(res, 1, "", { code: 1, message: "" });
            }
        }
        Authenticate(req, res, callback) {
            if (req.user) {
                if (req.isAuthenticated()) {
                    callback(req, res);
                }
                else {
                    this.SendError(res, 1, "", { code: 1, message: "" });
                }
            }
            else {
                this.SendError(res, 1, "", { code: 1, message: "" });
            }
        }
        FindById(res, code, model, id, callback) {
            model.findById(id).then((object) => {
                callback(res, object);
            }).catch((error) => {
                this.SendError(res, error.code, error.message, error);
            });
        }
        FindOne(res, code, model, query, callback) {
            model.findOne(query).then((doc) => {
                callback(res, doc);
            }).catch((error) => {
                this.SendError(res, error.code, error.message, error);
            });
        }
        Find(res, code, model, query, fields, option, callback) {
            model.find(query, fields, option).then((docs) => {
                callback(res, docs);
            }).catch((error) => {
                this.SendError(res, error.code, error.message, error);
            });
        }
        Count(response, code, model, query, callback) {
            model.count(query).then((count) => {
                callback(response, count);
            }).catch((error) => {
                this.SendError(response, error.code, error.message, error);
            });
        }
        FindAndModify(res, code, model, query, sort, update, options, callback) {
            model.findAndModify(query, sort, update, options).then((docs) => {
                callback(res, docs);
            }).catch((error) => {
                this.SendError(res, error.code, error.message, error);
            });
        }
        Save(res, code, instance, callback) {
            instance.save().then(() => {
                callback(res, instance);
            }).catch((error) => {
                this.SendError(res, error.code, error.message, error);
            });
        }
        Update(res, code, model, query, update, callback) {
            model.findOneAndUpdate(query, update, { upsert: false }).then(() => {
                callback(res);
            }).catch((error) => {
                this.SendError(res, error.code, error.message, error);
            });
        }
        Upsert(res, code, model, query, update, callback) {
            model.update(query, update, { upsert: true, multi: false }).then(() => {
                callback(res);
            }).catch((error) => {
                this.SendError(res, error.code, error.message, error);
            });
        }
        Remove(res, code, instance, callback) {
            instance.remove().then(() => {
                callback(res);
            }).catch((error) => {
                this.SendError(res, error.code, error.message, error);
            });
        }
        Delete(res, code, model, query, callback) {
            model.remove(query).then(() => {
                callback(res);
            }).catch((error) => {
                this.SendError(res, error.code, error.message, error);
            });
        }
        If(res, code, condition, callback) {
            if (condition) {
                callback(res);
            }
            else {
                this.SendWarn(res, code + 100, "", { code: code + 100, message: "" });
            }
        }
        SendWarn(response, code, message, object) {
            logger.warn(message + " " + code);
            if (response) {
                response.jsonp(new result(code, message, object));
            }
        }
        SendError(response, code, message, object) {
            logger.error(message + " " + code);
            if (response) {
                response.jsonp(new result(code, message, object));
            }
        }
        SendForbidden(response) {
            logger.error("Forbidden");
            if (response) {
                response.status(403).render("error", { message: "Forbidden...", status: 403 });
            }
        }
        SendNotFound(response) {
            logger.error("notfound");
            if (response) {
                response.status(404).render("error", { message: "not found", status: 404 });
            }
        }
        SendFatal(response, code, message, object) {
            logger.fatal(message + " " + code);
            if (response) {
                response.status(500).render("error", { message: message, status: 500 });
            }
        }
        SendSuccess(response, object) {
            if (response) {
                response.jsonp(new result(0, "", object));
            }
        }
        Decode(data) {
            let result = {};
            if (data) {
                let decode_data = decodeURIComponent(data);
                try {
                    result = JSON.parse(decode_data);
                }
                catch (e) {
                }
            }
            return result;
        }
        ;
        Parse(data) {
            let result = {};
            if (data) {
                try {
                    result = JSON.parse(data);
                }
                catch (e) {
                }
            }
            return result;
        }
        ;
    }
    Promised.Wrapper = Wrapper;
})(Promised = exports.Promised || (exports.Promised = {}));
module.exports = Promised;
//# sourceMappingURL=wrapper.js.map