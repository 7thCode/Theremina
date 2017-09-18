"use strict";
/**
 * Created by oda on 2017/07/05.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('graceful-fs');
const url = require('url');
const request = require('request');
const requestpromise = require('request-promise');
const jsdom = require("node-jsdom");
const _ = require('lodash');
var HTMLScanner;
(function (HTMLScanner) {
    class NodeScanner {
        constructor(callback) {
            this.document_depth = 0;
            this.depth = 0;
            this.position = 0;
            this.callback = callback;
        }
        static prefix(name) {
            let result = "";
            let splited_name = name.toLowerCase().split(":");
            if (splited_name.length == 2) {
                result = splited_name[0];
            }
            return result;
        }
        static localName(name) {
            let splited_name = name.toLowerCase().split(":");
            return splited_name[splited_name.length - 1];
        }
        ScanChild(base_url, node, data) {
            if (node) {
                let childnodes = node.childNodes;
                this.depth++;
                if (childnodes) {
                    _.forEach(childnodes, (node, index) => {
                        this.position = index;
                        this.ScanNode(base_url, node, data);
                    });
                }
                this.depth--;
            }
            else {
            }
        }
        ScanNode(base_url, node, data) {
            if (node) {
                if (node.childNodes.length > 0) {
                    this.ScanChild(base_url, node, data);
                }
            }
            else {
            }
        }
        ScanHtml(url) {
            this.document_depth++;
            jsdom.env(url, [], (errors, window) => {
                if (!errors) {
                    //          this.callback(null, "each", url);
                    let childnodes = window.document.childNodes;
                    if (childnodes) {
                        _.forEach(childnodes, (element, index) => {
                            this.position = index;
                            this.ScanNode(url, element, null);
                        });
                    }
                }
                else {
                    this.callback(errors, null);
                }
                this.document_depth--;
                if (this.document_depth == 0) {
                    this.callback(null, "");
                }
            });
        }
    }
    HTMLScanner.NodeScanner = NodeScanner;
    class LinkScanner extends NodeScanner {
        constructor() {
            super(...arguments);
            this.links = [];
        }
        static UrlNormalize(base_url, partial_url) {
            return url.resolve(base_url, partial_url);
        }
        ScanLinks(base_url, node, data) {
            if (node.attributes) {
                if (node.attributes.href) {
                    let url_value = node.attributes.href.nodeValue;
                    let target_url_string = LinkScanner.UrlNormalize(base_url, url_value);
                    if (_.indexOf(this.links, target_url_string) == -1) {
                        this.links.push(target_url_string);
                        let parsed_base_url = url.parse(base_url);
                        let parsed_target_url = url.parse(target_url_string);
                        if (parsed_target_url.hostname == parsed_base_url.hostname) {
                            this.ScanHtml(target_url_string);
                        }
                    }
                }
            }
        }
        ScanNode(base_url, node, data) {
            if (node) {
                switch (node.nodeType) {
                    case 1://element
                        switch (node.localName) {
                            case "a":
                                this.ScanLinks(base_url, node, data);
                                break;
                            default:
                                this.ScanChild(base_url, node, data);
                                break;
                        }
                        break;
                    default:
                        this.ScanChild(base_url, node, data);
                }
            }
            else {
            }
        }
    }
    HTMLScanner.LinkScanner = LinkScanner;
    /* DataSourceResolver
    *
    *  与えられたHTMLソースをパース・トラバース。
    *  "foreach","resolve"タグのqueryアトリビュートから得たクエリー文字列から、データソースをクエリー。
    *  与えられたDatasourcesのPromiseを解決する。
    *  クエリー文字列を名前、クエリーの結果を値としてオブジェクトを構成。
    *
    * */
    class DataSourceResolver extends NodeScanner {
        constructor(datasource, callback) {
            super(callback);
            this.datasource_target = [];
            this.datasource = datasource;
        }
        PromisedDataSource(node) {
            let result = null;
            try {
                result = this.datasource.GetDatasource(this, node);
            }
            catch (e) {
                this.callback({ code: 1 }, null);
            }
            return result;
        }
        ScanNode(base_url, node, data) {
            if (node) {
                switch (node.nodeType) {
                    case 1://element
                        let tagname = node.localName;
                        if (tagname) {
                            let prefix = DataSourceResolver.prefix(tagname);
                            let localname = DataSourceResolver.localName(tagname);
                            switch (localname) {
                                case "foreach":
                                    if (prefix == "ds") {
                                        if (node.attributes) {
                                            if (node.attributes.query) {
                                                let query = node.attributes.query;
                                                this.datasource_target.push({
                                                    name: query.nodeValue,
                                                    promise: this.PromisedDataSource(node),
                                                    resolved: ""
                                                });
                                            }
                                        }
                                    }
                                    break;
                                case "resolve":
                                    break;
                                default:
                                    break;
                            }
                            this.ScanChild(base_url, node, data);
                        }
                        else {
                            this.callback({ code: 1 }, null);
                        }
                        break;
                    default:
                }
            }
            else {
                this.callback({ code: 1 }, null);
            }
        }
        ResolveDataSource(url, result) {
            this.document_depth++;
            jsdom.env(url, [], (errors, window) => {
                if (!errors) {
                    //         this.callback(null, "each", url);
                    let childnodes = window.document.childNodes;
                    if (childnodes) {
                        _.forEach(childnodes, (element, index) => {
                            this.position = index;
                            this.ScanNode(url, element, null);
                        });
                    }
                }
                else {
                    this.callback(errors, null);
                }
                this.document_depth--;
                if (this.document_depth == 0) {
                    Promise.all(this.datasource_target.map((doc) => {
                        let result = null;
                        if (doc.promise) {
                            result = doc.promise;
                        }
                        return result;
                    })).then((resolved) => {
                        _.forEach(resolved, (entry, index) => {
                            result[this.datasource_target[index].name] = entry;
                            //                                result[this.datasource_target[index].name] = [{a:"a", b:[{c:"1"},{c:"2"}]}, {a:"b", b:[{c:"3"},{c:"4"}]}];
                        });
                        this.callback(null, result);
                    }).catch((error) => {
                        this.callback(error, null);
                    });
                }
            });
        }
    }
    HTMLScanner.DataSourceResolver = DataSourceResolver;
    /* UrlResolver
    *
    *  与えられたHTMLソースをパース・トラバース。
    *  "resolve"タグのsrcプロパティから得たURLにHTTP Get。
    *  与えられたDatasourcesのPromiseを解決する。
    *  URLを名前、HTTP Getの結果を値としてオブジェクトを構成。
    *
    * */
    class UrlResolver extends NodeScanner {
        constructor(datasource, callback) {
            super(callback);
            this.datasource_target = [];
            this.datasource = datasource;
        }
        PromisedUrl(url) {
            return requestpromise(url);
        }
        ScanNode(base_url, node, data) {
            if (node) {
                switch (node.nodeType) {
                    case 1://element
                        let tagname = node.localName;
                        if (tagname) {
                            let prefix = UrlResolver.prefix(tagname);
                            let localname = UrlResolver.localName(tagname);
                            switch (localname) {
                                case "foreach":
                                    break;
                                case "resolve":
                                    if (prefix == "ds") {
                                        if (node.attributes) {
                                            if (node.attributes.src) {
                                                let src = node.attributes.src;
                                                this.datasource_target.push({
                                                    name: src.nodeValue,
                                                    promise: this.PromisedUrl(src.nodeValue),
                                                    resolved: ""
                                                });
                                            }
                                        }
                                    }
                                    break;
                                default:
                                    break;
                            }
                            this.ScanChild(base_url, node, data);
                        }
                        break;
                    default:
                }
            }
            else {
                this.callback({ code: 1 }, null);
            }
        }
        ResolveUrl(url, result, data) {
            this.document_depth++;
            jsdom.env(url, [], (errors, window) => {
                if (!errors) {
                    //            this.callback(null, "each", url);
                    let childnodes = window.document.childNodes;
                    if (childnodes) {
                        _.forEach(childnodes, (element, index) => {
                            this.position = index;
                            this.ScanNode(url, element, data);
                        });
                    }
                }
                else {
                    this.callback(errors, null);
                }
                this.document_depth--;
                if (this.document_depth == 0) {
                    Promise.all(this.datasource_target.map((doc) => {
                        let result = null;
                        if (doc.promise) {
                            result = doc.promise;
                        }
                        return result;
                    })).then((resolved) => {
                        _.forEach(resolved, (entry, index) => {
                            result[this.datasource_target[index].name] = entry;
                        });
                        this.callback(null, result);
                    }).catch((error) => {
                        this.callback(error, null);
                    });
                }
            });
        }
    }
    HTMLScanner.UrlResolver = UrlResolver;
    /* Expander
    *
    *  与えられたHTMLソースをパース・トラバース。
    *
    *  ”foreach”,"resolve"タグのsrc,queryアトリビュートから得られた名前をDatasourceと照合する。
    *  ”foreach”タグは、クエリー結果の配列個数分、子ノードを展開する。（foreachタグは展開されない)
    *  ”resolve”タグは、fieldアトリビュートの内容をフィールド名とみなし、解決する。（タグ自体が置き換えられる）
    *  その際、"datasource"ネームスペースのアトリビュートは、値をフィールド名とみなし、値を解決する。
    *
    *  例　　　<div ds:class="fieldname">   ->   <div class="hoge">
    *
    * */
    class Expander extends NodeScanner {
        constructor(datasource, callback) {
            super(callback);
            this.fragments = {};
            this.html = "";
            this.datasource_target = [];
            this.datasource = datasource;
        }
        static FormatToValue(datasource, value) {
            return datasource.ResolveFormat(value);
        }
        static FieldValue(object, path) {
            let splited_path = path.split(".");
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
                        }
                    }
                    else {
                        return object;
                    }
                }
            };
            return Search(object, 0);
        }
        ;
        NodeToElement(base_url, node, data) {
            let localname = node.localName;
            let attribute_string = "";
            if (node.attributes) {
                let number = node.attributes.length;
                for (var index = 0; index < number; index++) {
                    let attribute = node.attributes[index];
                    let prefix = Expander.prefix(attribute.name);
                    let localname = Expander.localName(attribute.name);
                    if (prefix == "ds") {
                        let result = Expander.FieldValue(data, attribute.value);
                        if (result) {
                            attribute_string += ' ' + localname + '="' + Expander.FormatToValue(this.datasource, result) + '"';
                        }
                    }
                    else {
                        attribute_string += ' ' + attribute.localName + '="' + Expander.FormatToValue(this.datasource, attribute.value) + '"';
                    }
                }
            }
            if (node.childNodes.length > 0) {
                this.html += "<" + localname + attribute_string + ">";
                this.ScanChild(base_url, node, data);
                this.html += "</" + localname + ">";
            }
            else {
                let tagname = localname.toLowerCase();
                switch (tagname) {
                    case "link":
                    case "script":
                        this.html += "<" + localname + attribute_string + "></" + localname + ">";
                        break;
                    default:
                        this.html += "<" + localname + attribute_string + "/>";
                        break;
                }
            }
        }
        ScanNode(base_url, node, data) {
            if (node) {
                switch (node.nodeType) {
                    case 1://element
                        let tagname = node.localName;
                        if (tagname) {
                            let prefix = Expander.prefix(tagname);
                            let localname = Expander.localName(tagname);
                            switch (localname) {
                                case "foreach":
                                    if (prefix == "ds") {
                                        if (node.attributes) {
                                            if (node.attributes.query) {
                                                let query = node.attributes.query;
                                                let current_datasource = this.fragments[query.nodeValue];
                                                _.forEach(current_datasource, (data, index) => {
                                                    _.forEach(node.childNodes, (childnode, index) => {
                                                        this.position = index;
                                                        this.ScanNode(base_url, childnode, data);
                                                    });
                                                });
                                            }
                                            else if (node.attributes.field) {
                                                if (data) {
                                                    let field = node.attributes.field;
                                                    let result = Expander.FieldValue(data, field.nodeValue);
                                                    if (result) {
                                                        if (_.isArray(result)) {
                                                            _.forEach(result, (data, index) => {
                                                                _.forEach(node.childNodes, (childnode, index) => {
                                                                    this.position = index;
                                                                    this.ScanNode(base_url, childnode, data);
                                                                });
                                                            });
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    break;
                                case "resolve":
                                    if (prefix == "ds") {
                                        if (node.attributes) {
                                            if (node.attributes.field) {
                                                let field = node.attributes.field;
                                                let result = Expander.FieldValue(data, field.nodeValue);
                                                if (result) {
                                                    if (_.isString(result)) {
                                                        this.html += Expander.FormatToValue(this.datasource, result);
                                                    }
                                                }
                                            }
                                            else if (node.attributes.src) {
                                                let src = node.attributes.src;
                                                this.html += Expander.FormatToValue(this.datasource, this.fragments[src.nodeValue]);
                                            }
                                        }
                                    }
                                    break;
                                default:
                                    this.NodeToElement(base_url, node, data);
                                    break;
                            }
                        }
                        break;
                    case 3://text
                        this.html += Expander.FormatToValue(this.datasource, node.data);
                        break;
                    case 10:
                        this.html += "<!DOCTYPE " + node.nodeName + ">";
                        break;
                    case 8:
                        break;
                    default:
                }
            }
            else {
                this.callback({ code: 1 }, null);
            }
        }
        ExpandHtml(url, fragments) {
            this.fragments = fragments;
            this.document_depth++;
            jsdom.env(url, [], (errors, window) => {
                if (!errors) {
                    //            this.callback(null, "each", url);
                    let childnodes = window.document.childNodes;
                    if (childnodes) {
                        _.forEach(childnodes, (element, index) => {
                            this.position = index;
                            this.ScanNode(url, element, null);
                        });
                    }
                }
                else {
                    this.callback(errors, null);
                }
                this.document_depth--;
                if (this.document_depth == 0) {
                    this.callback(null, this.html);
                }
            });
        }
    }
    HTMLScanner.Expander = Expander;
    /* Builder
    *  Resolver,Expanderを使用して、HTMLテンプレートを展開する。
    *　todo: ３回パースするのはダサダサ。Resolveフェーズは文字列検索でなんとかならないか。。。
    *
    * */
    class Builder {
        static Build(source, datasource, callback) {
            let datasource_resolver = new HTMLScanner.DataSourceResolver(datasource, (error, result) => {
                if (!error) {
                    let url_resolver = new HTMLScanner.UrlResolver(datasource, (error, result) => {
                        if (!error) {
                            let expander = new HTMLScanner.Expander(datasource, (error, result) => {
                                if (!error) {
                                    callback(null, result);
                                }
                                else {
                                    callback(error, null);
                                }
                            });
                            expander.ExpandHtml(source, result);
                        }
                        else {
                            callback(error, null);
                        }
                    });
                    url_resolver.ResolveUrl(source, result, null);
                }
                else {
                    callback(error, null);
                }
            });
            datasource_resolver.ResolveDataSource(source, {});
        }
        ;
    }
    HTMLScanner.Builder = Builder;
    //      "<resolve src='http://seventh-code.club/site/b2de0af3aadcb3cfcb4b77bb19c057af492492bb/index.html/main'></resolve>" +
})(HTMLScanner || (HTMLScanner = {}));
let source0 = "<!DOCTYPE html>" +
    "<html>" +
    "<head>" +
    "</head>" +
    "<body>" +
    "<ds:foreach query='{\"collection\":\"Account\",\"query\":{}}'>" +
    "<div ds:class='a'>" +
    "<ds:resolve field='a'></ds:resolve>" +
    "</div>" +
    "<ds:foreach field='b'>" +
    "<div>" +
    "<ds:resolve field='c'></ds:resolve>" +
    "</div>" +
    "</ds:foreach>" +
    "</ds:foreach>" +
    "</body>" +
    "</html>";
let source = "<!DOCTYPE html>" +
    "<html>" +
    "<head>" +
    "</head>" +
    "<body>" +
    "<ds:foreach query='{\"collection\":\"Account\",\"query\":{}}'>" +
    "<div ds:class='type'>" +
    "<ds:resolve field='type'></ds:resolve>" +
    "</div>" +
    "<ds:foreach query='{\"collection\":\"Article\",\"query\":{},\"limit\":10,\"skip\":18,\"sort\":{\"content.title.value\": \"asc\"}}'>" +
    "<div a='aaa|{userid}|bbb'>" +
    "<div>" +
    "<ds:resolve field='content.title.value'></ds:resolve>" +
    "</div>" +
    "<div>" +
    "<ds:resolve field='content.type.value'></ds:resolve>" +
    "</div>" +
    "<div>" +
    "aaaa|{userid}|bbbb" +
    "</div>" +
    "</div>" +
    "</ds:foreach>" +
    "<div>" +
    "<ds:resolve field='username'></ds:resolve>" +
    "</div>" +
    "</ds:foreach>" +
    "</body>" +
    "</html>";
let source2 = "<!DOCTYPE html>" +
    "<html>" +
    "<head>" +
    "</head>" +
    "<body>" +
    "<resolve src='http://seventh-code.club/site/b2de0af3aadcb3cfcb4b77bb19c057af492492bb/index.html/main'></resolve>" +
    "</body>" +
    "</html>";
let userid = "USERID";
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const LocalAccount = require("./models/systems/accounts/account");
const Article = require("./models/services/articles/article");
const DataSource = require("./models/services/datasource/datasource");
const options = { useMongoClient: true, keepAlive: 300000, connectTimeoutMS: 1000000 };
mongoose.connect("mongodb://localhost/blog0_3", options);
class Source {
    constructor(id) {
        this.id = id;
    }
    GetDatasource(obj, node) {
        let result_promise = null;
        //    let mapper = [{from:"", to:{model:"",field:""}}];
        //    let a = DataSource.find({}).limit(10).skip(20).sort({}).exec();
        let query = node.attributes.query.nodeValue;
        let query_object = JSON.parse(query);
        let static_depth = obj.depth;
        let static_position = obj.position;
        if (query_object.collection) {
            //       if (query_object.on) {
            //            query_object = new Function("value", "with (value) {"+ query_object.on +"}")(query_object);
            //        }
            let query = query_object.query || {};
            let limit = query_object.limit || 0;
            let skip = query_object.skip || 0;
            let sort = query_object.sort || {};
            let model = null;
            switch (query_object.collection) {
                case "Account":
                    model = LocalAccount;
                    break;
                case "Article":
                    model = Article;
                    break;
                default:
                    model = DataSource;
                    break;
            }
            result_promise = model.find(query).limit(limit).skip(skip).sort(sort).exec();
        }
        return result_promise;
    }
    ResolveFormat(value) {
        let result = "";
        let id = this.id;
        let splited = value.split("|");
        _.forEach(splited, (element) => {
            if (element) {
                switch (element) {
                    case "{userid}":
                        result += id;
                        break;
                    default:
                        result += element;
                }
            }
        });
        return result;
    }
}
exports.Source = Source;
let datasource = new Source(userid);
HTMLScanner.Builder.Build(source, datasource, (error, result) => {
    if (!error) {
        console.log(result);
    }
});
//# sourceMappingURL=download.js.map