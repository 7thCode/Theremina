/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Persistent;
(function (Persistent) {
    const fs = require('graceful-fs');
    class Map {
        constructor(filename) {
            this.filename = filename;
            this.map = {};
        }
        Load() {
            try {
                let file = fs.openSync(this.filename, 'r');
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
        }
        Store() {
            try {
                let file = fs.openSync(this.filename, 'w');
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
        }
        Init() {
            this.map = {};
            this.Store();
        }
        Set(key, value) {
            this.map[key] = value;
        }
        SetArrray(array) {
            this.map = array;
        }
        Get(key) {
            return this.map[key];
        }
    }
    Persistent.Map = Map;
})(Persistent = exports.Persistent || (exports.Persistent = {}));
module.exports = Persistent;
//# sourceMappingURL=persistent.js.map