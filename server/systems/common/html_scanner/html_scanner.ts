/**!
 * Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 * This software is released under the MIT License.
 * //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace HTMLScanner {

    const url: any = require("url");
    const _: any = require("lodash");

    const jsdom: any = require("jsdom");
    const {JSDOM} = jsdom;

    const PREFIX: string = "ds";

    export class NodeScanner {

        public document_depth: number = 0;
        public depth: number = 0;
        public position: number = 0;
        protected callback: (error: any, result: any) => void;

        constructor(callback: (error: any, result: any) => void) {
            this.callback = callback;
        }

        public static prefix(name: string): string {
            let result: string = "";
            let splited_name: string[] = name.toLowerCase().split(":");
            if (splited_name.length === 2) {
                result = splited_name[0];
            }
            return result;
        }

        public static localName(name: string): string {
            let splited_name: any = name.toLowerCase().split(":");
            return splited_name[splited_name.length - 1];
        }

        protected ScanChild(node: any, data: any, position: number): void {
            if (node) {
                let childnodes: any[] = node.childNodes;
                this.depth++;
                if (childnodes) {
                    _.forEach(childnodes, (node: any, index: number): void => {
                        this.position = index;
                        this.ScanNode(node, data, position);
                    });
                }
                this.depth--;
            } else {
                this.callback({code: 1, message: "ScanChild node is null."}, undefined);
            }
        }

        protected ScanNode(node: any, data: any, position: number): void {
            this.ScanChild(node, data, position);
        }

        public ScanHtml(source: string): any {
            this.document_depth++;
            let dom = new JSDOM(source);
            if (dom) {
                let childnodes = dom.window.document.childNodes;
                if (childnodes) {
                    _.forEach(childnodes, (element, index) => {
                        this.position = index;
                        this.ScanNode(element, null, 0);
                    });
                }
            } else {
                this.callback({code: 1, message: "ScanHTML dom is null."}, null);
            }
            this.document_depth--;
            if (this.document_depth == 0) {
                this.callback(null, "");
            }
        }

    }

    export class LinkScanner extends NodeScanner {

        protected links: any[] = [];
        private base_url: string = "";

        protected ScanNode(node: any, data: any, position: number): void {
            if (node) {
                switch (node.nodeType) {
                    case 1: // element
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
            } else {
                this.callback({code: 1, message: "ScanNode node is null,"}, undefined);
            }
        }

        private UrlNormalize(partial_url: string): string {
            return url.resolve(this.base_url, partial_url);
        }

        private ScanLinks(node: any, data: any): void {
            if (node.attributes) {
                if (node.attributes.href) {
                    let url_value: any = node.attributes.href.nodeValue;
                    let target_url_string: any = this.UrlNormalize(url_value);
                    if (_.indexOf(this.links, target_url_string) === -1) {
                        this.links.push(target_url_string);
                        let parsed_base_url: { hostname: any } = url.parse(this.base_url);
                        let parsed_target_url: { hostname: any } = url.parse(target_url_string);
                        if (parsed_target_url.hostname === parsed_base_url.hostname) {
                            this.ScanHtml(target_url_string);
                        }
                    }
                }
            }
        }
    }

    /* DataSourceResolver
    *
    *  与えられたHTMLソースをパース・トラバース。
    *  "foreach","resolve"タグのqueryアトリビュートから得たクエリー文字列から、データソースをクエリー。
    *  与えられたDatasourcesのPromiseを解決する。
    *  クエリー文字列を名前、クエリーの結果を値としてオブジェクトを構成。
    *
    * */
    export class DataSourceResolver extends NodeScanner {

        public datasource: ScannerBehavior.Behavior;

        public datasource_promises: { name: string, promise: any, count: any, resolved: string }[] = [];

        constructor(datasource: ScannerBehavior.Behavior, callback: (error: any, result: any) => void) {
            super(callback);
            this.datasource = datasource;
        }

        private PromisedDataSource(node: any): any {
            let result: any = undefined;
            try {
                let query: any = node.attributes.query.nodeValue;
                result = this.datasource.GetDatasource(query, this);
            } catch (e) {
                this.callback(e, undefined);
            }
            return result;
        }

        private PromisedDataCount(node: any): any {
            let result: any = undefined;
            try {
                let query: any = node.attributes.query.nodeValue;
                result = this.datasource.GetCount(query, this);
            } catch (e) {
                this.callback(e, undefined);
            }
            return result;
        }

        private Aggregate(node: any): any {
            let result: any = undefined;
            try {
                let aggrigate: any = node.attributes.aggrigate.nodeValue;
                result = this.datasource.Aggregate(aggrigate, this);
            } catch (e) {
                this.callback(e, undefined);
            }
            return result;
        }

        protected ScanNode(node: any, data: any, position: number): void {
            if (node) {
                switch (node.nodeType) {
                    case 1: // element
                        let tagname: any = node.localName;
                        if (tagname) {
                            let prefix: string = DataSourceResolver.prefix(tagname);
                            let localname: string = DataSourceResolver.localName(tagname);
                            switch (localname) {
                                case "meta":
                                    if (node.attributes) {
                                        if (node.attributes["query"]) {
                                            let query: any = node.attributes["query"];
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
                                                let query: any = node.attributes.query;
                                                this.datasource_promises.push({
                                                    name: query.nodeValue,
                                                    promise: this.PromisedDataSource(node),
                                                    count: this.PromisedDataCount(node),
                                                    resolved: "",
                                                });
                                            } else if (node.attributes.aggrigate) {
                                                let aggrigate: any = node.attributes.aggrigate;
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
                        } else {
                            this.callback({code: 1, message: "ScanNode tagname is null"}, undefined);
                        }
                        break;
                    default:
                }
            } else {
                this.callback({code: 2, message: "ScanNode node is null"}, undefined);
            }
        }

        public ResolveDataSource(source: string, result: any): any {

            this.document_depth++;
            let dom: any = new JSDOM(source);
            if (dom) {
                let childnodes: any = dom.window.document.childNodes;
                if (childnodes) {
                    _.forEach(childnodes, (element: any, index: number) => {
                        this.position = index;
                        this.ScanNode(element, undefined, 0);
                    });
                }
            } else {
                this.callback({code: 1, message: "ResolveDataSource dom is null."}, undefined);
            }
            this.document_depth--;
            if (this.document_depth === 0) { // promise all(record) then Prmise All(count)

                // resolve all [record reference] in document.
                Promise.all(this.datasource_promises.map((doc: any): void => {
                    let result1: any = undefined;
                    if (doc.promise) {
                        result1 = doc.promise;
                    }
                    return result1;
                })).then((resolved: any[]): void => {

                    _.forEach(resolved, (entry: any, index: number): void => {
                        result[this.datasource_promises[index].name] = {content: entry, count: 0};
                    });

                    Promise.all(this.datasource_promises.map((doc: any): void => {
                        let result2: any = undefined;
                        if (doc.count) {
                            result2 = doc.count;
                        }
                        return result2;
                    })).then((_resolved: any[]): void => {
                        _.forEach(_resolved, (count: any, index: number): void => {
                            result[this.datasource_promises[index].name].count = count;
                        });
                        this.callback(undefined, result);
                    }).catch((error: any): void => {
                        this.callback(error, undefined);
                    });
                }).catch((error: any): void => {
                    this.callback(error, undefined);
                });
            }
        }

        // todo:1path

        public ResolveDataSource2(childnodes: string, result: any): any {

            if (childnodes) {
                _.forEach(childnodes, (element: any, index: number): void => {
                    this.position = index;
                    this.ScanNode(element, undefined, 0);
                });
            }

            // resolve all [record reference] in document.
            Promise.all(this.datasource_promises.map((doc: any): void => {
                let result1: any = undefined;
                if (doc.promise) {
                    result1 = doc.promise;
                }
                return result1;
            })).then((resolved: any[]): void => {

                _.forEach(resolved, (entry: any, index: number): void => {
                    result[this.datasource_promises[index].name] = {content: entry, count: 0};
                });

                Promise.all(this.datasource_promises.map((doc: any): void => {
                    let result2: any = undefined;
                    if (doc.count) {
                        result2 = doc.count;
                    }
                    return result2;
                })).then((_resolved: any[]): void => {
                    _.forEach(_resolved, (count: any, index: number): void => {
                        result[this.datasource_promises[index].name].count = count;
                    });
                    this.callback(undefined, result);
                }).catch((error: any): void => {
                    this.callback(error, undefined);
                });
            }).catch((error: any): void => {
                this.callback(error, undefined);
            });
        }

    }

    /* UrlResolver
    *
    *  与えられたHTMLソースをパース・トラバース。
    *  "resolve"タグのsrcプロパティから得たURLにHTTP Get。
    *  与えられたDatasourcesのPromiseを解決する。
    *  URLを名前、HTTP Getの結果を値としてオブジェクトを構成。
    *
    * */
    export class UrlResolver extends NodeScanner {

        public datasource: ScannerBehavior.Behavior; // scannerBehaviorModule.Behavior;

        private config: any;

        public url_promises: { name: string, promise: any, count: any, resolved: string }[] = [];

        constructor(datasource: ScannerBehavior.Behavior, config: any, callback: (error: any, result: any) => void) {
            super(callback);
            this.datasource = datasource;
            this.config = config;
        }

        private PromisedUrl(target_url_string: string): any {
            let result: any = undefined;
            try {
                result = this.datasource.GetUrl(target_url_string, this);
            } catch (e) {
                this.callback(e, undefined);
            }
            return result;
        }

        // js-domはHTMLを厳密にパースする。そのためHeader要素が限られる。
        // よって、"meta"タグをInclude命令に使用する。
        private Include(node: any): void {
            if (node.attributes) {
                let number: number = node.attributes.length;
                for (let index: number = 0; index < number; index++) {
                    let attribute: any = node.attributes[index];
                    let prefix: string = Expander.prefix(attribute.name);
                    let localname: string = Expander.localName(attribute.name);
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
        }

        protected ScanNode(node: { nodeType: number, localName: string, attributes: { src: { nodeValue: string } } }, data: any, position: number): void {
            if (node) {
                switch (node.nodeType) {
                    case 1: // element
                        let tagname: string = node.localName;
                        if (tagname) {
                            let prefix: string = UrlResolver.prefix(tagname);
                            let localname: string = UrlResolver.localName(tagname);
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
                                                let src: any = node.attributes.src;
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
            } else {
                this.callback({code: 1, message: "ScanNode node is null."}, undefined);
            }
        }

        public ResolveUrl(source: string, result: any): any {
            this.document_depth++;
            let dom: any = new JSDOM(source);
            if (dom) {
                let childnodes: any = dom.window.document.childNodes;
                if (childnodes) {
                    _.forEach(childnodes, (element: any, index: number): void => {
                        this.position = index;
                        this.ScanNode(element, undefined, 0);
                    });
                }
            } else {
                this.callback({code: 1, message: "ResolveUrl dom is null."}, undefined);
            }
            this.document_depth--;
            if (this.document_depth === 0) {
                Promise.all(this.url_promises.map((doc: any): void => {
                    let promise: any = undefined;
                    if (doc.promise) {
                        promise = doc.promise;
                    }
                    return promise;
                })).then((resolved: any[]): void => {
                    _.forEach(resolved, (entry: any, index: number): void => {
                        result[this.url_promises[index].name] = {content: entry, count: 1};
                    });
                    this.callback(undefined, result);
                }).catch((error: any): void => {
                    switch (error.statusCode) {
                        case 404:
                            this.callback({code: 404, message: error.options.uri}, undefined);
                            break;
                        default:
                            this.callback(error, undefined);
                    }
                });
            }

        }

        // todo:1path

        public ResolveUrl2(childnodes: any, result: any): any {

            if (childnodes) {
                _.forEach(childnodes, (element: any, index: number): void => {
                    this.position = index;
                    this.ScanNode(element, undefined, 0);
                });
            }

            Promise.all(this.url_promises.map((doc: any): void => {
                let promise: any = undefined;
                if (doc.promise) {
                    promise = doc.promise;
                }
                return promise;
            })).then((resolved: any[]): void => {
                _.forEach(resolved, (entry: any, index: number): void => {
                    result[this.url_promises[index].name] = {content: entry, count: 1};
                });
                this.callback(undefined, result);
            }).catch((error: any): void => {
                this.callback(error, undefined);
            });
        }
    }

    /* Expander
    *
    *  与えられたHTMLソースをパース・トラバース。
    *
    *  ”foreach”,"resolve"タグのsrc,queryアトリビュートから得られた名前をDatasourceと照合する。
    *  ”foreach”タグは、クエリー結果の配列個数分、子ノードを展開する。（foreachタグは展開されない)
    *  ”resolve”タグは、fieldアトリビュートの内容をフィールド名とみなし、解決する。（タグ自体が置き換えられる）
    *  その際、"datasource"ネームスペースのアトリビュートは、値をフィールド名とみなし、値を解決する。
    *
    *  例 <div ds:class="fieldname">   ->   <div class="hoge">
    *
    * */
    export class Expander extends NodeScanner {

        public fragments: any = {};
        public html: string = "";
        public datasource: ScannerBehavior.Behavior; // behavior;

        constructor(datasource: ScannerBehavior.Behavior, callback: (error: any, result: any) => void) {
            super(callback);
            this.datasource = datasource;
        }

        // js-domはHTMLを厳密にパースする。そのためHeader要素が限られる。
        // よって、"meta"タグをInclude命令に使用する。
        private Meta(node: any, data: any, position: number): void {
            let resolved: boolean = false;
            if (node.attributes) {
                let number: any = node.attributes.length;
                for (let index: number = 0; index < number; index++) {
                    let attribute: any = node.attributes[index];
                    let prefix: string = Expander.prefix(attribute.name);
                    let localname: string = Expander.localName(attribute.name);
                    if (prefix === PREFIX) {
                        switch (localname) {
                            case "include":
                                this.html += this.datasource.ResolveFormat(data, this.fragments[attribute.nodeValue], position, this);
                                resolved = true;
                                break;
                            case "title": {
                                let query_attribute: any = node.attributes["query"];
                                if (query_attribute) {
                                    let datas: any = data[query_attribute.nodeValue];
                                    if (datas.content.length > 0) {
                                        let first_data: any = datas.content[0];
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
                                let query_attribute: any = node.attributes["query"];
                                if (query_attribute) {
                                    let datas: any = data[query_attribute.nodeValue];
                                    if (datas.content.length > 0) {
                                        let first_data: any = datas.content[0];

                                        /*
                                                                              let name_attribute: any = node.attributes["name"];
                                                                              let name = "";
                                                                              if (name_attribute) {
                                                                                  name = 'name="' + name_attribute.nodeValue + '"';
                                                                              }
                                      */
                                        let name: string = "";
                                        let _number: number = node.attributes.length;
                                        for (let _index: number = 0; index < _number; index++) {
                                            let _attribute: any = node.attributes[_index];
                                            let _prefix: string = Expander.prefix(_attribute.name);
                                            let _localname: string = Expander.localName(_attribute.name);
                                            if (_prefix !== PREFIX) {
                                                if (_localname !== "query") {
                                                    name = _attribute.name + '="' + _attribute.nodeValue + '" ';
                                                }
                                            }
                                        }

                                        this.html += "<meta " + name + ' content="' + this.datasource.ResolveFormat(first_data, {
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
        }

        private NodeToElement(node: any, data: any, position: number): void {
            let tagname: string = node.localName;
            let attribute_string: string = "";
            if (node.attributes) {
                let number: number = node.attributes.length;
                for (let index: number = 0; index < number; index++) {
                    let attribute: any = node.attributes[index];
                    let _prefix: string = Expander.prefix(attribute.name);
                    let _localname: string = Expander.localName(attribute.name);
                    if (_prefix === PREFIX) {
                        attribute_string += " " + _localname + '="' + this.datasource.ResolveFormat(data, {
                            content: attribute.value,
                            count: 1,
                        }, position, this) + '"';
                    } else {
                        attribute_string += " " + attribute.name + '="' + attribute.value + '"';
                    }
                }
            }

            let localname: string = DataSourceResolver.localName(tagname);
            let prefix: string = DataSourceResolver.prefix(tagname);

            if (prefix !== PREFIX) {
                localname = tagname;
            }

            if (node.childNodes.length > 0) {
                this.html += "<" + localname + attribute_string + ">";
                this.ScanChild(node, data, position);
                this.html += "</" + localname + ">";
            } else {
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

        private ResolveChildren(node: any, result: any, position: number): void {
            _.forEach(node.childNodes, (childnode: any, index: number): void => {
                this.position = index;
                this.ScanNode(childnode, result, position);
            });
        }

        protected ScanNode(node: any, data: any, position: number): void {
            if (node) {
                switch (node.nodeType) {
                    case 1: // element
                        let tagname: string = node.localName;
                        if (tagname) {
                            let prefix: string = Expander.prefix(tagname);
                            let localname: string = Expander.localName(tagname);
                            switch (localname) {
                                case "html":
                                case "head":
                                case "body":
                                    if (this.datasource.isdocument) {
                                        this.NodeToElement(node, data, position);
                                    } else {
                                        this.ScanChild(node, data, position);
                                    }
                                    break;
                                case "meta":
                                    this.Meta(node, data, position);
                                    break;
                                case "foreach":
                                    if (prefix === PREFIX) {
                                        if (node.attributes) {
                                            if (node.attributes.query) { // query="{}"
                                                let query: any = node.attributes.query;
                                                let result: any = this.fragments[query.nodeValue].content;
                                                if (result) {
                                                    _.forEach(result, (resolved_data: any, position: number) => {
                                                        this.ResolveChildren(node, resolved_data, position);
                                                    });
                                                }
                                            } else if (node.attributes.aggrigate) { // aggrigate
                                                let aggrigate: any = node.attributes.aggrigate;
                                                let result: any = this.fragments[aggrigate.nodeValue].content;
                                                if (result) {
                                                    _.forEach(result, (resolved_data: any, position: number) => {
                                                        this.ResolveChildren(node, resolved_data, position);
                                                    });
                                                }
                                            } else if (node.attributes.field) {  // field="{a.b.c}"
                                                let field: any = node.attributes.field;
                                                this.html += this.datasource.ResolveFormat(data, {
                                                    content: field.nodeValue,
                                                    count: 1,
                                                }, position, this);
                                            } else if (node.attributes.scope) { // scope="a.b.c"
                                                if (data) {
                                                    let scope: any = node.attributes.scope;
                                                    let result: any = this.datasource.FieldValue(data, scope.nodeValue, position, this); // fragment
                                                    if (result) {
                                                        if (_.isArray(result)) {
                                                            _.forEach(result, (resolved_data: any, position: number) => {
                                                                this.ResolveChildren(node, resolved_data, position);
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
                                            if (node.attributes.query) {         // query="{}"
                                                let query: any = node.attributes.query;
                                                let current_datasource: any = this.fragments[query.nodeValue].content;
                                                _.forEach(node.childNodes, (childnode: any, index: number): void => {
                                                    this.position = index;
                                                    this.ScanNode(childnode, current_datasource[0], 0);
                                                });
                                            } else if (node.attributes.aggrigate) { // aggrigate
                                                let aggrigate: any = node.attributes.aggrigate;
                                                let result: any = this.fragments[aggrigate.nodeValue].content;
                                                if (result) {
                                                    _.forEach(result, (resolved_data: any, position: number) => {
                                                        this.ResolveChildren(node, resolved_data, position);
                                                    });
                                                }
                                            } else if (node.attributes.field) {  // field="{a.b.c}"
                                                let field: any = node.attributes.field;
                                                this.html += this.datasource.ResolveFormat(data, {
                                                    content: field.nodeValue,
                                                    count: 1,
                                                }, position, this);
                                            } else if (node.attributes.scope) {  // scope="a.b.c"
                                                if (data) {
                                                    let scope: any = node.attributes.scope;
                                                    let result: any = this.datasource.FieldValue(data, scope.nodeValue, position, this);
                                                    if (result) {
                                                        if (_.isArray(result)) {
                                                            if (result.length > 0) {
                                                                this.ResolveChildren(node, result[0], 0);
                                                            }
                                                        } else {
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
                                            if (node.attributes.src) {    // src="url"
                                                let src: any = node.attributes.src;
                                                this.html += this.datasource.ResolveFormat(data, this.fragments[src.nodeValue], position, this);
                                            }
                                        }
                                    }
                                    break;
                                case "if":
                                    if (prefix === PREFIX) {
                                        if (node.attributes) {
                                            if (node.attributes.exist) {
                                                let exist: any = node.attributes.exist;
                                                let result: any = this.datasource.FieldValue(data, exist.nodeValue, position, this); // model
                                                if (node.attributes.equal) {
                                                    let equal: any = node.attributes.equal;
                                                    let result2: any = this.datasource.FieldValue(data, equal.nodeValue, position, this); // model
                                                    if (result === result2) {
                                                        this.ResolveChildren(node, data, position);
                                                    }
                                                } else if (node.attributes.match) {
                                                    let match: any = node.attributes.match;
                                                    if (result === match.nodeValue) {
                                                        this.ResolveChildren(node, data, position);
                                                    }
                                                } else {
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
                                                let exist: any = node.attributes.exist;
                                                let result: any = this.datasource.FieldValue(data, exist.nodeValue, position, this); // model
                                                if (node.attributes.equal) {
                                                    let equal: any = node.attributes.equal;
                                                    let result2: any = this.datasource.FieldValue(data, equal.nodeValue, position, this); // model
                                                    if (result !== result2) {
                                                        this.ResolveChildren(node, data, position);
                                                    }
                                                } else if (node.attributes.match) {
                                                    let match: any = node.attributes.match;
                                                    if (result !== match.nodeValue) {
                                                        this.ResolveChildren(node, data, position);
                                                    }
                                                } else {
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
                    case 3: // text
                        if (node.parentNode) {  // field="{a.b.c}"
                            let parent_name: string = node.parentNode.localName;
                            let prefix: string = Expander.prefix(parent_name);
                            if (prefix === PREFIX) {
                                this.html += this.datasource.ResolveFormat(data, {
                                    content: node.data,
                                    count: 1,
                                }, position, this);
                            } else {
                                this.html += node.data;
                            }
                        } else {
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
            } else {
                this.callback({code: 1, message: "ScanNode node is null."}, undefined);
            }
        }

        public ExpandHtml(source: string, fragments: { content: string, count: number }[]): any {
            this.fragments = fragments;
            this.document_depth++;
            let dom: any = new JSDOM(source);
            if (dom) {
                let childnodes: any = dom.window.document.childNodes;
                if (childnodes) {
                    _.forEach(childnodes, (element: any, index: number) => {
                        this.position = index;
                        this.ScanNode(element, fragments, 0);
                    });
                }
            } else {
                this.callback({code: 1, message: "ExpandHtml dom is null."}, undefined);
            }
            this.document_depth--;
            if (this.document_depth === 0) {
                this.callback(undefined, this.html);
            }

        }

        // todo:1path
        public ExpandHtml2(childnodes: any, fragments: { content: string, count: number }[], position: number): any {
            if (childnodes) {
                _.forEach(childnodes, (element: any, index: number) => {
                    this.position = index;
                    this.ScanNode(element, fragments, position);
                });
                this.callback(undefined, this.html);
            }
        }
    }

    /* Builder
    *  Resolver,Expanderを使用して、HTMLテンプレートを展開する。
    *  todo: ３回パースするのはダサダサ。
    *
    * */
    export class Builder {

        static Build(source: any, datasource: any, page_init: any, config: any, callback: (error: any, result: string | undefined) => void): void {

            let build: any = (source: any, datasource: any, page_init, callback: (error: any, result: string | undefined) => void) => {
                let datasource_resolver: any = new HTMLScanner.DataSourceResolver(datasource, (error: any, datasource_result: any): void => {
                    if (!error) {
                        let url_resolver: any = new HTMLScanner.UrlResolver(datasource, config, (error: any, url_result: any): void => {
                            if (!error) {
                                let expander: any = new HTMLScanner.Expander(datasource, (error: any, expand_result: any): void => {
                                    if (!error) {
                                        callback(undefined, expand_result);
                                    } else {
                                        callback(error, undefined);
                                    }
                                });
                                expander.ExpandHtml(source, url_result);
                            } else {
                                callback(error, undefined);
                            }
                        });
                        url_resolver.ResolveUrl(source, datasource_result);
                    } else {
                        callback(error, undefined);
                    }
                });

                datasource_resolver.datasource_promises.push(page_init);
                datasource_resolver.ResolveDataSource(source, {});
            };

            if (datasource.page_params) {
                build(source, datasource, page_init, callback);
            } else {
                build(source, datasource, {}, callback);
            }

        };

        static Resolve(source: any, datasource: ScannerBehavior.Behavior, url_result: any, callback: (error: any, result: string | undefined) => void): void {
            let expander: any = new HTMLScanner.Expander(datasource, (error: any, expand_result: any): void => {
                if (!error) {
                    callback(undefined, expand_result);
                } else {
                    callback(error, undefined);
                }
            });
            expander.ExpandHtml(source, url_result);
        }

        // todo:1path
        static Build2(source: string, datasource: any, page_init: any, config: any, callback: (error: any, result: string | undefined) => void): void {

            let build: any = (source: string, datasource: any, page_init, callback: (error: any, result: string | undefined) => void) => {
                let datasource_resolver: any = new HTMLScanner.DataSourceResolver(datasource, (error: any, datasource_result: any): void => {
                    if (!error) {
                        let url_resolver: any = new HTMLScanner.UrlResolver(datasource, config, (error: any, url_result: any): void => {
                            if (!error) {
                                let expander: any = new HTMLScanner.Expander(datasource, (error: any, expand_result: any): void => {
                                    if (!error) {
                                        callback(undefined, expand_result);
                                    } else {
                                        callback(error, undefined);
                                    }
                                });
                                expander.ExpandHtml2(source, url_result);
                            } else {
                                callback(error, undefined);
                            }
                        });
                        url_resolver.ResolveUrl2(source, datasource_result);
                    } else {
                        callback(error, undefined);
                    }
                });

                datasource_resolver.datasource_promises.push(page_init);
                datasource_resolver.ResolveDataSource2(source, {});
            };

            let dom = new JSDOM(source);
            if (dom) {
                let childnodes: any = dom.window.document.childNodes;
                if (datasource.page_params) {
                    build(childnodes, datasource, page_init, callback);
                } else {
                    build(childnodes, datasource, {}, callback);
                }
            } else {
                callback({code: 1, message: ""}, undefined);
            }

        };

        static Resolve2(source: any, datasource: ScannerBehavior.Behavior, url_result: any, callback: (error: any, result: string | undefined) => void): void {
            let expander: any = new HTMLScanner.Expander(datasource, (error: any, expand_result: any): void => {
                if (!error) {
                    callback(undefined, expand_result);
                } else {
                    callback(error, undefined);
                }
            });
            expander.ExpandHtml(source, url_result);
        }
    }

}

module.exports = HTMLScanner;

