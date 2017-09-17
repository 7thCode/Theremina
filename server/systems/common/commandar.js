/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Commandar;
(function (Commandar) {
    let execSync = require('child_process').execSync;
    class Linux {
        constructor() {
            this.backupdir = process.cwd() + "/backup";
        }
        Backup(config) {
            let backup = "mongodump --authenticationDatabase " + config.name + " -u " + config.user + " -p " + config.password + " -d " + config.name + " -o " + '"' + this.backupdir + '"';
            console.log(backup);
            return "" + execSync(backup);
        }
        Restore(config) {
            let restore = "mongorestore --authenticationDatabase " + config.name + " -u " + config.user + " -p " + config.password + " -d " + config.name + " " + '"' + this.backupdir + "/" + config.name + '"';
            console.log(restore);
            return "" + execSync(restore);
        }
    }
    Commandar.Linux = Linux;
})(Commandar = exports.Commandar || (exports.Commandar = {}));
module.exports = Commandar;
//# sourceMappingURL=commandar.js.map