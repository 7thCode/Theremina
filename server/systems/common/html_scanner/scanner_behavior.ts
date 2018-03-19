/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace ScannerBehavior {

    const url: any = require('url');
    const moment: any = require("moment");
    const _: any = require('lodash');
    const requestpromise: any = require('request-promise');

    const default_start:number = 0;
    const default_length:number = 12;

    export interface Behavior {
        isdocument: boolean;

        GetDatasource(query: any, parent: any): any;

        GetCount(query: any, parent: any): any;

        Aggregate(query: any, parent: any): any;

        GetUrl(target_url_string: string, parent): any;

        FieldValue(object: any, path: string, position: number, parent: any): any;

        ResolveFormat(data: any, value: { content: any, count: number }, position: number, parent: any): string;
    }

    class Params {

        private params: any = {};
     //   private filters: any = {};

        constructor() {
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

        public FromParams(params): void {
            this.params = params;
        }

        // co::Article;q::{"content.type.value":"a"};l::10;s::2;so::{"name":1};
        public FromQueryFormat(query): void {
            let result: any = {};
            if (query) {
                let splited: string[] = query.split(";");
                _.forEach(splited, (element) => {
                    let pair: string[] = element.split("::");
                    if (pair.length == 2) {
                        result[pair[0]] = pair[1];
                    }
                });
            }
            this.params = result;
        }

        public ToParams() {
            return this.params;
        }

        public ToParseParams(): string {
            let result: string = "";
            let keywords: string[] = [];

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

            let delimitter: string = "?";          //  keywords to "?xxxx&yyyy&zzzz"
            _.forEach(keywords, (keyword) => {
                result += delimitter + keyword;
                delimitter = "&";
            });

            return result;
        }

        public ToQueryFormat(): string {
            let result: string = "";
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
        }
    }

    export class CustomBehavior implements Behavior {

        public name: string = "";
        public parent_name: string = "";
        public id: string = "";
        public namespace: string;
        public page_params: any;
        public isdocument: boolean;
        public filters: {};

        public models: any[];

        private default_query: any;

        private error_handler(e) {

        }

        constructor(parent_name: string, name: string, id: string, namespace: string, params: any, isdocument: boolean, models: any) {
            this.parent_name = parent_name;
            this.name = name;
            this.id = id;
            this.namespace = namespace;
            this.page_params = params;
            this.isdocument = isdocument;
            this.models = models;
            this.default_query = {"userid": this.id};
            this.filters = {
                date: (result: string, param: string): string => {
                    try {
                        let format: string = "MM/DD";
                        if (param[0]) {
                            format = param[0];
                        }
                        moment.locale("ja", {
                            weekdays: ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"],
                            weekdaysShort: ["日", "月", "火", "水", "木", "金", "土"]
                        });
                        //        moment.locale("ja");
                        let date: any = moment(result);
                        result = date.format(format);
                    } catch (e) {
                        this.error_handler(e);
                    }
                    return result;
                },
                substr: (result: string, param: string): string => {
                    try {
                        let limit = parseInt(param[0]);
                        if (result.length > limit) {
                            result = result.substr(0, limit) + "...";
                        }
                    } catch (e) {
                        this.error_handler(e);
                    }
                    return result;
                },
                convert: (result: string, param: string): string => {
                    try {
                        let param_object = JSON.parse(param[0]);
                        result = param_object[result];
                    } catch (e) {
                        this.error_handler(e);
                    }
                    return result;
                },
                encodeURIComponent: (result: string, param: string): string => {
                    try {
                        result = encodeURIComponent(result);
                    } catch (e) {
                        this.error_handler(e);
                    }
                    return result;
                },
                add: (result: string, param: string): string => {
                    try {
                        result = String(parseInt(result, 0) + parseInt(param[0], 0));
                    } catch (e) {
                        this.error_handler(e);
                    }
                    return result;
                },
                strip: (result: string, param: string): string => {
                    try {
                        result = result.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'')
                    } catch (e) {
                        this.error_handler(e);
                    }
                    return result;
                }
            };
        }

        private ParseQueryFormat(query: string) {
            let result = null;
            if (query[0] == "#") { // special name (#fieldname:postfix)
                let field_name: string = "";
                let postfix: string = "";
                let split_field_name: string[] = query.split(":");
                if (split_field_name) {
                    field_name = split_field_name[0];
                    if (split_field_name.length == 2) {
                        postfix = split_field_name[1];
                    }
                }
                switch (field_name) {
                    case "#query" :
                        switch (postfix) {
                            case "self":
                                result = this.page_params;  // #query:self
                                break;
                            default:
                                let params: any = new Params();
                                params.FromQueryFormat(this.page_params[postfix]); // #query:xxxx
                                result = params.ToParams();
                        }
                        break;
                    default:
                }
            } else {
                let params: any = new Params();
                params.FromQueryFormat(query);
                result = params.ToParams();
            }
            return result;
        }

//{"content.date.value":{"$gte":ISODate("2014-04-01T12:34:55+09:00"),"$lte":ISODate("2014-04-01T12:34:57+09:00")}}
        public GetDatasource(query: any, parent: any): any {// db query

            let query_object: any = this.ParseQueryFormat(query);

            let _query: any = this.default_query;
            if (query_object.q) {
                try {
                    //      let query = new Function("value", "with (value) {return value;}")(query_object.q);
                    //      _query = {"$and": [this.default_query, query]};
                    _query = {"$and": [this.default_query, Function("return " + query_object.q)()]};
                } catch (e) {
                    this.error_handler(e);
                }
            }

            let limit: number = 0;
            if (query_object.l) {
                try {
                    limit = parseInt(query_object.l, default_length);
                } catch (e) {
                    this.error_handler(e);
                }
            }

            let skip: number = 0;
            if (query_object.s) {
                try {
                    skip = parseInt(query_object.s, default_start);
                } catch (e) {
                    this.error_handler(e);
                }
            }

            let sort: any = {};
            if (query_object.so) {
                try {
                    sort = JSON.parse(query_object.so);
                } catch (e) {
                    this.error_handler(e);
                }
            }

            let collection: any = "";
            if (query_object.co) {
                collection = query_object.co;
            }

            let model: any = this.models[collection];
            if (!model) {
                model = this.models["Default"];
            }

            return model.find(_query).limit(limit).skip(skip).sort(sort).exec();
        }

        public GetCount(query: any, parent: any): any {// db query

            let query_object: any = this.ParseQueryFormat(query);

            let _query: any = this.default_query;
            if (query_object.q) {
                try {
                    _query = {"$and": [this.default_query, Function("return " + query_object.q)()]};
                } catch (e) {
                    this.error_handler(e);
                }
            }

            let collection: any = "";
            if (query_object.co) {
                collection = query_object.co;
            }

            let model: any = this.models[collection];
            if (!model) {
                model = this.models["Default"];
            }

            return model.count(_query).exec();
        }

        public Aggregate(query: any, parent: any): any {// db query

            let query_object: any = this.ParseQueryFormat(query);
            let parsed_query_object = Function("return " + query_object.ag)();
            let _query: any = this.default_query;
            let aggrigate: any = [{$match: _query}];
            if (parsed_query_object) {
                try {
                    parsed_query_object.forEach((filter) => {
                        aggrigate.push(filter);
                    });
                } catch (e) {
                    this.error_handler(e);
                }
            }

            let collection: any = "";
            if (query_object.co) {
                collection = query_object.co;
            }

            let model: any = this.models[collection];
            if (!model) {
                model = this.models["Default"];
            }

            return model.aggregate(aggrigate).exec();
        }

        public GetUrl(target_url_string: string, parent: any): any {// url

      //      let resolved_url_string_0: string =  this.FieldValue(object, target_url_string, 0, parent)
            let resolved_url_string: string = this.ResolveUrl(target_url_string);
            let host_string: string = parent.config.protocol + "://" + parent.config.domain;
            let target_url: any = url.resolve(host_string, resolved_url_string);

            //let target_url: any = url.parse(resolved_url_string);

            //  let host: string = target_url.host;
            //  if (host) {
            //      host_string = host;
            //  }
            //  let url_string: string = host_string + resolved_url_string;
            let options: any = {
                uri: target_url,
                method: "GET",
                timeout: parent.config.timeout,
                headers: {
                    'User-Agent': parent.config.ua
                },
            };

            return requestpromise(options);
        }

        private SplitFormat(value: string, callback: (element) => void): void {
            if (value) {
                let splited: string[] = value.split("|");
                if (splited.length > 1) {
                    _.forEach(splited, (element) => {
                        if (element) {
                            callback(element);
                        }
                    });
                } else {
                    callback(value);
                }
            }
        }

        public UrlValue(sliceed:string):string {
            let result:string =  "";
            if (sliceed[0] == "#") {
                let field_name: string = sliceed;                              // filter_names[0] := #specialname
                let postfix = "";
                let split_field_name: string[] = field_name.split(":");
                if (split_field_name) {
                    field_name = split_field_name[0];
                    if (split_field_name.length == 2) {
                        postfix = split_field_name[1];
                    }
                }

                switch (field_name) {
                    case "#userid" :
                        result = this.id;
                        break;
                    case "#namespace" :
                        result = this.namespace;
                        break;
                    case "#name":
                        switch (postfix) {
                            case "document":
                                result = this.parent_name;
                                break;
                            case "self":
                            default:
                                result = this.name;
                                break;
                        }
                        break;
                    case "#query" :
                        switch (postfix) {
                            case "self":
                                result = this.Query(this.page_params);
                                break;
                            default:
                                result = this.page_params[postfix];
                        }
                        break;
                    default:
                }
            }
            return result;
        }

        public FieldValue(object: any, params: string, position: number, parent: any): any {
            let result: any = null;
            let full_params = params.trim();
            if (full_params) {
                let full_param_array: string[] = full_params.split("==");
                let path: string = full_param_array[0].trim();

                // parse object path
                if (path) {
                    let isObject = (value: any): boolean => {
                        let result: boolean = false;
                        if (value !== null) {
                            result = ((typeof value === 'function') || (typeof value === 'object'));
                        }
                        return result;
                    };
                    let Search = (object: any, index: number): any => {
                        if (object) {
                            if (splited_path.length > index) {
                                if (isObject(object)) {
                                    if (splited_path[index] in object) {
                                        return Search(object[splited_path[index]], ++index);
                                    } else {
                                        return ""; //default
                                    }
                                }
                            } else {
                                return object;
                            }
                        }
                    };
                    let splited_path: string[] = path.split(".");   // resolve path ex:  a.b.c
                    if (splited_path.length == 1) {                             // aaa
                        if (path[0] == "#") {
                            let field_name: string = path;                              // filter_names[0] := #specialname
                            let postfix: string = "#init";
                            let split_field_name: string[] = path.split(":");
                            if (split_field_name) {
                                field_name = split_field_name[0];
                                if (split_field_name.length == 2) {
                                    postfix = split_field_name[1];
                                }
                            }
                            switch (field_name) { // resolve special name
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
                                case "#userid" :
                                    result = this.id;
                                    break;
                                case "#position" :
                                    result = position;
                                    break;
                                case "#namespace" :
                                    result = this.namespace;
                                    break;
                                case "#query" :
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
                                case "#pager" : {
                                    switch (postfix) {
                                        case "page" :
                                            result = Search(object, 0);
                                            if (!result) {
                                                result = "";
                                            }
                                            break;
                                        case "index" :
                                            result = object.index;
                                            break;
                                        case "current" :
                                            result = object.current;
                                            break;
                                        default:
                                            let count: number = 1;
                                            if (object[postfix]) {
                                                count = object[postfix].count;
                                            }
                                            result = this.Pager(this.page_params, count);
                                    }
                                }
                                    break;
                                case "#hasprev" :
                                    result = this.HasPrev(this.page_params);
                                    break;
                                case "#hasnext" : {
                                    let count: number = 1;
                                    if (object[postfix]) {
                                        count = object[postfix].count;
                                    }
                                    result = this.HasNext(this.page_params, count);
                                }
                                    break;
                                case "#init" :
                                    let obj: any = Search(object, 0);
                                    result = obj.content;
                                    break;
                                default:
                            }
                        } else {
                            result = Search(object, 0);
                        }
                    } else {
                        result = Search(object, 0);
                    }
                }

                // parse filter
                for (var index: number = 1; index <= full_param_array.length - 1; index++) {     // resolve filter ex:  name(" param ")
                    let filter_func: string = full_param_array[index].trim();
                    if (filter_func) {
                        let filter_names: string[] = filter_func.split('("');             // filter_names :== [' name ', ' param ") ']
                        let filter_name: string = filter_names[0].trim();                        // filter_names :== ['name', ' param ") '] // ignore space at name.
                        let filter_params: any[] = [];
                        if (filter_names.length > 1) {
                            filter_params = filter_names[1].split('")');        // filter_names :== ['name', ' param ']  // not ignore space at param.
                        }

                        let filter: (s1: string, s2: string[]) => void = this.filters[filter_name];
                        if (filter) {
                            result = filter(result, filter_params);
                        }
                    }
                }
            }

            return result;
        };

        private ConvertParam(params: string[], query_object: any): string[] {

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
        }

        private Query(query_object: any): string {
            let result: string = "";
            let keywords: string[] = [];
            this.ConvertParam(keywords, query_object);

            if (query_object.s) {
                keywords.push("s=" + parseInt(query_object.s, default_start));
            }

            let delimitter: string = "?";
            _.forEach(keywords, (keyword) => {
                result += delimitter + keyword;
                delimitter = "&";
            });

            return result;
        }

        private Pager(query_object: any, record_count: number): any[] {
            let result: any[] = [];

            let OnePage = (count) => {
                let result: string = "";
                let keywords: string[] = [];
                this.ConvertParam(keywords, query_object);

                if (query_object.s) {
                    keywords.push("s=" + (count));
                }

                let delimitter: string = "?";
                _.forEach(keywords, (keyword) => {
                    result += delimitter + keyword;
                    delimitter = "&";
                });

                return result;
            };

            let page_length = parseInt(query_object.l, default_length);
            if (!page_length) {
                page_length = 1;
            }

            let page_start: number = parseInt(query_object.s, default_start);

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

        private Next(query_object: any): string {
            let result: string = "";
            let keywords: string[] = [];
            this.ConvertParam(keywords, query_object);

            if (query_object.s) {
                keywords.push("s=" + (parseInt(query_object.s, default_start) + parseInt(query_object.l, default_length)));
            }

            let delimitter: string = "?";
            _.forEach(keywords, (keyword) => {
                result += delimitter + keyword;
                delimitter = "&";
            });

            return result;
        }

        private Prev(query_object: any): string {
            let result: string = "";
            let keywords: string[] = [];
            this.ConvertParam(keywords, query_object);

            if (query_object.s) {
                let s: number = parseInt(query_object.s, default_start) - parseInt(query_object.l, default_length);
                if (s < 0) {
                    s = 0;
                }
                keywords.push("s=" + s);
            }

            let delimitter: string = "?";
            _.forEach(keywords, (keyword) => {
                result += delimitter + keyword;
                delimitter = "&";
            });

            return result;
        }

        private HasNext(query_object: any, record_count: number): boolean {
            let result: boolean = false;
            if (query_object.s) {
                let current_last: number = parseInt(query_object.s, default_start) + parseInt(query_object.l, default_length);
                result = (current_last < record_count);
            }
            return result;
        }

        private HasPrev(query_object: any): boolean {
            let result: boolean = false;
            if (query_object.s) {
                let current_last: number = parseInt(query_object.s, default_start);
                result = (current_last > 0);
            }
            return result;
        }

        public ResolveFormat(data: any, value: { content: any, count: number }, position: number, parent: any): string { //model
            let result: string = "";
            this.SplitFormat(value.content, (element) => {//model
                let appender: any = element;
                let trimed: string = element.trim();
                if (data) {
                    if ("{" == trimed[0] && trimed[trimed.length - 1] == "}") {
                        let sliceed: string = trimed.slice(1, -1);
                        appender = this.FieldValue(data, sliceed.trim(), position, parent); // fragment, model
                    }
                }
                result += appender;
            });

            return result;
        }

        public ResolveUrl(value: string): string {
            let result: string = "";
            this.SplitFormat(value, (element) => {
                let appender: any = element;
                let trimed: string = element.trim();
                if ("{" == trimed[0] && trimed[trimed.length - 1] == "}") {
                    let sliceed: string = trimed.slice(1, -1);
                    appender = this.UrlValue(sliceed.trim());
                }
                result += appender;
            });
            return result;
        }

        public ToQueryFormat(): string {
            let params: any = new Params();
            params.FromParams(this.page_params);
            return params.ToQueryFormat();
        }
    }

}

module.exports = ScannerBehavior;

