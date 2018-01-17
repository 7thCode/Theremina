/**!
 Copyright (c) 2016 7thCode.(https://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

let FileServices: angular.IModule = angular.module('FileServices', []);

FileServices.filter('filename', [(): any => {
    return (filename: string, limit: number): string => {
        let result = filename;
        let nameparts: string[] = filename.split(".");
        if (nameparts.length == 2) {
            let name = nameparts[0];
            let type = nameparts[1];
            if (name) {
                if (name.length > limit) {
                    result = name.slice(0, limit) + "..." + type;
                }
            }
        }
        return result;
    };
}]);

FileServices.filter('icon', [(): any => {
    return (mimetype: string): string => {
        let result = "";
        switch (mimetype) {
            case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                result = "/systems/resources/files/icon/xls.svg";
                break;
            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                result = "/systems/resources/files/icon/doc.svg";
                break;
            case "application/pdf":
                result = "/systems/resources/files/icon/pdf.svg";
                break;
            case "text/plain":
                result = "/systems/resources/files/icon/txt.svg";
                break;
            case "text/css":
                result = "/systems/resources/files/icon/css.svg";
                break;
            case "text/javascript":
                result = "/systems/resources/files/icon/js.svg";
                break;
            case "text/html":
                result = "/systems/resources/files/icon/html.svg";
                break;
            default:
                result = "/systems/resources/files/icon/default.svg";
        }
        return result;
    };
}]);

FileServices.factory('File', ['$resource',
    ($resource): any => {
        return $resource('/files/api/:name/:key', {name: '@name', key: '@key'}, {
            send: {method: 'POST'},
            update: {method: 'PUT'}
        });
    }]);

FileServices.factory('FileData', ['$resource',
    ($resource): any => {
        return $resource('/files/api/data/:name', {name: '@name'}, {
            get: {method: 'GET'},
        });
    }]);

FileServices.factory('FileQuery', ['$resource',
    ($resource): any => {
        return $resource('/files/api/query/:query/:option', {query: '@query', option: '@option'}, {
            query: {method: 'GET'}
        });
    }]);


FileServices.factory('FileCount', ['$resource',
    ($resource: any): any => {
        return $resource('/files/api/count/:query', {query: '@query'}, {
            get: {method: 'GET'}
        });
    }]);

FileServices.factory('Upload', ['$resource',
    ($resource): any => {
        return $resource('/files/api/temporary/upload/:filename', {filename: '@filename'}, {
            send: {method: 'POST'}
        });
    }]);

//FileServices.value("CurrentFileQuery", {query: {filename: {$regex: ""}}, option: {limit: 10, skip: 0}});

FileServices.service('FileService', ["File", "FileData", "FileQuery", "FileCount","Upload",
    function (File: any,FileData:any, FileQuery: any, FileCount: any, Upload:any): void {

        this.SetQuery = (query:any, type:number = 0) => {
            this.option.skip = 0;
        //    this.query = {"metadata.key": {$gte: type, $lt: type + 2000}};
        //    if (query) {
         //       this.query = {$and:[{"metadata.key": {$gte: type, $lt: type + 2000}},query]};
         //   }


            this.query = query;
        };

        let init = () => {
            this.option = {limit: 40, skip: 0};
            this.SetQuery(null);
        };

        this.Init = () => {
            init();
        };

        this.Query = (callback: (result: any) => void, error: (code: number, message: string) => void) => {
            FileQuery.query({
                query: encodeURIComponent(JSON.stringify(this.query)),
                option: encodeURIComponent(JSON.stringify(this.option))
            }, (result: any): void => {
                if (result) {
                    if (result.code === 0) {
                        callback(result.value);
                    } else {
                        error(result.code, result.message);
                    }
                } else {
                    error(10000, "network error");
                }
            });
        };

        this.Exist = (query:any, callback: (result: boolean) => void, error: (code: number, message: string) => void): void => {
            FileCount.get({
                query: encodeURIComponent(JSON.stringify(query))
            }, (result: any): void => {
                if (result) {
                    if (result.code === 0) {
                        callback(result.value > 0);
                    } else {
                        error(result.code, result.message);
                    }
                } else {
                    error(10000, "network error");
                }
            });
        };

        this.Count = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            FileCount.get({
                query: encodeURIComponent(JSON.stringify(this.query))
            }, (result: any): void => {
                if (result) {
                    if (result.code === 0) {
                        callback(result.value);
                    } else {
                        error(result.code, result.message);
                    }
                } else {
                    error(10000, "network error");
                }
            });
        };

        this.Over = (callback: (result: boolean) => void, error: (code: number, message: string) => void): void => {
            this.Count((count) => {
                callback((this.option.skip + this.option.limit) <= count);
            }, error);
        };

        this.Under = (callback: (result: boolean) => void, error: (code: number, message: string) => void): void => {
            callback(this.option.skip > 0);
        };

        this.Next = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            this.Over((hasnext) => {
                if (hasnext) {
                    this.option.skip = this.option.skip + this.option.limit;
                    this.Query(callback, error);
                } else {
                    callback(null);
                }
            });
        };

        this.Prev = (callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            this.Under((hasprev) => {
                if (hasprev) {
                    this.option.skip = this.option.skip - this.option.limit;
                    this.Query(callback, error);
                } else {
                    callback(null);
                }
            });
        };

        this.Create = (url: string, filename: string, key: number, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            let remote_file: any = new File();
            remote_file.url = url;
            let promise = remote_file.$send({name: filename, key: key}, (value: any, responseHeaders: any): void => {
                callback(value);
            }, (httpResponse: any): void => {
                error(1, "");
            });
        };

        this.Update = (url: string, filename: string, key: number, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            let remote_file: any = new File();
            remote_file.url = url;
            let promise = remote_file.$update({name: filename, key: key}, (value: any, responseHeaders: any): void => {
                callback(value);
            }, (httpResponse: any): void => {
                error(1, "");
            });
        };

        this.Delete = (filename: string, key: number, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            let file: any = new File();
            file.$delete({name: filename, key: key}, (result, responseHeaders) => {
                if (result) {
                    switch (result.code) {
                        case 0:
                            callback(result);
                            break;
                        default:
                    }
                }
            }, (httpResponse) => {
                error(1, "")
            });
        };

        this.Get = (name: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            FileData.get({
                name: name
            }, (result: any): void => {
                if (result) {
                    if (result.code === 0) {
                        callback(result.value);
                    } else {
                        error(result.code, result.message);
                    }
                } else {
                    error(10000, "network error");
                }
            });
        };

        this.Upload = (url: string, filename: string, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            let remote_file: any = new Upload();
            remote_file.url = url;
            let promise = remote_file.$send({filename: filename}, (value: any, responseHeaders: any): void => {
                callback(value);
            }, (httpResponse: any): void => {
                error(1, "");
            });
        };

        this.Init();

    }]);