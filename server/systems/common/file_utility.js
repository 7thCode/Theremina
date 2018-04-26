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
    var exec = require('child_process').exec;
    var path = require('path');
    var _config = require('config');
    var config = _config.get("systems");
    //   const core: any = require(process.cwd() + '/gs');
    //   const share: any = core.share;
    //   const config:any = share.config;
    var Utility = /** @class */ (function () {
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
                        fs.writeFile(fd, data, function (error) {
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
        Utility.rm = function (tmp_path, callback) {
            exec('rm -r ' + tmp_path, function (error, stdout, stderr) {
                callback(error);
            });
        };
        ;
        Utility.prototype.unlink = function (path, callback) {
            fs.unlink(path, function (error) {
                callback(error);
            });
        };
        Utility.prototype.make_dir = function (path, callback, error) {
            fs.mkdir(path, function (_error) {
                if (!_error) {
                    callback();
                }
                else {
                    if (_error.code == "EEXIST") {
                        callback();
                    }
                    else {
                        error(_error);
                    }
                }
            });
        };
        ;
        Utility.prototype.delete_folder_recursive = function (path) {
            exec('rm -r ' + path, function (error, stdout, stderr) {
            });
            /*
            fs.readdirSync(path).forEach(function (file, index) {
                let curPath = path + "/" + file;
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                    this.delete_folder_recursive(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
            */
        };
        Utility.prototype.create_dir = function (root, pathes, callback, error_handler) {
            var _this = this;
            var current_path = root;
            var sequentialExec = function (directorys) {
                return directorys.reduce(function (prev, current, index, array) {
                    return prev.then(function (prevResult) {
                        return new Promise(function (resolve, reject) {
                            current_path = path.join(current_path, current);
                            _this.make_dir(current_path, function () {
                                resolve(current);
                            }, error_handler);
                        });
                    });
                }, Promise.resolve());
            };
            sequentialExec(pathes).then(function (lastResult) {
                callback(current_path);
            }).catch(function (e) {
                error_handler(e);
            });
        };
        Utility.prototype.exists = function (target_file, exist, notexist) {
            fs.access(target_file, function (error) {
                if (error) {
                    if (error.code === 'ENOENT') {
                        notexist(error);
                    }
                }
                else {
                    exist();
                }
            });
        };
        Utility.prototype.read_stream = function (file_name) {
            return fs.createReadStream(file_name);
        };
        Utility.get_image_mime = function (filename) {
            var result = "";
            var exitname = path.extname(filename);
            switch (exitname) {
                case ".jpeg":
                case ".jpg":
                    result = "image/jpeg";
                    break;
                case ".png":
                    result = "image/png";
                    break;
                case ".gif":
                    result = "image/gif";
                    break;
            }
            return result;
        };
        ;
        // 'Cache-Control': config.cache
        Utility.prototype.get_header = function (file_path, callback) {
            fs.stat(file_path, function (error, stat) {
                if (!error) {
                    callback({
                        'Content-Type': Utility.get_image_mime(file_path),
                        //     'Content-Length' : stat.size,
                        'Cache-Control': config.cache
                    });
                }
            });
        };
        return Utility;
    }());
    FileUtility.Utility = Utility;
})(FileUtility = exports.FileUtility || (exports.FileUtility = {}));
module.exports = FileUtility;
//# sourceMappingURL=file_utility.js.map