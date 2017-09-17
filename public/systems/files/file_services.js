/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
let FileServices = angular.module('FileServices', []);
FileServices.filter('filename', [() => {
        return (filename, limit) => {
            let result = filename;
            let nameparts = filename.split(".");
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
FileServices.filter('icon', [() => {
        return (mimetype) => {
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
    ($resource) => {
        return $resource('/files/api/:name/:key', { name: '@name', key: '@key' }, {
            send: { method: 'POST' },
            update: { method: 'PUT' }
        });
    }]);
FileServices.factory('FileData', ['$resource',
    ($resource) => {
        return $resource('/files/api/data/:name', { name: '@name' }, {
            get: { method: 'GET' },
        });
    }]);
FileServices.factory('FileQuery', ['$resource',
    ($resource) => {
        return $resource('/files/api/query/:query/:option', { query: '@query', option: '@option' }, {
            query: { method: 'GET' }
        });
    }]);
FileServices.factory('FileCount', ['$resource',
    ($resource) => {
        return $resource('/files/api/count/:query', { query: '@query' }, {
            get: { method: 'GET' }
        });
    }]);
FileServices.factory('Upload', ['$resource',
    ($resource) => {
        return $resource('/files/api/temporary/upload/:filename', { filename: '@filename' }, {
            send: { method: 'POST' }
        });
    }]);
//FileServices.value("CurrentFileQuery", {query: {filename: {$regex: ""}}, option: {limit: 10, skip: 0}});
FileServices.service('FileService', ["File", "FileData", "FileQuery", "FileCount", "Upload",
    function (File, FileData, FileQuery, FileCount, Upload) {
        this.SetQuery = (query, type = 0) => {
            this.option.skip = 0;
            this.query = { "metadata.key": { $gte: type, $lt: type + 2000 } };
            if (query) {
                this.query = { $and: [{ "metadata.key": { $gte: type, $lt: type + 2000 } }, query] };
            }
        };
        let init = () => {
            this.option = { limit: 40, skip: 0 };
            this.SetQuery(null);
        };
        this.Init = () => {
            init();
        };
        this.Query = (callback, error) => {
            FileQuery.query({
                query: encodeURIComponent(JSON.stringify(this.query)),
                option: encodeURIComponent(JSON.stringify(this.option))
            }, (result) => {
                if (result) {
                    if (result.code === 0) {
                        callback(result.value);
                    }
                    else {
                        error(result.code, result.message);
                    }
                }
                else {
                    error(10000, "network error");
                }
            });
        };
        this.Exist = (query, callback, error) => {
            FileCount.get({
                query: encodeURIComponent(JSON.stringify(query))
            }, (result) => {
                if (result) {
                    if (result.code === 0) {
                        callback(result.value > 0);
                    }
                    else {
                        error(result.code, result.message);
                    }
                }
                else {
                    error(10000, "network error");
                }
            });
        };
        this.Count = (callback, error) => {
            FileCount.get({
                query: encodeURIComponent(JSON.stringify(this.query))
            }, (result) => {
                if (result) {
                    if (result.code === 0) {
                        callback(result.value);
                    }
                    else {
                        error(result.code, result.message);
                    }
                }
                else {
                    error(10000, "network error");
                }
            });
        };
        this.Over = (callback, error) => {
            this.Count((count) => {
                callback((this.option.skip + this.option.limit) <= count);
            }, error);
        };
        this.Under = (callback, error) => {
            callback(this.option.skip > 0);
        };
        this.Next = (callback, error) => {
            this.Over((hasnext) => {
                if (hasnext) {
                    this.option.skip = this.option.skip + this.option.limit;
                    this.Query(callback, error);
                }
                else {
                    callback(null);
                }
            });
        };
        this.Prev = (callback, error) => {
            this.Under((hasprev) => {
                if (hasprev) {
                    this.option.skip = this.option.skip - this.option.limit;
                    this.Query(callback, error);
                }
                else {
                    callback(null);
                }
            });
        };
        this.Create = (url, filename, key, callback, error) => {
            let remote_file = new File();
            remote_file.url = url;
            let promise = remote_file.$send({ name: filename, key: key }, (value, responseHeaders) => {
                callback(value);
            }, (httpResponse) => {
                error(1, "");
            });
        };
        this.Update = (url, filename, key, callback, error) => {
            let remote_file = new File();
            remote_file.url = url;
            let promise = remote_file.$update({ name: filename, key: key }, (value, responseHeaders) => {
                callback(value);
            }, (httpResponse) => {
                error(1, "");
            });
        };
        this.Delete = (filename, key, callback, error) => {
            let file = new File();
            file.$delete({ name: filename, key: key }, (result, responseHeaders) => {
                if (result) {
                    switch (result.code) {
                        case 0:
                            callback(result);
                            break;
                        default:
                    }
                }
            }, (httpResponse) => {
                error(1, "");
            });
        };
        this.Get = (name, callback, error) => {
            FileData.get({
                name: name
            }, (result) => {
                if (result) {
                    if (result.code === 0) {
                        callback(result.value);
                    }
                    else {
                        error(result.code, result.message);
                    }
                }
                else {
                    error(10000, "network error");
                }
            });
        };
        this.Upload = (url, filename, callback, error) => {
            let remote_file = new Upload();
            remote_file.url = url;
            let promise = remote_file.$send({ filename: filename }, (value, responseHeaders) => {
                callback(value);
            }, (httpResponse) => {
                error(1, "");
            });
        };
        this.Init();
    }]);
//# sourceMappingURL=file_services.js.map