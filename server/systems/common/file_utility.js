/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FileUtility;
(function (FileUtility) {
    const fs = require('graceful-fs');
    const share = require('./share');
    const config = share.config;
    class Utility {
        constructor(current) {
            this.current = '';
            this.current = current;
        }
        readdir(path, callback) {
            fs.readdir(this.current + "/" + path, function (error, files) {
                if (!error) {
                    callback(null, files);
                }
                else {
                    callback(error, null);
                }
            });
        }
        readfileSync(filename) {
            let result = "";
            let file = fs.openSync(filename, 'r');
            if (file) {
                try {
                    result = fs.readFileSync(filename, 'utf8');
                }
                finally {
                    fs.closeSync(file);
                }
            }
            return result;
        }
        readfile(filename, callback) {
            fs.open(filename, 'r', (error, fd) => {
                let data = null;
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
        }
        delete_folder_recursive(path) {
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
        }
        writefileSync(filename, data) {
            let result = false;
            let fd = fs.openSync(filename, 'w');
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
        }
        writefile(filename, data, callback) {
            fs.open(filename, 'w', (error, fd) => {
                if (!error) {
                    try {
                        fs.writefile(fd, data, (error) => {
                            if (!error) {
                                callback(null);
                            }
                            else {
                                callback(error);
                            }
                        });
                    }
                    finally {
                        fs.close(fd, () => {
                        });
                    }
                }
                else {
                    callback(error);
                }
            });
        }
    }
    FileUtility.Utility = Utility;
})(FileUtility = exports.FileUtility || (exports.FileUtility = {}));
module.exports = FileUtility;
//# sourceMappingURL=file_utility.js.map