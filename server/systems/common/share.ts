/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace ShareModule {

    const _config: any = require('config');

    export const config: any = _config.get("systems");
    export const services_config: any = _config.get("services");
    export const plugins_config: any = _config.get("plugins");
    export const applications_config: any = _config.get("applications");

    const _: any = require("lodash");

    const log4js: any = require('log4js');
    log4js.configure("./config/systems/logs.json");
    export const logger: any = log4js.getLogger('request');

    const Promised: any = require("./wrapper");
    export const Wrapper: any = new Promised.Wrapper();

    const CipherModule: any = require('./cipher');
    export const Cipher: any = CipherModule.Cipher;

    const EventModule: any = require('./event');
    export const Event: any = new EventModule.Event();

    const SchedulerModule = require("./scheduler");
    export const Scheduler: any = new SchedulerModule.Scheduler();

    const Commandar = require("./commandar");
    export const Command: any = new Commandar.Linux();

    const path: any = require('path');

    const root_path: any = process.cwd();

    export const Root: any = (relpath: string): string => {
        return path.join(root_path, relpath);
    };

    export const Config = (relpath: string): string => {
        return path.join(root_path, "config/" + relpath);
    };

    export const Models = (relpath: string): string => {
        return path.join(root_path, "models/" + relpath);
    };

    export const Persistent = (relpath: string): string => {
        return path.join(root_path, "persistent/" + relpath);
    };

    export const Public = (relpath: string): string => {
        return path.join(root_path, "public/" + relpath);
    };

    export const Server = (relpath: string): string => {
        return path.join(root_path, "server/" + relpath);
    };

    export const Views = (relpath: string): string => {
        return path.join(root_path, "views/" + relpath);
    };

    export const FileUtility: any = require("./file_utility");
    export const Utility = new FileUtility.Utility(Public(""));

    export let Memory = [];

}

module.exports = ShareModule;
