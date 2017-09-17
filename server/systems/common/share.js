/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ShareModule;
(function (ShareModule) {
    const fs = require('graceful-fs');
    ShareModule.config = JSON.parse(fs.readFileSync('./config/systems/config.json', 'utf-8'));
    ShareModule.services_config = JSON.parse(fs.readFileSync('./config/services/config.json', 'utf-8'));
    ShareModule.plugins_config = JSON.parse(fs.readFileSync('./config/plugins/config.json', 'utf-8'));
    ShareModule.applications_config = JSON.parse(fs.readFileSync('./config/applications/config.json', 'utf-8'));
    const _ = require("lodash");
    const log4js = require('log4js');
    log4js.configure("./config/systems/logs.json");
    ShareModule.logger = log4js.getLogger('request');
    ShareModule.logger.setLevel(ShareModule.config.loglevel);
    const Promised = require("./wrapper");
    ShareModule.Wrapper = new Promised.Wrapper();
    const CipherModule = require('./cipher');
    ShareModule.Cipher = CipherModule.Cipher;
    const EventModule = require('./event');
    ShareModule.Event = new EventModule.Event();
    const SchedulerModule = require("./scheduler");
    ShareModule.Scheduler = new SchedulerModule.Scheduler();
    const Commandar = require("./commandar");
    ShareModule.Command = new Commandar.Linux();
    const path = require('path');
    const root_path = process.cwd();
    ShareModule.Root = (relpath) => {
        return path.join(root_path, relpath);
    };
    ShareModule.Config = (relpath) => {
        return path.join(root_path, "config/" + relpath);
    };
    ShareModule.Models = (relpath) => {
        return path.join(root_path, "models/" + relpath);
    };
    ShareModule.Persistent = (relpath) => {
        return path.join(root_path, "persistent/" + relpath);
    };
    ShareModule.Public = (relpath) => {
        return path.join(root_path, "public/" + relpath);
    };
    ShareModule.Server = (relpath) => {
        return path.join(root_path, "server/" + relpath);
    };
    ShareModule.Views = (relpath) => {
        return path.join(root_path, "views/" + relpath);
    };
    const PersistentModel = require("./persistent");
    ShareModule.Map = new PersistentModel.Map(ShareModule.Persistent("systems/storege.json"));
    const FileUtility = require("./file_utility");
    ShareModule.Utility = new FileUtility.Utility(ShareModule.Public(""));
    ShareModule.Memory = [];
    class Share {
    }
    ShareModule.Share = Share;
})(ShareModule = exports.ShareModule || (exports.ShareModule = {}));
module.exports = ShareModule;
//# sourceMappingURL=share.js.map