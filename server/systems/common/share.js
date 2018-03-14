/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ShareModule;
(function (ShareModule) {
    var _config = require('config');
    ShareModule.config = _config.get("systems");
    ShareModule.services_config = _config.get("services");
    ShareModule.plugins_config = _config.get("plugins");
    ShareModule.applications_config = _config.get("applications");
    /*
      export const config = JSON.parse(fs.readFileSync('./config/systems/config.json', 'utf-8'));
      export const services_config = JSON.parse(fs.readFileSync('./config/services/config.json', 'utf-8'));
      export const plugins_config = JSON.parse(fs.readFileSync('./config/plugins/config.json', 'utf-8'));
      export const applications_config = JSON.parse(fs.readFileSync('./config/applications/config.json', 'utf-8'));
    */
    var _ = require("lodash");
    var log4js = require('log4js');
    log4js.configure("./config/systems/logs.json");
    ShareModule.logger = log4js.getLogger('request');
    //  logger.setLevel(config.loglevel);
    var Promised = require("./wrapper");
    ShareModule.Wrapper = new Promised.Wrapper();
    var CipherModule = require('./cipher');
    ShareModule.Cipher = CipherModule.Cipher;
    var EventModule = require('./event');
    ShareModule.Event = new EventModule.Event();
    var SchedulerModule = require("./scheduler");
    ShareModule.Scheduler = new SchedulerModule.Scheduler();
    var Commandar = require("./commandar");
    ShareModule.Command = new Commandar.Linux();
    var path = require('path');
    var root_path = process.cwd();
    ShareModule.Root = function (relpath) {
        return path.join(root_path, relpath);
    };
    ShareModule.Config = function (relpath) {
        return path.join(root_path, "config/" + relpath);
    };
    ShareModule.Models = function (relpath) {
        return path.join(root_path, "models/" + relpath);
    };
    ShareModule.Persistent = function (relpath) {
        return path.join(root_path, "persistent/" + relpath);
    };
    ShareModule.Public = function (relpath) {
        return path.join(root_path, "public/" + relpath);
    };
    ShareModule.Server = function (relpath) {
        return path.join(root_path, "server/" + relpath);
    };
    ShareModule.Views = function (relpath) {
        return path.join(root_path, "views/" + relpath);
    };
    ShareModule.FileUtility = require("./file_utility");
    ShareModule.Utility = new ShareModule.FileUtility.Utility(ShareModule.Public(""));
    ShareModule.Memory = [];
})(ShareModule = exports.ShareModule || (exports.ShareModule = {}));
module.exports = ShareModule;
//# sourceMappingURL=share.js.map