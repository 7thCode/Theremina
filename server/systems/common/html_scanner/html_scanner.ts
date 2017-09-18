/**
 * Created by oda on 2017/07/05.
 */

namespace HTMLScanner {

    const url = require('url');
    const jsdom = require("node-jsdom");
    const _ = require('lodash');

    const PREFIX: string = "ds";

    export class NodeScanner {

        public document_depth: number = 0;
        public depth: number = 0;
        public position: number = 0;
        protected callback: (error: any, result: any) => void;

        constructor(callback: (error: any, result: any) => void) {
            this.callback = callback;
        }

        static prefix(name: string): string {
            let result:string = "";
            let splited_name = name.toLowerCase().split(":");
            if (splited_name.length == 2) {
                result = splited_name[0];
            }
            return result;
        }

        static localName(name: string): string {
            let splited_name:any = name.toLowerCase().split(":");
            return splited_name[splited_name.length - 1];
        }

        protected ScanChild(node: any, data: any): void {
            if (node) {
                let childnodes:any[] = node.childNodes;
                this.depth++;
                if (childnodes) {
                    _.forEach(childnodes, (node: any, index: number): void => {
                        this.position = index;
                        this.ScanNode(node, data);
                    });
                }
                this.depth--;
            } else {
                this.callback({code: 1}, null);
            }
        }

        protected ScanNode(node: any, data: any): void {
            this.ScanChild(node, data);
        }

        public ScanHtml(url: string): any {
            this.document_depth++;
            jsdom.env(
                url,
                [],
                {},
                (errors, window) => {
                    if (!errors) {
                        let childnodes = window.document.childNodes;
                        if (childnodes) {
                            _.forEach(childnodes, (element, index) => {
                                this.position = index;
                                this.ScanNode(element, null);
                            });
                        }
                    } else {
                        this.callback(errors, null);
                    }
                    this.document_depth--;
                    if (this.document_depth == 0) {
                        this.callback(null, "");
                    }
                }
            );
        }

    }

    export class LinkScanner extends NodeScanner {

        protected links:any[] = [];
        private base_url:string = "";

        private UrlNormalize(partial_url: string): string {
            return url.resolve(this.base_url, partial_url);
        }

        private ScanLinks(node: any, data: any): void {
            if (node.attributes) {
                if (node.attributes.href) {
                    let url_value:any = node.attributes.href.nodeValue;
                    let target_url_string:any = this.UrlNormalize(url_value);
                    if (_.indexOf(this.links, target_url_string) == -1) {
                        this.links.push(target_url_string);
                        let parsed_base_url:{hostname:any} = url.parse(this.base_url);
                        let parsed_target_url:{hostname:any} = url.parse(target_url_string);
                        if (parsed_target_url.hostname == parsed_base_url.hostname) {
                            this.ScanHtml(target_url_string);
                        }
                    }
                }
            }
        }

        protected ScanNode(node: any, data: any): void {
            if (node) {
                switch (node.nodeType) {
                    case 1://element
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
            } else {
                this.callback({code: 1}, null);
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
            let result:any = null;
            try {
                let query:any = node.attributes.query.nodeValue;
                result = this.datasource.GetDatasource(query, this);
            } catch (e) {
                this.callback({code: 1}, null);
            }
            return result;
        }

        private PromisedDataCount(node: any): any {
            let result:any = null;
            try {
                let query:any = node.attributes.query.nodeValue;
                result = this.datasource.GetCount(query, this);
            } catch (e) {
                this.callback({code: 1}, null);
            }
            return result;
        }

        protected ScanNode(node: any, data: any): void {
            if (node) {
                switch (node.nodeType) {
                    case 1://element
                        let tagname:any = node.localName;
                        if (tagname) {
                            let prefix:string = DataSourceResolver.prefix(tagname);
                            let localname:string = DataSourceResolver.localName(tagname);
                            switch (localname) {
                                case "resolve":
                                case "foreach":
                                    if (prefix == PREFIX) {
                                        if (node.attributes) {
                                            if (node.attributes.query) {
                                                let query:any = node.attributes.query;
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
                        } else {
                            this.callback({code: 1}, null);
                        }
                        break;
                    default:
                }
            } else {
                this.callback({code: 1}, null);
            }
        }

        public ResolveDataSource(source: string, result: any): any {
            this.document_depth++;
            jsdom.env(
                source,
                [],
                {},
                (errors, window) => {
                    if (!errors) {
                        let childnodes:any = window.document.childNodes;
                        if (childnodes) {
                            _.forEach(childnodes, (element, index) => {
                                this.position = index;
                                this.ScanNode(element, null);
                            });
                        }
                    } else {
                        this.callback(errors, null);
                    }
                    this.document_depth--;
                    if (this.document_depth == 0) {// Promise all(record) then Prmise All(count)

                        // resolve all [record reference] in document.
                        Promise.all(this.datasource_promises.map((doc: any): void => {
                            let result:any = null;
                            if (doc.promise) {
                                result = doc.promise;
                            }
                            return result;
                        })).then((resolved: any[]): void => {

                            _.forEach(resolved, (entry: any, index: number): void => {
                                result[this.datasource_promises[index].name] = {content: entry, count: 0};
                            });

                            Promise.all(this.datasource_promises.map((doc: any): void => {
                                let result:any = null;
                                if (doc.count) {
                                    result = doc.count;
                                }
                                return result;
                            })).then((resolved: any[]): void => {
                                _.forEach(resolved, (count: any, index: number): void => {
                                    result[this.datasource_promises[index].name].count = count;
                                });
                                this.callback(null, result);
                            }).catch((error: any): void => {
                                this.callback(error, null);
                            });


                        }).catch((error: any): void => {
                            this.callback(error, null);
                        });

                    }
                }
            );
        }

        // todo:1path
        public ResolveDataSource2(childnodes: string, result: any): any {


            if (childnodes) {
                _.forEach(childnodes, (element, index) => {
                    this.position = index;
                    this.ScanNode(element, null);
                });
            }


            // resolve all [record reference] in document.
            Promise.all(this.datasource_promises.map((doc: any): void => {
                let result:any = null;
                if (doc.promise) {
                    result = doc.promise;
                }
                return result;
            })).then((resolved: any[]): void => {

                _.forEach(resolved, (entry: any, index: number): void => {
                    result[this.datasource_promises[index].name] = {content: entry, count: 0};
                });

                Promise.all(this.datasource_promises.map((doc: any): void => {
                    let result:any = null;
                    if (doc.count) {
                        result = doc.count;
                    }
                    return result;
                })).then((resolved: any[]): void => {
                    _.forEach(resolved, (count: any, index: number): void => {
                        result[this.datasource_promises[index].name].count = count;
                    });
                    this.callback(null, result);
                }).catch((error: any): void => {
                    this.callback(error, null);
                });


            }).catch((error: any): void => {
                this.callback(error, null);
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

        public datasource:ScannerBehavior.Behavior; // ScannerBehaviorModule.Behavior;

        private config;

        public url_promises: { name: string, promise: any, count: any, resolved: string }[] = [];

        constructor(datasource: ScannerBehavior.Behavior, config:any, callback: (error: any, result: any) => void) {
            super(callback);
            this.datasource = datasource;
            this.config = config;
        }

        private PromisedUrl(target_url_string: string): any {
            let result:any = null;
            try {
                result = this.datasource.GetUrl(target_url_string, this);
            } catch (e) {
                this.callback({code: 1}, null);
            }
            return result;
        }

        //js-domはHTMLを厳密にパースする。そのためHeader要素が限られる。
        //よって、"meta"タグをInclude命令に使用する。
        private Include(node: any): void {
            if (node.attributes) {
                let number:number = node.attributes.length;
                for (var index:number = 0; index < number; index++) {
                    let attribute:any = node.attributes[index];
                    let prefix:string = Expander.prefix(attribute.name);
                    let localname:string = Expander.localName(attribute.name);
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

        protected ScanNode(node: {nodeType:number,localName:string, attributes:{src:{nodeValue:string}}}, data: any): void {
            if (node) {
                switch (node.nodeType) {
                    case 1://element
                        let tagname:string = node.localName;
                        if (tagname) {
                            let prefix:string = UrlResolver.prefix(tagname);
                            let localname:string = UrlResolver.localName(tagname);
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
                                                let src:any = node.attributes.src;
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
            } else {
                this.callback({code: 1}, null);
            }
        }

        public ResolveUrl(source: string, result: any): any {
            this.document_depth++;
            jsdom.env(
                source,
                [],
                {},
                (errors, window) => {
                    if (!errors) {
                        let childnodes:any = window.document.childNodes;
                        if (childnodes) {
                            _.forEach(childnodes, (element:any, index:number):void => {
                                this.position = index;
                                this.ScanNode(element, null);
                            });
                        }
                    } else {
                        this.callback(errors, null);
                    }
                    this.document_depth--;
                    if (this.document_depth == 0) {
                        Promise.all(this.url_promises.map((doc: any): void => {
                            let promise:any = null;
                            if (doc.promise) {
                                promise = doc.promise;
                            }
                            return promise;
                        })).then((resolved: any[]): void => {
                            _.forEach(resolved, (entry:any, index:number) :void => {
                                result[this.url_promises[index].name] = {content: entry, count: 1};
                            });
                            this.callback(null, result);
                        }).catch((error: any): void => {
                            this.callback(error, null);
                        });
                    }
                }
            );
        }

        // todo:1path
        public ResolveUrl2(childnodes: any, result: any): any {



            if (childnodes) {
                _.forEach(childnodes, (element:any, index:number):void => {
                    this.position = index;
                    this.ScanNode(element, null);
                });
            }


            Promise.all(this.url_promises.map((doc: any): void => {
                let promise:any = null;
                if (doc.promise) {
                    promise = doc.promise;
                }
                return promise;
            })).then((resolved: any[]): void => {
                _.forEach(resolved, (entry:any, index:number) :void => {
                    result[this.url_promises[index].name] = {content: entry, count: 1};
                });
                this.callback(null, result);
            }).catch((error: any): void => {
                this.callback(error, null);
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
    *  例　　　<div ds:class="fieldname">   ->   <div class="hoge">
    *
    * */
    export class Expander extends NodeScanner {

        public fragments: any = {};
        public html: string = "";
        public datasource: ScannerBehavior.Behavior; // Behavior;

        constructor(datasource: ScannerBehavior.Behavior, callback: (error: any, result: any) => void) {
            super(callback);
            this.datasource = datasource;
        }

        //js-domはHTMLを厳密にパースする。そのためHeader要素が限られる。
        //よって、"meta"タグをInclude命令に使用する。
        private Include(node: any, data: any): void {
            let resolved:boolean = false;
            if (node.attributes) {
                let number = node.attributes.length;
                for (var index:number = 0; index < number; index++) {
                    let attribute:any = node.attributes[index];
                    let prefix:string = Expander.prefix(attribute.name);
                    let localname:string = Expander.localName(attribute.name);
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

        private NodeToElement(node: any, data: any): void {
            let tagname:string = node.localName;
            let attribute_string:string = "";
            if (node.attributes) {
                let number = node.attributes.length;
                for (var index:number = 0; index < number; index++) {
                    let attribute:any = node.attributes[index];
                    let prefix:string = Expander.prefix(attribute.name);
                    let localname:string = Expander.localName(attribute.name);
                    if (prefix == PREFIX) {
                        attribute_string += ' ' + localname + '="' + this.datasource.ResolveFormat(data, {
                            content: attribute.value,
                            count: 1
                        }, this) + '"';
                    } else {
                        attribute_string += ' ' + attribute.name + '="' + attribute.value + '"';
                    }
                }
            }

            let localname:string = DataSourceResolver.localName(tagname);
            let prefix:string = DataSourceResolver.prefix(tagname);

            if (prefix != PREFIX) {
                localname = tagname;
            }

            if (node.childNodes.length > 0) {
                this.html += "<" + localname + attribute_string + ">";
                this.ScanChild(node, data);
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

        private ResolveChildren(node: any, result: any): void {
            _.forEach(node.childNodes, (childnode: any, index): void => {
                this.position = index;
                this.ScanNode(childnode, result);
            })
        }

        protected ScanNode(node: any, data: any): void {
            if (node) {
                switch (node.nodeType) {
                    case 1://element
                        let tagname:string = node.localName;
                        if (tagname) {
                            let prefix:string = Expander.prefix(tagname);
                            let localname:string = Expander.localName(tagname);
                            switch (localname) {
                                case "html":
                                case "head":
                                case "body":
                                    if (this.datasource.isdocument) {
                                        this.NodeToElement(node, data);
                                    } else {
                                        this.ScanChild(node, data);
                                    }
                                    break;
                                case "meta":
                                    this.Include(node, data);
                                    break;
                                case "foreach":
                                    if (prefix == PREFIX) {
                                        if (node.attributes) {
                                            if (node.attributes.query) { // query="{}"
                                                let query:any = node.attributes.query;
                                                let result:any = this.fragments[query.nodeValue].content;
                                                if (result) {
                                                    _.forEach(result, (resolved_data, index) => {
                                                        this.ResolveChildren(node, resolved_data);
                                                    });
                                                }
                                            } else if (node.attributes.scope) { // scope="a.b.c"
                                                if (data) {
                                                    let scope:any = node.attributes.scope;
                                                    let result:any = this.datasource.FieldValue(data, scope.nodeValue, this);//fragment
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
                                              if (node.attributes.src) {    // src="url"
                                                let src:any = node.attributes.src;
                                                this.html += this.datasource.ResolveFormat(data, this.fragments[src.nodeValue], this);
                                            }
                                        }
                                    }
                                    break;
                                case "resolve":
                                    if (prefix == PREFIX) {
                                        if (node.attributes) {
                                            if (node.attributes.query) {         // query="{}"
                                                let query:any = node.attributes.query;
                                                let current_datasource:any = this.fragments[query.nodeValue].content;
                                                _.forEach(node.childNodes, (childnode: any, index: number): void => {
                                                    this.position = index;
                                                    this.ScanNode(childnode, current_datasource[0]);
                                                })
                                            } else if (node.attributes.field) {  // field="{a.b.c}"
                                                let field:any = node.attributes.field;
                                                this.html += this.datasource.ResolveFormat(data, {
                                                    content: field.nodeValue,
                                                    count: 1
                                                }, this);
                                            } else if (node.attributes.scope) {  // scope="a.b.c"
                                                if (data) {
                                                    let scope:any = node.attributes.scope;
                                                    let result:any = this.datasource.FieldValue(data, scope.nodeValue, this);
                                                    if (result) {
                                                        if (_.isArray(result)) {
                                                            if (result.length > 0) {
                                                                this.ResolveChildren(node, result[0]);
                                                            }
                                                        } else {
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
                                                let exist:any = node.attributes.exist;
                                                let result:any = this.datasource.FieldValue(data, exist.nodeValue, this); //model
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
                                                let exist:any = node.attributes.exist;
                                                let result:any = this.datasource.FieldValue(data, exist.nodeValue, this); //model
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
                    case 3://text
                        if (node.parentNode) {  // field="{a.b.c}"
                            let parent_name:string = node.parentNode.localName;
                            let prefix:string = Expander.prefix(parent_name);
                            if (prefix == PREFIX) {
                                this.html += this.datasource.ResolveFormat(data, {content: node.data, count: 1}, this);
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
                this.callback({code: 1}, null);
            }
        }

        public ExpandHtml(source: string, fragments: { content: string, count: number }[]): any {
            this.fragments = fragments;
            this.document_depth++;
            jsdom.env(
                source,
                [],
                {},
                (errors, window) => {
                    if (!errors) {
                        let childnodes:any = window.document.childNodes;
                        if (childnodes) {
                            _.forEach(childnodes, (element, index) => {
                                this.position = index;
                                this.ScanNode(element, fragments);
                            });
                        }
                    } else {
                        this.callback(errors, null);
                    }
                    this.document_depth--;
                    if (this.document_depth == 0) {
                        this.callback(null, this.html);
                    }
                }
            );
        }

        // todo:1path
        public ExpandHtml2(childnodes: any, fragments: { content: string, count: number }[]): any {
            if (childnodes) {
                _.forEach(childnodes, (element, index) => {
                    this.position = index;
                    this.ScanNode(element, fragments);
                });
            }
        }
    }

    /* Builder
    *  Resolver,Expanderを使用して、HTMLテンプレートを展開する。
    *　todo: ３回パースするのはダサダサ。
    *
    * */
    export class Builder {

        static Build(source: any, datasource: any, page_init:any,config:any, callback: (error: any, result: string) => void): void {

            let build:any = (source: any, datasource: any, page_init, callback: (error: any, result: string) => void) => {
                let datasource_resolver:any = new HTMLScanner.DataSourceResolver(datasource, (error: any, datasource_result: any): void => {
                    if (!error) {
                        let url_resolver:any = new HTMLScanner.UrlResolver(datasource, config, (error: any, url_result: any): void => {
                            if (!error) {
                                let expander:any = new HTMLScanner.Expander(datasource, (error: any, expand_result: any): void => {
                                    if (!error) {
                                        callback(null, expand_result);
                                    } else {
                                        callback(error, null);
                                    }
                                });
                                expander.ExpandHtml(source, url_result);
                            } else {
                                callback(error, null);
                            }
                        });
                        url_resolver.ResolveUrl(source, datasource_result);
                    } else {
                        callback(error, null);
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

        static Resolve(source:any, datasource:ScannerBehavior.Behavior, url_result:any, callback: (error: any, result: string) => void) :void {
            let expander:any = new HTMLScanner.Expander(datasource, (error: any, expand_result: any): void => {
                if (!error) {
                    callback(null, expand_result);
                } else {
                    callback(error, null);
                }
            });
            expander.ExpandHtml(source, url_result);
        }

        // todo:1path
        static Build2(source: string, datasource: any, page_init:any,config:any, callback: (error: any, result: string) => void): void {

            let build:any = (source: string, datasource: any, page_init, callback: (error: any, result: string) => void) => {
                let datasource_resolver:any = new HTMLScanner.DataSourceResolver(datasource, (error: any, datasource_result: any): void => {
                    if (!error) {
                        let url_resolver:any = new HTMLScanner.UrlResolver(datasource, config, (error: any, url_result: any): void => {
                            if (!error) {
                                let expander:any = new HTMLScanner.Expander(datasource, (error: any, expand_result: any): void => {
                                    if (!error) {
                                        callback(null, expand_result);
                                    } else {
                                        callback(error, null);
                                    }
                                });
                                expander.ExpandHtml2(source, url_result);
                            } else {
                                callback(error, null);
                            }
                        });
                        url_resolver.ResolveUrl2(source, datasource_result);
                    } else {
                        callback(error, null);
                    }
                });

                datasource_resolver.datasource_promises.push(page_init);
                datasource_resolver.ResolveDataSource2(source, {});
            };

            jsdom.env(
                source,
                [],
                {},
                (errors, window) => {
                    if (!errors) {
                        let childnodes = window.document.childNodes;
                        if (datasource.page_params) {
                            build(childnodes, datasource, page_init, callback);
                        } else {
                            build(childnodes, datasource, {}, callback);
                        }

                    } else {
                        callback(errors, null);
                    }

                }
            );

        };

    }

}

module.exports = HTMLScanner;

