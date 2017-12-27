/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Persistent;
(function (Persistent) {
    var fs = require('graceful-fs');
    var Map = (function () {
        function Map(filename) {
            this.filename = filename;
            this.map = {};
        }
        Map.prototype.Load = function () {
            try {
                var file = fs.openSync(this.filename, 'r');
                if (file) {
                    try {
                        this.map = JSON.parse(fs.readFileSync(this.filename, 'utf8'));
                    }
                    finally {
                        fs.closeSync(file);
                    }
                }
                else {
                    this.Init();
                }
            }
            catch (e) {
            }
        };
        Map.prototype.Store = function () {
            try {
                var file = fs.openSync(this.filename, 'w');
                if (file) {
                    try {
                        fs.writeFile(this.filename, JSON.stringify(this.map));
                    }
                    finally {
                        fs.closeSync(file);
                    }
                }
            }
            catch (e) {
            }
        };
        Map.prototype.Init = function () {
            this.map = {};
            this.Store();
        };
        Map.prototype.Set = function (key, value) {
            this.map[key] = value;
        };
        Map.prototype.SetArrray = function (array) {
            this.map = array;
        };
        Map.prototype.Get = function (key) {
            return this.map[key];
        };
        return Map;
    }());
    Persistent.Map = Map;
})(Persistent = exports.Persistent || (exports.Persistent = {}));
module.exports = Persistent;
//# sourceMappingURL=persistent.js.map