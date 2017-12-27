/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FileUtility;
(function (FileUtility) {
    var fs = require('graceful-fs');
    var share = require('./share');
    var config = share.config;
    var Utility = (function () {
        function Utility(current) {
            this.current = '';
            this.current = current;
        }
        Utility.prototype.readdir = function (path, callback) {
            fs.readdir(this.current + "/" + path, function (error, files) {
                if (!error) {
                    callback(null, files);
                }
                else {
                    callback(error, null);
                }
            });
        };
        Utility.prototype.readfileSync = function (filename) {
            var result = "";
            var file = fs.openSync(filename, 'r');
            if (file) {
                try {
                    result = fs.readFileSync(filename, 'utf8');
                }
                finally {
                    fs.closeSync(file);
                }
            }
            return result;
        };
        Utility.prototype.readfile = function (filename, callback) {
            fs.open(filename, 'r', function (error, fd) {
                var data = null;
                if (fd) {
                    try {
                        data = fs.readFileSync(filename, 'utf8');
                    }
                    finally {
                        fs.closeSync(fd);
                    }
                }
                callback(error, data);
            });
        };
        Utility.prototype.delete_folder_recursive = function (path) {
            fs.readdirSync(path).forEach(function (file, index) {
                var curPath = path + "/" + file;
                if (fs.lstatSync(curPath).isDirectory()) {
                    this.delete_folder_recursive(curPath);
                }
                else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        };
        Utility.prototype.writefileSync = function (filename, data) {
            var result = false;
            var fd = fs.openSync(filename, 'w');
            if (fd) {
                try {
                    fs.writeFileSync(fd, data);
                    result = true;
                }
                catch (e) {
                }
                finally {
                    fs.closeSync(fd);
                }
            }
            return result;
        };
        Utility.prototype.writefile = function (filename, data, callback) {
            fs.open(filename, 'w', function (error, fd) {
                if (!error) {
                    try {
                        fs.writefile(fd, data, function (error) {
                            if (!error) {
                                callback(null);
                            }
                            else {
                                callback(error);
                            }
                        });
                    }
                    finally {
                        fs.close(fd, function () {
                        });
                    }
                }
                else {
                    callback(error);
                }
            });
        };
        return Utility;
    }());
    FileUtility.Utility = Utility;
})(FileUtility = exports.FileUtility || (exports.FileUtility = {}));
module.exports = FileUtility;
//# sourceMappingURL=file_utility.js.map