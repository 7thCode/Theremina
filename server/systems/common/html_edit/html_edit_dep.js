/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var server = (typeof window === 'undefined');
if (server) {
    var _ = require('lodash');
    var jsdom = require("node-jsdom");
    var moment = require("moment");
}
var HtmlEdit;
(function (HtmlEdit) {
    class Scanner {
        constructor(userid, order, modules) {
            this.userid = userid;
            this.order = order;
            this.modules = modules;
        }
        unescapeHTML(str) {
            return str
                .replace(/(&lt;)/g, '<')
                .replace(/(&gt;)/g, '>')
                .replace(/(&quot;)/g, '"')
                .replace(/(&#39;)/g, "'")
                .replace(/(&amp;)/g, '&')
                .replace(/(&#x2F;)/g, '/');
        }
        exception(e) {
        }
        Format(values, format_string, count) {
            let locale = 'ja-JP';
            let result = "";
            let tell_format = (record, format) => {
                let result = "";
                let separate_format = (type, value, option) => {
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
                            result = new Function("value", "with (value) {" + option.function + "}")(value); //scope chainをぶった切る(for Security)
                            break;
                        case "number":
                            result = new Intl.NumberFormat(locale, option).format(value);
                            break;
                        case "date":
                            let format = "YYYY-MM-DD";
                            if (option.format) {
                                format = option.format;
                            }
                            result = moment(new Date(value)).format(format);
                            //      result = new Date(value).toLocaleString(locale,option);
                            //        result = new Intl.DateTimeFormat(locale, option).format(new Date(value));
                            break;
                        case "html":
                            result = "" + this.unescapeHTML(value);
                            break;
                        default:
                            result = "" + value;
                    }
                    return result;
                };
                let cell = {};
                let name = format.name;
                if (name) {
                    cell = record[name];
                    if (cell) {
                        if (cell.value) {
                            let value = cell.value;
                            let option = {};
                            if (format.option) {
                                option = format.option;
                            }
                            let _type = "";
                            if (format.type) {
                                _type = format.type;
                            }
                            try {
                                result = separate_format(_type, value, option);
                            }
                            catch (e) {
                                this.exception(e);
                            }
                        }
                    }
                }
                return "" + result;
            };
            let eval_fragment = (fragment) => {
                let result = { eval: false, value: fragment };
                if (fragment) {
                    if (fragment[0] == "{" || fragment[1] == "{") {
                        if (fragment[fragment.length - 1] == "}") {
                            switch (fragment) {
                                case "|{count}":
                                case "{count}":
                                    result = { eval: false, value: count };
                                    break;
                                case "|{pages}":
                                case "{pages}":
                                    try {
                                        let pages = 0;
                                        try {
                                            if (("skip" in this.order) && ("limit" in this.order)) {
                                                pages = Math.ceil(count / this.order.limit);
                                            }
                                        }
                                        catch (e) {
                                            this.exception(e);
                                        }
                                        result = { eval: true, value: pages };
                                    }
                                    catch (e) {
                                        this.exception(e);
                                    }
                                    break;
                                case "|{page}":
                                case "{page}":
                                    try {
                                        let page = 1;
                                        try {
                                            if (("skip" in this.order) && ("limit" in this.order)) {
                                                if (this.order.skip) {
                                                    page = (this.order.skip / this.order.limit) + 1;
                                                }
                                            }
                                        }
                                        catch (e) {
                                            this.exception(e);
                                        }
                                        result = { eval: true, value: page };
                                    }
                                    catch (e) {
                                        this.exception(e);
                                    }
                                    break;
                                case "|{prev}":
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
                                        }
                                        catch (e) {
                                            this.exception(e);
                                        }
                                        result = { eval: true, value: start };
                                    }
                                    catch (e) {
                                        this.exception(e);
                                    }
                                    break;
                                case "|{next}":
                                case "{next}":
                                    try {
                                        let start = 0;
                                        try {
                                            if (("skip" in this.order) && ("limit" in this.order)) {
                                                start = this.order.skip + this.order.limit;
                                            }
                                        }
                                        catch (e) {
                                            this.exception(e);
                                        }
                                        result = { eval: true, value: start };
                                    }
                                    catch (e) {
                                        this.exception(e);
                                    }
                                    break;
                                case "|{hasprev}":
                                case "{hasprev}":
                                    try {
                                        let hasprev = false;
                                        try {
                                            if (("skip" in this.order) && ("limit" in this.order)) {
                                                hasprev = (this.order.skip > 0);
                                            }
                                        }
                                        catch (e) {
                                            this.exception(e);
                                        }
                                        result = { eval: true, value: hasprev };
                                    }
                                    catch (e) {
                                        this.exception(e);
                                    }
                                    break;
                                case "|{hasnext}":
                                case "{hasnext}":
                                    try {
                                        let hasnext = false;
                                        try {
                                            if (("skip" in this.order) && ("limit" in this.order)) {
                                                hasnext = (this.order.skip + this.order.limit < count);
                                            }
                                        }
                                        catch (e) {
                                            this.exception(e);
                                        }
                                        result = { eval: true, value: hasnext };
                                    }
                                    catch (e) {
                                        this.exception(e);
                                    }
                                    break;
                                case "|{create}":
                                case "{create}":
                                    try {
                                        result = {
                                            eval: true,
                                            value: new Intl.DateTimeFormat(locale).format(values.create)
                                        };
                                    }
                                    catch (e) {
                                        this.exception(e);
                                    }
                                    break;
                                case "|{modify}":
                                case "{modify}":
                                    try {
                                        result = {
                                            eval: true,
                                            value: new Intl.DateTimeFormat(locale).format(values.modify)
                                        };
                                    }
                                    catch (e) {
                                        this.exception(e);
                                    }
                                    break;
                                case "|{userid}":
                                case "{userid}":
                                    result = { eval: true, value: this.userid };
                                    break;
                                case "|{name}":
                                case "{name}":
                                    result = { eval: true, value: values.name };
                                    break;
                                default:
                                    let format = {};
                                    try {
                                        if (fragment[0] != "{") {
                                            fragment = fragment.slice(1);
                                        }
                                        format = JSON.parse(fragment);
                                        result = { eval: true, value: tell_format(values.content, format) };
                                    }
                                    catch (e) {
                                    }
                            }
                        }
                    }
                }
                return result;
            };
            let fragments = [];
            let current = "";
            if (format_string) {
                _.forEach(format_string, (char) => {
                    switch (char) {
                        case "|":
                            fragments.push(current);
                            current = "";
                        default:
                            current += char;
                    }
                });
                fragments.push(current);
                let evaled = false;
                fragments.forEach((fragment) => {
                    if (evaled) {
                        if (fragment[0] == "|") {
                            fragment = fragment.slice(1);
                        }
                        evaled = false;
                    }
                    let _fragment = eval_fragment(fragment);
                    evaled = _fragment.eval;
                    result += _fragment.value;
                });
            }
            return result;
        }
        ;
        ScanElement(node, record, records, index) {
            let result = "";
            let target = records[index];
            if (!target) {
                target = record;
            }
            result += "<" + node.nodeName;
            _.forEach(node.attributes, (value) => {
                result += " ";
                let attributevalue = "";
                if (record) {
                    attributevalue = this.Format(record, value.nodeValue, records.length);
                }
                else {
                    attributevalue = this.Format(records[index], value.nodeValue, records.length);
                }
                //  attributevalue = this.Format(target, value.nodeValue, records.length);
                result += value.localName + "=\"" + attributevalue + "\"";
                result += " ";
            });
            result += ">";
            _.forEach(node.childNodes, (node) => {
                result += this.ScanNode(node, record, records, index);
            });
            result += "</" + node.nodeName + ">";
            return result;
        }
        ScanText(node, record, records, index) {
            let result = "";
            if (record) {
                result = this.Format(record, node.data, records.length);
            }
            else {
                result = this.Format(records[index], node.data, records.length);
            }
            return result;
        }
        ScanNode(node, record, records, index) {
            let result = "";
            let filtered = records; //default value
            let sorted = records;
            if (node.attributes) {
                if (node.attributes.filter) {
                    filtered = [];
                    try {
                        let filter = {};
                        try {
                            filter = JSON.parse(node.attributes.filter.nodeValue);
                        }
                        catch (e) {
                        }
                        if (node.attributes.sorter) {
                            let sorter = {};
                            try {
                                sorter = JSON.parse(node.attributes.sorter.nodeValue);
                            }
                            catch (e) {
                            }
                            if (sorter.field) {
                                let content_fields = [];
                                sorter.field.forEach((field) => {
                                    switch (field) {
                                        case "create":
                                            content_fields.push(field);
                                            break;
                                        default:
                                            content_fields.push("content." + field + ".value");
                                    }
                                });
                                sorted = _.orderBy(records, content_fields, sorter.order);
                            }
                        }
                        sorted.forEach((record) => {
                            let found = false;
                            Object.keys(filter).forEach((key) => {
                                found = (record.content[key].value == filter[key]);
                            });
                            if (found) {
                                filtered.push(record);
                            }
                        });
                        if (!this.order) {
                            if (node.attributes.option) {
                                let option = {};
                                try {
                                    option = JSON.parse(node.attributes.option.nodeValue);
                                }
                                catch (e) {
                                }
                                this.order = option;
                            }
                        }
                    }
                    catch (e) {
                        this.exception(e);
                    }
                }
            }
            let skipper = (index, skip, limit, callback) => {
                if (index >= skip) {
                    if (limit == 0) {
                        callback();
                    }
                    else {
                        if (index < (skip + limit)) {
                            callback();
                        }
                    }
                }
            };
            switch (node.nodeType) {
                case 1:
                    switch (node.localName) {
                        case "repeat":
                            {
                                _.forEach(filtered, (record, _index) => {
                                    _.forEach(node.childNodes, (childnode) => {
                                        if (this.order) {
                                            if (("skip" in this.order) && ("limit" in this.order)) {
                                                skipper(_index, this.order.skip, this.order.limit, () => {
                                                    result += this.ScanNode(childnode, record, filtered, _index);
                                                });
                                            }
                                        }
                                        else {
                                            result += this.ScanNode(childnode, record, filtered, _index);
                                        }
                                    });
                                });
                            }
                            break;
                        case "if":
                            break;
                        case "br":
                            result = "<BR/>";
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
        ScanHtml(html, record, records, index, callback) {
            let split_html = html.split(/<include>|<\/include>/);
            let concat_html = "";
            split_html.forEach((fragment) => {
                let resolved = fragment;
                let target_module = _.filter(this.modules, (module) => {
                    return (module.name == fragment);
                });
                if (target_module.length > 0) {
                    resolved = target_module[0].content.resource;
                }
                concat_html += resolved;
            });
            jsdom.env(concat_html, [], (errors, window) => {
                if (!errors) {
                    let result = "";
                    _.forEach(window.document.childNodes, (element) => {
                        result += this.ScanNode(element, record, records, index);
                    });
                    callback(null, result);
                }
                else {
                    callback(errors, null);
                }
            });
        }
        ScanHtmlFragment(html, record, records, index, callback) {
            let split_html = html.split(/<include>|<\/include>/);
            let concat_html = "";
            split_html.forEach((fragment) => {
                let resolved = fragment;
                let target_module = _.filter(this.modules, (module) => {
                    return (module.name == fragment);
                });
                if (target_module.length > 0) {
                    resolved = target_module[0].content.resource;
                }
                concat_html += resolved;
            });
            jsdom.env(concat_html, [], (errors, window) => {
                if (!errors) {
                    let result = "";
                    _.forEach(window.document.childNodes[0].childNodes[1].childNodes, (element) => {
                        result += this.ScanNode(element, record, records, index);
                    });
                    callback(null, result);
                }
                else {
                    callback(errors, null);
                }
            });
        }
    }
    HtmlEdit.Scanner = Scanner;
    class Render {
        constructor() {
        }
        static Format(values, format_string) {
            let locale = 'ja-JP';
            let result = "";
            let tell_format = (record, format) => {
                let result = "";
                let separate_format = (type, value, option) => {
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
                            result = new Function("value", "with (value) {" + option.function + "}")(value); //scope chainをぶった切る(for Security)
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
                let cell = {};
                let name = format.name;
                if (name) {
                    cell = record[name];
                    if (cell) {
                        if (cell.value) {
                            let value = cell.value;
                            let option = {};
                            if (format.option) {
                                option = format.option;
                            }
                            let _type = "";
                            if (format.type) {
                                _type = format.type;
                            }
                            try {
                                result = separate_format(_type, value, option);
                            }
                            catch (e) {
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
                                    case "{create}":
                                        try {
                                            result += new Intl.DateTimeFormat(locale).format(values.create);
                                        }
                                        catch (e) {
                                        }
                                        break;
                                    case "{modify}":
                                        try {
                                            result += new Intl.DateTimeFormat(locale).format(values.modify);
                                        }
                                        catch (e) {
                                        }
                                        break;
                                    case "{userid}":
                                        result += values.userid;
                                        break;
                                    case "{name}":
                                        result += values.name;
                                        break;
                                    default:
                                        let format = {};
                                        try {
                                            format = JSON.parse(fragment);
                                        }
                                        catch (e) {
                                        }
                                        result += tell_format(values.content, format);
                                }
                            }
                            catch (e) {
                                result += "|" + fragment + "|";
                            }
                        }
                        else {
                            result += "|" + fragment + "|";
                        }
                    }
                    else {
                        result += "|" + fragment + "|";
                    }
                });
            }
            return result;
        }
        ;
        static MakeElement(node) {
            let result = { "name": "", "type": "", "_$": {}, "@": [] };
            result.name = node.nodeName;
            result["_$"] = node.attributes;
            let children = [];
            _.forEach(node.childNodes, (node) => {
                children.push(this.MakeNode(node));
            });
            result["@"] = children;
            return result;
        }
        static MakeText(node) {
            let result = "";
            result = node.nodeValue;
            return result;
        }
        static MakeNode(node) {
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
        static fromHtml(html, callback) {
            if (server) {
                jsdom.env(html, [], (errors, window) => {
                    if (!errors) {
                        let root = window.document;
                        let result = this.MakeNode(root);
                        callback(null, [result]);
                    }
                    else {
                        callback(errors, []);
                    }
                });
            }
            else {
                let root = document.createElement('html');
                root.innerHTML = html;
                let result = this.MakeNode(root);
                callback(null, [result]);
            }
        }
        // json to html
        static toHtml(object, html) {
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
                                }
                                else {
                                    html += ">" + Render.toHtml(child, "") + "</" + element["name"] + ">";
                                }
                            }
                            else {
                                html += "/>";
                            }
                            break;
                        }
                        case "doctypedecl": {
                            html += "<!DOCTYPE " + element["name"] + ">";
                            break;
                        }
                    }
                }
                else {
                    html += element;
                }
            });
            return html;
        }
        ;
        // components type document to html
        static docToHtml(doc, record, callback) {
            let flatten_collection = (a, b) => {
                let flatten_style = (a) => {
                    let result = "";
                    _.forEach(a, (v, k) => {
                        result += k + ":" + v + ";";
                    });
                    return result;
                };
                _.forEach(b, (v, k) => {
                    if (k == "style") {
                        a[k] = flatten_style(v);
                    }
                    else {
                        a[k] = v;
                    }
                });
                return a;
            };
            let mould = (document, parent, field, type) => {
                let element = Render.toHtml(field, "");
                let moulding = document.createElement(parent_restricted(type)); //　展開用型枠
                moulding.innerHTML = element; // pour it up
                let parent_node = document.getElementById(parent);
                if (parent_node) {
                    parent_node.appendChild(moulding.firstChild); // Take out
                }
                else {
                    let a = parent;
                }
            };
            let parent_restricted = (type) => {
                let restricted = {
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
                let result = restricted[type];
                if (!result) {
                    result = "div";
                }
                return result;
            };
            let elements = (page, callback) => {
                let _continue = true;
                _.forEach(page, (control) => {
                    _.forEach(control.elements, (element) => {
                        _continue = callback(control, element);
                        return _continue;
                    });
                    return _continue;
                });
            };
            jsdom.env("<html><head></head><body><div id='root'/></body></html>", [], function (errors, window) {
                if (!errors) {
                    let document = window.document;
                    elements(doc.content, (control, _element) => {
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
                                        "_$": flatten_collection({ "id": id }, attributes),
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
                                                    case "create":
                                                        contents = moment(record.create).format("YYYY-MM-DD HH:mm:ss");
                                                        break;
                                                    case "modify":
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
                                        "_$": flatten_collection({ "id": id }, attributes),
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
                                        "_$": flatten_collection({ "id": id }, attributes),
                                        "@": contents
                                    }];
                                mould(document, parent, field, type);
                                break;
                            }
                            case "select":
                                {
                                    let contents_model_name = id + "_contents";
                                    field = [{
                                            "name": "div", "type": "element",
                                            "_$": { "class": "form-group" },
                                            "@": [
                                                {
                                                    "name": "label", "type": "element",
                                                    "_$": { "for": id },
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
                                                }
                                            ]
                                        }];
                                    mould(document, parent, field, type);
                                    break;
                                }
                            case "button":
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
                                        "_$": flatten_collection({ "id": id }, attributes),
                                        "@": contents
                                    }];
                                // "table"Tag  is restricted parent
                                let element = Render.toHtml(field, "");
                                let moulding = document.createElement(parent_restricted(type)); //　展開用型枠
                                moulding.innerHTML = element; // pour it up
                                let parent_node = document.getElementById(parent);
                                parent_node.appendChild(moulding); // Take out
                                break;
                            }
                            case "tr": {
                                field = [{
                                        "name": type, "type": "element",
                                        "_$": flatten_collection({ "id": id }, attributes),
                                        "@": contents
                                    }];
                                mould(document, parent, field, type);
                                break;
                            }
                            case "td": {
                                field = [{
                                        "name": type, "type": "element",
                                        "_$": flatten_collection({ "id": id }, attributes),
                                        "@": contents
                                    }];
                                mould(document, parent, field, type);
                                break;
                            }
                            default: {
                                field = [{
                                        "name": type, "type": "element",
                                        "_$": flatten_collection({ "id": id }, attributes),
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
                }
                else {
                    callback({ code: 20000, message: "" }, null);
                }
            });
        }
        ;
        // html to components type document
        static fromHtmltoDoc(html, callback) {
            if (server) {
            }
            else {
            }
        }
    }
    HtmlEdit.Render = Render;
})(HtmlEdit || (HtmlEdit = {}));
if (server) {
    module.exports = HtmlEdit;
}
//# sourceMappingURL=html_edit_dep.js.map