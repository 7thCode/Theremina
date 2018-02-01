/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
/// <reference path="./shape_edit.ts" />
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var server = (typeof window === 'undefined');
var Adaptor;
(function (Adaptor) {
    if (server) {
        var _ = require('lodash');
        var ShapeEdit = require("./shape_edit");
        var PDFDocument = require('pdfkit');
        var http = require('http');
        var request = require('request');
        var url = require('url');
        var fs = require('graceful-fs');
        var crypto = require('crypto');
    }
    var SVGAdaptor = (function () {
        function SVGAdaptor(width, height, embedded, webfonts) {
            this.tilesizew = 64;
            this.tilesizeh = 64;
            var hoge = width * 0.37125;
            var geho = height * 0.37125;
            this.doc = "";
            this.width = "297mm";
            this.height = "210mm";
            this.embedded = embedded;
            this.webfonts = webfonts;
        }
        SVGAdaptor.StrokeColor = function (stroke_width, stroke_color) {
            var result = stroke_color;
            if (stroke_width == 0) {
                result = "rgba(0, 0, 0, 0)";
            }
            return result;
        };
        SVGAdaptor.prototype.Bezier = function (data, callback) {
            var bezier = '<path id="' + data.ID() + '" stroke="' + SVGAdaptor.StrokeColor(data.property.strokewidth, data.property.strokestyle.ToString()) + '" stroke-width="' + data.property.strokewidth + '" stroke-linecap="round" stroke-miterlimit="2" fill="' + data.property.fillstyle.ToString() + '" fill-opacity="' + data.property.fillstyle.a + '" d="';
            var startpoint = null;
            ShapeEdit.CurveShape.Each(data.vertex.list, function (vertex) {
                bezier += " M " + vertex.x + "," + vertex.y;
                startpoint = vertex;
            }, function (vertex) {
                bezier += " C " + vertex.controlPoint0.x + "," + vertex.controlPoint0.y + " " + vertex.controlPoint1.x + "," + vertex.controlPoint1.y + " " + vertex.x + "," + vertex.y;
            }, function (vertex) {
                bezier += " C " + vertex.controlPoint0.x + "," + vertex.controlPoint0.y + " " + vertex.controlPoint1.x + "," + vertex.controlPoint1.y + " " + vertex.x + "," + vertex.y;
                bezier += " C " + startpoint.controlPoint0.x + "," + startpoint.controlPoint0.y + " " + startpoint.controlPoint1.x + "," + startpoint.controlPoint1.y + " " + startpoint.x + "," + startpoint.y;
            });
            bezier += '" />';
            var path = "";
            if (data.property.path) {
                path = data.property.path;
            }
            var defs = '<defs>' +
                '<pattern id="' + data.ID() + '_IMAGE" width="' + this.tilesizew + '" height="' + this.tilesizeh + '" patternUnits="userSpaceOnUse">' +
                '<image x="0" y="0" width="' + this.tilesizew + '" height="' + this.tilesizeh + '" xlink:href="' + path + '"/>' +
                '</pattern>' +
                '</defs>';
            this.doc += bezier + defs;
            callback(null);
        };
        SVGAdaptor.prototype.Polygon = function (data, callback) {
            var lineshape = '<path id="' + data.ID() + '" stroke="' + SVGAdaptor.StrokeColor(data.property.strokewidth, data.property.strokestyle.ToString()) + '" stroke-width="' + data.property.strokewidth + '" stroke-linecap="round" stroke-miterlimit="2" fill="' + data.property.fillstyle.ToString() + '" fill-opacity="' + data.property.fillstyle.a + '" d="';
            if (data.property.path != "") {
                lineshape = '<path id="' + data.ID() + '" stroke="' + data.property.strokestyle.ToString() + '" stroke-width="' + data.property.strokewidth + '" stroke-linecap="round" stroke-miterlimit="2" fill="url(#' + data.ID() + '_IMAGE)' + '" fill-opacity="' + data.property.fillstyle.a + '" d="';
            }
            var startpoint = null;
            ShapeEdit.LineShape.Each(data.vertex.list, function (vertex) {
                lineshape += "M " + vertex.x + "," + vertex.y + " L ";
                startpoint = vertex;
            }, function (vertex) {
                lineshape += vertex.x + "," + vertex.y + " ";
            }, function (vertex) {
                lineshape += vertex.x + "," + vertex.y + " ";
                lineshape += startpoint.x + "," + startpoint.y + " ";
            });
            lineshape += "Z M " + startpoint.x + "," + startpoint.y + '" />';
            var path = "";
            if (data.property.path) {
                path = data.property.path;
            }
            var defs = '<defs>' +
                '<pattern id="' + data.ID() + '_IMAGE" width="' + this.tilesizew + '" height="' + this.tilesizeh + '" patternUnits="userSpaceOnUse">' +
                '<image x="0" y="0" width="' + this.tilesizew + '" height="' + this.tilesizeh + '" xlink:href="' + path + '"/>' +
                '</pattern>' +
                '</defs>';
            this.doc += lineshape + defs;
            callback(null);
        };
        SVGAdaptor.prototype.Text = function (data, callback) {
            var text = '';
            var defs = '';
            var error = { code: 0, message: "" };
            var create_def = function (fonts) {
                var result = '<defs><style type="text/css">';
                _.forEach(fonts, function (font) {
                    result += '@import url(' + font.url + ');';
                });
                result += '</style></defs>';
                return result;
            };
            if (data) {
                if (data.property) {
                    if (data.property.font) {
                        if (data.property.font.keyword) {
                            var urlkeyword = data.property.font.keyword.split(' ').join('+');
                            text = '<text text-rendering="geometricPrecision" id="' + data.ID() + '" fill="' + data.property.fillstyle.ToString() + '" font-weight="' + data.property.font.weight + '" font-family="' + data.property.font.family[0] + "," + data.property.font.keyword + '" font-size="' + (data.property.font.size / 16) + 'rem" x="' + data.rectangle.location.x + '" y="' + data.rectangle.location.y + '">';
                            //    text = '<text text-rendering="geometricPrecision" id="' + data.ID() + '" fill="' + data.property.fillstyle.ToString() + '" font-family="' + "Sawarabi Mincho" + '" font-size="' + (data.property.font.size / 16) + 'rem" x="' + data.rectangle.location.x + '" y="' + data.rectangle.location.y + '">';
                            //  text = '<text id="' + data.ID() + '" fill="' + data.property.fillstyle.ToString() + '" font-family="' + 'NotoSansBlack' + '" font-size="' + (data.property.font.size / 16) + 'rem" x="' + data.rectangle.location.x + '" y="' + data.rectangle.location.y + '">';
                            data.DrawText(1, function (line, x, y) {
                                text += '<tspan x="' + x + '" y="' + y + '">' + line.line + '</tspan>';
                            });
                            text += '</text>';
                            defs = create_def(this.webfonts);
                        }
                        else {
                            error = { code: 1, message: "" };
                        }
                    }
                    else {
                        error = { code: 1, message: "" };
                    }
                }
                else {
                    error = { code: 1, message: "" };
                }
            }
            else {
                error = { code: 1, message: "" };
            }
            this.doc += text; // + defs;
            callback(error);
        };
        SVGAdaptor.prototype.Box = function (data, callback) {
            var box = '<rect id="' + data.ID() + '" stroke="' + SVGAdaptor.StrokeColor(data.property.strokewidth, data.property.strokestyle.ToString()) + '" stroke-width="' + data.property.strokewidth + '" fill="' + data.property.fillstyle.ToString() + '" x="' + data.rectangle.location.x + '" y="' + data.rectangle.location.y + '" width="' + data.rectangle.size.w + '" height="' + data.rectangle.size.h + '" />';
            var defs = '<defs>' +
                '<filter id="' + data.ID() + '" x="' + data.rectangle.location.x + '" y="' + (data.rectangle.location.y + data.rectangle.size.h) + '" width="' + data.rectangle.size.w + '" height="' + data.rectangle.size.h + '" patternUnits="userSpaceOnUse" viewBox="0 0 ' + data.rectangle.size.w + ' ' + data.rectangle.size.h + '">' +
                '</filter>' +
                '</defs>';
            this.doc += box + defs;
            callback(null);
        };
        SVGAdaptor.prototype.Oval = function (data, callback) {
            var rx = data.rectangle.size.w / 2;
            var ry = data.rectangle.size.h / 2;
            var cx = data.rectangle.location.x + rx;
            var cy = data.rectangle.location.y + ry;
            var ellipse = '<ellipse id="' + data.ID() + '" stroke="' + SVGAdaptor.StrokeColor(data.property.strokewidth, data.property.strokestyle.ToString()) + '" stroke-width="' + data.property.strokewidth + '" fill="' + data.property.fillstyle.ToString() + '" cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" />';
            var defs = '<defs>' +
                '<filter id="' + data.ID() + '" x="' + data.rectangle.location.x + '" y="' + (data.rectangle.location.y + data.rectangle.size.h) + '" width="' + data.rectangle.size.w + '" height="' + data.rectangle.size.h + '" patternUnits="userSpaceOnUse" viewBox="0 0 ' + data.rectangle.size.w + ' ' + data.rectangle.size.h + '">' +
                '</filter>' +
                '</defs>';
            this.doc += ellipse + defs;
            callback(null);
        };
        SVGAdaptor.prototype.get_image = function (path, callback) {
            var pathToExtention = function (path) {
                var _url = url.parse(path);
                var pathname = _url.pathname;
                var split = pathname.split(".");
                var result = split[split.length - 1];
                switch (result) {
                    case 'jpg':
                        result = "jpeg";
                        break;
                    default:
                }
                return result;
            };
            if (this.embedded) {
                var draw = function (path) {
                    return new Promise(function (resolve, reject) {
                        var _url = url.parse(path);
                        var protocol = _url.protocol;
                        if (protocol == "data:") {
                            resolve(path);
                        }
                        else {
                            request.get({ url: path, encoding: null }, function (error, response, body) {
                                if (!error) {
                                    if (response) {
                                        if (response.statusCode == 200) {
                                            var data_url = "data:image/" + pathToExtention(path) + ";base64," + new Buffer(body).toString('base64');
                                            resolve(data_url);
                                        }
                                        else {
                                            reject({
                                                code: 10000,
                                                message: "request.get status " + response.statusCode
                                            });
                                        }
                                    }
                                    else {
                                        reject({ code: 10000, message: "request.get response is null." });
                                    }
                                }
                                else {
                                    reject(error);
                                }
                            });
                        }
                    });
                };
                draw(path).then(function (value) {
                    callback(null, value);
                }).catch(function (error) {
                    callback(error, null);
                });
            }
            else {
                callback(null, path);
            }
        };
        SVGAdaptor.prototype.ImageRect = function (data, callback) {
            var _this = this;
            var path = "";
            if (data.property.path) {
                path = data.property.path;
            }
            this.get_image(path, function (error, image_url) {
                var defs = '<image xlink:href="' + image_url + '" preserveAspectRatio="none" x="' + data.rectangle.location.x + '" y="' + data.rectangle.location.y + '" width="' + data.rectangle.size.w + '" height="' + data.rectangle.size.h + '" />';
                _this.doc += defs;
                callback(null);
            });
        };
        /*
                public ImageRect(data: any, callback: (error: any) => void): void {
        
                    let rect = '<rect id="' + data.ID() + '" stroke="none" fill="url(#' + data.ID() + ')" x="' + data.rectangle.location.x + '" y="' + data.rectangle.location.y + '" width="' + data.rectangle.size.w + '" height="' + data.rectangle.size.h + '" />';
        
                    let path = "";
                    if (data.property.path) {
                        path = data.property.path;
                    }
        
                    this.get_image(path, (error, image_url) => {
        
                        let defs = '<defs>' +
                            '<pattern id="' + data.ID() + '" x="' + data.rectangle.location.x + '" y="' + (data.rectangle.location.y + data.rectangle.size.h) + '" width="' + data.rectangle.size.w + '" height="' + data.rectangle.size.h + '" patternUnits="userSpaceOnUse" viewBox="0 0 ' + data.rectangle.size.w + ' ' + data.rectangle.size.h + '">' +
                            '<image xlink:href="' + image_url + '" preserveAspectRatio="none" x="0" y="0" width="' + data.rectangle.size.w + '" height="' + data.rectangle.size.h + '" />' +
                            '</pattern>' +
                            '</defs>';
        
                        this.doc += rect + defs;
                        callback(null);
                    });
                }
        */
        SVGAdaptor.prototype.Shapes = function (data, callback) {
            var _this = this;
            var draw = function (shape) {
                return function () {
                    return new Promise(function (resolve, reject) {
                        shape.ToSVG(function (error) {
                            if (!error) {
                                resolve(null);
                            }
                            else {
                                reject(error);
                            }
                        });
                    });
                };
            };
            var promises = [];
            this.doc += '<g id="' + data.ID() + '">';
            _.forEach(data.Shapes(), function (shape) {
                promises.push(draw(shape));
            });
            promises.reduce(function (prev, current, index, array) {
                return prev.then(current);
            }, Promise.resolve()).then(function () {
                var defs = '<defs>' +
                    '<filter id="' + data.ID() + '" x="' + data.rectangle.location.x + '" y="' + (data.rectangle.location.y + data.rectangle.size.h) + '" width="' + data.rectangle.size.w + '" height="' + data.rectangle.size.h + '" patternUnits="userSpaceOnUse" viewBox="0 0 ' + data.rectangle.size.w + ' ' + data.rectangle.size.h + '">' +
                    '</filter>' +
                    '</defs>';
                _this.doc += "</g>";
                _this.doc += defs;
                callback(null);
            }).catch(function (error) {
                callback(error);
            });
        };
        SVGAdaptor.prototype.Canvas = function (canvas, callback) {
            var _this = this;
            var create_def = function (fonts) {
                var result = '<defs><style type="text/css">';
                _.forEach(fonts, function (font) {
                    result += '@import url(' + font.url + ');';
                });
                result += '</style></defs>';
                return result;
            };
            canvas.shapes.ToSVG(function (error) {
                var defs = create_def(_this.webfonts);
                var result = '<?xml version="1.0" encoding="UTF-8"?>' +
                    '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' +
                    //     '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="' + canvas.canvas.width + '" height="' + canvas.canvas.height + '"  xml:space="preserve">' +
                    //    '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ' + canvas.canvas.width + ' ' + canvas.canvas.height + '"  xml:space="preserve">' +
                    '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="' + _this.width + '" height="' + _this.height + '" xml:space="preserve">' +
                    defs +
                    _this.doc +
                    '</svg>';
                _this.doc = result;
                callback(null);
            });
        };
        SVGAdaptor.prototype.Write = function () {
            return this.doc;
        };
        return SVGAdaptor;
    }());
    Adaptor.SVGAdaptor = SVGAdaptor;
    var PDFAdaptor = (function () {
        function PDFAdaptor(work_path, paper) {
            this.doc = null;
            this.serif = "";
            this.sans_serif = "";
            this.pagehight = 0;
            this.originx = 40;
            this.originy = 40;
            this.nameboxwidth = 250;
            this.valueboxwidth = 250;
            this.boxhight = 20;
            this.stringoffsetx = 3;
            this.stringoffsety = 2;
            this.tilesizew = 64;
            this.tilesizeh = 64;
            this.path = work_path;
            this.serif = "public/fonts/ttf/ipaexm.ttf";
            this.sans_serif = "public/fonts/ttf/ipaexg.ttf";
            this.doc = new PDFDocument(paper);
            this.doc.registerFont('serif', this.serif, '');
            this.doc.registerFont('sans-serif', this.sans_serif, '');
            this.pagehight = 660;
            this.originx = 40;
            this.originy = 40;
            this.boxhight = 20;
            this.stringoffsetx = 3;
            this.stringoffsety = 2;
        }
        PDFAdaptor.StrokeColor = function (stroke_width, fill_color, stroke_color) {
            var result = stroke_color;
            if (stroke_width == 0) {
                result = fill_color;
            }
            return result;
        };
        PDFAdaptor.prototype.Bezier = function (data, callback) {
            var _this = this;
            var startpoint = null;
            ShapeEdit.CurveShape.Each(data.vertex.list, function (vertex) {
                _this.doc.moveTo(vertex.x, vertex.y);
                startpoint = vertex;
            }, function (vertex) {
                _this.doc.bezierCurveTo(vertex.controlPoint0.x, vertex.controlPoint0.y, vertex.controlPoint1.x, vertex.controlPoint1.y, vertex.x, vertex.y);
            }, function (vertex) {
                _this.doc.bezierCurveTo(vertex.controlPoint0.x, vertex.controlPoint0.y, vertex.controlPoint1.x, vertex.controlPoint1.y, vertex.x, vertex.y);
            });
            this.doc.bezierCurveTo(startpoint.controlPoint0.x, startpoint.controlPoint0.y, startpoint.controlPoint1.x, startpoint.controlPoint1.y, startpoint.x, startpoint.y);
            this.doc.lineWidth(data.property.strokewidth);
            this.doc.fillAndStroke(data.property.fillstyle.RGB(), PDFAdaptor.StrokeColor(data.property.strokewidth, data.property.fillstyle.RGB(), data.property.strokestyle.RGB()));
            callback(null);
        };
        PDFAdaptor.prototype.Polygon = function (data, callback) {
            var _this = this;
            var startpoint = null;
            ShapeEdit.LineShape.Each(data.vertex.list, function (vertex) {
                _this.doc.moveTo(vertex.x, vertex.y);
                startpoint = vertex;
            }, function (vertex) {
                _this.doc.lineTo(vertex.x, vertex.y);
            }, function (vertex) {
                _this.doc.lineTo(vertex.x, vertex.y);
            });
            this.doc.lineTo(startpoint.x, startpoint.y);
            this.doc.lineWidth(data.property.strokewidth);
            this.doc.fillAndStroke(data.property.fillstyle.RGB(), PDFAdaptor.StrokeColor(data.property.strokewidth, data.property.fillstyle.RGB(), data.property.strokestyle.RGB()));
            callback(null);
        };
        PDFAdaptor.prototype.Text = function (data, callback) {
            var _this = this;
            var text = '';
            var defs = '';
            if (data) {
                if (data.property) {
                    if (data.property.font) {
                        if (data.property.font.keyword) {
                            var urlkeyword = data.property.font.keyword.split(' ').join('+');
                            var lineheight_1 = data.property.font.size * 1.2;
                            this.doc.fillAndStroke(data.property.fillstyle.RGB(), data.property.strokestyle.RGB());
                            data.DrawText(1, function (line, x, y) {
                                try {
                                    var page_width = _this.doc.page.width;
                                    var line_end = x + line.length;
                                    var gap = page_width - line_end;
                                    if (gap > 27) {
                                        _this.doc.font(data.property.font.keyword).fontSize(data.property.font.size).text(line.line, x, y - lineheight_1);
                                    }
                                    callback(null);
                                }
                                catch (e) {
                                    callback(e);
                                }
                            });
                        }
                        else {
                            callback({ code: 100, message: "no keyword" });
                        }
                    }
                    else {
                        callback({ code: 200, message: "no font" });
                    }
                }
                else {
                    callback({ code: 300, message: "no property" });
                }
            }
            else {
                callback({ code: 400, message: "no data" });
            }
        };
        PDFAdaptor.prototype.Box = function (data, callback) {
            this.doc.rect(data.rectangle.location.x, data.rectangle.location.y, data.rectangle.size.w, data.rectangle.size.h);
            this.doc.lineWidth(data.property.strokewidth);
            this.doc.fillAndStroke(data.property.fillstyle.RGB(), PDFAdaptor.StrokeColor(data.property.strokewidth, data.property.fillstyle.RGB(), data.property.strokestyle.RGB()));
            callback(null);
        };
        PDFAdaptor.prototype.Oval = function (data, callback) {
            var rx = data.rectangle.size.w / 2;
            var ry = data.rectangle.size.h / 2;
            var cx = data.rectangle.location.x + rx;
            var cy = data.rectangle.location.y + ry;
            this.doc.ellipse(cx, cy, rx, ry);
            this.doc.lineWidth(data.property.strokewidth);
            this.doc.fillAndStroke(data.property.fillstyle.RGB(), PDFAdaptor.StrokeColor(data.property.strokewidth, data.property.fillstyle.RGB(), data.property.strokestyle.RGB()));
            callback(null);
        };
        PDFAdaptor.prototype.ImageRect = function (data, callback) {
            var _doc = this.doc;
            var path = "";
            if (data.property.path) {
                path = data.property.path;
            }
            var _url = url.parse(path);
            var protocol = _url.protocol;
            var temp_path = this.path;
            if (protocol == "data:") {
                var md5hash = crypto.createHash('md5');
                md5hash.update(path, 'binary');
                var file_name = md5hash.digest('hex'); // generate unique filename.
                var regex = /^data:.+\/(.+);base64,(.*)$/;
                var matches = path.match(regex);
                var ext = matches[1];
                switch (ext) {
                    case "jpg": // for pdfkit
                    case "jpeg":
                    case "png": {
                        // dataToImage
                        var content = matches[2];
                        var buffer = new Buffer(content, 'base64');
                        var target_file_path_1 = temp_path + "/" + file_name;
                        fs.writeFile(target_file_path_1, buffer, 'binary', function (error) {
                            if (!error) {
                                try {
                                    _doc.image(target_file_path_1, data.rectangle.location.x, data.rectangle.location.y, {
                                        width: data.rectangle.size.w,
                                        height: data.rectangle.size.h
                                    });
                                    fs.unlink(target_file_path_1, function (error) {
                                        if (!error) {
                                            callback(null);
                                        }
                                        else {
                                            callback(error);
                                        }
                                    });
                                }
                                catch (e) {
                                    callback(e);
                                }
                            }
                            else {
                                callback(error);
                            }
                        });
                        break;
                    }
                    default:
                        callback({ code: 10000, message: "image format not support for PDF :" + ext });
                }
            }
            else {
                var split_path = _url.pathname.split("/");
                var file_name_1 = split_path[split_path.length - 1];
                var split_filename = file_name_1.split(/\.(?=[^.]+$)/);
                var ext = split_filename[split_filename.length - 1];
                switch (ext) {
                    case "jpg": // for pdfkit
                    case "jpeg":
                    case "png": {
                        var buffer_1 = [];
                        request.get(path, { timeout: 5000 }, function (error) {
                            if (!error) {
                                var innner_req = http.get(path, function (res) {
                                    res.setEncoding('binary');
                                    res.on('data', function (chunk) {
                                        buffer_1 += chunk;
                                    });
                                    res.on('end', function () {
                                        var target_file_path = temp_path + "/" + file_name_1;
                                        fs.writeFile(target_file_path, buffer_1, 'binary', function (error) {
                                            if (!error) {
                                                try {
                                                    _doc.image(target_file_path, data.rectangle.location.x, data.rectangle.location.y, {
                                                        width: data.rectangle.size.w,
                                                        height: data.rectangle.size.h
                                                    });
                                                    callback(null);
                                                }
                                                catch (e) {
                                                    callback(e);
                                                }
                                            }
                                            else {
                                                callback(error);
                                            }
                                        });
                                    });
                                });
                                innner_req.on('error', function (e) {
                                    callback(e);
                                });
                            }
                            else {
                                callback({ code: 100000, message: error.message }); //Because timeout occurs temporarily, it is not an error.
                            }
                        });
                        break;
                    }
                    default:
                        callback({ code: 100000, message: "image format not support for PDF :" + ext });
                }
            }
        };
        PDFAdaptor.prototype.Shapes = function (data, callback) {
            var draw = function (shape) {
                return function () {
                    return new Promise(function (resolve, reject) {
                        shape.ToPDF(function (error) {
                            if (!error) {
                                resolve(null);
                            }
                            else {
                                reject(error);
                            }
                        });
                    });
                };
            };
            var promises = [];
            _.forEach(data.Shapes(), function (shape) {
                promises.push(draw(shape));
            });
            promises.reduce(function (prev, current, index, array) {
                return prev.then(current);
            }, Promise.resolve()).then(function () {
                callback(null);
            }).catch(function (error) {
                callback(error);
            });
        };
        PDFAdaptor.prototype.Canvas = function (canvas, callback) {
            canvas.shapes.ToPDF(callback);
        };
        PDFAdaptor.prototype.Write = function () {
            this.doc.stroke();
            return this.doc;
        };
        return PDFAdaptor;
    }());
    Adaptor.PDFAdaptor = PDFAdaptor;
})(Adaptor || (Adaptor = {}));
if (server) {
    module.exports = Adaptor;
}
//# sourceMappingURL=adaptor.js.map