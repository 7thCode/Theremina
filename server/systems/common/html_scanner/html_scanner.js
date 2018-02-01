/**!
 * Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 * This software is released under the MIT License.
 * //opensource.org/licenses/mit-license.php
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var HTMLScanner;
(function (HTMLScanner) {
    var url = require("url");
    var _ = require("lodash");
    var jsdom = require("jsdom");
    var JSDOM = jsdom.JSDOM;
    var PREFIX = "ds";
    var NodeScanner = (function () {
        function NodeScanner(callback) {
            this.document_depth = 0;
            this.depth = 0;
            this.position = 0;
            this.callback = callback;
        }
        NodeScanner.prefix = function (name) {
            var result = "";
            var splited_name = name.toLowerCase().split(":");
            if (splited_name.length === 2) {
                result = splited_name[0];
            }
            return result;
        };
        NodeScanner.localName = function (name) {
            var splited_name = name.toLowerCase().split(":");
            return splited_name[splited_name.length - 1];
        };
        NodeScanner.prototype.ScanChild = function (node, data, position) {
            var _this = this;
            if (node) {
                var childnodes = node.childNodes;
                this.depth++;
                if (childnodes) {
                    _.forEach(childnodes, function (node, index) {
                        _this.position = index;
                        _this.ScanNode(node, data, position);
                    });
                }
                this.depth--;
            }
            else {
                this.callback({ code: 1, message: "ScanChild node is null." }, undefined);
            }
        };
        NodeScanner.prototype.ScanNode = function (node, data, position) {
            this.ScanChild(node, data, position);
        };
        NodeScanner.prototype.ScanHtml = function (source) {
            var _this = this;
            this.document_depth++;
            var dom = new JSDOM(source);
            if (dom) {
                var childnodes = dom.window.document.childNodes;
                if (childnodes) {
                    _.forEach(childnodes, function (element, index) {
                        _this.position = index;
                        _this.ScanNode(element, null, 0);
                    });
                }
            }
            else {
                this.callback({ code: 1, message: "ScanHTML dom is null." }, null);
            }
            this.document_depth--;
            if (this.document_depth == 0) {
                this.callback(null, "");
            }
        };
        return NodeScanner;
    }());
    HTMLScanner.NodeScanner = NodeScanner;
    var LinkScanner = (function (_super) {
        __extends(LinkScanner, _super);
        function LinkScanner() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.links = [];
            _this.base_url = "";
            return _this;
        }
        LinkScanner.prototype.ScanNode = function (node, data, position) {
            if (node) {
                switch (node.nodeType) {
                    case 1:// element
                        switch (node.localName) {
                            case "a":
                                this.ScanLinks(node, data);
                                break;
                            default:
                                this.ScanChild(node, data, position);
                                break;
                        }
                        break;
                    default:
                        this.ScanChild(node, data, position);
                }
            }
            else {
                this.callback({ code: 1, message: "ScanNode node is null," }, undefined);
            }
        };
        LinkScanner.prototype.UrlNormalize = function (partial_url) {
            return url.resolve(this.base_url, partial_url);
        };
        LinkScanner.prototype.ScanLinks = function (node, data) {
            if (node.attributes) {
                if (node.attributes.href) {
                    var url_value = node.attributes.href.nodeValue;
                    var target_url_string = this.UrlNormalize(url_value);
                    if (_.indexOf(this.links, target_url_string) === -1) {
                        this.links.push(target_url_string);
                        var parsed_base_url = url.parse(this.base_url);
                        var parsed_target_url = url.parse(target_url_string);
                        if (parsed_target_url.hostname === parsed_base_url.hostname) {
                            this.ScanHtml(target_url_string);
                        }
                    }
                }
            }
        };
        return LinkScanner;
    }(NodeScanner));
    HTMLScanner.LinkScanner = LinkScanner;
    /* DataSourceResolver
    *
    *  与えられたHTMLソースをパース・トラバース。
    *  "foreach","resolve"タグのqueryアトリビュートから得たクエリー文字列から、データソースをクエリー。
    *  与えられたDatasourcesのPromiseを解決する。
    *  クエリー文字列を名前、クエリーの結果を値としてオブジェクトを構成。
    *
    * */
    var DataSourceResolver = (function (_super) {
        __extends(DataSourceResolver, _super);
        function DataSourceResolver(datasource, callback) {
            var _this = _super.call(this, callback) || this;
            _this.datasource_promises = [];
            _this.datasource = datasource;
            return _this;
        }
        DataSourceResolver.prototype.PromisedDataSource = function (node) {
            var result = undefined;
            try {
                var query = node.attributes.query.nodeValue;
                result = this.datasource.GetDatasource(query, this);
            }
            catch (e) {
                this.callback(e, undefined);
            }
            return result;
        };
        DataSourceResolver.prototype.PromisedDataCount = function (node) {
            var result = undefined;
            try {
                var query = node.attributes.query.nodeValue;
                result = this.datasource.GetCount(query, this);
            }
            catch (e) {
                this.callback(e, undefined);
            }
            return result;
        };
        DataSourceResolver.prototype.Aggregate = function (node) {
            var result = undefined;
            try {
                var aggrigate = node.attributes.aggrigate.nodeValue;
                result = this.datasource.Aggregate(aggrigate, this);
            }
            catch (e) {
                this.callback(e, undefined);
            }
            return result;
        };
        DataSourceResolver.prototype.ScanNode = function (node, data, position) {
            if (node) {
                switch (node.nodeType) {
                    case 1:// element
                        var tagname = node.localName;
                        if (tagname) {
                            var prefix = DataSourceResolver.prefix(tagname);
                            var localname = DataSourceResolver.localName(tagname);
                            switch (localname) {
                                case "meta":
                                    if (node.attributes) {
                                        if (node.attributes["query"]) {
                                            var query = node.attributes["query"];
                                            this.datasource_promises.push({
                                                name: query.nodeValue,
                                                promise: this.PromisedDataSource(node),
                                                count: this.PromisedDataCount(node),
                                                resolved: "",
                                            });
                                        }
                                    }
                                    break;
                                case "resolve":
                                case "foreach":
                                    if (prefix === PREFIX) {
                                        if (node.attributes) {
                                            if (node.attributes.query) {
                                                var query = node.attributes.query;
                                                this.datasource_promises.push({
                                                    name: query.nodeValue,
                                                    promise: this.PromisedDataSource(node),
                                                    count: this.PromisedDataCount(node),
                                                    resolved: "",
                                                });
                                            }
                                            else if (node.attributes.aggrigate) {
                                                var aggrigate = node.attributes.aggrigate;
                                                this.datasource_promises.push({
                                                    name: aggrigate.nodeValue,
                                                    promise: this.Aggregate(node),
                                                    count: undefined,
                                                    resolved: "",
                                                });
                                            }
                                        }
                                    }
                                    break;
                                default:
                                    break;
                            }
                            this.ScanChild(node, data, position);
                        }
                        else {
                            this.callback({ code: 1, message: "ScanNode tagname is null" }, undefined);
                        }
                        break;
                    default:
                }
            }
            else {
                this.callback({ code: 2, message: "ScanNode node is null" }, undefined);
            }
        };
        DataSourceResolver.prototype.ResolveDataSource = function (source, result) {
            var _this = this;
            this.document_depth++;
            var dom = new JSDOM(source);
            if (dom) {
                var childnodes = dom.window.document.childNodes;
                if (childnodes) {
                    _.forEach(childnodes, function (element, index) {
                        _this.position = index;
                        _this.ScanNode(element, undefined, 0);
                    });
                }
            }
            else {
                this.callback({ code: 1, message: "ResolveDataSource dom is null." }, undefined);
            }
            this.document_depth--;
            if (this.document_depth === 0) {
                // resolve all [record reference] in document.
                Promise.all(this.datasource_promises.map(function (doc) {
                    var result1 = undefined;
                    if (doc.promise) {
                        result1 = doc.promise;
                    }
                    return result1;
                })).then(function (resolved) {
                    _.forEach(resolved, function (entry, index) {
                        result[_this.datasource_promises[index].name] = { content: entry, count: 0 };
                    });
                    Promise.all(_this.datasource_promises.map(function (doc) {
                        var result2 = undefined;
                        if (doc.count) {
                            result2 = doc.count;
                        }
                        return result2;
                    })).then(function (_resolved) {
                        _.forEach(_resolved, function (count, index) {
                            result[_this.datasource_promises[index].name].count = count;
                        });
                        _this.callback(undefined, result);
                    }).catch(function (error) {
                        _this.callback(error, undefined);
                    });
                }).catch(function (error) {
                    _this.callback(error, undefined);
                });
            }
        };
        // todo:1path
        DataSourceResolver.prototype.ResolveDataSource2 = function (childnodes, result) {
            var _this = this;
            if (childnodes) {
                _.forEach(childnodes, function (element, index) {
                    _this.position = index;
                    _this.ScanNode(element, undefined, 0);
                });
            }
            // resolve all [record reference] in document.
            Promise.all(this.datasource_promises.map(function (doc) {
                var result1 = undefined;
                if (doc.promise) {
                    result1 = doc.promise;
                }
                return result1;
            })).then(function (resolved) {
                _.forEach(resolved, function (entry, index) {
                    result[_this.datasource_promises[index].name] = { content: entry, count: 0 };
                });
                Promise.all(_this.datasource_promises.map(function (doc) {
                    var result2 = undefined;
                    if (doc.count) {
                        result2 = doc.count;
                    }
                    return result2;
                })).then(function (_resolved) {
                    _.forEach(_resolved, function (count, index) {
                        result[_this.datasource_promises[index].name].count = count;
                    });
                    _this.callback(undefined, result);
                }).catch(function (error) {
                    _this.callback(error, undefined);
                });
            }).catch(function (error) {
                _this.callback(error, undefined);
            });
        };
        return DataSourceResolver;
    }(NodeScanner));
    HTMLScanner.DataSourceResolver = DataSourceResolver;
    /* UrlResolver
    *
    *  与えられたHTMLソースをパース・トラバース。
    *  "resolve"タグのsrcプロパティから得たURLにHTTP Get。
    *  与えられたDatasourcesのPromiseを解決する。
    *  URLを名前、HTTP Getの結果を値としてオブジェクトを構成。
    *
    * */
    var UrlResolver = (function (_super) {
        __extends(UrlResolver, _super);
        function UrlResolver(datasource, config, callback) {
            var _this = _super.call(this, callback) || this;
            _this.url_promises = [];
            _this.datasource = datasource;
            _this.config = config;
            return _this;
        }
        UrlResolver.prototype.PromisedUrl = function (target_url_string) {
            var result = undefined;
            try {
                result = this.datasource.GetUrl(target_url_string, this);
            }
            catch (e) {
                this.callback(e, undefined);
            }
            return result;
        };
        // js-domはHTMLを厳密にパースする。そのためHeader要素が限られる。
        // よって、"meta"タグをInclude命令に使用する。
        UrlResolver.prototype.Include = function (node) {
            if (node.attributes) {
                var number = node.attributes.length;
                for (var index = 0; index < number; index++) {
                    var attribute = node.attributes[index];
                    var prefix = Expander.prefix(attribute.name);
                    var localname = Expander.localName(attribute.name);
                    if (prefix === PREFIX) {
                        if (localname === "include") {
                            this.url_promises.push({
                                name: attribute.nodeValue,
                                promise: this.PromisedUrl(attribute.nodeValue),
                                count: 1,
                                resolved: "",
                            });
                        }
                    }
                }
            }
        };
        UrlResolver.prototype.ScanNode = function (node, data, position) {
            if (node) {
                switch (node.nodeType) {
                    case 1:// element
                        var tagname = node.localName;
                        if (tagname) {
                            var prefix = UrlResolver.prefix(tagname);
                            var localname = UrlResolver.localName(tagname);
                            switch (localname) {
                                case "meta":
                                    this.Include(node);
                                    break;
                                case "foreach":
                                    break;
                                //    case "resolve":
                                case "include":
                                    if (prefix === PREFIX) {
                                        if (node.attributes) {
                                            if (node.attributes.src) {
                                                var src = node.attributes.src;
                                                this.url_promises.push({
                                                    name: src.nodeValue,
                                                    promise: this.PromisedUrl(src.nodeValue),
                                                    count: 1,
                                                    resolved: "",
                                                });
                                            }
                                        }
                                    }
                                    break;
                                default:
                                    break;
                            }
                            this.ScanChild(node, data, position);
                        }
                        break;
                    default:
                }
            }
            else {
                this.callback({ code: 1, message: "ScanNode node is null." }, undefined);
            }
        };
        UrlResolver.prototype.ResolveUrl = function (source, result) {
            var _this = this;
            this.document_depth++;
            var dom = new JSDOM(source);
            if (dom) {
                var childnodes = dom.window.document.childNodes;
                if (childnodes) {
                    _.forEach(childnodes, function (element, index) {
                        _this.position = index;
                        _this.ScanNode(element, undefined, 0);
                    });
                }
            }
            else {
                this.callback({ code: 1, message: "ResolveUrl dom is null." }, undefined);
            }
            this.document_depth--;
            if (this.document_depth === 0) {
                Promise.all(this.url_promises.map(function (doc) {
                    var promise = undefined;
                    if (doc.promise) {
                        promise = doc.promise;
                    }
                    return promise;
                })).then(function (resolved) {
                    _.forEach(resolved, function (entry, index) {
                        result[_this.url_promises[index].name] = { content: entry, count: 1 };
                    });
                    _this.callback(undefined, result);
                }).catch(function (error) {
                    switch (error.statusCode) {
                        case 404:
                            _this.callback({ code: 404, message: error.options.uri }, undefined);
                            break;
                        default:
                            _this.callback(error, undefined);
                    }
                });
            }
        };
        // todo:1path
        UrlResolver.prototype.ResolveUrl2 = function (childnodes, result) {
            var _this = this;
            if (childnodes) {
                _.forEach(childnodes, function (element, index) {
                    _this.position = index;
                    _this.ScanNode(element, undefined, 0);
                });
            }
            Promise.all(this.url_promises.map(function (doc) {
                var promise = undefined;
                if (doc.promise) {
                    promise = doc.promise;
                }
                return promise;
            })).then(function (resolved) {
                _.forEach(resolved, function (entry, index) {
                    result[_this.url_promises[index].name] = { content: entry, count: 1 };
                });
                _this.callback(undefined, result);
            }).catch(function (error) {
                _this.callback(error, undefined);
            });
        };
        return UrlResolver;
    }(NodeScanner));
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
    var Expander = (function (_super) {
        __extends(Expander, _super);
        function Expander(datasource, callback) {
            var _this = _super.call(this, callback) || this;
            _this.fragments = {};
            _this.html = "";
            _this.datasource = datasource;
            return _this;
        }
        // js-domはHTMLを厳密にパースする。そのためHeader要素が限られる。
        // よって、"meta"タグをInclude命令に使用する。
        Expander.prototype.Meta = function (node, data, position) {
            var resolved = false;
            if (node.attributes) {
                var number = node.attributes.length;
                for (var index = 0; index < number; index++) {
                    var attribute = node.attributes[index];
                    var prefix = Expander.prefix(attribute.name);
                    var localname = Expander.localName(attribute.name);
                    if (prefix === PREFIX) {
                        switch (localname) {
                            case "include":
                                this.html += this.datasource.ResolveFormat(data, this.fragments[attribute.nodeValue], position, this);
                                resolved = true;
                                break;
                            case "title": {
                                var query_attribute = node.attributes["query"];
                                if (query_attribute) {
                                    var datas = data[query_attribute.nodeValue];
                                    if (datas.content.length > 0) {
                                        var first_data = datas.content[0];
                                        this.html += "<title>" + this.datasource.ResolveFormat(first_data, {
                                            content: attribute.value,
                                            count: 1,
                                        }, position, this) + "</title>";
                                    }
                                    resolved = true;
                                }
                                break;
                            }
                            case "content": {
                                var query_attribute = node.attributes["query"];
                                if (query_attribute) {
                                    var datas = data[query_attribute.nodeValue];
                                    if (datas.content.length > 0) {
                                        var first_data = datas.content[0];
                                        /*
                                                                              let name_attribute: any = node.attributes["name"];
                                                                              let name = "";
                                                                              if (name_attribute) {
                                                                                  name = 'name="' + name_attribute.nodeValue + '"';
                                                                              }
                                      */
                                        var name_1 = "";
                                        var _number = node.attributes.length;
                                        for (var _index = 0; index < _number; index++) {
                                            var _attribute = node.attributes[_index];
                                            var _prefix = Expander.prefix(_attribute.name);
                                            var _localname = Expander.localName(_attribute.name);
                                            if (_prefix !== PREFIX) {
                                                if (_localname !== "query") {
                                                    name_1 = _attribute.name + '="' + _attribute.nodeValue + '" ';
                                                }
                                            }
                                        }
                                        this.html += "<meta " + name_1 + ' content="' + this.datasource.ResolveFormat(first_data, {
                                            content: attribute.value,
                                            count: 1,
                                        }, position, this) + '"/>';
                                    }
                                    resolved = true;
                                }
                                break;
                            }
                            default:
                        }
                        //     if (localname == "include") {
                        //         this.html += this.datasource.ResolveFormat(data, this.fragments[attribute.nodeValue], this);
                        //         resolved = true;
                        //     }
                    }
                }
            }
            if (!resolved) {
                this.NodeToElement(node, data, position);
            }
        };
        Expander.prototype.NodeToElement = function (node, data, position) {
            var tagname = node.localName;
            var attribute_string = "";
            if (node.attributes) {
                var number = node.attributes.length;
                for (var index = 0; index < number; index++) {
                    var attribute = node.attributes[index];
                    var _prefix = Expander.prefix(attribute.name);
                    var _localname = Expander.localName(attribute.name);
                    if (_prefix === PREFIX) {
                        attribute_string += " " + _localname + '="' + this.datasource.ResolveFormat(data, {
                            content: attribute.value,
                            count: 1,
                        }, position, this) + '"';
                    }
                    else {
                        attribute_string += " " + attribute.name + '="' + attribute.value + '"';
                    }
                }
            }
            var localname = DataSourceResolver.localName(tagname);
            var prefix = DataSourceResolver.prefix(tagname);
            if (prefix !== PREFIX) {
                localname = tagname;
            }
            if (node.childNodes.length > 0) {
                this.html += "<" + localname + attribute_string + ">";
                this.ScanChild(node, data, position);
                this.html += "</" + localname + ">";
            }
            else {
                switch (localname.toLowerCase()) {
                    case "link":
                    case "script":
                        this.html += "<" + localname + attribute_string + "></" + localname + ">";
                        break;
                    default:
                        this.html += "<" + localname + attribute_string + "></" + localname + ">";
                        //     this.html += "<" + localname + attribute_string + "/>";
                        break;
                }
            }
        };
        Expander.prototype.ResolveChildren = function (node, result, position) {
            var _this = this;
            _.forEach(node.childNodes, function (childnode, index) {
                _this.position = index;
                _this.ScanNode(childnode, result, position);
            });
        };
        Expander.prototype.ScanNode = function (node, data, position) {
            var _this = this;
            if (node) {
                switch (node.nodeType) {
                    case 1:// element
                        var tagname = node.localName;
                        if (tagname) {
                            var prefix = Expander.prefix(tagname);
                            var localname = Expander.localName(tagname);
                            switch (localname) {
                                case "html":
                                case "head":
                                case "body":
                                    if (this.datasource.isdocument) {
                                        this.NodeToElement(node, data, position);
                                    }
                                    else {
                                        this.ScanChild(node, data, position);
                                    }
                                    break;
                                case "meta":
                                    this.Meta(node, data, position);
                                    break;
                                case "foreach":
                                    if (prefix === PREFIX) {
                                        if (node.attributes) {
                                            if (node.attributes.query) {
                                                var query = node.attributes.query;
                                                var result = this.fragments[query.nodeValue].content;
                                                if (result) {
                                                    _.forEach(result, function (resolved_data, position) {
                                                        _this.ResolveChildren(node, resolved_data, position);
                                                    });
                                                }
                                            }
                                            else if (node.attributes.aggrigate) {
                                                var aggrigate = node.attributes.aggrigate;
                                                var result = this.fragments[aggrigate.nodeValue].content;
                                                if (result) {
                                                    _.forEach(result, function (resolved_data, position) {
                                                        _this.ResolveChildren(node, resolved_data, position);
                                                    });
                                                }
                                            }
                                            else if (node.attributes.field) {
                                                var field = node.attributes.field;
                                                this.html += this.datasource.ResolveFormat(data, {
                                                    content: field.nodeValue,
                                                    count: 1,
                                                }, position, this);
                                            }
                                            else if (node.attributes.scope) {
                                                if (data) {
                                                    var scope = node.attributes.scope;
                                                    var result = this.datasource.FieldValue(data, scope.nodeValue, position, this); // fragment
                                                    if (result) {
                                                        if (_.isArray(result)) {
                                                            _.forEach(result, function (resolved_data, position) {
                                                                _this.ResolveChildren(node, resolved_data, position);
                                                            });
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    break;
                                case "resolve":
                                    if (prefix === PREFIX) {
                                        if (node.attributes) {
                                            if (node.attributes.query) {
                                                var query = node.attributes.query;
                                                var current_datasource_1 = this.fragments[query.nodeValue].content;
                                                _.forEach(node.childNodes, function (childnode, index) {
                                                    _this.position = index;
                                                    _this.ScanNode(childnode, current_datasource_1[0], 0);
                                                });
                                            }
                                            else if (node.attributes.aggrigate) {
                                                var aggrigate = node.attributes.aggrigate;
                                                var result = this.fragments[aggrigate.nodeValue].content;
                                                if (result) {
                                                    _.forEach(result, function (resolved_data, position) {
                                                        _this.ResolveChildren(node, resolved_data, position);
                                                    });
                                                }
                                            }
                                            else if (node.attributes.field) {
                                                var field = node.attributes.field;
                                                this.html += this.datasource.ResolveFormat(data, {
                                                    content: field.nodeValue,
                                                    count: 1,
                                                }, position, this);
                                            }
                                            else if (node.attributes.scope) {
                                                if (data) {
                                                    var scope = node.attributes.scope;
                                                    var result = this.datasource.FieldValue(data, scope.nodeValue, position, this);
                                                    if (result) {
                                                        if (_.isArray(result)) {
                                                            if (result.length > 0) {
                                                                this.ResolveChildren(node, result[0], 0);
                                                            }
                                                        }
                                                        else {
                                                            this.ResolveChildren(node, result, position);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    break;
                                case "include":
                                    if (prefix === PREFIX) {
                                        if (node.attributes) {
                                            if (node.attributes.src) {
                                                var src = node.attributes.src;
                                                this.html += this.datasource.ResolveFormat(data, this.fragments[src.nodeValue], position, this);
                                            }
                                        }
                                    }
                                    break;
                                case "if":
                                    if (prefix === PREFIX) {
                                        if (node.attributes) {
                                            if (node.attributes.exist) {
                                                var exist = node.attributes.exist;
                                                var result = this.datasource.FieldValue(data, exist.nodeValue, position, this); // model
                                                if (node.attributes.equal) {
                                                    var equal = node.attributes.equal;
                                                    var result2 = this.datasource.FieldValue(data, equal.nodeValue, position, this); // model
                                                    if (result === result2) {
                                                        this.ResolveChildren(node, data, position);
                                                    }
                                                }
                                                else if (node.attributes.match) {
                                                    var match = node.attributes.match;
                                                    if (result === match.nodeValue) {
                                                        this.ResolveChildren(node, data, position);
                                                    }
                                                }
                                                else {
                                                    if (result) {
                                                        this.ResolveChildren(node, data, position);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    break;
                                case "ifn":
                                    if (prefix === PREFIX) {
                                        if (node.attributes) {
                                            if (node.attributes.exist) {
                                                var exist = node.attributes.exist;
                                                var result = this.datasource.FieldValue(data, exist.nodeValue, position, this); // model
                                                if (node.attributes.equal) {
                                                    var equal = node.attributes.equal;
                                                    var result2 = this.datasource.FieldValue(data, equal.nodeValue, position, this); // model
                                                    if (result !== result2) {
                                                        this.ResolveChildren(node, data, position);
                                                    }
                                                }
                                                else if (node.attributes.match) {
                                                    var match = node.attributes.match;
                                                    if (result !== match.nodeValue) {
                                                        this.ResolveChildren(node, data, position);
                                                    }
                                                }
                                                else {
                                                    if (!result) {
                                                        this.ResolveChildren(node, data, position);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    break;
                                default:
                                    this.NodeToElement(node, data, position);
                                    break;
                            }
                        }
                        break;
                    case 3:// text
                        if (node.parentNode) {
                            var parent_name = node.parentNode.localName;
                            var prefix = Expander.prefix(parent_name);
                            if (prefix === PREFIX) {
                                this.html += this.datasource.ResolveFormat(data, {
                                    content: node.data,
                                    count: 1,
                                }, position, this);
                            }
                            else {
                                this.html += node.data;
                            }
                        }
                        else {
                            this.html += node.data;
                        }
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
                this.callback({ code: 1, message: "ScanNode node is null." }, undefined);
            }
        };
        Expander.prototype.ExpandHtml = function (source, fragments) {
            var _this = this;
            this.fragments = fragments;
            this.document_depth++;
            var dom = new JSDOM(source);
            if (dom) {
                var childnodes = dom.window.document.childNodes;
                if (childnodes) {
                    _.forEach(childnodes, function (element, index) {
                        _this.position = index;
                        _this.ScanNode(element, fragments, 0);
                    });
                }
            }
            else {
                this.callback({ code: 1, message: "ExpandHtml dom is null." }, undefined);
            }
            this.document_depth--;
            if (this.document_depth === 0) {
                this.callback(undefined, this.html);
            }
        };
        // todo:1path
        Expander.prototype.ExpandHtml2 = function (childnodes, fragments, position) {
            var _this = this;
            if (childnodes) {
                _.forEach(childnodes, function (element, index) {
                    _this.position = index;
                    _this.ScanNode(element, fragments, position);
                });
                this.callback(undefined, this.html);
            }
        };
        return Expander;
    }(NodeScanner));
    HTMLScanner.Expander = Expander;
    /* Builder
    *  Resolver,Expanderを使用して、HTMLテンプレートを展開する。
    *　todo: ３回パースするのはダサダサ。
    *
    * */
    var Builder = (function () {
        function Builder() {
        }
        Builder.Build = function (source, datasource, page_init, config, callback) {
            var build = function (source, datasource, page_init, callback) {
                var datasource_resolver = new HTMLScanner.DataSourceResolver(datasource, function (error, datasource_result) {
                    if (!error) {
                        var url_resolver = new HTMLScanner.UrlResolver(datasource, config, function (error, url_result) {
                            if (!error) {
                                var expander = new HTMLScanner.Expander(datasource, function (error, expand_result) {
                                    if (!error) {
                                        callback(undefined, expand_result);
                                    }
                                    else {
                                        callback(error, undefined);
                                    }
                                });
                                expander.ExpandHtml(source, url_result);
                            }
                            else {
                                callback(error, undefined);
                            }
                        });
                        url_resolver.ResolveUrl(source, datasource_result);
                    }
                    else {
                        callback(error, undefined);
                    }
                });
                datasource_resolver.datasource_promises.push(page_init);
                datasource_resolver.ResolveDataSource(source, {});
            };
            if (datasource.page_params) {
                build(source, datasource, page_init, callback);
            }
            else {
                build(source, datasource, {}, callback);
            }
        };
        ;
        Builder.Resolve = function (source, datasource, url_result, callback) {
            var expander = new HTMLScanner.Expander(datasource, function (error, expand_result) {
                if (!error) {
                    callback(undefined, expand_result);
                }
                else {
                    callback(error, undefined);
                }
            });
            expander.ExpandHtml(source, url_result);
        };
        // todo:1path
        Builder.Build2 = function (source, datasource, page_init, config, callback) {
            var build = function (source, datasource, page_init, callback) {
                var datasource_resolver = new HTMLScanner.DataSourceResolver(datasource, function (error, datasource_result) {
                    if (!error) {
                        var url_resolver = new HTMLScanner.UrlResolver(datasource, config, function (error, url_result) {
                            if (!error) {
                                var expander = new HTMLScanner.Expander(datasource, function (error, expand_result) {
                                    if (!error) {
                                        callback(undefined, expand_result);
                                    }
                                    else {
                                        callback(error, undefined);
                                    }
                                });
                                expander.ExpandHtml2(source, url_result);
                            }
                            else {
                                callback(error, undefined);
                            }
                        });
                        url_resolver.ResolveUrl2(source, datasource_result);
                    }
                    else {
                        callback(error, undefined);
                    }
                });
                datasource_resolver.datasource_promises.push(page_init);
                datasource_resolver.ResolveDataSource2(source, {});
            };
            var dom = new JSDOM(source);
            if (dom) {
                var childnodes = dom.window.document.childNodes;
                if (datasource.page_params) {
                    build(childnodes, datasource, page_init, callback);
                }
                else {
                    build(childnodes, datasource, {}, callback);
                }
            }
            else {
                callback({ code: 1, message: "" }, undefined);
            }
        };
        ;
        Builder.Resolve2 = function (source, datasource, url_result, callback) {
            var expander = new HTMLScanner.Expander(datasource, function (error, expand_result) {
                if (!error) {
                    callback(undefined, expand_result);
                }
                else {
                    callback(error, undefined);
                }
            });
            expander.ExpandHtml(source, url_result);
        };
        return Builder;
    }());
    HTMLScanner.Builder = Builder;
})(HTMLScanner || (HTMLScanner = {}));
module.exports = HTMLScanner;
//# sourceMappingURL=html_scanner.js.map