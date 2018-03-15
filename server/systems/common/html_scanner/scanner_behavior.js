/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var ScannerBehavior;
(function (ScannerBehavior) {
    var url = require('url');
    var moment = require("moment");
    var _ = require('lodash');
    var requestpromise = require('request-promise');
    var default_start = 0;
    var default_length = 12;
    var Params = /** @class */ (function () {
        //   private filters: any = {};
        function Params() {
            this.params = {};
            /*
            this.filters = {
                value: (result: string, param: string): string => {
                    try {
                        result = "content." + param.trim() + ".value";
                    } catch (e) {
this.error_handler(e);
                    }
                    return result;
                }
            };
            */
        }
        Params.prototype.FromParams = function (params) {
            this.params = params;
        };
        // co::Article;q::{"content.type.value":"a"};l::10;s::2;so::{"name":1};
        Params.prototype.FromQueryFormat = function (query) {
            var result = {};
            if (query) {
                var splited = query.split(";");
                _.forEach(splited, function (element) {
                    var pair = element.split("::");
                    if (pair.length == 2) {
                        result[pair[0]] = pair[1];
                    }
                });
            }
            this.params = result;
        };
        Params.prototype.ToParams = function () {
            return this.params;
        };
        Params.prototype.ToParseParams = function () {
            var result = "";
            var keywords = [];
            if (this.params.co) {
                keywords.push("co=" + this.params.co);
            }
            if (this.params.q) {
                keywords.push("q=" + encodeURIComponent(this.params.q));
            }
            if (this.params.so) {
                keywords.push("so=" + encodeURIComponent(this.params.so));
            }
            if (this.params.l) {
                keywords.push("l=" + parseInt(this.params.l, default_length));
            }
            if (this.params.s) {
                keywords.push("s=" + parseInt(this.params.s, default_start));
            }
            var delimitter = "?"; //  keywords to "?xxxx&yyyy&zzzz"
            _.forEach(keywords, function (keyword) {
                result += delimitter + keyword;
                delimitter = "&";
            });
            return result;
        };
        Params.prototype.ToQueryFormat = function () {
            var result = "";
            if (this.params.co) {
                result += 'co::' + this.params.co + ';';
            }
            if (this.params.q) {
                result += 'q::' + this.params.q + ';';
            }
            if (this.params.l) {
                result += 'l::' + this.params.l + ';';
            }
            if (this.params.s) {
                result += 's::' + this.params.s + ';';
            }
            if (this.params.so) {
                result += 'so::' + this.params.so + ';';
            }
            return result;
        };
        return Params;
    }());
    var CustomBehavior = /** @class */ (function () {
        function CustomBehavior(parent_name, name, id, namespace, params, isdocument, models) {
            var _this = this;
            this.name = "";
            this.parent_name = "";
            this.id = "";
            this.parent_name = parent_name;
            this.name = name;
            this.id = id;
            this.namespace = namespace;
            this.page_params = params;
            this.isdocument = isdocument;
            this.models = models;
            this.default_query = { "userid": this.id };
            this.filters = {
                date: function (result, param) {
                    try {
                        var format = "MM/DD";
                        if (param[0]) {
                            format = param[0];
                        }
                        moment.locale("ja", {
                            weekdays: ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"],
                            weekdaysShort: ["日", "月", "火", "水", "木", "金", "土"]
                        });
                        //        moment.locale("ja");
                        var date = moment(result);
                        result = date.format(format);
                    }
                    catch (e) {
                        _this.error_handler(e);
                    }
                    return result;
                },
                substr: function (result, param) {
                    try {
                        var limit = parseInt(param[0]);
                        if (result.length > limit) {
                            result = result.substr(0, limit) + "...";
                        }
                    }
                    catch (e) {
                        _this.error_handler(e);
                    }
                    return result;
                },
                convert: function (result, param) {
                    try {
                        var param_object = JSON.parse(param[0]);
                        result = param_object[result];
                    }
                    catch (e) {
                        _this.error_handler(e);
                    }
                    return result;
                },
                encodeURIComponent: function (result, param) {
                    try {
                        result = encodeURIComponent(result);
                    }
                    catch (e) {
                        _this.error_handler(e);
                    }
                    return result;
                },
                add: function (result, param) {
                    try {
                        result = String(parseInt(result, 0) + parseInt(param[0], 0));
                    }
                    catch (e) {
                        _this.error_handler(e);
                    }
                    return result;
                },
                strip: function (result, param) {
                    try {
                        result = result.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '');
                    }
                    catch (e) {
                        _this.error_handler(e);
                    }
                    return result;
                }
            };
        }
        CustomBehavior.prototype.error_handler = function (e) {
        };
        CustomBehavior.prototype.ParseQueryFormat = function (query) {
            var result = null;
            if (query[0] == "#") {
                var field_name = "";
                var postfix = "";
                var split_field_name = query.split(":");
                if (split_field_name) {
                    field_name = split_field_name[0];
                    if (split_field_name.length == 2) {
                        postfix = split_field_name[1];
                    }
                }
                switch (field_name) {
                    case "#query":
                        switch (postfix) {
                            case "self":
                                result = this.page_params; // #query:self
                                break;
                            default:
                                var params = new Params();
                                params.FromQueryFormat(this.page_params[postfix]); // #query:xxxx
                                result = params.ToParams();
                        }
                        break;
                    default:
                }
            }
            else {
                var params = new Params();
                params.FromQueryFormat(query);
                result = params.ToParams();
            }
            return result;
        };
        //{"content.date.value":{"$gte":ISODate("2014-04-01T12:34:55+09:00"),"$lte":ISODate("2014-04-01T12:34:57+09:00")}}
        CustomBehavior.prototype.GetDatasource = function (query, parent) {
            var query_object = this.ParseQueryFormat(query);
            var _query = this.default_query;
            if (query_object.q) {
                try {
                    //      let query = new Function("value", "with (value) {return value;}")(query_object.q);
                    //      _query = {"$and": [this.default_query, query]};
                    _query = { "$and": [this.default_query, Function("return " + query_object.q)()] };
                }
                catch (e) {
                    this.error_handler(e);
                }
            }
            var limit = 0;
            if (query_object.l) {
                try {
                    limit = parseInt(query_object.l, default_length);
                }
                catch (e) {
                    this.error_handler(e);
                }
            }
            var skip = 0;
            if (query_object.s) {
                try {
                    skip = parseInt(query_object.s, default_start);
                }
                catch (e) {
                    this.error_handler(e);
                }
            }
            var sort = {};
            if (query_object.so) {
                try {
                    sort = JSON.parse(query_object.so);
                }
                catch (e) {
                    this.error_handler(e);
                }
            }
            var collection = "";
            if (query_object.co) {
                collection = query_object.co;
            }
            var model = this.models[collection];
            if (!model) {
                model = this.models["Default"];
            }
            return model.find(_query).limit(limit).skip(skip).sort(sort).exec();
        };
        CustomBehavior.prototype.GetCount = function (query, parent) {
            var query_object = this.ParseQueryFormat(query);
            var _query = this.default_query;
            if (query_object.q) {
                try {
                    _query = { "$and": [this.default_query, Function("return " + query_object.q)()] };
                }
                catch (e) {
                    this.error_handler(e);
                }
            }
            var collection = "";
            if (query_object.co) {
                collection = query_object.co;
            }
            var model = this.models[collection];
            if (!model) {
                model = this.models["Default"];
            }
            return model.count(_query).exec();
        };
        CustomBehavior.prototype.Aggregate = function (query, parent) {
            var query_object = this.ParseQueryFormat(query);
            var parsed_query_object = Function("return " + query_object.ag)();
            var _query = this.default_query;
            var aggrigate = [{ $match: _query }];
            if (parsed_query_object) {
                try {
                    parsed_query_object.forEach(function (filter) {
                        aggrigate.push(filter);
                    });
                }
                catch (e) {
                    this.error_handler(e);
                }
            }
            var collection = "";
            if (query_object.co) {
                collection = query_object.co;
            }
            var model = this.models[collection];
            if (!model) {
                model = this.models["Default"];
            }
            return model.aggregate(aggrigate).exec();
        };
        CustomBehavior.prototype.GetUrl = function (target_url_string, parent) {
            var resolved_url_string = this.ResolveUrl(target_url_string);
            var host_string = parent.config.protocol + "://" + parent.config.domain;
            var target_url = url.resolve(host_string, resolved_url_string);
            //let target_url: any = url.parse(resolved_url_string);
            //  let host: string = target_url.host;
            //  if (host) {
            //      host_string = host;
            //  }
            //  let url_string: string = host_string + resolved_url_string;
            var options = {
                uri: target_url,
                method: "GET",
                timeout: parent.config.timeout,
                headers: {
                    'User-Agent': parent.config.ua
                },
            };
            return requestpromise(options);
        };
        CustomBehavior.prototype.SplitFormat = function (value, callback) {
            if (value) {
                var splited = value.split("|");
                if (splited.length > 1) {
                    _.forEach(splited, function (element) {
                        if (element) {
                            callback(element);
                        }
                    });
                }
                else {
                    callback(value);
                }
            }
        };
        CustomBehavior.prototype.ResolveUrl = function (value) {
            var _this = this;
            var result = "";
            this.SplitFormat(value, function (element) {
                var appender = element;
                var trimed = element.trim();
                switch (trimed) {
                    case "{#name:document}":
                        appender = _this.parent_name;
                        break;
                    case "{#name:self}":
                        appender = _this.name;
                        break;
                    case "{#userid}":
                        appender = _this.id;
                        break;
                    case "{#namespace}":
                        appender = _this.namespace;
                        break;
                    case "{#query:self}":
                        appender = _this.Query(_this.page_params);
                        break;
                    default:
                }
                result += appender;
            });
            return result;
        };
        CustomBehavior.prototype.FieldValue = function (object, params, position, parent) {
            var result = null;
            var full_params = params.trim();
            if (full_params) {
                var full_param_array = full_params.split("==");
                var path = full_param_array[0].trim();
                // parse object path
                if (path) {
                    var isObject_1 = function (value) {
                        var result = false;
                        if (value !== null) {
                            result = ((typeof value === 'function') || (typeof value === 'object'));
                        }
                        return result;
                    };
                    var Search_1 = function (object, index) {
                        if (object) {
                            if (splited_path_1.length > index) {
                                if (isObject_1(object)) {
                                    if (splited_path_1[index] in object) {
                                        return Search_1(object[splited_path_1[index]], ++index);
                                    }
                                    else {
                                        return ""; //default
                                    }
                                }
                            }
                            else {
                                return object;
                            }
                        }
                    };
                    var splited_path_1 = path.split("."); // resolve path ex:  a.b.c
                    if (splited_path_1.length == 1) {
                        if (path[0] == "#") {
                            var field_name = path; // filter_names[0] := #specialname
                            var postfix = "#init";
                            var split_field_name = path.split(":");
                            if (split_field_name) {
                                field_name = split_field_name[0];
                                if (split_field_name.length == 2) {
                                    postfix = split_field_name[1];
                                }
                            }
                            switch (field_name) {
                                case "#name":
                                    switch (postfix) {
                                        case "document":
                                            result = this.parent_name;
                                            break;
                                        case "self":
                                        default:
                                            result = this.name;
                                    }
                                    break;
                                case "#userid":
                                    result = this.id;
                                    break;
                                case "#position":
                                    result = position;
                                    break;
                                case "#namespace":
                                    result = this.namespace;
                                    break;
                                case "#query":
                                    switch (postfix) {
                                        case "next":
                                            result = this.Next(this.page_params);
                                            break;
                                        case "prev":
                                            result = this.Prev(this.page_params);
                                            break;
                                        case "self":
                                            result = this.Query(this.page_params);
                                            break;
                                        default:
                                            result = this.page_params[postfix];
                                    }
                                    break;
                                case "#pager":
                                    {
                                        switch (postfix) {
                                            case "page":
                                                result = Search_1(object, 0);
                                                if (!result) {
                                                    result = "";
                                                }
                                                break;
                                            case "index":
                                                result = object.index;
                                                break;
                                            case "current":
                                                result = object.current;
                                                break;
                                            default:
                                                var count = 1;
                                                if (object[postfix]) {
                                                    count = object[postfix].count;
                                                }
                                                result = this.Pager(this.page_params, count);
                                        }
                                    }
                                    break;
                                case "#hasprev":
                                    result = this.HasPrev(this.page_params);
                                    break;
                                case "#hasnext":
                                    {
                                        var count = 1;
                                        if (object[postfix]) {
                                            count = object[postfix].count;
                                        }
                                        result = this.HasNext(this.page_params, count);
                                    }
                                    break;
                                case "#init":
                                    var obj = Search_1(object, 0);
                                    result = obj.content;
                                    break;
                                default:
                            }
                        }
                        else {
                            result = Search_1(object, 0);
                        }
                    }
                    else {
                        result = Search_1(object, 0);
                    }
                }
                // parse filter
                for (var index = 1; index <= full_param_array.length - 1; index++) {
                    var filter_func = full_param_array[index].trim();
                    if (filter_func) {
                        var filter_names = filter_func.split('("'); // filter_names :== [' name ', ' param ") ']
                        var filter_name = filter_names[0].trim(); // filter_names :== ['name', ' param ") '] // ignore space at name.
                        var filter_params = [];
                        if (filter_names.length > 1) {
                            filter_params = filter_names[1].split('")'); // filter_names :== ['name', ' param ']  // not ignore space at param.
                        }
                        var filter = this.filters[filter_name];
                        if (filter) {
                            result = filter(result, filter_params);
                        }
                    }
                }
            }
            return result;
        };
        ;
        CustomBehavior.prototype.ConvertParam = function (params, query_object) {
            if (query_object.co) {
                params.push("co=" + query_object.co);
            }
            if (query_object.q) {
                params.push("q=" + encodeURIComponent(query_object.q));
            }
            if (query_object.so) {
                params.push("so=" + encodeURIComponent(query_object.so));
            }
            if (query_object.ag) {
                params.push("ag=" + encodeURIComponent(query_object.ag));
            }
            if (query_object.l) {
                params.push("l=" + (parseInt(query_object.l, default_length)));
            }
            return params;
        };
        CustomBehavior.prototype.Query = function (query_object) {
            var result = "";
            var keywords = [];
            this.ConvertParam(keywords, query_object);
            if (query_object.s) {
                keywords.push("s=" + parseInt(query_object.s, default_start));
            }
            var delimitter = "?";
            _.forEach(keywords, function (keyword) {
                result += delimitter + keyword;
                delimitter = "&";
            });
            return result;
        };
        CustomBehavior.prototype.Pager = function (query_object, record_count) {
            var _this = this;
            var result = [];
            var OnePage = function (count) {
                var result = "";
                var keywords = [];
                _this.ConvertParam(keywords, query_object);
                if (query_object.s) {
                    keywords.push("s=" + (count));
                }
                var delimitter = "?";
                _.forEach(keywords, function (keyword) {
                    result += delimitter + keyword;
                    delimitter = "&";
                });
                return result;
            };
            var page_length = parseInt(query_object.l, default_length);
            if (!page_length) {
                page_length = 1;
            }
            var page_start = parseInt(query_object.s, default_start);
            var index = 0;
            for (var count = 0; count < record_count; count += page_length) {
                result.push({
                    "#pager:page": OnePage(count),
                    "index": index + 1,
                    "current": (Math.floor(page_start / page_length) == index++)
                });
            }
            return result;
        };
        CustomBehavior.prototype.Next = function (query_object) {
            var result = "";
            var keywords = [];
            this.ConvertParam(keywords, query_object);
            if (query_object.s) {
                keywords.push("s=" + (parseInt(query_object.s, default_start) + parseInt(query_object.l, default_length)));
            }
            var delimitter = "?";
            _.forEach(keywords, function (keyword) {
                result += delimitter + keyword;
                delimitter = "&";
            });
            return result;
        };
        CustomBehavior.prototype.Prev = function (query_object) {
            var result = "";
            var keywords = [];
            this.ConvertParam(keywords, query_object);
            if (query_object.s) {
                var s = parseInt(query_object.s, default_start) - parseInt(query_object.l, default_length);
                if (s < 0) {
                    s = 0;
                }
                keywords.push("s=" + s);
            }
            var delimitter = "?";
            _.forEach(keywords, function (keyword) {
                result += delimitter + keyword;
                delimitter = "&";
            });
            return result;
        };
        CustomBehavior.prototype.HasNext = function (query_object, record_count) {
            var result = false;
            if (query_object.s) {
                var current_last = parseInt(query_object.s, default_start) + parseInt(query_object.l, default_length);
                result = (current_last < record_count);
            }
            return result;
        };
        CustomBehavior.prototype.HasPrev = function (query_object) {
            var result = false;
            if (query_object.s) {
                var current_last = parseInt(query_object.s, default_start);
                result = (current_last > 0);
            }
            return result;
        };
        CustomBehavior.prototype.ResolveFormat = function (data, value, position, parent) {
            var _this = this;
            var result = "";
            this.SplitFormat(value.content, function (element) {
                var appender = element;
                var trimed = element.trim();
                if (data) {
                    if ("{" == trimed[0] && trimed[trimed.length - 1] == "}") {
                        var sliceed = trimed.slice(1, -1);
                        appender = _this.FieldValue(data, sliceed.trim(), position, parent); // fragment, model
                    }
                }
                result += appender;
            });
            //    let p = this.page_params;
            return result;
        };
        CustomBehavior.prototype.ToQueryFormat = function () {
            var params = new Params();
            params.FromParams(this.page_params);
            return params.ToQueryFormat();
        };
        return CustomBehavior;
    }());
    ScannerBehavior.CustomBehavior = CustomBehavior;
})(ScannerBehavior || (ScannerBehavior = {}));
module.exports = ScannerBehavior;
//# sourceMappingURL=scanner_behavior.js.map