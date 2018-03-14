/**!
 Copyright (c) 2016 7thCode.(https://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace HtmlEdit {

    export class Render {

        constructor() {
        }

        static Format(values: any, format_string: string): string {
            let locale = 'ja-JP';
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
                                            result += new Intl.DateTimeFormat(locale).format(values.create);
                                        } catch (e) {
                                        }
                                        break;
                                    case "{modify}" :
                                        try {
                                            result += new Intl.DateTimeFormat(locale).format(values.modify);
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
                                        let format = {};
                                        try {
                                            format = JSON.parse(fragment);
                                        } catch (e) {
                                        }
                                        result += tell_format(values.content, format);
                                }
                            } catch (e) {
                                result += "|" + fragment + "|";
                            }
                        } else {
                            result += "|" + fragment + "|";
                        }
                    } else {
                        result += "|" + fragment + "|";
                    }
                });
            }
            return result;
        };

        static MakeElement(node): any {
            let result = {"name": "", "type": "", "_$": {}, "@": []};
            result.name = node.nodeName;
            result["_$"] = node.attributes;
            let children:any[] = [];
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
            let result:any = null;
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

        };

        // html to components type document
        static fromHtmltoDoc(html: string, callback: (error: any, doc: any) => void): void {
            if (server) {
            } else {
            }
        }
    }

}
