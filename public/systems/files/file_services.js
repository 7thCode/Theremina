/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var FileServices = angular.module('FileServices', []);
FileServices.filter('filename', [function () {
        return function (filename, limit) {
            var result = filename;
            var nameparts = filename.split(".");
            if (nameparts.length == 2) {
                var name_1 = nameparts[0];
                var type = nameparts[1];
                if (name_1) {
                    if (name_1.length > limit) {
                        result = name_1.slice(0, limit) + "..." + type;
                    }
                }
            }
            return result;
        };
    }]);
FileServices.filter('icon', [function () {
        return function (mimetype) {
            var result = "";
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
    function ($resource) {
        return $resource('/files/api/:name/:key', { name: '@name', key: '@key' }, {
            send: { method: 'POST' },
            update: { method: 'PUT' }
        });
    }]);
FileServices.factory('FileData', ['$resource',
    function ($resource) {
        return $resource('/files/api/data/:name', { name: '@name' }, {
            get: { method: 'GET' },
        });
    }]);
FileServices.factory('FileQuery', ['$resource',
    function ($resource) {
        return $resource('/files/api/query/:query/:option', { query: '@query', option: '@option' }, {
            query: { method: 'GET' }
        });
    }]);
FileServices.factory('FileCount', ['$resource',
    function ($resource) {
        return $resource('/files/api/count/:query', { query: '@query' }, {
            get: { method: 'GET' }
        });
    }]);
FileServices.factory('Upload', ['$resource',
    function ($resource) {
        return $resource('/files/api/temporary/upload/:filename', { filename: '@filename' }, {
            send: { method: 'POST' }
        });
    }]);
//FileServices.value("CurrentFileQuery", {query: {filename: {$regex: ""}}, option: {limit: 10, skip: 0}});
FileServices.service('FileService', ["File", "FileData", "FileQuery", "FileCount", "Upload",
    function (File, FileData, FileQuery, FileCount, Upload) {
        var _this = this;
        this.SetQuery = function (query, type) {
            if (type === void 0) { type = 0; }
            _this.option.skip = 0;
            //    this.query = {"metadata.key": {$gte: type, $lt: type + 2000}};
            //    if (query) {
            //       this.query = {$and:[{"metadata.key": {$gte: type, $lt: type + 2000}},query]};
            //   }
            _this.query = query;
        };
        var init = function () {
            _this.option = { limit: 40, skip: 0 };
            _this.SetQuery(null);
        };
        this.Init = function () {
            init();
        };
        this.Query = function (callback, error) {
            FileQuery.query({
                query: encodeURIComponent(JSON.stringify(_this.query)),
                option: encodeURIComponent(JSON.stringify(_this.option))
            }, function (result) {
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
        this.Exist = function (query, callback, error) {
            FileCount.get({
                query: encodeURIComponent(JSON.stringify(query))
            }, function (result) {
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
        this.Count = function (callback, error) {
            FileCount.get({
                query: encodeURIComponent(JSON.stringify(_this.query))
            }, function (result) {
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
        this.Over = function (callback, error) {
            _this.Count(function (count) {
                callback((_this.option.skip + _this.option.limit) <= count);
            }, error);
        };
        this.Under = function (callback, error) {
            callback(_this.option.skip > 0);
        };
        this.Next = function (callback, error) {
            _this.Over(function (hasnext) {
                if (hasnext) {
                    _this.option.skip = _this.option.skip + _this.option.limit;
                    _this.Query(callback, error);
                }
                else {
                    callback(null);
                }
            });
        };
        this.Prev = function (callback, error) {
            _this.Under(function (hasprev) {
                if (hasprev) {
                    _this.option.skip = _this.option.skip - _this.option.limit;
                    _this.Query(callback, error);
                }
                else {
                    callback(null);
                }
            });
        };
        this.Create = function (url, filename, key, callback, error) {
            var remote_file = new File();
            remote_file.url = url;
            var promise = remote_file.$send({ name: filename, key: key }, function (value, responseHeaders) {
                callback(value);
            }, function (httpResponse) {
                error(1, "");
            });
        };
        this.Update = function (url, filename, key, callback, error) {
            var remote_file = new File();
            remote_file.url = url;
            var promise = remote_file.$update({ name: filename, key: key }, function (value, responseHeaders) {
                callback(value);
            }, function (httpResponse) {
                error(1, "");
            });
        };
        this.Delete = function (filename, key, callback, error) {
            var file = new File();
            file.$delete({ name: filename, key: key }, function (result, responseHeaders) {
                if (result) {
                    switch (result.code) {
                        case 0:
                            callback(result);
                            break;
                        default:
                    }
                }
            }, function (httpResponse) {
                error(1, "");
            });
        };
        this.Get = function (name, callback, error) {
            FileData.get({
                name: name
            }, function (result) {
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
        this.Upload = function (url, filename, callback, error) {
            var remote_file = new Upload();
            remote_file.url = url;
            var promise = remote_file.$send({ filename: filename }, function (value, responseHeaders) {
                callback(value);
            }, function (httpResponse) {
                error(1, "");
            });
        };
        this.Init();
    }]);
//# sourceMappingURL=file_services.js.map