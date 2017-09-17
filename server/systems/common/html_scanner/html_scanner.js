/**
 * Created by oda on 2017/07/05.
 */
var HTMLScanner;
(function (HTMLScanner) {
    const url = require('url');
    const jsdom = require("node-jsdom");
    const _ = require('lodash');
    const PREFIX = "ds";
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
        ScanChild(node, data) {
            if (node) {
                let childnodes = node.childNodes;
                this.depth++;
                if (childnodes) {
                    _.forEach(childnodes, (node, index) => {
                        this.position = index;
                        this.ScanNode(node, data);
                    });
                }
                this.depth--;
            }
            else {
                this.callback({ code: 1 }, null);
            }
        }
        ScanNode(node, data) {
            this.ScanChild(node, data);
        }
        ScanHtml(url) {
            this.document_depth++;
            jsdom.env(url, [], {}, (errors, window) => {
                if (!errors) {
                    let childnodes = window.document.childNodes;
                    if (childnodes) {
                        _.forEach(childnodes, (element, index) => {
                            this.position = index;
                            this.ScanNode(element, null);
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
            this.base_url = "";
        }
        UrlNormalize(partial_url) {
            return url.resolve(this.base_url, partial_url);
        }
        ScanLinks(node, data) {
            if (node.attributes) {
                if (node.attributes.href) {
                    let url_value = node.attributes.href.nodeValue;
                    let target_url_string = this.UrlNormalize(url_value);
                    if (_.indexOf(this.links, target_url_string) == -1) {
                        this.links.push(target_url_string);
                        let parsed_base_url = url.parse(this.base_url);
                        let parsed_target_url = url.parse(target_url_string);
                        if (parsed_target_url.hostname == parsed_base_url.hostname) {
                            this.ScanHtml(target_url_string);
                        }
                    }
                }
            }
        }
        ScanNode(node, data) {
            if (node) {
                switch (node.nodeType) {
                    case 1:
                        switch (node.localName) {
                            case "a":
                                this.ScanLinks(node, data);
                                break;
                            default:
                                this.ScanChild(node, data);
                                break;
                        }
                        break;
                    default:
                        this.ScanChild(node, data);
                }
            }
            else {
                this.callback({ code: 1 }, null);
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
            this.datasource_promises = [];
            this.datasource = datasource;
        }
        PromisedDataSource(node) {
            let result = null;
            try {
                let query = node.attributes.query.nodeValue;
                result = this.datasource.GetDatasource(query, this);
            }
            catch (e) {
                this.callback({ code: 1 }, null);
            }
            return result;
        }
        PromisedDataCount(node) {
            let result = null;
            try {
                let query = node.attributes.query.nodeValue;
                result = this.datasource.GetCount(query, this);
            }
            catch (e) {
                this.callback({ code: 1 }, null);
            }
            return result;
        }
        ScanNode(node, data) {
            if (node) {
                switch (node.nodeType) {
                    case 1:
                        let tagname = node.localName;
                        if (tagname) {
                            let prefix = DataSourceResolver.prefix(tagname);
                            let localname = DataSourceResolver.localName(tagname);
                            switch (localname) {
                                case "resolve":
                                case "foreach":
                                    if (prefix == PREFIX) {
                                        if (node.attributes) {
                                            if (node.attributes.query) {
                                                let query = node.attributes.query;
                                                this.datasource_promises.push({
                                                    name: query.nodeValue,
                                                    promise: this.PromisedDataSource(node),
                                                    count: this.PromisedDataCount(node),
                                                    resolved: ""
                                                });
                                            }
                                        }
                                    }
                                    break;
                                default:
                                    break;
                            }
                            this.ScanChild(node, data);
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
        ResolveDataSource(source, result) {
            this.document_depth++;
            jsdom.env(source, [], {}, (errors, window) => {
                if (!errors) {
                    let childnodes = window.document.childNodes;
                    if (childnodes) {
                        _.forEach(childnodes, (element, index) => {
                            this.position = index;
                            this.ScanNode(element, null);
                        });
                    }
                }
                else {
                    this.callback(errors, null);
                }
                this.document_depth--;
                if (this.document_depth == 0) {
                    // resolve all [record reference] in document.
                    Promise.all(this.datasource_promises.map((doc) => {
                        let result = null;
                        if (doc.promise) {
                            result = doc.promise;
                        }
                        return result;
                    })).then((resolved) => {
                        _.forEach(resolved, (entry, index) => {
                            result[this.datasource_promises[index].name] = { content: entry, count: 0 };
                        });
                        Promise.all(this.datasource_promises.map((doc) => {
                            let result = null;
                            if (doc.count) {
                                result = doc.count;
                            }
                            return result;
                        })).then((resolved) => {
                            _.forEach(resolved, (count, index) => {
                                result[this.datasource_promises[index].name].count = count;
                            });
                            this.callback(null, result);
                        }).catch((error) => {
                            this.callback(error, null);
                        });
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
        constructor(datasource, config, callback) {
            super(callback);
            this.url_promises = [];
            this.datasource = datasource;
            this.config = config;
        }
        PromisedUrl(target_url_string) {
            let result = null;
            try {
                result = this.datasource.GetUrl(target_url_string, this);
            }
            catch (e) {
                this.callback({ code: 1 }, null);
            }
            return result;
        }
        //js-domはHTMLを厳密にパースする。そのためHeader要素が限られる。
        //よって、"meta"タグをInclude命令に使用する。
        Include(node) {
            if (node.attributes) {
                let number = node.attributes.length;
                for (var index = 0; index < number; index++) {
                    let attribute = node.attributes[index];
                    let prefix = Expander.prefix(attribute.name);
                    let localname = Expander.localName(attribute.name);
                    if (prefix == PREFIX) {
                        if (localname == "include") {
                            this.url_promises.push({
                                name: attribute.nodeValue,
                                promise: this.PromisedUrl(attribute.nodeValue),
                                count: 1,
                                resolved: ""
                            });
                        }
                    }
                }
            }
        }
        ScanNode(node, data) {
            if (node) {
                switch (node.nodeType) {
                    case 1:
                        let tagname = node.localName;
                        if (tagname) {
                            let prefix = UrlResolver.prefix(tagname);
                            let localname = UrlResolver.localName(tagname);
                            switch (localname) {
                                case "meta":
                                    this.Include(node);
                                    break;
                                case "foreach":
                                    break;
                                //    case "resolve":
                                case "include":
                                    if (prefix == PREFIX) {
                                        if (node.attributes) {
                                            if (node.attributes.src) {
                                                let src = node.attributes.src;
                                                this.url_promises.push({
                                                    name: src.nodeValue,
                                                    promise: this.PromisedUrl(src.nodeValue),
                                                    count: 1,
                                                    resolved: ""
                                                });
                                            }
                                        }
                                    }
                                    break;
                                default:
                                    break;
                            }
                            this.ScanChild(node, data);
                        }
                        break;
                    default:
                }
            }
            else {
                this.callback({ code: 1 }, null);
            }
        }
        ResolveUrl(source, result) {
            this.document_depth++;
            jsdom.env(source, [], {}, (errors, window) => {
                if (!errors) {
                    let childnodes = window.document.childNodes;
                    if (childnodes) {
                        _.forEach(childnodes, (element, index) => {
                            this.position = index;
                            this.ScanNode(element, null);
                        });
                    }
                }
                else {
                    this.callback(errors, null);
                }
                this.document_depth--;
                if (this.document_depth == 0) {
                    Promise.all(this.url_promises.map((doc) => {
                        let promise = null;
                        if (doc.promise) {
                            promise = doc.promise;
                        }
                        return promise;
                    })).then((resolved) => {
                        _.forEach(resolved, (entry, index) => {
                            result[this.url_promises[index].name] = { content: entry, count: 1 };
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
            this.datasource = datasource;
        }
        //js-domはHTMLを厳密にパースする。そのためHeader要素が限られる。
        //よって、"meta"タグをInclude命令に使用する。
        Include(node, data) {
            let resolved = false;
            if (node.attributes) {
                let number = node.attributes.length;
                for (var index = 0; index < number; index++) {
                    let attribute = node.attributes[index];
                    let prefix = Expander.prefix(attribute.name);
                    let localname = Expander.localName(attribute.name);
                    if (prefix == PREFIX) {
                        if (localname == "include") {
                            this.html += this.datasource.ResolveFormat(data, this.fragments[attribute.nodeValue], this);
                            resolved = true;
                        }
                    }
                }
            }
            if (!resolved) {
                this.NodeToElement(node, data);
            }
        }
        NodeToElement(node, data) {
            let tagname = node.localName;
            let attribute_string = "";
            if (node.attributes) {
                let number = node.attributes.length;
                for (var index = 0; index < number; index++) {
                    let attribute = node.attributes[index];
                    let prefix = Expander.prefix(attribute.name);
                    let localname = Expander.localName(attribute.name);
                    if (prefix == PREFIX) {
                        attribute_string += ' ' + localname + '="' + this.datasource.ResolveFormat(data, {
                            content: attribute.value,
                            count: 1
                        }, this) + '"';
                    }
                    else {
                        attribute_string += ' ' + attribute.name + '="' + attribute.value + '"';
                    }
                }
            }
            let localname = DataSourceResolver.localName(tagname);
            let prefix = DataSourceResolver.prefix(tagname);
            if (prefix != PREFIX) {
                localname = tagname;
            }
            if (node.childNodes.length > 0) {
                this.html += "<" + localname + attribute_string + ">";
                this.ScanChild(node, data);
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
        }
        ResolveChildren(node, result) {
            _.forEach(node.childNodes, (childnode, index) => {
                this.position = index;
                this.ScanNode(childnode, result);
            });
        }
        ScanNode(node, data) {
            if (node) {
                switch (node.nodeType) {
                    case 1:
                        let tagname = node.localName;
                        if (tagname) {
                            let prefix = Expander.prefix(tagname);
                            let localname = Expander.localName(tagname);
                            switch (localname) {
                                case "html":
                                case "head":
                                case "body":
                                    if (this.datasource.isdocument) {
                                        this.NodeToElement(node, data);
                                    }
                                    else {
                                        this.ScanChild(node, data);
                                    }
                                    break;
                                case "meta":
                                    this.Include(node, data);
                                    break;
                                case "foreach":
                                    if (prefix == PREFIX) {
                                        if (node.attributes) {
                                            if (node.attributes.query) {
                                                let query = node.attributes.query;
                                                let result = this.fragments[query.nodeValue].content;
                                                if (result) {
                                                    _.forEach(result, (resolved_data, index) => {
                                                        this.ResolveChildren(node, resolved_data);
                                                    });
                                                }
                                            }
                                            else if (node.attributes.scope) {
                                                if (data) {
                                                    let scope = node.attributes.scope;
                                                    let result = this.datasource.FieldValue(data, scope.nodeValue, this); //fragment
                                                    if (result) {
                                                        if (_.isArray(result)) {
                                                            _.forEach(result, (resolved_data, index) => {
                                                                this.ResolveChildren(node, resolved_data);
                                                            });
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    break;
                                case "include":
                                    if (prefix == PREFIX) {
                                        if (node.attributes) {
                                            if (node.attributes.src) {
                                                let src = node.attributes.src;
                                                this.html += this.datasource.ResolveFormat(data, this.fragments[src.nodeValue], this);
                                            }
                                        }
                                    }
                                    break;
                                case "resolve":
                                    if (prefix == PREFIX) {
                                        if (node.attributes) {
                                            if (node.attributes.query) {
                                                let query = node.attributes.query;
                                                let current_datasource = this.fragments[query.nodeValue].content;
                                                _.forEach(node.childNodes, (childnode, index) => {
                                                    this.position = index;
                                                    this.ScanNode(childnode, current_datasource[0]);
                                                });
                                            }
                                            else if (node.attributes.field) {
                                                let field = node.attributes.field;
                                                this.html += this.datasource.ResolveFormat(data, {
                                                    content: field.nodeValue,
                                                    count: 1
                                                }, this);
                                            }
                                            else if (node.attributes.scope) {
                                                if (data) {
                                                    let scope = node.attributes.scope;
                                                    let result = this.datasource.FieldValue(data, scope.nodeValue, this);
                                                    if (result) {
                                                        if (_.isArray(result)) {
                                                            if (result.length > 0) {
                                                                this.ResolveChildren(node, result[0]);
                                                            }
                                                        }
                                                        else {
                                                            this.ResolveChildren(node, result);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    break;
                                case "if":
                                    if (prefix == PREFIX) {
                                        if (node.attributes) {
                                            if (node.attributes.exist) {
                                                let exist = node.attributes.exist;
                                                let result = this.datasource.FieldValue(data, exist.nodeValue, this); //model
                                                if (result) {
                                                    this.ResolveChildren(node, data);
                                                }
                                            }
                                        }
                                    }
                                    break;
                                case "ifn":
                                    if (prefix == PREFIX) {
                                        if (node.attributes) {
                                            if (node.attributes.exist) {
                                                let exist = node.attributes.exist;
                                                let result = this.datasource.FieldValue(data, exist.nodeValue, this); //model
                                                if (!result) {
                                                    this.ResolveChildren(node, data);
                                                }
                                            }
                                        }
                                    }
                                    break;
                                default:
                                    this.NodeToElement(node, data);
                                    break;
                            }
                        }
                        break;
                    case 3:
                        if (node.parentNode) {
                            let parent_name = node.parentNode.localName;
                            let prefix = Expander.prefix(parent_name);
                            if (prefix == PREFIX) {
                                this.html += this.datasource.ResolveFormat(data, { content: node.data, count: 1 }, this);
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
                this.callback({ code: 1 }, null);
            }
        }
        ExpandHtml(source, fragments) {
            this.fragments = fragments;
            this.document_depth++;
            jsdom.env(source, [], {}, (errors, window) => {
                if (!errors) {
                    let childnodes = window.document.childNodes;
                    if (childnodes) {
                        _.forEach(childnodes, (element, index) => {
                            this.position = index;
                            this.ScanNode(element, fragments);
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
        static Build(source, datasource, page_init, config, callback) {
            let build = (source, datasource, page_init, callback) => {
                let datasource_resolver = new HTMLScanner.DataSourceResolver(datasource, (error, datasource_result) => {
                    if (!error) {
                        let url_resolver = new HTMLScanner.UrlResolver(datasource, config, (error, url_result) => {
                            if (!error) {
                                let expander = new HTMLScanner.Expander(datasource, (error, expand_result) => {
                                    if (!error) {
                                        callback(null, expand_result);
                                    }
                                    else {
                                        callback(error, null);
                                    }
                                });
                                expander.ExpandHtml(source, url_result);
                            }
                            else {
                                callback(error, null);
                            }
                        });
                        url_resolver.ResolveUrl(source, datasource_result);
                    }
                    else {
                        callback(error, null);
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
        }
        ;
        static Resolve(source, datasource, url_result, callback) {
            let expander = new HTMLScanner.Expander(datasource, (error, expand_result) => {
                if (!error) {
                    callback(null, expand_result);
                }
                else {
                    callback(error, null);
                }
            });
            expander.ExpandHtml(source, url_result);
        }
    }
    HTMLScanner.Builder = Builder;
})(HTMLScanner || (HTMLScanner = {}));
module.exports = HTMLScanner;
//# sourceMappingURL=html_scanner.js.map