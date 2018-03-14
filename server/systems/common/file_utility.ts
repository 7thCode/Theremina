/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */


"use strict";

export namespace FileUtility {

    const fs: any = require('graceful-fs');
    const exec: any = require('child_process').exec;
    const path: any = require('path');

    const _config: any = require('config');
    const config: any = _config.get("systems");

 //   const core: any = require(process.cwd() + '/gs');
 //   const share: any = core.share;
 //   const config:any = share.config;

    export class Utility {
        private current: string = '';

        constructor(current: string) {
            this.current = current;
        }

        public readdir(path: string, callback: (error, data: any) => void): void {
            fs.readdir(this.current + "/" + path, function (error, files): void {
                if (!error) {
                    callback(null, files);
                } else {
                    callback(error, null);
                }
            });
        }

        public readfileSync(filename: any): string {
            let result = "";
            let file = fs.openSync(filename, 'r');
            if (file) {
                try {
                    result = fs.readFileSync(filename, 'utf8');
                } finally {
                    fs.closeSync(file);
                }
            }
            return result;
        }

        public readfile(filename: any, callback: (error, data) => void): void {
            fs.open(filename, 'r', (error, fd) => {
                let data = null;
                if (fd) {
                    try {
                        data = fs.readFileSync(filename, 'utf8');
                    } finally {
                        fs.closeSync(fd);
                    }
                }
                callback(error, data);

            });
        }

        public writefileSync(filename: string, data: string): boolean {
            let result: boolean = false;
            let fd = fs.openSync(filename, 'w');
            if (fd) {
                try {
                    fs.writeFileSync(fd, data);
                    result = true;
                } catch (e) {
                } finally {
                    fs.closeSync(fd);
                }
            }
            return result;
        }

        public writefile(filename: string, data: string, callback: (error: any) => void): void {
            fs.open(filename, 'w', (error: any, fd: any): void => {
                if (!error) {
                    try {
                        fs.writeFile(fd, data, (error: any): void => {
                            if (!error) {
                                callback(null);
                            } else {
                                callback(error);
                            }
                        });
                    } finally {
                        fs.close(fd, () => {
                        });
                    }
                } else {
                    callback(error);
                }
            });
        }

        static rm(tmp_path: string, callback: (error) => void): void {
            exec('rm -r ' + tmp_path, (error, stdout, stderr) => {
                callback(error);
            });
        };

        public unlink(path: string, callback: (error) => void): void {
            fs.unlink(path, (error) => {
                callback(error);
            });
        }

        public make_dir(path: string, callback: () => void, error: (_error) => void): void {
            fs.mkdir(path, (_error): void => {
                if (!_error) {
                    callback();
                } else {
                    if (_error.code == "EEXIST") {
                        callback();
                    } else {
                        error(_error);
                    }
                }
            });
        };

        public delete_folder_recursive(path): void {

            exec('rm -r ' + path, (error, stdout, stderr) => {

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
        }

        public create_dir(root: string, pathes: string[], callback: (path: string) => void, error_handler: (error: any) => void): void {
            let current_path = root;
            let sequentialExec = (directorys: any[]): any => {
                return directorys.reduce((prev, current, index, array) => {
                    return prev.then((prevResult) => {
                        return new Promise((resolve, reject) => {
                            current_path = path.join(current_path, current);
                            this.make_dir(current_path, () => {
                                resolve(current);
                            }, error_handler);
                        });
                    });
                }, Promise.resolve());
            };

            sequentialExec(pathes).then(function (lastResult) {
                callback(current_path);
            }).catch((e) => {
                error_handler(e);
            });
        }

        public exists(target_file,exist:() => void, notexist:(error) => void) {
            fs.access(target_file,  (error) => {
                if (error) {
                    if (error.code === 'ENOENT') {
                        notexist(error);
                    }
                } else {
                    exist();
                }
            });
        }

        public read_stream(file_name:string):any {
            return fs.createReadStream(file_name);
        }

        static get_image_mime(filename:string):string {
            let result:string = "";
            let exitname:string = path.extname(filename);
            switch (exitname) {
                case ".jpeg":
                case ".jpg":
                    result = "image/jpg";
                    break;
                case ".png":
                    result = "image/png";
                    break;
                case ".gif":
                    result = "image/gif";
                    break
            }
            return result;
        };

        // 'Cache-Control': config.cache

        public get_header(file_path, callback:(header) => void) {
            fs.stat(file_path, (error, stat) => {
                if (!error) {
                    callback({
                        'Content-Type' : Utility.get_image_mime(file_path),
                        'Content-Length' : stat.size,
                        'Cache-Control': config.cache
                    })
                }
            });
        }

    }
}

module.exports = FileUtility;
