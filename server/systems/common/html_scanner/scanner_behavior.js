/**
 * Created by oda on 2017/07/05.
 */
var ScannerBehavior;
(function (ScannerBehavior) {
    const url = require('url');
    const jsdom = require("node-jsdom");
    const moment = require("moment");
    const _ = require('lodash');
    const requestpromise = require('request-promise');
    class Params {
        constructor() {
            this.params = {};
        }
        FromParams(params) {
            this.params = params;
        }
        // co::Article;q::{"content.type.value":"a"};l::10;s::2;so::{"name":1};
        FromQueryFormat(query) {
            let result = {};
            if (query) {
                let splited = query.split(";");
                _.forEach(splited, (element) => {
                    let pair = element.split("::");
                    if (pair.length == 2) {
                        result[pair[0]] = pair[1];
                    }
                });
            }
            this.params = result;
        }
        ToParams() {
            return this.params;
        }
        ToParseParams() {
            let result = "";
            let keywords = [];
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
                keywords.push("l=" + parseInt(this.params.l, 10));
            }
            if (this.params.s) {
                keywords.push("s=" + parseInt(this.params.s, 10));
            }
            let delimitter = "?";
            _.forEach(keywords, (keyword) => {
                result += delimitter + keyword;
                delimitter = "&";
            });
            return result;
        }
        ToQueryFormat() {
            let result = "";
            if (this.params["co"]) {
                result += 'co::' + this.params["co"] + ';';
            }
            if (this.params["q"]) {
                result += 'q::' + this.params["q"] + ';';
            }
            if (this.params["l"]) {
                result += 'l::' + this.params["l"] + ';';
            }
            if (this.params["s"]) {
                result += 's::' + this.params["s"] + ';';
            }
            if (this.params["so"]) {
                result += 'so::' + this.params["so"] + ';';
            }
            return result;
        }
    }
    class CustomBehavior {
        constructor(parent_name, name, id, params, isdocument, models) {
            this.name = "";
            this.parent_name = "";
            this.id = "";
            this.parent_name = parent_name;
            this.name = name;
            this.id = id;
            this.page_params = params;
            this.isdocument = isdocument;
            this.models = models;
            this.default_query = { "userid": this.id };
            this.filters = {
                date: (result, param) => {
                    try {
                        let format = "MM/DD";
                        if (param) {
                            format = param;
                        }
                        let date = moment(result);
                        result = date.format(format);
                    }
                    catch (e) {
                    }
                    return result;
                }
            };
        }
        ParseQueryFormat(query) {
            let params = new Params();
            params.FromQueryFormat(query);
            return params.ToParams();
        }
        GetDatasource(query, parent) {
            let result_promise = null;
            //           let depth: number = 0;
            //           let position: number = 0;
            //         if (parent) {
            //           depth = parent.depth;
            //           position = parent.position;
            //       }
            let query_object = this.ParseQueryFormat(query);
            let _query = this.default_query;
            if (query_object.q) {
                try {
                    _query = { "$and": [this.default_query, JSON.parse(query_object.q)] };
                }
                catch (e) {
                }
            }
            let limit = 0;
            if (query_object.l) {
                try {
                    limit = parseInt(query_object.l, 10);
                }
                catch (e) {
                }
            }
            let skip = 0;
            if (query_object.s) {
                try {
                    skip = parseInt(query_object.s, 10);
                }
                catch (e) {
                }
            }
            let sort = {};
            if (query_object.so) {
                try {
                    sort = JSON.parse(query_object.so);
                }
                catch (e) {
                }
            }
            let collection = "";
            if (query_object.co) {
                collection = query_object.co;
            }
            let model = this.models[collection];
            if (!model) {
                model = this.models["Default"];
            }
            result_promise = model.find(_query).limit(limit).skip(skip).sort(sort).exec();
            return result_promise;
        }
        GetCount(query, parent) {
            let result_promise = null;
            //        let depth: number = 0;
            //        let position: number = 0;
            //        if (parent) {
            //            depth = parent.depth;
            //            position = parent.position;
            //        }
            let query_object = this.ParseQueryFormat(query);
            let _query = this.default_query;
            if (query_object.q) {
                try {
                    _query = { "$and": [this.default_query, JSON.parse(query_object.q)] };
                }
                catch (e) {
                }
            }
            let collection = "";
            if (query_object.co) {
                collection = query_object.co;
            }
            let model = this.models[collection];
            if (!model) {
                model = this.models["Default"];
            }
            result_promise = model.count(_query).exec();
            return result_promise;
        }
        GetUrl(target_url_string, parent) {
            let result_promise = null;
            //    let depth: number = parent.depth;
            //    let position: number = parent.position;
            let resolved_url_string = this.ResolveUrl(target_url_string);
            let target_url = url.parse(resolved_url_string);
            let host_string = parent.config.protocol + "://" + parent.config.domain;
            let host = target_url.host;
            if (host) {
                host_string = host;
            }
            let url_string = host_string + resolved_url_string;
            let options = {
                uri: url_string,
                method: "GET",
                timeout: parent.config.timeout,
                headers: {
                    'User-Agent': parent.config.ua
                },
            };
            result_promise = requestpromise(options);
            return result_promise;
        }
        SplitFormat(value, callback) {
            if (value) {
                let splited = value.split("|");
                if (splited.length > 1) {
                    _.forEach(splited, (element) => {
                        if (element) {
                            callback(element);
                        }
                    });
                }
                else {
                    callback(value);
                }
            }
        }
        ResolveUrl(value) {
            let result = "";
            this.SplitFormat(value, (element) => {
                let appender = element;
                let trimed = element.trim();
                switch (trimed) {
                    case "{#name:document}":
                        appender = this.parent_name;
                        break;
                    case "{#name:self}":
                        appender = this.name;
                        break;
                    case "{#userid}":
                        appender = this.id;
                        break;
                    case "{#query:self}":
                        appender = this.Query(this.page_params);
                        break;
                    default:
                }
                result += appender;
            });
            return result;
        }
        FieldValue(object, params, parent) {
            //    let depth: number = parent.depth;
            //    let position: number = parent.position;
            let result = null;
            let full_params = params.trim();
            if (full_params) {
                let full_param_array = full_params.split("==");
                let path = full_param_array[0].trim();
                // parse object path
                if (path) {
                    let isObject = (value) => {
                        let result = false;
                        if (value !== null) {
                            result = ((typeof value === 'function') || (typeof value === 'object'));
                        }
                        return result;
                    };
                    let Search = (object, index) => {
                        if (object) {
                            if (splited_path.length > index) {
                                if (isObject(object)) {
                                    if (splited_path[index] in object) {
                                        return Search(object[splited_path[index]], ++index);
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
                    let splited_path = path.split("."); // resolve path ex:  a.b.c
                    if (splited_path.length == 1) {
                        if (path[0] == "#") {
                            let field_name = path; // filter_names[0] := #specialname
                            let postfix = "#init";
                            let split_field_name = path.split(":");
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
                                case "#query":
                                    switch (postfix) {
                                        case "next":
                                            result = this.Next(this.page_params);
                                            break;
                                        case "prev":
                                            result = this.Prev(this.page_params);
                                            break;
                                        case "self":
                                        default:
                                            result = this.Query(this.page_params);
                                    }
                                    break;
                                case "#pager":
                                    {
                                        switch (postfix) {
                                            case "page":
                                                result = Search(object, 0);
                                                break;
                                            case "index":
                                                result = object.index;
                                                break;
                                            case "current":
                                                result = object.current;
                                                break;
                                            default:
                                                let count = 1;
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
                                        let count = 1;
                                        if (object[postfix]) {
                                            count = object[postfix].count;
                                        }
                                        result = this.HasNext(this.page_params, count);
                                    }
                                    break;
                                case "#init":
                                    let obj = Search(object, 0);
                                    result = obj.content;
                                    break;
                                default:
                            }
                        }
                        else {
                            result = Search(object, 0);
                        }
                    }
                    else {
                        result = Search(object, 0);
                    }
                }
                // parse filter
                for (var index = 1; index <= full_param_array.length - 1; index++) {
                    let filter_func = full_param_array[index].trim();
                    if (filter_func) {
                        let filter_names = filter_func.split('("'); // filter_names :== [' name ', ' param ") ']
                        let filter_name = filter_names[0].trim(); // filter_names :== ['name', ' param ") '] // ignore space at name.
                        let filter_params = [];
                        if (filter_names.length > 1) {
                            filter_params = filter_names[1].split('")'); // filter_names :== ['name', ' param ']  // not ignore space at param.
                        }
                        let filter = this.filters[filter_name];
                        if (filter) {
                            result = filter(result, filter_params[0]);
                        }
                    }
                }
            }
            return result;
        }
        ;
        ConvertParam(params, query_object) {
            if (query_object.co) {
                params.push("co=" + query_object.co);
            }
            if (query_object.q) {
                params.push("q=" + encodeURIComponent(query_object.q));
            }
            if (query_object.so) {
                params.push("so=" + encodeURIComponent(query_object.so));
            }
            if (query_object.l) {
                params.push("l=" + (parseInt(query_object.l, 10)));
            }
            return params;
        }
        Query(query_object) {
            let result = "";
            let keywords = [];
            this.ConvertParam(keywords, query_object);
            if (query_object.s) {
                keywords.push("s=" + parseInt(query_object.s, 10));
            }
            let delimitter = "?";
            _.forEach(keywords, (keyword) => {
                result += delimitter + keyword;
                delimitter = "&";
            });
            return result;
        }
        Pager(query_object, record_count) {
            let result = [];
            let OnePage = (count) => {
                let result = "";
                let keywords = [];
                this.ConvertParam(keywords, query_object);
                if (query_object.s) {
                    keywords.push("s=" + (count));
                }
                let delimitter = "?";
                _.forEach(keywords, (keyword) => {
                    result += delimitter + keyword;
                    delimitter = "&";
                });
                return result;
            };
            let page_length = parseInt(query_object.l, 10);
            let page_start = parseInt(query_object.s, 10);
            let index = 0;
            for (var count = 0; count < record_count; count += page_length) {
                result.push({
                    "#pager:page": OnePage(count),
                    "index": index + 1,
                    "current": (Math.floor(page_start / page_length) == index++)
                });
            }
            return result;
        }
        Next(query_object) {
            let result = "";
            let keywords = [];
            this.ConvertParam(keywords, query_object);
            if (query_object.s) {
                keywords.push("s=" + (parseInt(query_object.s, 10) + parseInt(query_object.l, 10)));
            }
            let delimitter = "?";
            _.forEach(keywords, (keyword) => {
                result += delimitter + keyword;
                delimitter = "&";
            });
            return result;
        }
        Prev(query_object) {
            let result = "";
            let keywords = [];
            this.ConvertParam(keywords, query_object);
            if (query_object.s) {
                let s = parseInt(query_object.s, 10) - parseInt(query_object.l, 10);
                if (s < 0) {
                    s = 0;
                }
                keywords.push("s=" + s);
            }
            let delimitter = "?";
            _.forEach(keywords, (keyword) => {
                result += delimitter + keyword;
                delimitter = "&";
            });
            return result;
        }
        HasNext(query_object, record_count) {
            let result = false;
            if (query_object.s) {
                let current_last = parseInt(query_object.s, 10) + parseInt(query_object.l, 10);
                result = (current_last < record_count);
            }
            return result;
        }
        HasPrev(query_object) {
            let result = false;
            if (query_object.s) {
                let current_last = parseInt(query_object.s, 10);
                result = (current_last > 0);
            }
            return result;
        }
        ResolveFormat(data, value, parent) {
            let result = "";
            this.SplitFormat(value.content, (element) => {
                let appender = element;
                let trimed = element.trim();
                if (data) {
                    if ("{" == trimed[0] && trimed[trimed.length - 1] == "}") {
                        let sliceed = trimed.slice(1, -1);
                        appender = this.FieldValue(data, sliceed.trim(), parent); // fragment, model
                    }
                }
                result += appender;
            });
            return result;
        }
        ToQueryFormat() {
            let params = new Params();
            params.FromParams(this.page_params);
            return params.ToQueryFormat();
        }
    }
    ScannerBehavior.CustomBehavior = CustomBehavior;
})(ScannerBehavior || (ScannerBehavior = {}));
module.exports = ScannerBehavior;
//# sourceMappingURL=scanner_behavior.js.map