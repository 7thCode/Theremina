/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

var server = (typeof window === 'undefined');

if (server) {
    var _: _.LoDashStatic = require('lodash');
    var jsdom = require("node-jsdom");
    var moment = require("moment");
}

namespace HtmlEdit {

    interface article { create: any, modify: any, content: any }

    export class Scanner {

        private order:any;
        private userid:string;

        constructor(userid:string, order:any) {
            this.userid = userid;
            this.order = order;
        }

        private unescapeHTML(str) {
            return str
                .replace(/(&lt;)/g, '<')
                .replace(/(&gt;)/g, '>')
                .replace(/(&quot;)/g, '"')
                .replace(/(&#39;)/g, "'")
                .replace(/(&amp;)/g, '&')
                .replace(/(&#x2F;)/g, '/');
        }

        private exception(e) {

        }

        private Format(values: any, format_string: string, count: number): string {
            let result = "";
            let tell_format = (record: any, format: any): string => {
                let result = "";
                let separate_format = (type, value, option): string => {
                    let result = "";
                    let locale = "ja-JP";
                    if (option.locale) {
                        locale = option.locale;
                    }
                    switch (type) {
                        case "formula":
                            result = new Function("return " + value)();
                            break;
                        case "function":
                            result = new Function("value", "with (value) {" + option.function + "}")(value);//scope chainをぶった切る(for Security)
                            break;
                        case "number":
                            result = new Intl.NumberFormat(locale, option).format(value);
                            break;
                        case "date":
                            result = new Intl.DateTimeFormat(locale, option).format(value);
                            break;
                        case "html":
                            result = "" + this.unescapeHTML(value);
                            break;
                        default:
                            result = "" + value;
                    }
                    return result;
                };

                let cell: any = {};
                let name = format.name;
                if (name) {
                    cell = record[name];
                    if (cell) {
                        if (cell.value) {
                            let value = cell.value;

                            let option: any = {};
                            if (format.option) {
                                option = format.option;
                            }

                            let _type: string = "";
                            if (format.type) {
                                _type = format.type;
                            }

                            try {
                                result = separate_format(_type, value, option);
                            } catch (e) {
                                this.exception(e);
                            }
                        }
                    }
                }
                return "" + result;
            };

            if (format_string) {

                _.forEach(format_string.split("|"), (fragment) => {
                    if (fragment[0] == "{") {
                        if (fragment[fragment.length - 1] == "}") {
                            try {
                                switch (fragment) {
                                    case "{count}":
                                        result += "" + count;
                                        break;
                                    case "{pages}":
                                        try {
                                            let pages = 0;
                                            try {
                                                if (("skip" in this.order) && ("limit" in this.order)) {
                                                    pages = Math.ceil(count / this.order.limit);
                                                }
                                            } catch (e) {
                                                this.exception(e);
                                            }
                                            result += "" + pages;
                                        } catch (e) {
                                            this.exception(e);
                                        }
                                        break;
                                    case "{page}":
                                        try {
                                            let page = 1;
                                            try {
                                                if (("skip" in this.order) && ("limit" in this.order)) {
                                                    if (this.order.skip) {
                                                        page = (this.order.skip / this.order.limit) + 1;
                                                    }
                                                }
                                            } catch (e) {
                                                this.exception(e);
                                            }
                                            result += "" + page;
                                        } catch (e) {
                                            this.exception(e);
                                        }
                                        break;
                                    case "{prev}":
                                        try {
                                            let start = 0;
                                            try {
                                                if (("skip" in this.order) && ("limit" in this.order)) {
                                                    start = this.order.skip - this.order.limit;
                                                    if (start < 0) {
                                                        start = 0;
                                                    }
                                                }
                                            } catch (e) {
                                                this.exception(e);
                                            }
                                            result += "" + start;
                                        } catch (e) {
                                            this.exception(e);
                                        }
                                        break;
                                    case "{next}":
                                        try {
                                            let start = 0;
                                            try {
                                                if (("skip" in this.order) && ("limit" in this.order)) {
                                                    start = this.order.skip + this.order.limit;
                                                }
                                            } catch (e) {
                                                this.exception(e);
                                            }
                                            result += "" + start;
                                        } catch (e) {
                                            this.exception(e);
                                        }
                                        break;
                                    case "{create}" :
                                        try {
                                            result += new Intl.DateTimeFormat().format(values.create);
                                        } catch (e) {
                                            this.exception(e);
                                        }
                                        break;
                                    case "{modify}" :
                                        try {
                                            result += new Intl.DateTimeFormat().format(values.modify);
                                        } catch (e) {
                                            this.exception(e);
                                        }
                                        break;
                                    case "{userid}" :
                                        result += this.userid;
                                        break;
                                    case "{name}" :
                                        result += values.name;
                                        break;
                                    default:
                                        result += tell_format(values.content, JSON.parse(fragment));
                                }
                            } catch (e) {
                                result += fragment;
                                this.exception(e);
                            }
                        } else {
                            result += fragment;
                        }
                    } else {
                        result += fragment;
                    }
                });
            }
            return result;
        };

        private ScanElement(node: any, record: article, records: article[], index: number): string {
            let result:string = "";

            let target:article = records[index];
            if (!target) {
                target = record;
            }

            result += "<" + node.nodeName;
            _.forEach(node.attributes, (value: any): void => {
                result += " ";
                let attributevalue = "";
                attributevalue = this.Format(target, value.nodeValue, records.length);
                result += value.localName + "=\"" + attributevalue + "\"";
                result += " ";
            });
            result += ">";

            _.forEach(node.childNodes, (node: any): void => {
                result += this.ScanNode(node, record, records, index);

            });

            result += "</" + node.nodeName + ">";
            return result;
        }

        private ScanText(node: any, record: article, records: article[], index: number): string {
            let result:string = "";
            if (record) {
                result = this.Format(record, node.data, records.length);
            } else {
                result = this.Format(records[index], node.data, records.length);
            }
            return result;
        }

        private ScanNode(node: any, record: article, records: article[], index: number): string {

            let result:string = "";
            let filtered: article[] = records;
            if (node.attributes) {
                if (node.attributes.filter) {
                    filtered = [];
                    try {
                        let filter = JSON.parse(node.attributes.filter.nodeValue);
                        records.forEach((record) => {
                            let found = false;
                            Object.keys(filter).forEach((key) => {
                                found = (record.content[key].value == filter[key]);
                            });
                            if (found) {
                                filtered.push(record);
                            }
                        });
                    } catch (e) {
                        this.exception(e);
                    }
                }
            }

            let skipper = (index:number,skip:number,limit:number, callback:()=> void) => {
                if (index >= skip) {
                    if (limit == 0) {
                        callback();
                    } else {
                        if (index < (skip + limit)) {
                            callback();
                        }
                    }
                }
            };

            switch (node.nodeType) {
                case 1:
                    switch (node.localName) {
                        case "repeat": {
                            _.forEach(filtered, (record: any, _index: number): void => {
                                _.forEach(node.childNodes, (childnode: any): void => {
                                    let skip = 0;
                                    let limit = 0;
                                    if (this.order.skip) {
                                        skip = this.order.skip;
                                    }
                                    if (this.order.limit) {
                                        limit = this.order.limit;
                                    }

                                    skipper(_index, skip, limit, () => {
                                        result += this.ScanNode(childnode, record, filtered, _index);
                                    });

                                });
                            });
                        }
                            break;
                        case "if":

                            break;
                        default:
                            result = this.ScanElement(node, record, records, index);
                            break;
                    }
                    break;
                case 3:
                    result = this.ScanText(node, record, records, index);
                    break;
                case 10:
                    result = "<!DOCTYPE " + node.nodeName + ">";
                    break;
                case 8:
                    break;

                default:
                    result = this.ScanElement(node, record, records, index);
            }
            return result;
        }

        public ScanHtml(html: string, record: article, records: article[], index: number, callback: (error: any, doc: any) => void): any {

            jsdom.env(
                html,
                [],
                (errors, window) => {
                    if (!errors) {
                        let result = "";

                        _.forEach(window.document.childNodes, (element) => {
                            result += this.ScanNode(element, record, records, index);
                        });

                        callback(null, result);
                    } else {
                        callback(errors, null);
                    }
                }
            );
        }

        public ScanHtmlFragment(html: string, record: article, records: article[], index: number, callback: (error: any, doc: any) => void): any {

            jsdom.env(
                html,
                [],
                (errors, window) => {
                    if (!errors) {
                        let result = "";

                        _.forEach(window.document.childNodes[0].childNodes[1].childNodes, (element) => {
                            result += this.ScanNode(element, record, records, index);
                        });

                        callback(null, result);
                    } else {
                        callback(errors, null);
                    }
                }
            );
        }
    }


    export class Render {

        constructor() {
        }

        static Format(values: any, format_string: string): string {
            let result = "";

            let tell_format = (record: any, format: any): string => {
                let result = "";

                let separate_format = (type, value, option): string => {
                    let result = "";

                    let locale = "ja-JP";
                    if (option.locale) {
                        locale = option.locale;
                    }
                    switch (type) {
                        case "formula":
                            result = new Function("return " + value)();
                            break;
                        case "function":
                            result = new Function("value", "with (value) {" + option.function + "}")(value);//scope chainをぶった切る(for Security)
                            //result = new Function("value", option.function)(value);//scope chainをぶった切る(for Security)
                            break;
                        case "number":
                            result = new Intl.NumberFormat(locale, option).format(value);
                            break;
                        case "date":
                            result = new Intl.DateTimeFormat(locale, option).format(value);
                            break;
                        default:
                            result = "" + value;
                    }
                    return result;
                };

                let cell: any = {};
                let name = format.name;
                if (name) {
                    cell = record[name];
                    if (cell) {
                        if (cell.value) {
                            let value = cell.value;

                            let option: any = {};
                            if (format.option) {
                                option = format.option;
                            }

                            let _type: string = "";
                            if (format.type) {
                                _type = format.type;
                            }

                            try {
                                result = separate_format(_type, value, option);
                            } catch (e) {
                            }
                        }
                    }
                }
                return "" + result;
            };

            if (format_string) {

                _.forEach(format_string.split("|"), (fragment) => {
                    if (fragment[0] == "{") {
                        if (fragment[fragment.length - 1] == "}") {
                            try {
                                switch (fragment) {
                                    case "{create}" :
                                        try {
                                            result += new Intl.DateTimeFormat().format(values.create);
                                        } catch (e) {

                                        }
                                        break;
                                    case "{modify}" :
                                        try {
                                            result += new Intl.DateTimeFormat().format(values.modify);
                                        } catch (e) {
                                        }
                                        break;
                                    case "{userid}" :
                                        result += values.userid;
                                        break;
                                    case "{name}" :
                                        result += values.name;
                                        break;
                                    default:
                                        result += tell_format(values.content, JSON.parse(fragment));
                                }
                            }
                            catch (e) {
                                result += fragment;
                            }
                        } else {
                            result += fragment;
                        }
                    } else {
                        result += fragment;
                    }
                });
            }
            return result;
        };

        static MakeElement(node): any {
            let result = {"name": "", "type": "", "_$": {}, "@": []};
            result.name = node.nodeName;
            result["_$"] = node.attributes;
            let children = [];
            _.forEach(node.childNodes, (node) => {
                children.push(this.MakeNode(node));
            });
            result["@"] = children;
            return result;
        }

        static MakeText(node): any {
            let result = "";
            result = node.nodeValue;
            return result;
        }

        static MakeNode(node): any {
            let result = null;
            switch (node.nodeType) {
                case 1:
                    result = this.MakeElement(node);
                    result.type = "element";
                    break;
                case 2:
                    result = this.MakeElement(node);
                    result.type = "attribute";
                    break;
                case 3:
                    result = this.MakeText(node);
                    break;
                case 4:
                    result = this.MakeElement(node);
                    result.type = "cdata";
                    break;
                case 5:
                    result = this.MakeElement(node);
                    result.type = "entity_ref";
                    break;
                case 6:
                    result = this.MakeElement(node);
                    result.type = "entity";
                    break;
                case 7:
                    result = this.MakeElement(node);
                    result.type = "pi";
                    break;
                case 8:
                    result = this.MakeElement(node);
                    result.type = "comment";
                    break;
                case 9:
                    result = this.MakeElement(node);
                    result.type = "document";
                    break;
                case 10:
                    result = this.MakeElement(node);
                    result.type = "document_type";
                    break;
                case 11:
                    result = this.MakeElement(node);
                    result.type = "document_fragment";
                    break;
                case 12:
                    result = this.MakeElement(node);
                    result.type = "notation";
                    break;
                default:
            }
            return result;
        }

        static fromHtml(html: string, callback: (error: any, doc: any) => void): any {
            if (server) {
                jsdom.env(
                    html,
                    [],
                    (errors, window) => {
                        if (!errors) {
                            let root = window.document;
                            let result = this.MakeNode(root);
                            callback(null, [result]);
                        } else {
                            callback(errors, []);
                        }
                    }
                );
            } else {
                let root = document.createElement('html');
                root.innerHTML = html;
                let result = this.MakeNode(root);
                callback(null, [result]);
            }

        }

        // json to html
        static toHtml(object: any, html: string): string {
            _.each(object, (element, name) => {
                if (typeof element === 'object') {

                    switch (element["type"]) {
                        case "element": {
                            html += "<" + element["name"];
                            let attributes = element["_$"];
                            if (attributes) {
                                html += " ";
                                _.each(attributes, (value, name) => {
                                    html += name + "=" + "'" + value + "' ";
                                });
                            }
                            let child = element["@"];
                            if (child) {
                                if (child.length == 0) {
                                    html += "></" + element["name"] + ">";
                                } else {
                                    html += ">" + Render.toHtml(child, "") + "</" + element["name"] + ">";
                                }
                            } else {
                                html += "/>";
                            }
                            break;
                        }
                        case "doctypedecl": {
                            html += "<!DOCTYPE " + element["name"] + ">";
                            break;
                        }
                    }
                } else {
                    html += element;
                }

            });
            return html;
        };

        // components type document to html
        static docToHtml(doc: any, record: { create: any, modify: any, content: any }, callback: (error: any, result: string) => void): void {

            let flatten_collection = (a: any, b: any): any => {

                let flatten_style = (a: any): string => {
                    let result: string = "";
                    _.forEach(a, (v: any, k: any): void => {
                        result += k + ":" + v + ";";
                    });
                    return result;
                };

                _.forEach(b, (v: any, k: any): void => {
                    if (k == "style") {
                        a[k] = flatten_style(v);
                    } else {
                        a[k] = v;
                    }
                });
                return a;
            };

            let mould = (document, parent, field, type) => {
                let element = Render.toHtml(field, "");
                let moulding = document.createElement(parent_restricted(type));      //　展開用型枠
                moulding.innerHTML = element;                      // pour it up
                let parent_node = document.getElementById(parent);
                if (parent_node) {
                    parent_node.appendChild(moulding.firstChild);  // Take out
                } else {
                    let a = parent;
                }
            };

            let parent_restricted = (type: string): string => {
                let restricted: any = {
                    "li": "ol",
                    "dt": "dl",
                    "dd": "dl",
                    "caption": "table",
                    "thead": "table",
                    "tbody": "table",
                    "tfoot": "table",
                    "colgroup": "table",
                    "col": "table",
                    "tr": "table",
                    "td": "tr",
                    "th": "tr",
                    "option": "select",
                    "legend": "fieldset",
                    "optgroup": "select"
                };

                let result: string = restricted[type];
                if (!result) {
                    result = "div";
                }
                return result;
            };

            let elements = (page, callback: (control: any, element: any) => boolean): void => {
                let _continue = true;
                _.forEach(page, (control: any): boolean => {
                    _.forEach(control.elements, (element: any): boolean => {
                        _continue = callback(control, element);
                        return _continue;
                    });
                    return _continue;
                });
            };

            jsdom.env(
                "<html><head></head><body><div id='root'/></body></html>",
                [],
                function (errors: any, window: any): void {
                    if (!errors) {
                        let document = window.document;
                        elements(doc.content, (control, _element: any): boolean => {
                            let field = [];
                            let id = _element.id;
                            let parent = _element.parent;
                            let label = _element.label;
                            let type = _element.type;
                            let attributes = _element.attributes;
                            let contents = _element.contents;

                            let events = _element.events;

                            switch (type) {
                                case "img": {
                                    if (record) {
                                        if (record.content) {
                                            let name = attributes["src"];
                                            if (name) {
                                                let replaceive = record.content[name];
                                                if (replaceive) {
                                                    attributes["src"] = "" + replaceive.value;
                                                }
                                            }
                                        }
                                    }

                                    field = [{
                                        "name": type, "type": "element",
                                        "_$": flatten_collection({"id": id}, attributes),
                                        "@": contents
                                    }];
                                    mould(document, parent, field, type);

                                    break;
                                }
                                case "div": {
                                    if (record) {
                                        if (record.content) {
                                            if (contents) {
                                                if (typeof contents == "string") {
                                                    switch (contents) {
                                                        case "create" :
                                                            contents = moment(record.create).format("YYYY-MM-DD HH:mm:ss");
                                                            break;
                                                        case "modify" :
                                                            contents = moment(record.modify).format("YYYY-MM-DD HH:mm:ss");
                                                            break;
                                                        default:
                                                            contents = Render.Format(record.content, contents);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    field = [{
                                        "name": type, "type": "element",
                                        "_$": flatten_collection({"id": id}, attributes),
                                        "@": contents
                                    }];
                                    mould(document, parent, field, type);

                                    break;
                                }

                                case "form":
                                case "span":
                                case "label":
                                case "input":
                                case "textarea": {

                                    field = [{
                                        "name": type, "type": "element",
                                        "_$": flatten_collection({"id": id}, attributes),
                                        "@": contents
                                    }];
                                    mould(document, parent, field, type);

                                    break;
                                }
                                case "select":// for bootstrap 3
                                {
                                    let contents_model_name = id + "_contents";
                                    field = [{
                                        "name": "div", "type": "element",
                                        "_$": {"class": "form-group"},
                                        "@": [
                                            {
                                                "name": "label", "type": "element",
                                                "_$": {"for": id},
                                                "@": label,
                                            },
                                            {
                                                "name": "select", "type": "element",
                                                "_$": flatten_collection({
                                                    id: id,
                                                    "class": "form-control",
                                                    "ng-init": id + " = " + contents_model_name + "[0]",
                                                    "ng-model": id,
                                                    "ng-options": "option for option in " + contents_model_name,
                                                    "name": id
                                                }, attributes)
                                            }]
                                    }];
                                    mould(document, parent, field, type);
                                    break;
                                }
                                case "button":// for bootstrap 3
                                {
                                    field = [
                                        {
                                            "name": "button", "type": "element",
                                            "_$": flatten_collection({
                                                id: id,
                                                "class": "form-control",
                                                "ng-click": "click_" + id + "()"
                                            }, attributes),
                                            "@": label
                                        }
                                    ];
                                    mould(document, parent, field, type);

                                    break;
                                }

                                case "table": {
                                    field = [{
                                        "name": type, "type": "element",
                                        "_$": flatten_collection({"id": id}, attributes),
                                        "@": contents
                                    }];

                                    // "table"Tag  is restricted parent

                                    let element = Render.toHtml(field, "");
                                    let moulding = document.createElement(parent_restricted(type));      //　展開用型枠
                                    moulding.innerHTML = element;                      // pour it up
                                    let parent_node = document.getElementById(parent);
                                    parent_node.appendChild(moulding);  // Take out

                                    break;
                                }

                                case "tr": {
                                    field = [{
                                        "name": type, "type": "element",
                                        "_$": flatten_collection({"id": id}, attributes),
                                        "@": contents
                                    }];
                                    mould(document, parent, field, type);
                                    break;
                                }

                                case "td": {

                                    field = [{
                                        "name": type, "type": "element",
                                        "_$": flatten_collection({"id": id}, attributes),
                                        "@": contents
                                    }];
                                    mould(document, parent, field, type);

                                    break;
                                }
                                default: {
                                    field = [{
                                        "name": type, "type": "element",
                                        "_$": flatten_collection({"id": id}, attributes),
                                        "@": contents
                                    }];
                                    mould(document, parent, field, type);
                                    break;
                                }
                            }
                            return true;
                        });

                        let the_thing_itself = document.getElementById("root");
                        callback(null, the_thing_itself.innerHTML);
                        window.close();
                    } else {
                        callback({code: 20000, message: ""}, null);
                    }
                }
            );
        };

        // html to components type document
        static fromHtmltoDoc(html: string, callback: (error: any, doc: any) => void): void {
            if (server) {
            } else {
            }
        }
    }

}

if (server) {
    module.exports = HtmlEdit;
}
