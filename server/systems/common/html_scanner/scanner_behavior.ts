/**
 * Created by oda on 2017/07/05.
 */

namespace ScannerBehavior {

    const url = require('url');
    const moment = require("moment");
    const _ = require('lodash');
    const requestpromise = require('request-promise');

    export interface Behavior {
        isdocument: boolean;

        GetDatasource(query: any, parent): any;

        GetCount(query: any, parent): any;

        GetUrl(target_url_string: string, parent): any;

        FieldValue(object: any, path: string, position: number, parent: any): any;

        ResolveFormat(data: any, value: { content: any, count: number }, position: number, parent: any): string;
    }

    class Params {

        private params: any = {};

        constructor() {

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
                keywords.push("l=" + parseInt(this.params.l, 10));
            }

            if (this.params.s) {
                keywords.push("s=" + parseInt(this.params.s, 10));
            }

            let delimitter: string = "?";
            _.forEach(keywords, (keyword) => {
                result += delimitter + keyword;
                delimitter = "&";
            });

            return result;
        }

        public ToQueryFormat(): string {
            let result: string = "";

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
                date: (result: string, param: string) => {
                    try {
                        let format: string = "MM/DD";
                        if (param) {
                            format = param;
                        }
                        let date: any = moment(result);
                        result = date.format(format);
                    } catch (e) {

                    }
                    return result;
                }
            }
        }

        private ParseQueryFormat(query: any) {
            let result = null;
            if (query == "#query:self") {
                result = this.page_params;
            } else {
                let params: any = new Params();
                params.FromQueryFormat(query);
                result = params.ToParams();
            }
            return result;
        }

        public GetDatasource(query: any, parent: any): any {// db query

            let query_object: any = this.ParseQueryFormat(query);

            let _query: any = this.default_query;
            if (query_object.q) {
                try {
                    _query = {"$and": [this.default_query, JSON.parse(query_object.q)]};
                } catch (e) {

                }
            }

            let limit: number = 0;
            if (query_object.l) {
                try {
                    limit = parseInt(query_object.l, 10);
                } catch (e) {

                }
            }

            let skip: number = 0;
            if (query_object.s) {
                try {
                    skip = parseInt(query_object.s, 10);
                } catch (e) {

                }
            }

            let sort: any = {};
            if (query_object.so) {
                try {
                    sort = JSON.parse(query_object.so);
                } catch (e) {

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
                    _query = {"$and": [this.default_query, JSON.parse(query_object.q)]};
                } catch (e) {

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

        public GetUrl(target_url_string: string, parent: any): any {// url
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

        private ResolveUrl(value: string): string {
            let result: string = "";
            this.SplitFormat(value, (element) => {
                let appender: any = element;
                let trimed: string = element.trim();
                switch (trimed) {
                    case "{#name:document}":
                        appender = this.parent_name;
                        break;
                    case "{#name:self}":
                        appender = this.name;
                        break;
                    case "{#userid}" :
                        appender = this.id;
                        break;
                    case "{#namespace}" :
                        appender = this.namespace;
                        break;
                    case "{#query:self}" :
                        appender = this.Query(this.page_params);
                        break;
                    default:
                }
                result += appender;
            });
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
                            result = ( (typeof value === 'function') || (typeof value === 'object') );
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
                                        default:
                                            result = this.Query(this.page_params);
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
                            result = filter(result, filter_params[0]);
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

            if (query_object.l) {
                params.push("l=" + (parseInt(query_object.l, 10)));
            }

            return params;
        }

        private Query(query_object: any): string {
            let result: string = "";
            let keywords: string[] = [];
            this.ConvertParam(keywords, query_object);

            if (query_object.s) {
                keywords.push("s=" + parseInt(query_object.s, 10));
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


            let page_length = parseInt(query_object.l, 10);
            if (!page_length) {
                page_length = 1;
            }

            let page_start: number = parseInt(query_object.s, 10);

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
                keywords.push("s=" + (parseInt(query_object.s, 10) + parseInt(query_object.l, 10)));
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
                let s: number = parseInt(query_object.s, 10) - parseInt(query_object.l, 10);
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
                let current_last: number = parseInt(query_object.s, 10) + parseInt(query_object.l, 10);
                result = (current_last < record_count);
            }
            return result;
        }

        private HasPrev(query_object: any): boolean {
            let result: boolean = false;
            if (query_object.s) {
                let current_last: number = parseInt(query_object.s, 10);
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

        public ToQueryFormat(): string {
            let params: any = new Params();
            params.FromParams(this.page_params);
            return params.ToQueryFormat();
        }
    }

}

module.exports = ScannerBehavior;

