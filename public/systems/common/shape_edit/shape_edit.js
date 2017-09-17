/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var server = (typeof window === 'undefined');
if (server) {
    var _ = require('lodash');
}
var ShapeEdit;
(function (ShapeEdit) {
    // require lodash 4.X
    // resizehandle Size
    const handlesize = 6;
    ShapeEdit.gridsize = 1;
    // move shape or free drawing
    var Mode;
    (function (Mode) {
        Mode[Mode["move"] = 0] = "move";
        Mode[Mode["draw"] = 1] = "draw";
        Mode[Mode["bezierdraw"] = 2] = "bezierdraw";
    })(Mode = ShapeEdit.Mode || (ShapeEdit.Mode = {}));
    // pressed key
    var Key;
    (function (Key) {
        Key[Key["normal"] = 0] = "normal";
        Key[Key["shift"] = 1] = "shift";
        Key[Key["control"] = 2] = "control";
        Key[Key["alt"] = 4] = "alt";
        Key[Key["meta"] = 8] = "meta";
    })(Key = ShapeEdit.Key || (ShapeEdit.Key = {}));
    // shape handle category
    // location             move corner
    // center               move side
    // control0, control1   for Bezier
    // resize               resize shape
    // rotate               rotate shape
    var HandleCategory;
    (function (HandleCategory) {
        HandleCategory[HandleCategory["location"] = 0] = "location";
        HandleCategory[HandleCategory["center"] = 1] = "center";
        HandleCategory[HandleCategory["control0"] = 2] = "control0";
        HandleCategory[HandleCategory["control1"] = 3] = "control1";
        HandleCategory[HandleCategory["resize"] = 4] = "resize";
        HandleCategory[HandleCategory["rotate"] = 5] = "rotate";
        HandleCategory[HandleCategory["crop"] = 6] = "crop";
    })(HandleCategory || (HandleCategory = {}));
    var Transform;
    (function (Transform) {
        Transform[Transform["none"] = 0] = "none";
        Transform[Transform["deformation"] = 1] = "deformation";
        Transform[Transform["resize"] = 2] = "resize";
        Transform[Transform["rotate"] = 3] = "rotate";
    })(Transform || (Transform = {}));
    // for Text Line Break
    var PrevChar;
    (function (PrevChar) {
        PrevChar[PrevChar["normal"] = 0] = "normal";
        PrevChar[PrevChar["cr"] = 1] = "cr";
        PrevChar[PrevChar["lf"] = 2] = "lf";
    })(PrevChar || (PrevChar = {}));
    // Event Handler
    class EventHandlers {
        constructor() {
            this.handlers = {};
        }
        Free() {
        }
        Exec(name, target, e) {
            if (this.handlers[name]) {
                this.handlers[name](target, e);
            }
        }
        on(name, handler) {
            let result = false;
            if (!this.handlers[name]) {
                this.handlers[name] = handler;
            }
            return result;
        }
    }
    ShapeEdit.EventHandlers = EventHandlers;
    // Event Handler
    class Plugins extends EventHandlers {
    }
    ShapeEdit.Plugins = Plugins;
    // Typed Root Class
    // object type identify
    class Typed {
        constructor(type) {
            this.type = type;
        }
        get type() {
            return this._type;
        }
        set type(type) {
            this._type = type;
        }
        Serialize() {
            return "";
        }
        Free() {
        }
    }
    ShapeEdit.Typed = Typed;
    // Font Class
    class Font extends Typed {
        constructor(style, variant, weight, size, keyword, family) {
            super("Font");
            this._style = style;
            this._variant = variant;
            this._weight = weight;
            this._keyword = "sans-serif";
            if (keyword != "") {
                this._keyword = keyword;
            }
            this._size = size;
            this._family = family;
        }
        get style() {
            return this._style;
        }
        set style(style) {
            this._style = style;
        }
        get variant() {
            return this._variant;
        }
        set variant(variant) {
            this._variant = variant;
        }
        get weight() {
            return this._weight;
        }
        set weight(weight) {
            this._weight = weight;
        }
        get size() {
            return this._size;
        }
        set size(size) {
            this._size = size;
        }
        get keyword() {
            return this._keyword;
        }
        set keyword(keyword) {
            this._keyword = keyword;
        }
        get family() {
            return this._family;
        }
        set family(family) {
            this._family = family;
        }
        Free() {
            super.Free();
        }
        Clone() {
            let family = [];
            this.family.forEach((name) => {
                family.push(name);
            });
            return new Font(this.style, this.variant, this.weight, this.size, this.keyword, family);
        }
        Value() {
            let family = "";
            let delimmiter = "";
            this.family.forEach((name) => {
                family += delimmiter + "'" + name + "'";
                delimmiter = ",";
            });
            return this.style + " " + this.variant + " " + this.weight + " " + this.size + 'px ' + family + delimmiter + this.keyword;
        }
        Serialize() {
            let family = "[";
            let delimmiter = "";
            this.family.forEach((name) => {
                family += delimmiter;
                family += '"' + name + '"';
                delimmiter = ",";
            });
            family += "]";
            return '{"style":"' + this.style + '", "variant":"' + this.variant + '", "weight":"' + this.weight + '", "size":' + this.size + ', "keyword":"' + this.keyword + '", "family":' + family + '}';
        }
        ToString() {
            return this.Value();
        }
        static Load(obj) {
            return new ShapeEdit.Font(obj.style, obj.variant, obj.weight, obj.size, obj.keyword, obj.family);
        }
    }
    ShapeEdit.Font = Font;
    // Color Class
    class RGBAColor extends Typed {
        constructor(r, g, b, a) {
            super('RGBAColor');
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
        }
        Free() {
            super.Free();
        }
        Clone() {
            return new RGBAColor(this.r, this.g, this.b, this.a);
        }
        static Check(a) {
            let result = 0;
            if (a > 255) {
                result = 255;
            }
            if (a < 0) {
                result = 0;
            }
            return result;
        }
        ;
        RGBA() {
            return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + this.a + ")";
        }
        CanvasValue(context) {
            return this.RGBA();
        }
        SetRGB(color) {
            if (color) {
                if (color.length === 6) {
                    this.r = parseInt(color.slice(0, 2), 16);
                    this.g = parseInt(color.slice(2, 4), 16);
                    this.b = parseInt(color.slice(4, 6), 16);
                    //this._a = parseInt(color.slice(6, 8), 16);
                }
                else if (color[0] === "#") {
                    this.r = parseInt(color.slice(1, 3), 16);
                    this.g = parseInt(color.slice(3, 5), 16);
                    this.b = parseInt(color.slice(5, 7), 16);
                    //this._a = parseInt(color.slice(7, 9), 16);
                }
            }
        }
        Lighten(n) {
            let check = (a, b) => {
                let result = a + b;
                if (a > 255) {
                    result = 255;
                }
                return result;
            };
            return new ShapeEdit.RGBAColor(check(this.r, n), check(this.g, n), check(this.b, n), this.a);
        }
        Darken(n) {
            let check = (a, b) => {
                let result = a - b;
                if (a < 0) {
                    result = 0;
                }
                return result;
            };
            return new ShapeEdit.RGBAColor(check(this.r, n), check(this.g, n), check(this.b, n), this.a);
        }
        Invert() {
            return new ShapeEdit.RGBAColor(255 - this.r, 255 - this.g, 255 - this.b, this.a);
        }
        RGB() {
            return "#" + ("0" + this.r.toString(16)).slice(-2) + ("0" + this.g.toString(16)).slice(-2) + ("0" + this.b.toString(16)).slice(-2);
        }
        Serialize() {
            return '{"type":"' + this.type + '", "r":' + this.r + ', "g":' + this.g + ', "b":' + this.b + ', "a":' + this.a + '}';
        }
        ToString() {
            return "rgba(" + this.r + ", " + this.g + ", " + this.b + ", " + this.a + ")";
        }
        static Load(obj) {
            return new RGBAColor(obj.r, obj.g, obj.b, obj.a);
        }
        SetPath(path, callback, error) {
            callback();
        }
    }
    ShapeEdit.RGBAColor = RGBAColor;
    //image
    class ImageStyle extends Typed {
        constructor(path) {
            super("ImageStyle");
            this._path = path;
            this.SetPath(path, () => {
            }, () => {
            });
        }
        Free() {
            super.Free();
        }
        Clone() {
            return new ImageStyle(this._path);
        }
        Serialize() {
            return '{"type":"' + this.type + '", "path":' + this._path + '}';
        }
        CanvasValue(context) {
            let result = new RGBAColor(255, 255, 255, 1).RGBA();
            if (this.image) {
                if (!this._haserror) {
                    try {
                        result = context.createPattern(this.image, "repeat");
                    }
                    catch (e) {
                        let a = 1;
                    }
                }
            }
            return result;
        }
        SetPath(path, callback, error) {
            this._path = path;
            if (!server) {
                if (this._path != "") {
                    this.image = new Image();
                    this.image.crossOrigin = 'Anonymous';
                    this.image.onload = (e) => {
                        this._haserror = false;
                        callback();
                    };
                    this.image.onerror = (e) => {
                        this._haserror = true;
                        error();
                    };
                    this.image.src = this._path;
                }
                else {
                    this._haserror = false;
                    this.image = null;
                    callback();
                }
            }
        }
        static Load(obj) {
            return new ImageStyle(obj.path);
        }
        RGBA() {
            return "";
        }
        SetRGB(color) {
        }
        Lighten(n) {
            return null;
        }
        Darken(n) {
            return null;
        }
        Invert() {
            return null;
        }
        RGB() {
            return "";
        }
        ToString() {
            return "";
        }
    }
    ShapeEdit.ImageStyle = ImageStyle;
    //グラデーション
    class GradationStyle extends Typed {
        Free() {
            super.Free();
        }
        Clone() {
        }
        Serialize() {
            return "";
        }
        CanvasValue(context) {
            return "";
        }
        SetPath(path, callback, error) {
            callback();
        }
        static Load(obj) {
            return null;
        }
        RGBA() {
            return "";
        }
        SetRGB(color) {
        }
        Lighten(n) {
            return null;
        }
        Darken(n) {
            return null;
        }
        Invert() {
            return null;
        }
        RGB() {
            return "";
        }
        ToString() {
            return "";
        }
    }
    ShapeEdit.GradationStyle = GradationStyle;
    ShapeEdit.guidelinecolor = new ShapeEdit.RGBAColor(120, 160, 200, 1);
    ShapeEdit.rotatehandlecolor = new ShapeEdit.RGBAColor(255, 100, 100, 0.8);
    ShapeEdit.resizehandlecolor = new ShapeEdit.RGBAColor(100, 100, 255, 0.8);
    ShapeEdit.shiftedrotatehandlecolor = new ShapeEdit.RGBAColor(255, 255, 140, 0.9);
    ShapeEdit.shiftedresizehandlecolor = new ShapeEdit.RGBAColor(140, 255, 255, 0.9);
    ShapeEdit.cornerhandlecolor = new ShapeEdit.RGBAColor(255, 255, 255, 0.7);
    ShapeEdit.centerhandlecolor = new ShapeEdit.RGBAColor(200, 200, 200, 0.7);
    ShapeEdit.blackcolor = new ShapeEdit.RGBAColor(0, 0, 0, 1);
    ShapeEdit.whitecolor = new ShapeEdit.RGBAColor(255, 255, 255, 1);
    // Shape Property Class
    class ShapeProperty extends Typed {
        constructor(canvas, text, textwidth, path, fillstyle, strokestyle, strokewidth, font, align = "", linejoin = "miter", description = {}) {
            super("ShapeProperty");
            this.canvas = canvas;
            this.fillstyle = fillstyle;
            this.strokestyle = strokestyle;
            this.strokewidth = strokewidth;
            this.linejoin = linejoin;
            this._textwidth = textwidth;
            this._text = text;
            this._path = path;
            this.font = font;
            this.align = align;
            this.description = description;
            this.SetPath(path, () => {
                this.canvas.Draw();
            }, () => {
            });
        }
        get text() {
            return this._text;
        }
        set text(text) {
            this._text = text;
            this.CulcWidth();
        }
        get textwidth() {
            return this._textwidth;
        }
        get path() {
            return this._path;
        }
        get image() {
            return this._image;
        }
        get haserror() {
            return this._haserror;
        }
        Free() {
            super.Free();
        }
        FillStyle(context) {
            let result = this.fillstyle.CanvasValue(context);
            if (this.image) {
                if (!this.haserror) {
                    try {
                        result = context.createPattern(this.image, "repeat");
                    }
                    catch (e) {
                        let a = 1;
                    }
                }
            }
            return result;
        }
        SetPath(path, callback, error) {
            this._path = path;
            if (!server) {
                if (this._path != "") {
                    this._image = new Image();
                    this._image.crossOrigin = 'Anonymous';
                    this._image.onload = (e) => {
                        this._haserror = false;
                        callback();
                    };
                    this._image.onerror = (e) => {
                        this._haserror = true;
                        error();
                    };
                    this._image.src = this._path;
                }
                else {
                    this._haserror = false;
                    this._image = null;
                    callback();
                }
            }
        }
        Clone() {
            let description = {};
            _.forEach(this.description, (value, key) => {
                description[key] = value;
            });
            let result = new ShapeEdit.ShapeProperty(this.canvas, this.text, this._textwidth, this.path, this.fillstyle.Clone(), this.strokestyle.Clone(), this.strokewidth, this.font.Clone(), this.align, this.linejoin, description);
            result._image = this._image;
            return result;
        }
        CulcWidth() {
            if (!server) {
                this._textwidth = [];
                _.forEach(this.text, (char) => {
                    this._textwidth.push(this.canvas.context.measureText(char).width);
                });
            }
        }
        Serialize() {
            let textwidth = "[";
            let delimiter = "";
            this._textwidth.forEach((width) => {
                textwidth += delimiter + width;
                delimiter = ",";
            });
            textwidth += "]";
            let text;
            switch (typeof this.text) {
                case "undefined":
                    text = "";
                    break;
                case "string":
                    text = this.text.replace(/\r?\n/g, "\\n");
                    break;
                default:
                    text = this.text;
            }
            return '{"type":"' + this.type + '", "text":"' + text + '", "textwidth":' + textwidth + ', "path":"' + this.path +
                '", "fillstyle":' + this.fillstyle.Serialize() +
                ', "strokestyle":' + this.strokestyle.Serialize() +
                ', "strokewidth":' + this.strokewidth +
                ', "font":' + this.font.Serialize() + ', "align":"' + this.align + '", "linejoin":"' + this.linejoin + '", "description":' + JSON.stringify(this.description) +
                '}';
        }
        static Style(canvas, obj, style) {
            let result = null;
            switch (style.type) {
                case "RGBAColor":
                    result = RGBAColor.Load(style);
                    break;
                case "ImageStyle":
                    result = ImageStyle.Load(style);
                    break;
                case "GradationStyle":
                    result = GradationStyle.Load(style);
                    break;
            }
            return result;
        }
        static Load(canvas, obj) {
            let text = "";
            if (obj.text) {
                text = obj.text.replace(/\n/g, "\n");
            }
            let fillstyle = ShapeProperty.Style(canvas, obj, obj.fillstyle);
            let strokestyle = ShapeProperty.Style(canvas, obj, obj.strokestyle);
            return new ShapeEdit.ShapeProperty(canvas, text, obj.textwidth, obj.path, fillstyle, strokestyle, obj.strokewidth, Font.Load(obj.font), obj.align, obj.linejoin, obj.description);
        }
    }
    ShapeEdit.ShapeProperty = ShapeProperty;
    // Location Class
    class Location extends Typed {
        constructor(x, y, cp0, cp1, miter) {
            super("Location");
            this.miter = 0;
            if (miter) {
                this.miter = miter;
            }
            this.x = x;
            this.y = y;
            this._controlPoint0 = null;
            if (cp0) {
                this._controlPoint0 = new ShapeEdit.Location(cp0.x, cp0.y, null, null, cp0.miter);
            }
            this._controlPoint1 = null;
            if (cp1) {
                this._controlPoint1 = new ShapeEdit.Location(cp1.x, cp1.y, null, null, cp1.miter);
            }
        }
        set x(value) {
            if (!isNaN(value)) {
                this._x = value;
            }
        }
        get x() {
            return this._x;
        }
        set y(value) {
            if (!isNaN(value)) {
                this._y = value;
            }
        }
        get y() {
            return this._y;
        }
        get controlPoint0() {
            return this._controlPoint0;
        }
        get controlPoint1() {
            return this._controlPoint1;
        }
        Free() {
            super.Free();
        }
        Clone() {
            let result = null;
            if (this.IsCurve()) {
                result = new Location(this.x, this.y, this._controlPoint0, this._controlPoint1, this.miter);
            }
            else {
                result = new Location(this.x, this.y, null, null, this.miter);
            }
            return result;
        }
        IsCurve() {
            return ((this._controlPoint0 != null) && (this._controlPoint1 != null));
        }
        Move(delta) {
            this.x = this.x + delta.x;
            this.y = this.y + delta.y;
            if (this.IsCurve()) {
                this.controlPoint0.x += delta.x;
                this.controlPoint0.y += delta.y;
                this.controlPoint1.x += delta.x;
                this.controlPoint1.y += delta.y;
            }
        }
        Resize(origin, magnify) {
            this.x = ((this.x - origin.x) * magnify.w) + origin.x;
            this.y = ((this.y - origin.y) * magnify.h) + origin.y;
            if (this.IsCurve()) {
                this.controlPoint0.x = ((this.controlPoint0.x - origin.x) * magnify.w) + origin.x;
                this.controlPoint0.y = ((this.controlPoint0.y - origin.y) * magnify.h) + origin.y;
                this.controlPoint1.x = ((this.controlPoint1.x - origin.x) * magnify.w) + origin.x;
                this.controlPoint1.y = ((this.controlPoint1.y - origin.y) * magnify.h) + origin.y;
            }
        }
        Rotate(center, degree) {
            let newpoint = Location.PointRotate(center, this, degree);
            this.x = newpoint.x;
            this.y = newpoint.y;
            if (this.IsCurve()) {
                newpoint = Location.PointRotate(center, this.controlPoint0, degree);
                this.controlPoint0.x = newpoint.x;
                this.controlPoint0.y = newpoint.y;
                newpoint = Location.PointRotate(center, this.controlPoint1, degree);
                this.controlPoint1.x = newpoint.x;
                this.controlPoint1.y = newpoint.y;
            }
        }
        static PointRotate(center, location, angle) {
            let rad = angle * 3.14159 / 180;
            let rotatex = (location.x - center.x) * Math.cos(rad) - (location.y - center.y) * Math.sin(rad);
            let rotatey = (location.x - center.x) * Math.sin(rad) + (location.y - center.y) * Math.cos(rad);
            return new ShapeEdit.Location(center.x + rotatex, center.y + rotatey);
        }
        //交差ポイント数
        CrossingCount(begin, end) {
            let result = 0;
            if (((begin.y <= this.y) && (end.y > this.y)) || ((begin.y > this.y) && (end.y <= this.y))) {
                let vt = (this.y - begin.y) / (end.y - begin.y);
                if (this.x < (begin.x + (vt * (end.x - begin.x)))) {
                    result = 1;
                }
            }
            return result;
        }
        /**
         * ベジェ曲線と直線の交点
         * ベジェ曲線：始点p0,終点p1,コントロール点cp
         * 直線:ax+by+c=0
         *
         * @return ベジェ曲線のt値
         */
        static intersection(p0, p1, cp, a, b, c) {
            let m = b * p1.y + b * p0.y + a * p1.x + a * p0.x - 2 * b * cp.y - 2 * a * cp.x;
            let n = -2 * b * p0.y - 2 * a * p0.x + 2 * b * cp.y + 2 * a * cp.x;
            let l = b * p0.y + a * p0.x + c;
            //判別式
            let D = n * n - 4 * m * l;
            if (D > 0) {
                D = Math.sqrt(D);
                let t0 = 0.5 * (-n + D) / m;
                let t1 = 0.5 * (-n - D) / m;
                let result = [];
                //解が0～1にあれば交点
                if (t0 >= 0 && t0 <= 1) {
                    result.push(t0);
                }
                if (t1 >= 0 && t1 <= 1) {
                    result.push(t1);
                }
                return result;
            }
            else if (D === 0) {
                let t2 = 0.5 * -n / m;
                if (t2 >= 0 && t2 <= 1) {
                    return [t2];
                }
                else {
                    return [];
                }
            }
            else {
                //交点なし
                return [];
            }
        }
        Serialize() {
            let result = "";
            if (this.controlPoint0) {
                let cp0 = this.controlPoint0;
                let cp1 = this.controlPoint1;
                result = '{"type":"' + this.type + '", "x":' + Math.floor(this.x) + ', "y":' + Math.floor(this.y)
                    + ', "cp0":'
                    + '{"type":"' + cp0.type + '", "x":' + Math.floor(cp0.x) + ', "y":' + Math.floor(cp0.y)
                    + ', "miter":' + cp0.miter
                    + '}'
                    + ', "cp1":'
                    + '{"type":"' + cp1.type + '", "x":' + Math.floor(cp1.x) + ', "y":' + Math.floor(cp1.y)
                    + ', "miter":' + cp1.miter
                    + '}'
                    + ', "miter":' + this.miter
                    + '}';
            }
            else {
                result = '{"type":"' + this.type + '", "x":' + Math.floor(this.x) + ', "y":' + Math.floor(this.y)
                    + ', "miter":' + this.miter
                    + '}';
            }
            return result;
        }
        static Tolerance(value1, value2, tolerance) {
            return (value1 <= (value2 + tolerance)) && (value1 >= (value2 - tolerance));
        }
        Near(to, tolerance) {
            return Location.Tolerance(this.x, to.x, tolerance) && Location.Tolerance(this.y, to.y, tolerance);
        }
        static Plus(from, to) {
            let result = new ShapeEdit.Location(from.x + to.x, from.y + to.y);
            if (from.IsCurve()) {
                result = new ShapeEdit.Location(from.x + to.x, from.y + to.y, Location.Plus(from._controlPoint0, to), Location.Plus(from._controlPoint1, to));
            }
            return result;
        }
        static Minus(from, to) {
            let result = new ShapeEdit.Location(from.x - to.x, from.y - to.y);
            if (from.IsCurve()) {
                result = new ShapeEdit.Location(from.x - to.x, from.y - to.y, Location.Minus(from._controlPoint0, to), Location.Minus(from._controlPoint1, to));
            }
            return result;
        }
        static Load(obj) {
            let result = null;
            if (obj.cp0) {
                result = new ShapeEdit.Location(obj.x, obj.y, obj.cp0, obj.cp1, obj.miter);
            }
            else {
                result = new ShapeEdit.Location(obj.x, obj.y);
            }
            return result;
        }
    }
    ShapeEdit.Location = Location;
    ShapeEdit.resizehandleoffset = new ShapeEdit.Location(20, 20);
    ShapeEdit.rotatehandleoffset = new ShapeEdit.Location(0, -20);
    // Size Class
    class Size extends Typed {
        constructor(w, h) {
            super("Size");
            this.w = w;
            this.h = h;
        }
        set w(value) {
            if (this._w < 1) {
                this._w = 1;
            }
            else {
                this._w = value;
            }
        }
        get w() {
            return this._w;
        }
        set h(value) {
            if (this._h < 1) {
                this._h = 1;
            }
            else {
                this._h = value;
            }
        }
        get h() {
            return this._h;
        }
        Free() {
            super.Free();
        }
        Clone() {
            return new Size(this.w, this.h);
        }
        Serialize() {
            return '{"type":"' + this.type + '", "w":' + this.w + ', "h":' + this.h + '}';
        }
        static Multiply(size, n) {
            return new Size(size.w * n, size.h * n);
        }
        static Load(obj) {
            return new Size(obj.w, obj.h);
        }
    }
    ShapeEdit.Size = Size;
    // Rectangle Class
    class Rectangle extends Typed {
        constructor(x, y, w, h) {
            super("Size");
            this._location = new ShapeEdit.Location(x, y);
            this._size = new Size(w, h);
        }
        get location() {
            return this._location;
        }
        set location(location) {
            this._location = location;
        }
        get size() {
            return this._size;
        }
        set size(size) {
            this._size = size;
        }
        get topleft() {
            return this.location;
        }
        get topright() {
            return new ShapeEdit.Location(this.location.x + this.size.w, this.location.y);
        }
        get bottomleft() {
            return new ShapeEdit.Location(this.location.x, this.location.y + this.size.h);
        }
        get bottomright() {
            return new ShapeEdit.Location(this.location.x + this.size.w, this.location.y + this.size.h);
        }
        get topcenter() {
            return new ShapeEdit.Location(this.location.x + (this.size.w / 2), this.location.y);
        }
        get bottomcenter() {
            return new ShapeEdit.Location(this.location.x + (this.size.w / 2), this.location.y + this.size.h);
        }
        get leftcenter() {
            return new ShapeEdit.Location(this.location.x, this.location.y + (this.size.h / 2));
        }
        get rightcenter() {
            return new ShapeEdit.Location(this.location.x + this.size.w, this.location.y + (this.size.h / 2));
        }
        Free() {
            this._location.Free();
            this._size.Free();
            super.Free();
        }
        Clone() {
            return new Rectangle(this._location.x, this._location.y, this._size.w, this._size.h);
        }
        Center() {
            let center = Size.Multiply(this.size, 0.5);
            let x = center.w + this.location.x;
            let y = center.h + this.location.y;
            return new ShapeEdit.Location(x, y);
        }
        RectangleIsContain(rectangle) {
            return this.LocationIsContain(rectangle.topleft) ||
                this.LocationIsContain(rectangle.topright) ||
                this.LocationIsContain(rectangle.bottomleft) ||
                this.LocationIsContain(rectangle.bottomright);
        }
        LocationIsContain(location) {
            let width = this.size.w;
            let height = this.size.h;
            let left = this.location.x;
            let top = this.location.y;
            if (width < 0) {
                left = this.location.x + width;
            }
            if (height < 0) {
                top = this.location.y + height;
            }
            let rect = new Rectangle(left, top, Math.abs(width), Math.abs(height));
            return rect.Contains(location);
        }
        Contains(location) {
            let x = this.location.x;
            let y = this.location.y;
            let lx = location.x;
            let ly = location.y;
            return ((x < lx) && ((x + this.size.w) > lx)) && ((y < ly) && ((y + this.size.h) > ly));
        }
        Equals(rectangle) {
            let result = [[0, 0, 0, 0], [0, 0, 0, 0]];
            if (this.location.x === rectangle.location.x) {
                result[0][0] = this.location.x;
            }
            if (this.location.x === rectangle.location.x + rectangle.size.w) {
                result[0][1] = rectangle.location.x + rectangle.size.w;
            }
            if (this.location.x + this.size.w === rectangle.location.x) {
                result[0][2] = this.location.x + this.size.w;
            }
            if (this.location.x + this.size.w === rectangle.location.x + rectangle.size.w) {
                result[0][3] = rectangle.location.x + rectangle.size.w;
            }
            if (this.location.y === rectangle.location.y) {
                result[1][0] = this.location.y;
            }
            if (this.location.y === rectangle.location.y + rectangle.size.h) {
                result[1][1] = rectangle.location.y + rectangle.size.h;
            }
            if (this.location.y + this.size.h === rectangle.location.y) {
                result[1][2] = this.location.y + this.size.h;
            }
            if (this.location.y + this.size.h === rectangle.location.y + rectangle.size.h) {
                result[1][3] = rectangle.location.y + rectangle.size.h;
            }
            return result;
        }
        Serialize() {
            return '{"type":"' + this.type + '", "location":' + this.location.Serialize() + ', "size":' + this.size.Serialize() + '}';
        }
        static Load(obj) {
            return new ShapeEdit.Rectangle(obj.location.x, obj.location.y, obj.size.w, obj.size.h);
        }
    }
    ShapeEdit.Rectangle = Rectangle;
    class Stack extends Typed {
        constructor(max) {
            super('Stack');
            this.max = max;
            this.current = 0;
            this._list = [];
            for (let index = 0; index < max; index++) {
                this._list.push(null);
            }
        }
        Free() {
            super.Free();
            delete this._list;
        }
        Shift() {
            for (let index = 0; index < this.max; index++) {
                this._list[index - 1] = this._list[index];
            }
        }
        Push(data) {
            if (this.current < this.max) {
                this._list[this.current] = data;
                this.current++;
            }
            else {
                this.Shift();
                this._list[this.max - 1] = data;
            }
        }
        Pop() {
            let result = null;
            if (this.current > 0) {
                result = this._list[this.current - 1];
                this._list[this.current - 1] = null;
                this.current--;
            }
            return result;
        }
        Count() {
            return this.current;
        }
    }
    ShapeEdit.Stack = Stack;
    // RingList (Endless List)
    class RingList extends Typed {
        constructor() {
            super('RingList');
            this._list = [];
        }
        get list() {
            return this._list;
        }
        Free() {
            super.Free();
            delete this._list;
        }
        Clone() {
            let result = new RingList();
            this._list.forEach((item) => {
                result.list.push(item.Clone());
            });
            return result;
        }
        Add(node) {
            this._list.push(node);
        }
        Nth(n) {
            return this.list[(Math.abs(n) % this._list.length)];
        }
        Each(callback) {
            this._list.forEach(callback);
        }
        //   public EachPrev(callback:(prev:any, obj:any, index:number) => void) {
        //       let size = this._list.length;
        //       for (let index = 0; index < size; index++) {
        //           callback(this.Nth(index - 1), this.Nth(index), index);
        //       }
        //   }
        EachNext(callback) {
            let size = this._list.length;
            for (let index = 0; index < size; index++) {
                callback(this.Nth(index), this.Nth(index + 1), index);
            }
        }
        Serialize() {
            let liststring = "[";
            let delimmiter = "";
            this.Each((node) => {
                liststring += delimmiter + node.Serialize();
                delimmiter = ",";
            });
            liststring += "]";
            return '{"type":"' + this.type + '", "node":' + liststring + '}';
        }
        static Load(obj) {
            let result = new RingList();
            result.type = obj.type;
            obj.node.forEach((location) => {
                if (location.cp0) {
                    result._list.push(new Location(location.x, location.y, location.cp0, location.cp1));
                }
                else {
                    result._list.push(new Location(location.x, location.y));
                }
            });
            return result;
        }
    }
    ShapeEdit.RingList = RingList;
    // Base Shape & Shapes
    class BaseShape extends Typed {
        constructor(type, canvas, obj) {
            super(type);
            this.canvas = canvas;
            this.rectangle = new ShapeEdit.Rectangle(0, 0, 0, 0);
            if (obj.rectangle) {
                this.rectangle = Rectangle.Load(obj.rectangle);
            }
            if (obj.property) {
                this.property = ShapeProperty.Load(this.canvas, obj.property);
            }
            else {
                this.property = new ShapeProperty(this.canvas, "", [], "", new RGBAColor(0, 0, 0, 0), new RGBAColor(0, 0, 0, 0), 0, new Font("", "", "", 0, "", []), "", "miter", {});
            }
            this.vertex = new ShapeEdit.RingList();
            if (obj.vertex) {
                this.vertex = RingList.Load(obj.vertex);
            }
            this.shapes = [];
            if (obj.shapes) {
                obj.shapes.forEach((shape) => {
                    this.Add(BaseShape.Load(this.canvas, shape));
                });
            }
            this.locked = (obj.locked === "true");
            this.parent = null;
            this.currentHandle = 0;
            this.isSelected = false;
            this.isCapture = false;
            this.transform = Transform.none;
            this.degree = 0;
            this.center = new ShapeEdit.Location(0, 0);
            this.prevlocation = new ShapeEdit.Location(0, 0);
        }
        Free() {
            super.Free();
            this.canvas = null;
            this.property.Free();
            this.parent.Free();
            delete this.shapes;
            this.vertex.Free();
        }
        CopyContent(result) {
            result.property = this.property.Clone();
            result.parent = this.parent;
            this.shapes.forEach((shape) => {
                result.shapes.push(shape.Clone());
            });
            result.rectangle = this.rectangle.Clone();
            result.animationContext = this.animationContext;
            result.currentHandle = this.currentHandle;
            result.locked = this.locked;
            result.isSelected = false;
            result.isCapture = false;
            result.transform = Transform.none;
            result.degree = 0;
            result.center = new Location(0, 0);
            return result;
        }
        Clone() {
            return this.CopyContent(new BaseShape(this.type, this.canvas, {}));
        }
        Canvas() {
            return this.canvas;
        }
        SetParent(parent) {
            this.parent = parent;
        }
        Parent() {
            return this.parent;
        }
        IsRoot() {
            return (this.parent === null);
        }
        IsRotable() {
            return false;
        }
        ID() {
            let result = "_0";
            if (this.parent != null) {
                let no = 0;
                this.parent.shapes.forEach((shape, index) => {
                    if (shape === this) {
                        no = index;
                    }
                    result = this.parent.ID() + "_" + no;
                });
            }
            return result;
        }
        // Draw One Resize Handle
        DrawHandle(point, fill) {
            let context = this.canvas.context;
            try {
                context.save();
                context.beginPath();
                context.rect((point.x - handlesize), (point.y - handlesize), handlesize * 2, handlesize * 2);
                context.fillStyle = fill.RGBA();
                context.fill();
                context.strokeStyle = fill.Darken(100).RGBA();
                context.lineWidth = 0.5;
                context.shadowColor = fill.Darken(100).RGBA();
                context.shadowBlur = 2;
                context.shadowOffsetX = 2;
                context.shadowOffsetY = 2;
                context.stroke();
            }
            finally {
                context.restore();
            }
        }
        DrawBorder() {
            let context = this.canvas.context;
            try {
                context.save();
                context.beginPath();
                context.rect(this.rectangle.location.x, this.rectangle.location.y, this.rectangle.size.w, this.rectangle.size.h);
                context.strokeStyle = ShapeEdit.guidelinecolor.Lighten(50).RGB();
                context.lineWidth = 1;
                context.stroke();
            }
            finally {
                context.restore();
            }
        }
        // Draw One Resize Handle
        DrawCircleHandle(point, fill) {
            let context = this.canvas.context;
            try {
                context.save();
                context.beginPath();
                // context.rect((point.x - handlesize), (point.y - handlesize), handlesize * 2, handlesize * 2);
                context.arc(point.x, point.y, handlesize, 0, 360 * Math.PI / 180, false);
                context.fillStyle = fill.RGBA();
                context.fill();
                context.strokeStyle = fill.Darken(100).RGBA();
                context.lineWidth = 0.5;
                context.shadowColor = fill.Darken(100).RGBA();
                context.shadowBlur = 2;
                context.shadowOffsetX = 2;
                context.shadowOffsetY = 2;
                context.stroke();
            }
            finally {
                context.restore();
            }
        }
        DrawContent() {
        }
        Size() {
            return this.rectangle.size;
        }
        Location() {
            return this.rectangle.location;
        }
        Shapes() {
            return this.shapes;
        }
        Area() {
            return 0;
        }
        Vertex() {
            return this.vertex;
        }
        Property() {
            return this.property;
        }
        ToSVG(callback) {
            callback(null);
        }
        ToPDF(callback) {
            callback(null);
        }
        Serialize() {
            return '{"type":"' + this.type + '", "property":' + this.property.Serialize() + '}';
        }
        getShapeById(id) {
            if (id == this.ID()) {
                return this;
            }
            else {
                return null;
            }
        }
        getShapeByType(type, result) {
            if (this.type == type) {
                result.push(this);
            }
        }
        getShapeByTypes(types, result) {
            if (types.indexOf(this.type) >= 0) {
                result.push(this);
            }
        }
        Add(shape) {
        }
        Group() {
        }
        ;
        Ungroup() {
        }
        ;
        Lock() {
            this.isSelected = false;
            this.locked = true;
        }
        UnLock() {
            this.locked = false;
        }
        IsLocked() {
            return this.locked;
        }
        Select() {
            if (!this.isSelected) {
                this.isSelected = true;
                this.canvas.handlers.Exec('select', this, this.canvas.context);
                this.canvas.handlers.Exec('change', this, null);
            }
        }
        Deselect() {
            if (this.isSelected) {
                this.isSelected = false;
                this.canvas.handlers.Exec('deselect', this, this.canvas.context);
                this.canvas.handlers.Exec('change', this, null);
            }
        }
        SetFillColor(color) {
            this.property.fillstyle = color;
            this.canvas.handlers.Exec('change', this, null);
        }
        FillColor() {
            return this.property.fillstyle;
        }
        SetStrokeColor(color) {
            this.property.strokestyle = color;
            this.canvas.handlers.Exec('change', this, null);
        }
        StrokeColor() {
            return this.property.strokestyle;
        }
        SetStrokeWidth(width) {
            this.property.strokewidth = width;
            if (this.property.strokewidth == 0) {
                this.property.strokestyle.a = 0;
            }
            else {
                this.property.strokestyle.a = 1;
            }
            this.canvas.handlers.Exec('change', this, null);
        }
        StrokeWidth() {
            return this.property.strokewidth;
        }
        SetFontStyle(style) {
            this.property.font.style = style;
            this.canvas.handlers.Exec('change', this, null);
        }
        FontStyle() {
            return this.property.font.style;
        }
        SetFontVariant(variant) {
            this.property.font.variant = variant;
            this.canvas.handlers.Exec('change', this, null);
        }
        FontVariant() {
            return this.property.font.variant;
        }
        SetFontWeight(weight) {
            this.property.font.weight = weight;
            this.canvas.handlers.Exec('change', this, null);
        }
        FontWeight() {
            return this.property.font.weight;
        }
        SetFontSize(size) {
            this.property.font.size = size;
            this.canvas.handlers.Exec('change', this, null);
        }
        FontSize() {
            return this.property.font.size;
        }
        SetFontKeyword(keyword) {
            this.property.font.keyword = keyword;
            this.canvas.handlers.Exec('change', this, null);
        }
        FontKeyword() {
            return this.property.font.keyword;
        }
        SetFontFamily(family) {
            this.property.font.family = family;
            this.canvas.handlers.Exec('change', this, null);
        }
        FontFamily() {
            return this.property.font.family;
        }
        SetPath(path) {
            this.property.SetPath(path, () => {
                this.canvas.Draw();
                this.canvas.handlers.Exec('change', this, null);
            }, () => {
            });
        }
        Path() {
            return this.property.path;
        }
        SetAlign(align) {
            this.property.align = align;
            this.canvas.handlers.Exec('change', this, null);
        }
        Align() {
            return this.property.align;
        }
        SetText(text) {
            this.property.text = text;
            this.canvas.handlers.Exec('change', this, null);
        }
        Text() {
            return this.property.text;
        }
        Transform() {
            return this.transform;
        }
        IsCapture() {
            return this.isCapture;
        }
        IsSelected() {
            return this.isSelected;
        }
        Draw() {
            this.DrawContent();
        }
        ResizeRectangle() {
        }
        DrawAllHandle() {
            if (this.parent) {
                if (this.parent.IsRoot()) {
                    this.DrawBorder();
                    //    this.DrawHandle(this.rectangle.topleft, cornerhandlecolor);// corner handle
                    //    this.DrawHandle(this.rectangle.topright, cornerhandlecolor);// corner handle
                    //    this.DrawHandle(this.rectangle.bottomleft, cornerhandlecolor);// corner handle
                    //    this.DrawHandle(this.rectangle.bottomright, cornerhandlecolor);// corner handle
                    if (this.canvas.modifier === Key.shift) {
                        this.DrawHandle(Location.Plus(this.rectangle.bottomright, ShapeEdit.resizehandleoffset), ShapeEdit.shiftedresizehandlecolor.Lighten(50)); // resize handle
                    }
                    else {
                        this.DrawHandle(Location.Plus(this.rectangle.bottomright, ShapeEdit.resizehandleoffset), ShapeEdit.resizehandlecolor.Lighten(50)); // resize handle
                    }
                    if (this.IsRotable()) {
                        if (this.canvas.modifier === Key.shift) {
                            this.DrawCircleHandle(Location.Plus(this.rectangle.topcenter, ShapeEdit.rotatehandleoffset), ShapeEdit.shiftedrotatehandlecolor.Lighten(50)); // rotate handle
                        }
                        else {
                            this.DrawCircleHandle(Location.Plus(this.rectangle.topcenter, ShapeEdit.rotatehandleoffset), ShapeEdit.rotatehandlecolor.Lighten(50)); // rotate handle
                        }
                    }
                }
            }
        }
        Tick() {
            if (this.canvas.plugins) {
                this.animationContext = this.canvas.plugins.Exec('tick', this, this.animationContext);
            }
            this.ResizeRectangle();
        }
        Release() {
            this.isCapture = false;
        }
        BeginDeformation(handle_location, handleCategory) {
            this.transform = Transform.deformation;
            this.currentHandle = handle_location;
            this.handleCategory = handleCategory;
        }
        Deformation(delta) {
            this.ResizeRectangle();
            this.canvas.handlers.Exec('deformation', this, null);
        }
        EndDeformation() {
            this.transform = Transform.none;
            this.currentHandle = 0;
            this.handleCategory = HandleCategory.location;
        }
        BeginResize(handle_location, handleCategory) {
            this.transform = Transform.resize;
            this.currentHandle = handle_location;
            this.handleCategory = handleCategory;
        }
        Resize(origin, magnify) {
            this.ResizeRectangle();
            this.canvas.handlers.Exec('resize', this, null);
        }
        EndResize() {
            this.transform = Transform.none;
            this.currentHandle = 0;
            this.handleCategory = HandleCategory.location;
        }
        BeginRotate(handle_location, handleCategory, degree) {
            this.transform = Transform.rotate;
            this.center.x = this.rectangle.Center().x;
            this.center.y = this.rectangle.Center().y;
            this.degree = degree;
            this.currentHandle = handle_location;
            this.handleCategory = handleCategory;
        }
        Rotate(center, angle) {
            this.ResizeRectangle();
            this.canvas.handlers.Exec('rotate', this, null);
        }
        EndRotate() {
            this.transform = Transform.none;
            this.currentHandle = 0;
            this.handleCategory = HandleCategory.location;
        }
        static Degree(center, location) {
            let dx = center.x - location.x;
            let dy = center.y - location.y;
            let rad = Math.atan2(dy, dx);
            return rad * 180 / 3.14159;
        }
        Equals(shape) {
            return this.rectangle.Equals(shape.rectangle);
        }
        Capture() {
            this.isCapture = true;
        }
        Contains(location) {
            return false;
        }
        MoveTo(delta) {
        }
        HitHandles(location, callback) {
        }
        HitShapes(location, callback) {
        }
        Intersection(rect) {
            return false;
        }
        AddVertexAbsolute(vertex) {
        }
        AddCurveAbsolute(curve) {
        }
        static Load(canvas, obj) {
            let result = null;
            let type = obj.type;
            switch (type) {
                case "Box":
                    result = new ShapeEdit.Box(canvas, obj);
                    break;
                case "Oval":
                    result = new ShapeEdit.Oval(canvas, obj);
                    break;
                case "Text":
                    result = new ShapeEdit.Text(canvas, obj);
                    break;
                case "ImageRect":
                    result = new ShapeEdit.ImageRect(canvas, obj);
                    break;
                case "Polygon":
                    result = new ShapeEdit.Polygon(canvas, obj);
                    break;
                case "Bezier":
                    result = new ShapeEdit.Bezier(canvas, obj);
                    break;
                case "Shapes":
                    result = Shapes.Load(canvas, obj);
                    break;
            }
            return result;
        }
    }
    ShapeEdit.BaseShape = BaseShape;
    // Rectangle base Shape Base
    class RectShape extends BaseShape {
        constructor(type, canvas, obj) {
            super(type, canvas, obj);
            this.handletl = new ShapeEdit.Rectangle(this.rectangle.location.x - handlesize, this.rectangle.location.y - handlesize, handlesize * 2, handlesize * 2);
            this.handlebl = new ShapeEdit.Rectangle(this.rectangle.location.x - handlesize, this.rectangle.location.y + this.rectangle.size.h - handlesize, handlesize * 2, handlesize * 2);
            this.handletr = new ShapeEdit.Rectangle(this.rectangle.location.x + this.rectangle.size.w - handlesize, this.rectangle.location.y - handlesize, handlesize * 2, handlesize * 2);
            this.handlebr = new ShapeEdit.Rectangle(this.rectangle.location.x + this.rectangle.size.w - handlesize, this.rectangle.location.y + this.rectangle.size.h - handlesize, handlesize * 2, handlesize * 2);
            this.handlelc = new ShapeEdit.Rectangle(this.rectangle.location.x - handlesize, this.rectangle.location.y + (this.rectangle.size.h / 2) - handlesize, handlesize * 2, handlesize * 2);
            this.handlerc = new ShapeEdit.Rectangle(this.rectangle.location.x + this.rectangle.size.w - handlesize, this.rectangle.location.y + (this.rectangle.size.h / 2) - handlesize, handlesize * 2, handlesize * 2);
            this.handletc = new ShapeEdit.Rectangle(this.rectangle.location.x + (this.rectangle.size.w / 2) - handlesize, this.rectangle.location.y - handlesize, handlesize * 2, handlesize * 2);
            this.handlebc = new ShapeEdit.Rectangle(this.rectangle.location.x + (this.rectangle.size.w / 2) - handlesize, this.rectangle.location.y + this.rectangle.size.h - handlesize, handlesize * 2, handlesize * 2);
            this.grid = new ShapeEdit.Location(this.rectangle.location.x, this.rectangle.location.y);
        }
        Free() {
            super.Free();
            this.handletl.Free();
            this.handlebl.Free();
            this.handletr.Free();
            this.handlebr.Free();
            this.handlelc.Free();
            this.handlerc.Free();
            this.handletc.Free();
            this.handlebc.Free();
        }
        CopyContent(result) {
            result = super.CopyContent(result);
            result.handletl = this.handletl.Clone();
            result.handlebl = this.handlebl.Clone();
            result.handletr = this.handletr.Clone();
            result.handlebr = this.handlebr.Clone();
            result.handlelc = this.handlelc.Clone();
            result.handlerc = this.handlerc.Clone();
            result.handletc = this.handletc.Clone();
            result.handlebc = this.handlebc.Clone();
            result.grid = this.grid.Clone();
            return result;
        }
        Clone() {
            return this.CopyContent(new RectShape(this.type, this.canvas, {}));
        }
        FreeDeformation(delta) {
            let x = delta.x; // this.Grid(delta.x);
            let y = delta.y; // this.Grid(delta.y);
            let rectangle = this.rectangle;
            switch (this.currentHandle) {
                case 1:
                    rectangle.size.w -= x;
                    rectangle.size.h -= y;
                    rectangle.location.x += x;
                    rectangle.location.y += y;
                    break;
                case 2:
                    rectangle.size.h -= y;
                    rectangle.location.y += y;
                    break;
                case 3:
                    rectangle.size.w += x;
                    rectangle.size.h -= y;
                    rectangle.location.y += y;
                    break;
                case 4:
                    rectangle.size.w += x;
                    break;
                case 5:
                    rectangle.size.w += x;
                    rectangle.size.h += y;
                    break;
                case 6:
                    rectangle.size.h += y;
                    break;
                case 7:
                    rectangle.size.w -= x;
                    rectangle.size.h += y;
                    rectangle.location.x += x;
                    break;
                case 8:
                    rectangle.size.w -= x;
                    rectangle.location.x += x;
                    break;
                default:
            }
        }
        ResizeRectangle() {
            let locationx = this.rectangle.location.x - handlesize;
            let locationy = this.rectangle.location.y - handlesize;
            let sizew = this.rectangle.size.w;
            let sizeh = this.rectangle.size.h;
            this.handletl.location.x = locationx;
            this.handletl.location.y = locationy;
            this.handlebl.location.x = locationx;
            this.handlebl.location.y = locationy + sizeh;
            this.handletr.location.x = locationx + sizew;
            this.handletr.location.y = locationy;
            this.handlebr.location.x = locationx + sizew;
            this.handlebr.location.y = locationy + sizeh;
            this.handlelc.location.x = locationx;
            this.handlelc.location.y = locationy + (sizeh / 2);
            this.handlerc.location.x = locationx + sizew;
            this.handlerc.location.y = locationy + (sizeh / 2);
            this.handletc.location.x = locationx + (sizew / 2);
            this.handletc.location.y = locationy;
            this.handlebc.location.x = locationx + (sizew / 2);
            this.handlebc.location.y = locationy + sizeh;
            this.canvas.isdirty = true;
        }
        DrawAllHandle() {
            if (this.parent) {
                if (this.parent.IsRoot()) {
                    this.DrawHandle(this.handletl.Center(), ShapeEdit.cornerhandlecolor);
                    this.DrawHandle(this.handlebl.Center(), ShapeEdit.cornerhandlecolor);
                    this.DrawHandle(this.handletr.Center(), ShapeEdit.cornerhandlecolor);
                    this.DrawHandle(this.handlebr.Center(), ShapeEdit.cornerhandlecolor);
                    this.DrawHandle(this.handlelc.Center(), ShapeEdit.centerhandlecolor);
                    this.DrawHandle(this.handlerc.Center(), ShapeEdit.centerhandlecolor);
                    this.DrawHandle(this.handletc.Center(), ShapeEdit.centerhandlecolor);
                    this.DrawHandle(this.handlebc.Center(), ShapeEdit.centerhandlecolor);
                    if (this.canvas.modifier === Key.shift) {
                        this.DrawHandle(Location.Plus(this.rectangle.bottomright, ShapeEdit.resizehandleoffset), ShapeEdit.shiftedresizehandlecolor.Lighten(50)); // resize handle
                    }
                    else {
                        this.DrawHandle(Location.Plus(this.rectangle.bottomright, ShapeEdit.resizehandleoffset), ShapeEdit.resizehandlecolor.Lighten(50)); // resize handle
                    }
                }
            }
        }
        // Serialize Format
        Serialize() {
            return '{"type":"' + this.type + '", "locked":"' + this.locked + '", "rectangle":' + this.rectangle.Serialize() + ', "property":' + this.property.Serialize() + '}';
        }
        // Click is This?
        Contains(location) {
            return this.rectangle.Contains(location);
        }
        Area() {
            return this.rectangle.size.w * this.rectangle.size.h;
        }
        // Draw This
        Draw() {
            super.Draw();
            if (this.isSelected) {
                this.DrawAllHandle();
            }
        }
        // Mouse Capture for Resize
        Capture() {
            this.isCapture = true;
        }
        static Grid(n) {
            return Math.round(n / ShapeEdit.gridsize) * ShapeEdit.gridsize;
        }
        // Move this
        //todo:グリッドについてはあんまりよくない. リファクタするべき
        MoveTo(delta) {
            if (this.transform != Transform.deformation) {
                if (this.isSelected) {
                    if (ShapeEdit.gridsize === 1) {
                        this.rectangle.location.x += delta.x;
                        this.rectangle.location.y += delta.y;
                    }
                    else {
                        this.grid.x += delta.x; //差分を加算
                        this.grid.y += delta.y;
                        this.rectangle.location.x = RectShape.Grid(this.grid.x); //差分が閾値を超えたら
                        this.rectangle.location.y = RectShape.Grid(this.grid.y);
                    }
                    this.ResizeRectangle();
                    this.canvas.handlers.Exec('move', this, null);
                }
            }
        }
        // Click Where Handle?
        HitHandles(location, callback) {
            let result = 0;
            let handlecategory = HandleCategory.location;
            switch (this.canvas.modifier) {
                case Key.normal:
                    if (this.handletl.Contains(location)) {
                        result = 1;
                    }
                    else if (this.handletc.Contains(location)) {
                        result = 2;
                    }
                    else if (this.handletr.Contains(location)) {
                        result = 3;
                    }
                    else if (this.handlerc.Contains(location)) {
                        result = 4;
                    }
                    else if (this.handlebr.Contains(location)) {
                        result = 5;
                    }
                    else if (this.handlebc.Contains(location)) {
                        result = 6;
                    }
                    else if (this.handlebl.Contains(location)) {
                        result = 7;
                    }
                    else if (this.handlelc.Contains(location)) {
                        result = 8;
                    }
                    else if (location.Near(Location.Plus(this.rectangle.bottomright, ShapeEdit.resizehandleoffset), handlesize)) {
                        handlecategory = HandleCategory.resize;
                        result = -1;
                    }
                    break;
                case Key.shift:
                    if (location.Near(Location.Plus(this.rectangle.bottomright, ShapeEdit.resizehandleoffset), handlesize)) {
                        handlecategory = HandleCategory.resize;
                        result = -1;
                    }
                    break;
            }
            callback(result, handlecategory);
        }
        // Click Where Shape?
        HitShapes(location, callback) {
            this.Shapes().forEach((shape) => {
                if (shape.type === "Shapes") {
                    shape.HitShapes(location, callback);
                }
                if (shape.Contains(location)) {
                    callback(shape);
                }
            });
        }
        Deformation(delta) {
            if (this.transform === Transform.deformation) {
                this.FreeDeformation(delta);
                super.Deformation(delta);
                this.canvas.isdirty = true;
            }
        }
        Resize(origin, magnify) {
            this.rectangle.location.x = ((this.rectangle.location.x - origin.x) * magnify.w) + origin.x;
            this.rectangle.location.y = ((this.rectangle.location.y - origin.y) * magnify.h) + origin.y;
            this.rectangle.size.w = this.rectangle.size.w * magnify.w;
            this.rectangle.size.h = this.rectangle.size.h * magnify.h;
            super.Resize(origin, magnify);
            this.canvas.isdirty = true;
        }
        Intersection(rect) {
            return rect.RectangleIsContain(this.rectangle);
        }
    }
    ShapeEdit.RectShape = RectShape;
    class LineShape extends BaseShape {
        CopyContent(result) {
            result = super.CopyContent(result);
            result.vertex = this.vertex.Clone();
            return result;
        }
        Clone() {
            return this.CopyContent(new LineShape(this.type, this.canvas, {}));
        }
        FreeDeformation(delta) {
            let handle = this.vertex.Nth(this.currentHandle - 2);
            if (Math.abs(delta.x) > Math.abs(delta.y)) {
                handle.x += delta.x;
            }
            else {
                handle.y += delta.y;
            }
            this.ResizeRectangle(); //外接四角形のリサイズ
        }
        ResizeRectangle() {
            let x = _.minBy(this.vertex.list, 'x').x;
            let y = _.minBy(this.vertex.list, 'y').y;
            this.rectangle.location.x = x;
            this.rectangle.location.y = y;
            this.rectangle.size.w = _.maxBy(this.vertex.list, 'x').x - x;
            this.rectangle.size.h = _.maxBy(this.vertex.list, 'y').y - y;
            this.canvas.isdirty = true;
        }
        DrawAllHandle() {
            super.DrawAllHandle();
            if (this.parent) {
                if (this.parent.IsRoot()) {
                    this.vertex.EachNext((point, next) => {
                        this.DrawHandle(point, ShapeEdit.cornerhandlecolor); // vertex handle
                        let centerx = ((next.x - point.x) / 2) + point.x;
                        let centery = ((next.y - point.y) / 2) + point.y;
                        this.DrawHandle(new ShapeEdit.Location(centerx, centery), ShapeEdit.centerhandlecolor); // center handle
                    });
                }
            }
        }
        /*
         //OOP approach.  simple but more then Memories...
         protected DrawAllHandle():void {
         this.vertex.EachNext((point, next, index) => {
         this.DrawHandle(point);
         var rectangle = new Rectangle(point.x, point.y, next.x - point.x, next.y - point.y);
         this.DrawHandle(rectangle.Center());
         });
         }
         */
        Property() {
            return this.property;
        }
        AddVertexAbsolute(vertex) {
            this.vertex.Add(vertex);
        }
        AddVertex(vertex) {
            this.vertex.Add(ShapeEdit.Location.Plus(vertex, this.rectangle.location));
        }
        static Each(elements, begin, each, end) {
            for (let index = 0; index < elements.length; index++) {
                if (index === 0) {
                    begin(elements[index]);
                }
                else if (index >= elements.length - 1) {
                    end(elements[index]);
                }
                else {
                    each(elements[index]);
                }
            }
        }
        Area() {
            let result = 0;
            this.vertex.EachNext((current, next) => {
                result += (current.x - next.x) * (current.y + next.y);
            });
            return Math.abs(Math.round(result / 2));
        }
        //ポイントが図形に含まれるか
        Contains(inner) {
            let cross = 0;
            this.vertex.list.forEach((point, index) => {
                cross += inner.CrossingCount(this.vertex.Nth(index), this.vertex.Nth(index + 1));
            });
            return ((cross % 2) === 1); // 交差ポイント数が奇数なら内側、偶数なら外。
        }
        Intersection(rect) {
            return (_.filter(this.vertex.list, (location) => {
                return rect.LocationIsContain(location);
            }).length > 0);
        }
        Serialize() {
            return '{"type":"' + this.type + '", "locked":"' + this.locked + '", "rectangle":' + this.rectangle.Serialize() + ', "vertex":' + this.vertex.Serialize() + ', "property":' + this.property.Serialize() + '}';
        }
        Draw() {
            super.Draw();
            if (this.isSelected) {
                this.DrawAllHandle();
            }
        }
        MoveTo(delta) {
            if (this.transform != Transform.deformation) {
                if (this.isSelected) {
                    this.vertex.list.forEach((point) => {
                        point.Move(delta);
                    });
                    this.ResizeRectangle();
                    this.canvas.handlers.Exec('move', this, null);
                }
            }
        }
        HitShapes(location, callback) {
        }
        HitHandles(location, callback) {
            let result = 0;
            let handlecategory = HandleCategory.location;
            switch (this.canvas.modifier) {
                case Key.normal:
                    this.vertex.EachNext((point, next, index) => {
                        if (location.Near(point, handlesize)) {
                            handlecategory = HandleCategory.location;
                            result = index + 2;
                        }
                        else {
                            let center = new ShapeEdit.Location(((next.x - point.x) / 2) + point.x, ((next.y - point.y) / 2) + point.y);
                            if (location.Near(center, handlesize)) {
                                handlecategory = HandleCategory.center;
                                result = index + 2;
                            }
                        }
                    });
                    if (location.Near(Location.Plus(this.rectangle.bottomright, ShapeEdit.resizehandleoffset), handlesize)) {
                        handlecategory = HandleCategory.resize;
                        result = -1;
                    }
                    else if (location.Near(Location.Plus(this.rectangle.topcenter, ShapeEdit.rotatehandleoffset), handlesize)) {
                        handlecategory = HandleCategory.rotate;
                        result = -1;
                    }
                    break;
                case Key.shift:
                    if (location.Near(Location.Plus(this.rectangle.bottomright, ShapeEdit.resizehandleoffset), handlesize)) {
                        handlecategory = HandleCategory.resize;
                        result = -1;
                    }
                    else if (location.Near(Location.Plus(this.rectangle.topcenter, ShapeEdit.rotatehandleoffset), handlesize)) {
                        handlecategory = HandleCategory.rotate;
                        result = -1;
                    }
                    break;
            }
            callback(result, handlecategory);
        }
        Deformation(delta) {
            if (this.transform === Transform.deformation) {
                switch (this.handleCategory) {
                    case HandleCategory.location:
                        this.FreeDeformation(delta);
                        break;
                    case HandleCategory.center:
                        let prevhandle = this.vertex.Nth(this.currentHandle - 2);
                        let nexthandle = this.vertex.Nth(this.currentHandle - 1);
                        if (Math.abs(delta.x) > Math.abs(delta.y)) {
                            prevhandle.x += delta.x;
                            nexthandle.x += delta.x;
                        }
                        else {
                            prevhandle.y += delta.y;
                            nexthandle.y += delta.y;
                        }
                        break;
                    default:
                        break;
                }
                super.Deformation(delta);
            }
        }
        Resize(origin, magnify) {
            this.vertex.list.forEach((point) => {
                point.Resize(origin, magnify);
            });
            super.Resize(origin, magnify);
            this.canvas.isdirty = true;
        }
        Rotate(center, degree) {
            this.vertex.list.forEach((point) => {
                point.Rotate(center, degree);
            });
            super.Rotate(center, degree);
        }
        IsRotable() {
            return true;
        }
    }
    ShapeEdit.LineShape = LineShape;
    class CurveShape extends BaseShape {
        CopyContent(result) {
            result = super.CopyContent(result);
            result.vertex = this.vertex.Clone();
            return result;
        }
        Clone() {
            return this.CopyContent(new CurveShape(this.type, this.canvas, {}));
        }
        FreeDeformation(delta) {
            // todo: 諸君、私はリファクタリングが好きだ。....分岐が減った時など、絶頂すらおぼえる。。。更なるリファクタを望むか？よろしい、ならばリファクタだ。一心不乱のリファクタを！！
            let point = this.currentHandle - 1;
            let round = (point) => {
                let result = point;
                if (result < 0) {
                    result = this.vertex.list.length - 1;
                }
                else if (result > this.vertex.list.length - 1) {
                    result = 0;
                }
                return result;
            };
            let nexthandle = this.vertex.list[round(point - 1)];
            let handle = this.vertex.list[round(point)];
            let prevhandle = this.vertex.list[round(point + 1)];
            switch (this.handleCategory) {
                case HandleCategory.location:
                    prevhandle.controlPoint0.x += delta.x;
                    prevhandle.controlPoint0.y += delta.y;
                    handle.controlPoint1.x += delta.x;
                    handle.controlPoint1.y += delta.y;
                    handle.x += delta.x;
                    handle.y += delta.y;
                    break;
                case HandleCategory.control0:
                    if (handle.miter === 0) {
                        nexthandle.controlPoint1.x -= delta.x;
                        nexthandle.controlPoint1.y -= delta.y;
                    }
                    handle.controlPoint0.x += delta.x;
                    handle.controlPoint0.y += delta.y;
                    break;
                case HandleCategory.control1:
                    if (handle.miter === 0) {
                        prevhandle.controlPoint0.x -= delta.x;
                        prevhandle.controlPoint0.y -= delta.y;
                    }
                    handle.controlPoint1.x += delta.x;
                    handle.controlPoint1.y += delta.y;
                    break;
            }
            this.ResizeRectangle(); //外接四角形のリサイズ
        }
        ResizeRectangle() {
            let x = _.minBy(this.vertex.list, 'x').x;
            let y = _.minBy(this.vertex.list, 'y').y;
            this.rectangle.location.x = x;
            this.rectangle.location.y = y;
            this.rectangle.size.w = _.maxBy(this.vertex.list, 'x').x - x;
            this.rectangle.size.h = _.maxBy(this.vertex.list, 'y').y - y;
        }
        DrawCurveHandle(vertex, next) {
            let context = this.canvas.context;
            try {
                context.save();
                context.beginPath();
                context.moveTo(vertex.x, vertex.y);
                context.lineTo(next.controlPoint0.x, next.controlPoint0.y); //control line 0
                context.moveTo(vertex.x, vertex.y);
                context.lineTo(vertex.controlPoint1.x, vertex.controlPoint1.y); //control line 1
                context.rect((vertex.x - handlesize), (vertex.y - handlesize), handlesize * 2, handlesize * 2);
                context.rect((vertex.controlPoint0.x - handlesize), (vertex.controlPoint0.y - handlesize), handlesize * 2, handlesize * 2);
                context.rect((vertex.controlPoint1.x - handlesize), (vertex.controlPoint1.y - handlesize), handlesize * 2, handlesize * 2);
                context.fillStyle = ShapeEdit.whitecolor.RGBA();
                context.fill();
                context.strokeStyle = ShapeEdit.blackcolor.RGBA();
                context.lineWidth = 0.5;
                context.stroke();
            }
            finally {
                context.restore();
            }
        }
        DrawAllHandle() {
            super.DrawAllHandle();
            if (this.parent) {
                if (this.parent.IsRoot()) {
                    this.vertex.EachNext((obj, next) => {
                        this.DrawCurveHandle(obj, next);
                    });
                }
            }
        }
        Property() {
            return this.property;
        }
        AddCurveAbsolute(vertex) {
            this.vertex.Add(vertex);
        }
        AddCurve(vertex) {
            this.vertex.Add(ShapeEdit.Location.Plus(vertex, this.rectangle.location));
        }
        static Each(elements, begin, each, end) {
            for (let index = 0; index < elements.length; index++) {
                if (index === 0) {
                    begin(elements[index]);
                }
                else if (index >= elements.length - 1) {
                    end(elements[index]);
                }
                else {
                    each(elements[index]);
                }
            }
        }
        Area() {
            return 0;
        }
        //図形にポイントが含まれるか
        Contains(inner) {
            let cross = 0;
            this.vertex.list.forEach((point, index) => {
                cross += inner.CrossingCount(this.vertex.Nth(index), this.vertex.Nth(index + 1));
            });
            return ((cross % 2) === 1); // 交差ポイント数が奇数なら内側、偶数なら外。
        }
        Serialize() {
            return '{"type":"' + this.type + '", "locked":"' + this.locked + '", "rectangle":' + this.rectangle.Serialize() + ', "vertex":' + this.vertex.Serialize() + ', "property":' + this.property.Serialize() + '}';
        }
        Draw() {
            super.Draw();
            if (this.isSelected) {
                this.DrawAllHandle();
            }
        }
        MoveTo(delta) {
            if (this.transform != Transform.deformation) {
                if (this.isSelected) {
                    this.vertex.list.forEach((vertex) => {
                        vertex.Move(delta);
                    });
                    this.ResizeRectangle();
                    this.canvas.handlers.Exec('move', this, null);
                }
            }
        }
        HitShapes(location, callback) {
        }
        HitHandles(location, callback) {
            let result = 0;
            let handlecategory = HandleCategory.location;
            let rectangle = this.rectangle;
            switch (this.canvas.modifier) {
                case Key.normal:
                    let index = 0;
                    this.vertex.list.forEach((vertex) => {
                        index++;
                        if (location.Near(vertex, handlesize)) {
                            handlecategory = HandleCategory.location;
                            result = index;
                        }
                        else if (location.Near(vertex.controlPoint0, handlesize)) {
                            handlecategory = HandleCategory.control0;
                            result = index;
                        }
                        else if (location.Near(vertex.controlPoint1, handlesize)) {
                            handlecategory = HandleCategory.control1;
                            result = index;
                        }
                    });
                    if (location.Near(Location.Plus(rectangle.bottomright, ShapeEdit.resizehandleoffset), handlesize)) {
                        handlecategory = HandleCategory.resize;
                        result = -1;
                    }
                    else if (location.Near(Location.Plus(rectangle.topcenter, ShapeEdit.rotatehandleoffset), handlesize)) {
                        handlecategory = HandleCategory.rotate;
                        result = -1;
                    }
                    break;
                case Key.shift:
                    if (location.Near(Location.Plus(rectangle.bottomright, ShapeEdit.resizehandleoffset), handlesize)) {
                        handlecategory = HandleCategory.resize;
                        result = -1;
                    }
                    else if (location.Near(Location.Plus(rectangle.topcenter, ShapeEdit.rotatehandleoffset), handlesize)) {
                        handlecategory = HandleCategory.rotate;
                        result = -1;
                    }
                    break;
            }
            callback(result, handlecategory);
        }
        Deformation(delta) {
            if (this.transform === Transform.deformation) {
                this.FreeDeformation(delta);
                super.Deformation(delta);
                this.canvas.isdirty = true;
            }
        }
        Resize(origin, magnify) {
            this.vertex.list.forEach((vertex) => {
                vertex.Resize(origin, magnify);
            });
            super.Resize(origin, magnify);
            this.canvas.isdirty = true;
        }
        Rotate(center, degree) {
            this.vertex.list.forEach((vertex) => {
                vertex.Rotate(center, degree);
            });
            super.Rotate(center, degree);
            this.canvas.isdirty = true;
        }
        Intersection(rect) {
            return (_.filter(this.vertex.list, (vertex) => {
                return rect.LocationIsContain(vertex);
            }).length > 0);
        }
        IsRotable() {
            return true;
        }
    }
    ShapeEdit.CurveShape = CurveShape;
    class Bezier extends CurveShape {
        constructor(canvas, obj) {
            super("Bezier", canvas, obj);
        }
        Free() {
            super.Free();
        }
        Clone() {
            return this.CopyContent(new Bezier(this.canvas, {}));
        }
        DrawContent() {
            let context = this.canvas.context;
            try {
                context.save();
                context.beginPath();
                let startpoint = null;
                CurveShape.Each(this.vertex.list, (vertex) => {
                    context.moveTo(vertex.x, vertex.y);
                    startpoint = vertex;
                }, (vertex) => {
                    context.bezierCurveTo(vertex.controlPoint0.x, vertex.controlPoint0.y, vertex.controlPoint1.x, vertex.controlPoint1.y, vertex.x, vertex.y);
                }, (vertex) => {
                    context.bezierCurveTo(vertex.controlPoint0.x, vertex.controlPoint0.y, vertex.controlPoint1.x, vertex.controlPoint1.y, vertex.x, vertex.y);
                    context.bezierCurveTo(startpoint.controlPoint0.x, startpoint.controlPoint0.y, startpoint.controlPoint1.x, startpoint.controlPoint1.y, startpoint.x, startpoint.y);
                });
                context.closePath();
                context.fillStyle = this.property.FillStyle(context);
                context.fill();
                context.strokeStyle = this.property.strokestyle.CanvasValue(context);
                context.lineWidth = this.property.strokewidth;
                context.lineJoin = this.property.linejoin; //"miter";// bevel, round,
                if (context.lineWidth == 0) {
                    context.strokeStyle = new RGBAColor(255, 255, 255, 0);
                }
                if (this.canvas.plugins) {
                    this.canvas.plugins.Exec('draw', this, context);
                }
                context.stroke();
            }
            finally {
                context.restore();
            }
        }
        ToSVG(callback) {
            this.canvas.adaptor.Bezier(this, callback);
        }
        ToPDF(callback) {
            this.canvas.adaptor.Bezier(this, callback);
        }
        //Helpers
        lineTo(px, py) {
            this.AddCurveAbsolute(new ShapeEdit.Location(px, py, new ShapeEdit.Location(px, py), new ShapeEdit.Location(px, py)));
        }
        ;
        bezierCurveTo(cp1x, cp1y, cp2x, cp2y, px, py) {
            this.AddCurveAbsolute(new ShapeEdit.Location(px, py, new ShapeEdit.Location(cp1x, cp1y), new ShapeEdit.Location(cp2x, cp2y)));
        }
        ;
    }
    ShapeEdit.Bezier = Bezier;
    class Polygon extends LineShape {
        constructor(canvas, obj) {
            super("Polygon", canvas, obj);
        }
        Free() {
            super.Free();
        }
        Clone() {
            return this.CopyContent(new Polygon(this.canvas, {}));
        }
        DrawContent() {
            let context = this.canvas.context;
            try {
                context.save();
                context.beginPath();
                let startpoint = null;
                LineShape.Each(this.vertex.list, (vertex) => {
                    context.moveTo(vertex.x, vertex.y);
                    startpoint = vertex;
                }, (vertex) => {
                    context.lineTo(vertex.x, vertex.y);
                }, (vertex) => {
                    context.lineTo(vertex.x, vertex.y);
                });
                context.closePath();
                context.fillStyle = this.property.FillStyle(context);
                context.fill();
                context.strokeStyle = this.property.strokestyle.CanvasValue(context);
                context.lineWidth = this.property.strokewidth;
                context.lineJoin = this.property.linejoin; //"miter";// bevel, round,
                if (context.lineWidth == 0) {
                    context.strokeStyle = new RGBAColor(255, 255, 255, 0);
                }
                if (this.canvas.plugins) {
                    this.canvas.plugins.Exec('draw', this, context);
                }
                context.stroke();
            }
            finally {
                context.restore();
            }
        }
        ToSVG(callback) {
            this.canvas.adaptor.Polygon(this, callback);
        }
        ToPDF(callback) {
            this.canvas.adaptor.Polygon(this, callback);
        }
        //Helper
        lineTo(px, py) {
            this.AddVertex(new ShapeEdit.Location(px, py));
        }
        ;
    }
    ShapeEdit.Polygon = Polygon;
    class Text extends RectShape {
        constructor(canvas, obj) {
            super("Text", canvas, obj);
            this.canvas.context.font = this.property.font.Value();
            this.ResizeRectangle();
        }
        Free() {
            super.Free();
        }
        Clone() {
            return this.CopyContent(new Text(this.canvas, {}));
        }
        static CRLF(char, prevchar, addline, addchar) {
            let result = prevchar;
            switch (prevchar) {
                case PrevChar.normal:
                    switch (char.charCodeAt(0)) {
                        case 0x0D:
                            result = PrevChar.cr;
                            addline();
                            break;
                        case 0x0A:
                            result = PrevChar.lf;
                            addline();
                            break;
                        default:
                            addchar();
                            break;
                    }
                    break;
                case PrevChar.cr:
                    switch (char.charCodeAt(0)) {
                        case 0x0D:
                            addline();
                            break;
                        case 0x0A:
                            result = PrevChar.lf;
                            break;
                        default:
                            result = PrevChar.normal;
                            addchar();
                            break;
                    }
                    break;
                case PrevChar.lf:
                    switch (char.charCodeAt(0)) {
                        case 0x0D:
                            result = PrevChar.cr;
                            break;
                        case 0x0A:
                            addline();
                            break;
                        default:
                            result = PrevChar.normal;
                            addchar();
                            break;
                    }
                    break;
            }
            return result;
        }
        FitText(textContent, textwidth, hint) {
            let result = [];
            let linewidth = 0;
            let line = "";
            let prevchar = PrevChar.normal;
            let index = 0;
            _.forEach(textContent, (char) => {
                linewidth += textwidth[index] * hint; // 現在までの行長さにfont幅を加算（textwidth=すでにとっておいた一文字ごとのFont幅）
                // linewidth += this.canvas.context.measureText(char).width;//クライアントの場合、measureTextが使用できるが。。
                if (linewidth > this.rectangle.size.w) {
                    result.push({ line: line, length: linewidth }); //現在までの業を行に追加
                    linewidth = 0; //次の行のための初期化
                    line = ""; //次の行のための初期化
                }
                prevchar = Text.CRLF(char, prevchar, () => {
                    result.push({ line: line, length: linewidth });
                    linewidth = 0;
                    line = "";
                }, () => {
                    line += char;
                });
                index++;
            });
            result.push({ line: line, length: linewidth });
            return result;
        }
        DrawText(hint, draw) {
            let lineheight = this.property.font.size * 1.2;
            let lineoffset = this.rectangle.location.y + lineheight;
            let height = lineheight;
            let textContent = this.property.text;
            this.property.text = this.property.text; //  reculc! (ignore warning please.)
            let textwidth = this.property.textwidth;
            let align = this.property.align;
            _.forEach(this.FitText(textContent, textwidth, hint), (line) => {
                let offset = 0;
                switch (align) {
                    case "left":
                        offset = 0;
                        break;
                    case "right":
                        offset = Math.abs(this.rectangle.size.w - line.length);
                        break;
                    case "center":
                        offset = Math.abs(this.rectangle.size.w - line.length) / 2;
                        break;
                }
                draw(line, this.rectangle.location.x + offset, lineoffset);
                lineoffset += lineheight;
                height += lineheight;
            });
            //  this.rectangle.size.h = height;
        }
        DrawContent() {
            let context = this.canvas.context;
            try {
                context.save();
                context.fillStyle = this.property.FillStyle(context);
                //this.property.font.size = (this.property.font.size);
                context.font = this.property.font.Value();
                let hoge = this.property.font.Value();
                //   context.font = "normal normal normal 100px 'Nico Moji',sans-serif";
                context.textAlign = "left";
                this.DrawText(1, (line, x, y) => {
                    context.fillText(line.line, x, y);
                });
                if (this.canvas.plugins) {
                    this.canvas.plugins.Exec('draw', this, context);
                }
            }
            finally {
                context.restore();
            }
        }
        Text() {
            return this.property.text;
        }
        Resize(origin, magnify) {
            this.property.font.size *= magnify.w;
            super.Resize(origin, magnify);
            this.canvas.isdirty = true;
        }
        SetText(text) {
            this.property.text = text;
            this.canvas.context.font = this.property.font.Value();
            this.DrawText(1, (line, x, y) => {
                this.canvas.context.fillText(line.line, x, y);
            });
            this.ResizeRectangle();
        }
        ToSVG(callback) {
            this.canvas.adaptor.Text(this, callback);
        }
        ToPDF(callback) {
            this.canvas.adaptor.Text(this, callback);
        }
    }
    ShapeEdit.Text = Text;
    class Box extends RectShape {
        constructor(canvas, obj) {
            super("Box", canvas, obj);
        }
        Free() {
            super.Free();
        }
        Clone() {
            return this.CopyContent(new Box(this.canvas, {}));
        }
        DrawContent() {
            let context = this.canvas.context;
            try {
                context.save();
                context.beginPath();
                context.rect(this.rectangle.location.x, this.rectangle.location.y, this.rectangle.size.w, this.rectangle.size.h);
                context.fillStyle = this.property.FillStyle(context);
                context.fill();
                context.strokeStyle = this.property.strokestyle.CanvasValue(context);
                context.lineWidth = this.property.strokewidth;
                if (context.lineWidth == 0) {
                    context.strokeStyle = new RGBAColor(255, 255, 255, 0);
                }
                if (this.canvas.plugins) {
                    this.canvas.plugins.Exec('draw', this, context);
                }
                context.stroke();
            }
            finally {
                context.restore();
            }
        }
        ToSVG(callback) {
            this.canvas.adaptor.Box(this, callback);
        }
        ToPDF(callback) {
            this.canvas.adaptor.Box(this, callback);
        }
    }
    ShapeEdit.Box = Box;
    class Oval extends RectShape {
        constructor(canvas, obj) {
            super("Oval", canvas, obj);
        }
        Free() {
            super.Free();
        }
        DrawContent() {
            let context = this.canvas.context;
            try {
                context.save();
                context.beginPath();
                let rx = this.rectangle.size.w / 2;
                let ry = this.rectangle.size.h / 2;
                let cx = this.rectangle.location.x + rx;
                let cy = this.rectangle.location.y + ry;
                context.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI, false);
                context.fillStyle = this.property.FillStyle(context);
                context.fill();
                context.lineWidth = this.property.strokewidth;
                context.strokeStyle = this.property.strokestyle.CanvasValue(context);
                if (context.lineWidth == 0) {
                    context.strokeStyle = new RGBAColor(255, 255, 255, 0);
                }
                if (this.canvas.plugins) {
                    this.canvas.plugins.Exec('draw', this, context);
                }
                context.stroke();
            }
            finally {
                context.restore();
            }
        }
        Clone() {
            return this.CopyContent(new Oval(this.canvas, {}));
        }
        Area() {
            return Math.round(3.14 * (this.rectangle.size.w / 2) * (this.rectangle.size.h / 2));
        }
        ToSVG(callback) {
            this.canvas.adaptor.Oval(this, callback);
        }
        ToPDF(callback) {
            this.canvas.adaptor.Oval(this, callback);
        }
    }
    ShapeEdit.Oval = Oval;
    class ImageRect extends RectShape {
        constructor(canvas, obj) {
            super("ImageRect", canvas, obj);
        }
        Free() {
            super.Free();
        }
        Clone() {
            return this.CopyContent(new ImageRect(this.canvas, {}));
        }
        DrawContent() {
            let context = this.canvas.context;
            try {
                context.save();
                if (this.property.image) {
                    if (!this.property.haserror) {
                        context.drawImage(this.property.image, this.rectangle.location.x, this.rectangle.location.y, this.rectangle.size.w, this.rectangle.size.h);
                    }
                    if (this.canvas.plugins) {
                        this.canvas.plugins.Exec('draw', this, context);
                    }
                }
            }
            finally {
                context.restore();
            }
        }
        // Click Where Handle?
        HitHandles(location, callback) {
            let result = 0;
            let handlecategory = HandleCategory.location;
            switch (this.canvas.modifier) {
                case Key.normal:
                    if (this.handletl.Contains(location)) {
                        result = 1;
                    }
                    else if (this.handletc.Contains(location)) {
                        result = 2;
                    }
                    else if (this.handletr.Contains(location)) {
                        result = 3;
                    }
                    else if (this.handlerc.Contains(location)) {
                        result = 4;
                    }
                    else if (this.handlebr.Contains(location)) {
                        result = 5;
                    }
                    else if (this.handlebc.Contains(location)) {
                        result = 6;
                    }
                    else if (this.handlebl.Contains(location)) {
                        result = 7;
                    }
                    else if (this.handlelc.Contains(location)) {
                        result = 8;
                    }
                    else if (location.Near(Location.Plus(this.rectangle.bottomright, ShapeEdit.resizehandleoffset), handlesize)) {
                        handlecategory = HandleCategory.resize;
                        result = -1;
                    }
                    break;
                case Key.shift:
                    if (location.Near(Location.Plus(this.rectangle.bottomright, ShapeEdit.resizehandleoffset), handlesize)) {
                        handlecategory = HandleCategory.resize;
                        result = -1;
                    }
                    break;
            }
            callback(result, handlecategory);
        }
        ToSVG(callback) {
            this.canvas.adaptor.ImageRect(this, callback);
        }
        ToPDF(callback) {
            this.canvas.adaptor.ImageRect(this, callback);
        }
    }
    ShapeEdit.ImageRect = ImageRect;
    // Root Shapes
    class Shapes extends BaseShape {
        constructor(canvas, obj) {
            super("Shapes", canvas, obj);
            this.ClearSelected();
        }
        Free() {
            super.Free();
        }
        Clone() {
            return this.CopyContent(new Shapes(this.canvas, {}));
        }
        DrawContent() {
            let context = this.canvas.context;
            try {
                context.save();
                if (this.isSelected) {
                    this.DrawAllHandle();
                }
                if (this.canvas.plugins) {
                    this.canvas.plugins.Exec('draw', this, context);
                }
            }
            finally {
                context.restore();
            }
        }
        SetFillColor(color) {
            this.property.fillstyle = color;
            this.canvas.isdirty = false;
            this.canvas.handlers.Exec('change', this, null);
            //      this.property.fillstyle = color;
            //      this.canvas.handlers.Exec('change', this, null);
            //      this.Shapes().forEach((shape: BaseShape): void => {
            //          shape.SetFillColor(color);
            //      });
        }
        FillColor() {
            return this.property.fillstyle;
        }
        SetStrokeColor(color) {
            this.property.strokestyle = color;
            this.canvas.isdirty = false;
            this.canvas.handlers.Exec('change', this, null);
            //       this.property.strokestyle = color;
            //       this.canvas.handlers.Exec('change', this, null);
            //       this.Shapes().forEach((shape: BaseShape): void => {
            //           shape.SetStrokeColor(color);
            //       });
        }
        StrokeColor() {
            return this.property.strokestyle;
        }
        SetStrokeWidth(width) {
            this.property.strokewidth = width;
            this.canvas.isdirty = false;
            this.canvas.handlers.Exec('change', this, null);
            //       this.property.strokewidth = width;
            //       this.canvas.handlers.Exec('change', this, null);
            //       this.Shapes().forEach((shape: BaseShape): void => {
            //           shape.SetStrokeWidth(width);
            //       });
        }
        StrokeWidth() {
            return this.property.strokewidth;
        }
        Select() {
            super.Select();
            this.Shapes().forEach((shape) => {
                shape.Select();
            });
        }
        Deselect() {
            super.Deselect();
            this.Shapes().forEach((shape) => {
                shape.Deselect();
            });
        }
        Capture() {
            super.Capture();
            this.Shapes().forEach((shape) => {
                shape.Capture();
            });
        }
        Release() {
            super.Release();
            this.Shapes().forEach((shape) => {
                shape.Release();
            });
        }
        Group() {
        }
        Ungroup() {
            if (this.parent) {
                this.Shapes().forEach((shape) => {
                    this.parent.Add(shape);
                });
                this.shapes = [];
            }
        }
        MoveTo(delta) {
            if (this.transform != Transform.deformation) {
                if (this.isSelected) {
                    this.rectangle.location.x += delta.x;
                    this.rectangle.location.y += delta.y;
                    this.canvas.isdirty = false;
                    this.canvas.handlers.Exec('move', this, null);
                    this.Shapes().forEach((shape) => {
                        shape.MoveTo(delta);
                        this.canvas.handlers.Exec('move', shape, null);
                    });
                }
            }
        }
        HitHandles(location, callback) {
            let result = 0;
            let handlecategory = HandleCategory.location;
            let rectangle = this.rectangle;
            switch (this.canvas.modifier) {
                case Key.normal:
                    if (location.Near(rectangle.topleft, handlesize)) {
                        result = 1;
                    }
                    else if (location.Near(rectangle.topright, handlesize)) {
                        result = 3;
                    }
                    else if (location.Near(rectangle.bottomleft, handlesize)) {
                        result = 5;
                    }
                    else if (location.Near(rectangle.bottomright, handlesize)) {
                        result = 7;
                    }
                    else if (location.Near(Location.Plus(rectangle.bottomright, ShapeEdit.resizehandleoffset), handlesize)) {
                        handlecategory = HandleCategory.resize;
                        result = -1;
                    }
                    else if (location.Near(Location.Plus(rectangle.topcenter, ShapeEdit.rotatehandleoffset), handlesize)) {
                        handlecategory = HandleCategory.rotate;
                        result = -1;
                    }
                    break;
                case Key.shift:
                    if (location.Near(Location.Plus(rectangle.bottomright, ShapeEdit.resizehandleoffset), handlesize)) {
                        handlecategory = HandleCategory.resize;
                        result = -1;
                    }
                    else if (location.Near(Location.Plus(rectangle.topcenter, ShapeEdit.rotatehandleoffset), handlesize)) {
                        handlecategory = HandleCategory.rotate;
                        result = -1;
                    }
                    break;
            }
            callback(result, handlecategory);
        }
        HitShapes(location, callback) {
            let stack = [];
            this.Shapes().forEach((shape) => {
                if (shape.Contains(location)) {
                    stack.push(shape);
                }
            });
            stack.reverse();
            if (stack.length > 0) {
                let top_shape = stack[0];
                if (top_shape.type === "Shapes") {
                    top_shape.HitShapes(location, callback);
                }
                callback(top_shape);
            }
        }
        Deformation(delta) {
        }
        Resize(origin, magnify) {
            this.shapes.forEach((shape) => {
                shape.Resize(origin, magnify);
            });
            super.Resize(origin, magnify);
            this.canvas.isdirty = true;
        }
        Rotate(center, degree) {
            this.shapes.forEach((shape) => {
                shape.Rotate(center, degree);
            });
            super.Rotate(center, degree);
            this.canvas.isdirty = true;
        }
        IsRotable() {
            return (_.filter(this.shapes, (shape) => {
                return !shape.IsRotable();
            }).length === 0);
        }
        ResizeRectangle() {
            let x = _.minBy(this.Shapes(), 'rectangle.topleft.x').rectangle.topleft.x;
            let y = _.minBy(this.Shapes(), 'rectangle.topleft.y').rectangle.topleft.y;
            this.rectangle.location.x = x;
            this.rectangle.location.y = y;
            this.rectangle.size.w = _.maxBy(this.Shapes(), 'rectangle.bottomright.x').rectangle.bottomright.x - x;
            this.rectangle.size.h = _.maxBy(this.Shapes(), 'rectangle.bottomright.y').rectangle.bottomright.y - y;
        }
        Location() {
            return this.rectangle.location;
        }
        Size() {
            return this.rectangle.size;
        }
        Contains(location) {
            return (_.filter(this.Shapes(), (shape) => {
                return shape.Contains(location);
            }).length != 0);
        }
        Equals(shape) {
            return this.rectangle.Equals(shape.rectangle);
        }
        Property() {
            return this.property;
        }
        Serialize() {
            let result = "[";
            let dellimitter = "";
            this.Shapes().forEach((shape) => {
                result += dellimitter + shape.Serialize();
                dellimitter = ",";
            });
            return '{"type":"' + this.type + '", "locked":"' + this.locked + '", "rectangle":' + this.rectangle.Serialize() + ', "property":' + this.property.Serialize() + ', "shapes":' + result + ']}';
        }
        getShapeById(id) {
            let result = null;
            if (this.parent) {
                if (id == this.ID()) {
                    result = this;
                }
            }
            this.Shapes().forEach((shape) => {
                result = result || shape.getShapeById(id);
            });
            return result;
        }
        getShapeByType(type, result) {
            if (this.parent) {
                if (this.type == type) {
                    result.push(this);
                }
            }
            this.Shapes().forEach((shape) => {
                shape.getShapeByType(type, result);
            });
        }
        getShapeByTypes(types, result) {
            if (this.parent) {
                if (types.indexOf(this.type) >= 0) {
                    result.push(this);
                }
            }
            this.Shapes().forEach((shape) => {
                shape.getShapeByTypes(types, result);
            });
        }
        ToSVG(callback) {
            this.canvas.adaptor.Shapes(this, callback);
        }
        ToPDF(callback) {
            this.canvas.adaptor.Shapes(this, callback);
        }
        Add(shape) {
            shape.SetParent(this);
            this.Shapes().push(shape);
            if (this.parent) {
                this.ResizeRectangle();
            }
        }
        Remove(shape) {
            _.pull(this.Shapes(), shape);
            if (this.parent) {
                this.ResizeRectangle();
            }
        }
        Draw() {
            this.DrawContent();
            this.Shapes().forEach((shape) => {
                shape.Draw();
            });
        }
        Tick() {
            this.Shapes().forEach((shape) => {
                shape.Tick();
            });
        }
        Each(callback) {
            this.Shapes().forEach(callback);
        }
        ClearSelected() {
            this.Shapes().forEach((shape) => {
                shape.EndDeformation();
                shape.EndResize();
                shape.Deselect();
                shape.Release();
            });
        }
        Selected() {
            return _.filter(this.Shapes(), (shape) => {
                return (shape.IsSelected());
            });
        }
        Pull(callback) {
            //   let result:BaseShape[] = _.filter<BaseShape>(this.Shapes(), (shape:BaseShape):boolean => {
            //       return shape.IsSelected();
            //   });
            let result = this.Selected();
            result.forEach((selected) => {
                callback(selected);
                _.pull(this.Shapes(), selected);
            });
            return result;
        }
        ToTop() {
            _.forEach(this.Pull((shape) => {
            }), (shape) => {
                this.shapes.push(shape);
            });
            this.canvas.isdirty = false;
            this.canvas.handlers.Exec('change', this, null);
        }
        ToBottom() {
            _.forEach(this.Pull((shape) => {
            }), (shape) => {
                this.shapes.unshift(shape);
            });
            this.canvas.isdirty = false;
            this.canvas.handlers.Exec('change', this, null);
        }
        Lock() {
            this.isSelected = false;
            this.locked = true;
            this.Shapes().forEach((shape) => {
                shape.Lock();
            });
        }
        UnLock() {
            this.locked = false;
            this.Shapes().forEach((shape) => {
                shape.UnLock();
            });
        }
        Intersection(rect) {
            return (_.filter(this.shapes, (shape) => {
                return shape.Intersection(rect);
            }).length > 0);
        }
        Clear() {
            delete this.shapes;
            this.shapes = [];
        }
        static Load(canvas, shapes) {
            return new ShapeEdit.Shapes(canvas, shapes);
        }
    }
    ShapeEdit.Shapes = Shapes;
    // Canvas Object
    class Canvas extends Typed {
        constructor(canvas, handlers, plugins, adaptor, editmode) {
            super("Canvas");
            this.canvas = canvas;
            this.context = this.canvas.getContext('2d');
            this.adaptor = adaptor;
            this.handlers = handlers;
            this.plugins = plugins;
            this.mode = Mode.move;
            this.copybuffer = null;
            // this.undobuffer = new Stack<string>(1);
            this.undoheap = null;
            this.isdrag = false;
            this.isdirty = false;
            this.selectrect = null;
            this.newshape = null;
            this.newcurve = null;
            this.modifier = Key.normal;
            if (editmode) {
                this.canvas.style.cursor = "pointer";
                //リサイズなど
                let ModifyShape = (offsetX, offsetY) => {
                    let result = false;
                    this.shapes.Selected().forEach((shape) => {
                        if (!shape.IsLocked()) {
                            shape.HitHandles(new ShapeEdit.Location(offsetX, offsetY), (handle_location, handle_category) => {
                                if (handle_location != 0) {
                                    switch (handle_category) {
                                        case HandleCategory.resize:
                                            shape.BeginResize(handle_location, handle_category); //リサイズ開始
                                            this.canvas.style.cursor = "url('/systems/common/shape_edit/image/scale.png'), auto";
                                            break;
                                        case HandleCategory.rotate:
                                            //   let degree = shape.Degree(shape.rectangle.Center(), new Location(offsetX, offsetY));
                                            let degree = BaseShape.Degree(shape.rectangle.Center(), Location.Plus(shape.rectangle.topcenter, ShapeEdit.rotatehandleoffset));
                                            shape.BeginRotate(handle_location, handle_category, degree); //回転開始
                                            this.canvas.style.cursor = "url('/systems/common/shape_edit/image/blue.png'), auto"; //crosshair
                                            break;
                                        default:
                                            shape.BeginDeformation(handle_location, handle_category); //変形開始
                                            if ((shape.type === "Polygon") || (shape.type === "Bezier")) {
                                                this.canvas.style.cursor = "move";
                                            }
                                            else {
                                                this.SetCursor(handle_location);
                                            }
                                            break;
                                    }
                                    //      this.SavePoint();
                                    result = true;
                                }
                            });
                        }
                    });
                    return result;
                };
                let MoveShape = (offsetX, offsetY) => {
                    let result = false;
                    this.shapes.HitShapes(new ShapeEdit.Location(offsetX, offsetY), (hitshape) => {
                        if (!hitshape.IsLocked()) {
                            this.SavePoint();
                            if (this.modifier != Key.shift) {
                                this.shapes.ClearSelected(); //そうでなければ全てのShapeの選択を解除。
                            }
                            this.shapes.Selected().forEach((selectshape) => {
                                selectshape.Capture(); //キャプチャ
                            });
                            hitshape.Select(); //自分もセレクト
                            hitshape.Capture(); //自分もキャプチャ
                            this.canvas.style.cursor = "move"; //カーソル変えて
                            result = true; //移動開始
                        }
                    });
                    return result;
                };
                let SelectStart = (offsetX, offsetY) => {
                    this.shapes.Shapes().forEach((shape) => {
                        shape.prevlocation.x = offsetX;
                        shape.prevlocation.y = offsetY;
                    });
                    switch (this.Mode) {
                        case Mode.move:
                            if (!ModifyShape(offsetX, offsetY)) {
                                if (!MoveShape(offsetX, offsetY)) {
                                    this.ClearSelected();
                                    this.BeginSelect(offsetX, offsetY);
                                }
                            }
                            break;
                        case Mode.draw:
                            if (!this.newshape) {
                                let property = new ShapeProperty(this, '', [], '', new RGBAColor(255, 255, 255, 1), new RGBAColor(0, 0, 0, 1), 0, new Font("", "", "", 0, "", []), "", "miter", {});
                                this.newshape = new Polygon(this, { property: property });
                                this.newshape.Select();
                            }
                            else {
                                let firstlocation = this.newshape.Vertex().list[0]; // 先頭
                                let lastlocation = new ShapeEdit.Location(offsetX, offsetY); //最後
                                if (firstlocation.Near(lastlocation, handlesize)) {
                                    this.ClosePath();
                                    this.mode = Mode.move;
                                }
                            }
                            break;
                        case Mode.bezierdraw:
                            if (!this.newshape) {
                                let property = new ShapeProperty(this, '', [], '', new RGBAColor(255, 255, 255, 1), new RGBAColor(0, 0, 0, 1), 0, new Font("", "", "", 0, "", []), "", "miter", {});
                                this.newshape = new Bezier(this, { property: property });
                                this.newcurve = new Location(offsetX, offsetY, new ShapeEdit.Location(offsetX, offsetY), new Location(offsetX, offsetY));
                                this.newshape.AddCurveAbsolute(this.newcurve);
                                this.newshape.ResizeRectangle(); //外接四角形のリサイズ
                                this.newshape.Select();
                            }
                            else {
                                let firstlocation = this.newshape.Vertex().list[0]; // 先頭
                                let lastlocation = new ShapeEdit.Location(offsetX, offsetY); //最後
                                if (firstlocation.Near(lastlocation, handlesize)) {
                                    this.ClosePath();
                                    this.mode = Mode.move;
                                }
                                else {
                                    this.newcurve = new ShapeEdit.Location(offsetX, offsetY, new ShapeEdit.Location(offsetX, offsetY), new ShapeEdit.Location(offsetX, offsetY), 1);
                                    this.newshape.AddCurveAbsolute(this.newcurve);
                                    this.newshape.ResizeRectangle(); //外接四角形のリサイズ
                                }
                            }
                            break;
                    }
                };
                let SelectEnd = (offsetX, offsetY) => {
                    this.Draw(() => {
                        switch (this.Mode) {
                            case Mode.move:
                                this.EndSelect();
                                this.shapes.Selected().forEach((shape) => {
                                    if (!shape.IsLocked()) {
                                        switch (shape.Transform()) {
                                            case Transform.deformation:
                                                shape.EndDeformation();
                                                break;
                                            case Transform.resize:
                                                shape.EndResize();
                                                break;
                                            case Transform.rotate:
                                                shape.EndRotate();
                                                break;
                                            case Transform.none:
                                                break;
                                        }
                                        shape.Release();
                                        this.canvas.style.cursor = "pointer";
                                    }
                                });
                                //  this.SavePoint();
                                break;
                            case Mode.draw:
                                if (this.newshape) {
                                    this.newshape.AddVertexAbsolute(new ShapeEdit.Location(offsetX, offsetY));
                                    this.newshape.ResizeRectangle(); //外接四角形のリサイズ
                                }
                                break;
                            case Mode.bezierdraw:
                                this.newcurve = new Location(offsetX, offsetY, new ShapeEdit.Location(offsetX, offsetY), new ShapeEdit.Location(offsetX, offsetY));
                                break;
                        }
                    });
                };
                let DrawPolygon = (offsetX, offsetY) => {
                    let context = this.context;
                    try {
                        context.save();
                        context.beginPath();
                        LineShape.Each(this.newshape.Vertex().list, (vertex) => {
                            context.moveTo(vertex.x, vertex.y);
                        }, (vertex) => {
                            context.lineTo(vertex.x, vertex.y);
                        }, (vertex) => {
                            context.lineTo(vertex.x, vertex.y);
                        });
                        context.lineTo(offsetX, offsetY);
                        context.fillStyle = ShapeEdit.blackcolor; // new RGBAColor(0, 0, 0, 1);
                        context.fill();
                        context.strokeStyle = ShapeEdit.blackcolor; //= new RGBAColor(0, 0, 0, 1);
                        context.lineWidth = 3;
                        context.stroke();
                    }
                    finally {
                        context.restore();
                    }
                };
                let DrawBezier = (offsetX, offsetY, cp0, cp1) => {
                    let vertex = this.newshape.Vertex();
                    let context = this.context;
                    try {
                        context.save();
                        context.beginPath();
                        let startpoint = vertex.list[0];
                        CurveShape.Each(this.newshape.Vertex().list, (curve) => {
                            context.moveTo(curve.x, curve.y);
                            startpoint = curve;
                        }, (curve) => {
                            context.bezierCurveTo(curve.controlPoint0.x, curve.controlPoint0.y, curve.controlPoint1.x, curve.controlPoint1.y, curve.x, curve.y);
                        }, (curve) => {
                            context.bezierCurveTo(curve.controlPoint0.x, curve.controlPoint0.y, curve.controlPoint1.x, curve.controlPoint1.y, curve.x, curve.y);
                        });
                        context.bezierCurveTo(cp0.x, cp0.y, cp1.x, cp1.y, offsetX, offsetY);
                        context.fillStyle = ShapeEdit.blackcolor; // new RGBAColor(0, 0, 0, 1);
                        context.fill();
                        context.strokeStyle = ShapeEdit.blackcolor; //new RGBAColor(0, 0, 0, 1);
                        context.lineWidth = 3;
                        context.stroke();
                    }
                    finally {
                        context.restore();
                    }
                };
                let onDown = (e) => {
                    this.isdrag = true;
                    SelectStart(e.offsetX, e.offsetY);
                };
                let onUp = (e) => {
                    SelectEnd(e.offsetX, e.offsetY);
                    this.isdrag = false;
                };
                let onMove = (e) => {
                    this.Draw(() => {
                        switch (this.Mode) {
                            case Mode.move:
                                this.LassoSelect(e.offsetX, e.offsetY);
                                this.shapes.Selected().forEach((shape) => {
                                    if (!shape.IsLocked()) {
                                        switch (shape.Transform()) {
                                            case Transform.deformation:
                                                shape.Deformation(new ShapeEdit.Location(e.offsetX - shape.prevlocation.x, e.offsetY - shape.prevlocation.y));
                                                shape.prevlocation.x = e.offsetX;
                                                shape.prevlocation.y = e.offsetY;
                                                break;
                                            case Transform.resize:
                                                let magnifyw = (e.offsetX - shape.rectangle.location.x - ShapeEdit.resizehandleoffset.x) / (shape.rectangle.bottomright.x - shape.rectangle.location.x);
                                                let magnifyh = (e.offsetY - shape.rectangle.location.y - ShapeEdit.resizehandleoffset.y) / (shape.rectangle.bottomright.y - shape.rectangle.location.y);
                                                if ((magnifyw > 0) && (magnifyh > 0)) {
                                                    if (this.modifier === Key.shift) {
                                                        magnifyw = Math.max(magnifyw, magnifyh);
                                                        magnifyh = magnifyw;
                                                    }
                                                    shape.Resize(shape.rectangle.location, new Size(magnifyw, magnifyh));
                                                    this.isdirty = true;
                                                }
                                                break;
                                            case Transform.rotate:
                                                if (shape.IsRotable()) {
                                                    let context = this.context;
                                                    try {
                                                        context.save();
                                                        context.beginPath();
                                                        context.moveTo(shape.center.x, shape.center.y);
                                                        context.lineTo(e.offsetX, e.offsetY);
                                                        context.strokeStyle = ShapeEdit.guidelinecolor.Lighten(50).RGB();
                                                        context.lineWidth = 1;
                                                        context.stroke();
                                                    }
                                                    finally {
                                                        context.restore();
                                                    }
                                                    let current = null;
                                                    if (this.modifier === Key.shift) {
                                                        current = BaseShape.Degree(shape.center, new ShapeEdit.Location(e.offsetX, e.offsetY));
                                                    }
                                                    else {
                                                        current = Math.round(Math.round(Math.round(BaseShape.Degree(shape.center, new ShapeEdit.Location(e.offsetX, e.offsetY))) / 15) * 15);
                                                    }
                                                    shape.Rotate(shape.center, current - shape.degree);
                                                    shape.degree = current;
                                                }
                                                break;
                                            default:
                                                if (shape.IsCapture()) {
                                                    shape.MoveTo(new ShapeEdit.Location(e.offsetX - shape.prevlocation.x, e.offsetY - shape.prevlocation.y));
                                                    shape.prevlocation.x = e.offsetX;
                                                    shape.prevlocation.y = e.offsetY;
                                                    this.DrawGrid(shape);
                                                }
                                                break;
                                        }
                                    }
                                });
                                break;
                            case Mode.draw:
                                if (this.newshape) {
                                    DrawPolygon(e.offsetX, e.offsetY);
                                }
                                break;
                            case Mode.bezierdraw:
                                if (this.newshape) {
                                    if (this.newcurve) {
                                        let curve = this.newcurve;
                                        if (this.isdrag) {
                                            curve.controlPoint0.x = curve.x;
                                            curve.controlPoint0.y = curve.y;
                                            curve.controlPoint1.x = curve.x;
                                            curve.controlPoint1.y = curve.y;
                                            DrawBezier(curve.x, curve.y, curve.controlPoint0, curve.controlPoint1);
                                        }
                                        else {
                                            curve.x = e.offsetX;
                                            curve.y = e.offsetY;
                                            curve.controlPoint0.x = curve.x;
                                            curve.controlPoint0.y = curve.y;
                                            curve.controlPoint1.x = curve.x;
                                            curve.controlPoint1.y = curve.y;
                                            DrawBezier(curve.x, curve.y, curve.controlPoint0, curve.controlPoint1);
                                            this.newshape.DrawAllHandle();
                                        }
                                    }
                                }
                                break;
                            default:
                                let a = 1;
                                break;
                        }
                    });
                };
                let onContextMenu = (e) => {
                    this.shapes.Selected().forEach((shape) => {
                        this.handlers.Exec('contextmenu', shape, e);
                    });
                };
                /////// todo
                let onTouchStart = (e) => {
                    _.forEach(e.changedTouches, (t) => {
                        let pointx = t.pageX - this.canvas.offsetLeft;
                        let pointy = t.pageY - this.canvas.offsetTop;
                        SelectStart(pointx, pointy);
                    });
                };
                let onTouchEnd = (e) => {
                    _.forEach(e.changedTouches, (t) => {
                        let pointx = t.pageX - this.canvas.offsetLeft;
                        let pointy = t.pageY - this.canvas.offsetTop;
                        SelectEnd(pointx, pointy);
                    });
                };
                let onTouchMove = (e) => {
                    _.forEach(e.changedTouches, (t) => {
                        let pointx = t.pageX - this.canvas.offsetLeft;
                        let pointy = t.pageY - this.canvas.offsetTop;
                        this.Draw(() => {
                            switch (this.Mode) {
                                case Mode.move:
                                    this.LassoSelect(pointx, pointy);
                                    this.shapes.Selected().forEach((shape) => {
                                        if (!shape.IsLocked()) {
                                            switch (shape.Transform()) {
                                                case Transform.deformation:
                                                    shape.Deformation(new ShapeEdit.Location(pointx - shape.prevlocation.x, pointy - shape.prevlocation.y));
                                                    shape.prevlocation.x = pointx;
                                                    shape.prevlocation.y = pointy;
                                                    break;
                                                case Transform.resize:
                                                    let magnifyw = (pointx - shape.rectangle.location.x) / (shape.rectangle.bottomright.x - shape.rectangle.location.x);
                                                    let magnifyh = (pointy - shape.rectangle.location.y) / (shape.rectangle.bottomright.y - shape.rectangle.location.y);
                                                    if ((magnifyw > 0) && (magnifyh > 0)) {
                                                        shape.Resize(shape.rectangle.location, new Size(magnifyw, magnifyh));
                                                        this.isdirty = true;
                                                    }
                                                    break;
                                                case Transform.rotate:
                                                    if (shape.IsRotable()) {
                                                        let context = this.context;
                                                        try {
                                                            context.save();
                                                            context.beginPath();
                                                            context.moveTo(shape.center.x, shape.center.y);
                                                            context.lineTo(pointx, pointy);
                                                            context.strokeStyle = ShapeEdit.guidelinecolor.Lighten(50).RGB();
                                                            context.lineWidth = 1;
                                                            context.stroke();
                                                        }
                                                        finally {
                                                            context.restore();
                                                        }
                                                        let current = null;
                                                        if (this.modifier === Key.shift) {
                                                            current = BaseShape.Degree(shape.center, new ShapeEdit.Location(pointx, pointy));
                                                        }
                                                        else {
                                                            current = Math.round(Math.round(Math.round(BaseShape.Degree(shape.center, new ShapeEdit.Location(pointx, pointy))) / 15) * 15);
                                                        }
                                                        shape.Rotate(shape.center, current - shape.degree);
                                                        shape.degree = current;
                                                    }
                                                    break;
                                                default:
                                                    if (shape.IsCapture()) {
                                                        shape.MoveTo(new ShapeEdit.Location(pointx - shape.prevlocation.x, pointy - shape.prevlocation.y));
                                                        shape.prevlocation.x = pointx;
                                                        shape.prevlocation.y = pointy;
                                                        this.DrawGrid(shape);
                                                    }
                                                    break;
                                            }
                                        }
                                    });
                                    break;
                                case Mode.draw:
                                    if (this.newshape) {
                                        DrawPolygon(pointx, pointy);
                                    }
                                    break;
                                case Mode.bezierdraw:
                                    if (this.newshape) {
                                        if (this.newcurve) {
                                            if (this.isdrag) {
                                                this.newcurve.controlPoint1.x = pointx - this.newcurve.x;
                                                this.newcurve.controlPoint1.y = pointy - this.newcurve.y;
                                                this.newcurve.controlPoint0.x = pointx;
                                                this.newcurve.controlPoint0.y = pointy;
                                                DrawBezier(this.newcurve.x, this.newcurve.y, this.newcurve.controlPoint0, this.newcurve.controlPoint1);
                                            }
                                            else {
                                                this.newcurve.x = pointx;
                                                this.newcurve.y = pointy;
                                                this.newcurve.controlPoint0.x = pointx;
                                                this.newcurve.controlPoint0.y = pointy;
                                                this.newcurve.controlPoint1.x = pointx;
                                                this.newcurve.controlPoint1.y = pointy;
                                                DrawBezier(this.newcurve.x, this.newcurve.y, this.newcurve.controlPoint0, this.newcurve.controlPoint1);
                                                //     DrawBezier(this.newcurve.x, this.newcurve.y, this.newcurve.controlPoint0, lastcurve.controlPoint1);
                                                this.newshape.DrawAllHandle();
                                            }
                                        }
                                    }
                                    break;
                            }
                        });
                    });
                };
                /////// todo
                this.canvas.addEventListener("dragover", (e) => {
                    if (e.preventDefault) {
                        e.preventDefault();
                    }
                    return false;
                }, false);
                this.canvas.addEventListener("dragenter", (e) => {
                    if (e.preventDefault) {
                        e.preventDefault();
                    }
                    return false;
                }, false);
                this.canvas.addEventListener("drop", (e) => {
                    this.handlers.Exec('drop', null, e);
                    if (e.preventDefault) {
                        e.preventDefault();
                    }
                    return false;
                }, false);
                this.canvas.addEventListener("click", (e) => {
                    this.handlers.Exec('click', this.shapes, e);
                }, false);
                this.canvas.addEventListener("dblclick", () => {
                }, false);
                this.canvas.addEventListener("contextmenu", onContextMenu, false);
                this.canvas.addEventListener("mouseout", () => {
                }, false);
                this.canvas.addEventListener("mouseover", () => {
                }, false);
                this.canvas.addEventListener("mousedown", onDown, false);
                this.canvas.addEventListener("mouseup", onUp, false);
                this.canvas.addEventListener("mousemove", onMove, false);
                if (!server) {
                    if (window.TouchEvent) {
                        this.canvas.addEventListener("touchstart", onTouchStart, false); // touchstart – to toggle drawing mode “on”
                        this.canvas.addEventListener("touchend", onTouchEnd, false); // touchend – to toggle drawing mode “off”
                        this.canvas.addEventListener("touchmove", onTouchMove, false); // touchmove – to track finger position, used in drawing
                    }
                }
                this.canvas.addEventListener("DOMMouseScroll", () => {
                }, false);
                this.canvas.addEventListener("mousewheel", () => {
                }, false);
            }
            else {
                this.canvas.addEventListener("click", (e) => {
                    this.handlers.Exec('click', this.shapes, e);
                }, false);
                this.canvas.addEventListener("mousedown", (e) => {
                }, false);
                this.canvas.addEventListener("mouseup", (e) => {
                }, false);
                this.canvas.addEventListener("mousemove", (e) => {
                }, false);
                if (!server) {
                    if (window.TouchEvent) {
                        this.canvas.addEventListener("touchstart", (e) => {
                            this.shapes.HitShapes(new ShapeEdit.Location(e.offsetX, e.offsetY), (hitshape) => {
                                this.handlers.Exec('click', hitshape, null);
                            });
                        }, false); // touchstart – to toggle drawing mode “on”
                        this.canvas.addEventListener("touchend", (e) => {
                            this.shapes.HitShapes(new ShapeEdit.Location(e.offsetX, e.offsetY), (hitshape) => {
                                this.handlers.Exec('click', hitshape, null);
                            });
                        }, false); // touchend – to toggle drawing mode “off”
                        this.canvas.addEventListener("touchmove", (e) => {
                            this.shapes.HitShapes(new ShapeEdit.Location(e.offsetX, e.offsetY), (hitshape) => {
                                this.handlers.Exec('click', hitshape, null);
                            });
                        }, false); // touchmove – to track finger position, used in drawing
                    }
                }
            }
            if (!server) {
                let devicePixelRatio = window.devicePixelRatio || 1;
                let backingStorePixelRatio = this.context.webkitBackingStorePixelRatio
                    || this.context.mozBackingStorePixelRatio
                    || this.context.msBackingStorePixelRatio
                    || this.context.oBackingStorePixelRatio
                    || this.context.backingStorePixelRatio
                    || 1;
                this.pixelRatio = 1; // devicePixelRatio / backingStorePixelRatio;
                let requestAnimationFrame = window.requestAnimationFrame ||
                    window.mozRequestAnimationFrame ||
                    window.webkitRequestAnimationFrame ||
                    window.msRequestAnimationFrame;
                window.requestAnimationFrame = requestAnimationFrame;
            }
            this.shapes = new Shapes(this, {});
            this.shapes.SetParent(null);
        }
        get Mode() {
            return this.mode;
        }
        static Grid(n) {
            return Math.round(n / ShapeEdit.gridsize) * ShapeEdit.gridsize;
        }
        Free() {
            super.Free();
        }
        BeginSelect(x, y) {
            this.selectrect = new ShapeEdit.Rectangle(x, y, 0, 0);
        }
        LassoSelect(x, y) {
            if (this.selectrect) {
                this.selectrect.size._w = x - this.selectrect.location.x;
                this.selectrect.size._h = y - this.selectrect.location.y;
                // todo: リファクタ
                let context = this.context;
                try {
                    context.save();
                    context.beginPath();
                    context.rect(this.selectrect.location.x, this.selectrect.location.y, this.selectrect.size._w, this.selectrect.size._h);
                    context.strokeStyle = ShapeEdit.guidelinecolor.RGB();
                    context.lineWidth = 1;
                    context.stroke();
                }
                finally {
                    context.restore();
                }
                this.shapes.Shapes().forEach((shape) => {
                    if (!shape.IsLocked()) {
                        if (shape.Intersection(this.selectrect)) {
                            shape.Select();
                        }
                        else {
                            shape.Deselect();
                        }
                    }
                });
            }
        }
        EndSelect() {
            this.selectrect = null;
        }
        ClosePath() {
            this.handlers.Exec('new', this.newshape, null);
            this.Add(this.newshape);
            this.newshape = null;
            this.newcurve = null;
        }
        DrawGrid(selected_shape) {
            this.shapes.Each((compareshape) => {
                if (selected_shape != compareshape) {
                    let lines = selected_shape.Equals(compareshape);
                    _.forEach(lines[0], (line) => {
                        if (line != 0) {
                            this.VLine(line);
                        }
                    });
                    _.forEach(lines[1], (line) => {
                        if (line != 0) {
                            this.HLine(line);
                        }
                    });
                }
            });
        }
        HLine(y) {
            try {
                this.context.save();
                this.context.beginPath();
                this.context.moveTo(0, y);
                this.context.lineTo(this.canvas.width, y);
                this.context.strokeStyle = ShapeEdit.guidelinecolor.RGBA();
                this.context.lineWidth = 1;
                this.context.stroke();
            }
            finally {
                this.context.restore();
            }
        }
        VLine(x) {
            try {
                this.context.save();
                this.context.beginPath();
                this.context.moveTo(x, 0);
                this.context.lineTo(x, this.canvas.height);
                this.context.strokeStyle = ShapeEdit.guidelinecolor.RGBA();
                this.context.lineWidth = 1;
                this.context.stroke();
            }
            finally {
                this.context.restore();
            }
        }
        SetCursor(handle_location) {
            switch (handle_location) {
                case 1:
                    this.canvas.style.cursor = "nw-resize"; //   左上リサイズ
                    break;
                case 2:
                    this.canvas.style.cursor = "n-resize"; //		上リサイズ
                    break;
                case 3:
                    this.canvas.style.cursor = "ne-resize"; //		右上リサイズ
                    break;
                case 4:
                    this.canvas.style.cursor = "e-resize"; //		右リサイズ
                    break;
                case 5:
                    this.canvas.style.cursor = "se-resize"; //		右下リサイズ
                    break;
                case 6:
                    this.canvas.style.cursor = "s-resize"; //		下リサイズ
                    break;
                case 7:
                    this.canvas.style.cursor = "sw-resize"; //	左下リサイズ
                    break;
                case 8:
                    this.canvas.style.cursor = "w-resize"; //		左リサイズ
                    break;
                default:
                    break;
            }
        }
        Exception(e) {
        }
        ClearSelected() {
            this.shapes.ClearSelected();
        }
        SetMode(mode) {
            try {
                if (mode != Mode.draw) {
                    if (this.newshape) {
                        this.ClosePath();
                    }
                }
                this.ClearSelected();
                this.mode = mode;
            }
            catch (e) {
                this.Exception(e);
            }
        }
        ToTop() {
            try {
                this.Draw(() => {
                    this.shapes.ToTop();
                });
            }
            catch (e) {
                this.Exception(e);
            }
        }
        ToBottom() {
            try {
                this.Draw(() => {
                    this.shapes.ToBottom();
                });
            }
            catch (e) {
                this.Exception(e);
            }
        }
        Selected() {
            return this.shapes.Selected();
        }
        Add(shape) {
            try {
                this.Draw(() => {
                    this.shapes.Add(shape);
                    shape.ResizeRectangle(); //外接四角形のリサイズ
                });
                this.canvas.isdirty = false;
                this.handlers.Exec('new', shape, null);
                this.handlers.Exec('change', shape, null);
            }
            catch (e) {
                this.Exception(e);
            }
        }
        DeleteSelected() {
            try {
                this.Draw(() => {
                    if (this.Selected().length > 0) {
                        this.shapes.Pull((shape) => {
                            this.handlers.Exec('delete', shape, null);
                        });
                        this.canvas.isdirty = false;
                    }
                });
            }
            catch (e) {
                this.Exception(e);
            }
        }
        Lock() {
            try {
                this.Draw(() => {
                    this.Selected().forEach((shape) => {
                        shape.Lock();
                    });
                });
            }
            catch (e) {
                this.Exception(e);
            }
        }
        UnLockAll() {
            try {
                this.shapes.UnLock();
            }
            catch (e) {
                this.Exception(e);
            }
        }
        Group() {
            try {
                this.Draw(() => {
                    if (this.Selected().length > 1) {
                        let subgroup = new Shapes(this, {});
                        this.shapes.Add(subgroup); // add subgroup root
                        this.Selected().forEach((shape) => {
                            subgroup.Release();
                            subgroup.Add(shape); // add to subgroup
                        });
                        subgroup.Shapes().forEach((shape) => {
                            this.shapes.Remove(shape); //remove subgrouped member
                        });
                        this.canvas.isdirty = false;
                        this.handlers.Exec('new', subgroup, null);
                        subgroup.Select();
                    }
                });
            }
            catch (e) {
                this.Exception(e);
            }
        }
        Ungroup() {
            try {
                this.Draw(() => {
                    this.Selected().forEach((shape) => {
                        shape.Ungroup(); // move group member to parent
                        if (shape.type === "Shapes") {
                            if (shape.Shapes().length === 0) {
                                this.canvas.isdirty = false;
                                this.handlers.Exec('delete', shape, null);
                                this.shapes.Remove(shape); // remove group root;
                            }
                        }
                    });
                });
            }
            catch (e) {
                this.Exception(e);
            }
        }
        Copy() {
            try {
                this.Draw(() => {
                    _.forEach(this.Selected(), (shape) => {
                        this.copybuffer = shape.Clone();
                    });
                });
            }
            catch (e) {
                this.Exception(e);
            }
        }
        Paste() {
            try {
                this.Draw(() => {
                    if (this.copybuffer) {
                        this.Add(this.copybuffer.Clone());
                        this.canvas.isdirty = false;
                        this.handlers.Exec('change', this.copybuffer, null);
                        this.copybuffer = null;
                    }
                });
            }
            catch (e) {
                this.Exception(e);
            }
        }
        onKeyDown(e) {
            if (e.altKey) {
                switch (e.keyCode) {
                    case 67:
                        this.Copy();
                        break;
                    case 86:
                        this.Paste();
                        break;
                    case 71:
                        this.Group();
                        break;
                    default:
                }
            }
            else {
                this.modifier = Key.normal;
                if (e.shiftKey) {
                    this.modifier = Key.shift;
                }
                this.Draw(() => {
                    switch (this.Mode) {
                        case Mode.move:
                            if (this.shapes.Selected().length > 0) {
                                this.shapes.Selected().forEach((shape) => {
                                    if (!shape.IsLocked()) {
                                        this.handlers.Exec('keydown', shape, e);
                                        this.DrawGrid(shape);
                                        if (this.modifier) {
                                            switch (e.key) {
                                                case "ArrowDown":
                                                    shape.MoveTo(new ShapeEdit.Location(0, ShapeEdit.gridsize));
                                                    e.returnValue = false;
                                                    break;
                                                case "ArrowUp":
                                                    shape.MoveTo(new ShapeEdit.Location(0, -ShapeEdit.gridsize));
                                                    e.returnValue = false;
                                                    break;
                                                case "ArrowRight":
                                                    shape.MoveTo(new ShapeEdit.Location(ShapeEdit.gridsize, 0));
                                                    e.returnValue = false;
                                                    break;
                                                case "ArrowLeft":
                                                    shape.MoveTo(new ShapeEdit.Location(-ShapeEdit.gridsize, 0));
                                                    e.returnValue = false;
                                                    break;
                                                default:
                                            }
                                        }
                                    }
                                });
                            }
                            else {
                                this.handlers.Exec('keydown', null, e);
                            }
                            break;
                        case Mode.draw:
                            break;
                        case Mode.bezierdraw:
                            break;
                    }
                });
            }
        }
        ;
        onKeyUp(e) {
            this.modifier = Key.normal;
            this.Draw(() => {
                this.shapes.Selected().forEach((shape) => {
                    this.handlers.Exec('keyup', shape, e);
                });
            });
        }
        ;
        SetCurrentLocation(new_location) {
            try {
                this.Draw(() => {
                    this.Selected().forEach((shape) => {
                        let current_location = shape.Location();
                        current_location.x = new_location.x;
                        current_location.y = new_location.y;
                        shape.ResizeRectangle();
                    });
                });
            }
            catch (e) {
                this.Exception(e);
            }
        }
        CurrentLocation() {
            let result;
            if (this.Selected().length > 0) {
                result = this.Selected()[0].Location();
            }
            return result;
        }
        SetCurrentSize(new_size) {
            try {
                this.Draw(() => {
                    this.Selected().forEach((shape) => {
                        let current_size = shape.Size();
                        current_size.w = new_size.w;
                        current_size.h = new_size.h;
                        shape.ResizeRectangle();
                    });
                });
            }
            catch (e) {
                this.Exception(e);
            }
        }
        CurrentSize() {
            let result;
            if (this.Selected().length > 0) {
                result = this.Selected()[0].Size();
            }
            return result;
        }
        SetCurrentFillColor(color) {
            try {
                this.Draw(() => {
                    this.Selected().forEach((shape) => {
                        shape.SetFillColor(color);
                    });
                });
            }
            catch (e) {
                this.Exception(e);
            }
        }
        CurrentFillColor() {
            let result = new RGBAColor(0, 0, 0, 1);
            if (this.Selected().length > 0) {
                result = this.Selected()[0].FillColor();
            }
            return result;
        }
        SetCurrentStrokeColor(color) {
            try {
                this.Draw(() => {
                    this.Selected().forEach((shape) => {
                        shape.SetStrokeColor(color);
                    });
                });
            }
            catch (e) {
                this.Exception(e);
            }
        }
        CurrentStrokeColor() {
            let result = new RGBAColor(0, 0, 0, 1);
            if (this.Selected().length > 0) {
                result = this.Selected()[0].StrokeColor();
            }
            return result;
        }
        SetCurrentStrokeWidth(width) {
            try {
                this.Draw(() => {
                    this.Selected().forEach((shape) => {
                        shape.SetStrokeWidth(width);
                    });
                });
            }
            catch (e) {
                this.Exception(e);
            }
        }
        CurrentStrokeWidth() {
            let result = 0;
            if (this.Selected().length > 0) {
                result = this.Selected()[0].StrokeWidth();
            }
            return result;
        }
        SetCurrentFontStyle(style) {
            try {
                this.Draw(() => {
                    this.Selected().forEach((shape) => {
                        shape.SetFontStyle(style);
                    });
                });
            }
            catch (e) {
                this.Exception(e);
            }
        }
        CurrentFontStyle() {
            let result = "";
            if (this.Selected().length > 0) {
                result = this.Selected()[0].FontStyle();
            }
            return result;
        }
        SetCurrentFontVariant(variant) {
            try {
                this.Draw(() => {
                    this.Selected().forEach((shape) => {
                        shape.SetFontVariant(variant);
                    });
                });
            }
            catch (e) {
                this.Exception(e);
            }
        }
        CurrentFontVariant() {
            let result = "";
            if (this.Selected().length > 0) {
                result = this.Selected()[0].FontVariant();
            }
            return result;
        }
        SetCurrentFontWeight(weight) {
            try {
                this.Draw(() => {
                    this.Selected().forEach((shape) => {
                        shape.SetFontWeight(weight);
                    });
                });
            }
            catch (e) {
                this.Exception(e);
            }
        }
        CurrentFontWeight() {
            let result = "";
            if (this.Selected().length > 0) {
                result = this.Selected()[0].FontWeight();
            }
            return result;
        }
        SetCurrentFontSize(size) {
            try {
                this.Draw(() => {
                    this.Selected().forEach((shape) => {
                        shape.SetFontSize(size);
                    });
                });
            }
            catch (e) {
                this.Exception(e);
            }
        }
        CurrentFontSize() {
            let result = 10;
            if (this.Selected().length > 0) {
                result = this.Selected()[0].FontSize();
            }
            return result;
        }
        SetCurrentFontKeyword(keyword) {
            try {
                this.Draw(() => {
                    this.Selected().forEach((shape) => {
                        shape.SetFontKeyword(keyword);
                    });
                });
            }
            catch (e) {
                this.Exception(e);
            }
        }
        CurrentFontKeyword() {
            let result = "";
            if (this.Selected().length > 0) {
                result = this.Selected()[0].FontKeyword();
            }
            return result;
        }
        SetCurrentFontFamily(family) {
            try {
                this.Draw(() => {
                    this.Selected().forEach((shape) => {
                        shape.SetFontFamily(family);
                    });
                });
            }
            catch (e) {
                this.Exception(e);
            }
        }
        CurrentFontFamily() {
            let result = [];
            if (this.Selected().length > 0) {
                result = this.Selected()[0].FontFamily();
            }
            return result;
        }
        SetCurrentPath(path) {
            try {
                this.Draw(() => {
                    this.Selected().forEach((shape) => {
                        shape.SetPath(path);
                    });
                });
            }
            catch (e) {
                this.Exception(e);
            }
        }
        CurrentPath() {
            let result = "";
            if (this.Selected().length > 0) {
                result = this.Selected()[0].Path();
            }
            return result;
        }
        SetCurrentAlign(align) {
            try {
                this.Draw(() => {
                    this.Selected().forEach((shape) => {
                        shape.SetAlign(align);
                    });
                });
            }
            catch (e) {
                this.Exception(e);
            }
        }
        CurrentAlign() {
            let result = "";
            if (this.Selected().length > 0) {
                result = this.Selected()[0].Align();
            }
            return result;
        }
        SetCurrentText(text) {
            try {
                this.Draw(() => {
                    this.Selected().forEach((shape) => {
                        shape.SetText(text);
                    });
                });
            }
            catch (e) {
                this.Exception(e);
            }
        }
        CurrentText() {
            let result = "";
            if (this.Selected().length > 0) {
                result = this.Selected()[0].Text();
            }
            return result;
        }
        CurrentType() {
            let result = "";
            if (this.Selected().length > 0) {
                result = this.Selected()[0].type;
            }
            return result;
        }
        SetCurrentShapesAlign(align) {
            try {
                this.Draw(() => {
                    switch (align) {
                        case 0:
                            {
                                let rectangle = _.minBy(this.Selected(), 'rectangle.topleft.y').rectangle;
                                this.Selected().forEach((shape) => {
                                    shape.MoveTo(new ShapeEdit.Location(0, rectangle.topleft.y - shape.rectangle.topleft.y));
                                });
                            }
                            break;
                        case 1:
                            {
                                let rectangle = _.maxBy(this.Selected(), 'rectangle.topright.x').rectangle;
                                this.Selected().forEach((shape) => {
                                    shape.MoveTo(new ShapeEdit.Location(rectangle.topright.x - shape.rectangle.topright.x, 0));
                                });
                            }
                            break;
                        case 2:
                            {
                                let rectangle = _.maxBy(this.Selected(), 'rectangle.bottomright.y').rectangle;
                                this.Selected().forEach((shape) => {
                                    shape.MoveTo(new ShapeEdit.Location(0, rectangle.bottomright.y - shape.rectangle.bottomright.y));
                                });
                            }
                            break;
                        case 3:
                            {
                                let rectangle = _.minBy(this.Selected(), 'rectangle.bottomleft.x').rectangle;
                                this.Selected().forEach((shape) => {
                                    shape.MoveTo(new ShapeEdit.Location(rectangle.bottomleft.x - shape.rectangle.bottomleft.x, 0));
                                });
                            }
                            break;
                        case 4:
                            {
                                let rectangle = _.minBy(this.Selected(), 'rectangle.bottomleft.y').rectangle;
                                this.Selected().forEach((shape) => {
                                    if (rectangle != shape.rectangle) {
                                        shape.MoveTo(new ShapeEdit.Location(0, rectangle.bottomleft.y - shape.rectangle.topleft.y));
                                    }
                                });
                            }
                            break;
                        case 5:
                            {
                                let rectangle = _.minBy(this.Selected(), 'rectangle.bottomright.x').rectangle;
                                this.Selected().forEach((shape) => {
                                    if (rectangle != shape.rectangle) {
                                        shape.MoveTo(new ShapeEdit.Location(rectangle.bottomright.x - shape.rectangle.topleft.x, 0));
                                    }
                                });
                            }
                            break;
                        case 6:
                            {
                                let rectangle = _.maxBy(this.Selected(), 'rectangle.topright.y').rectangle;
                                this.Selected().forEach((shape) => {
                                    if (rectangle != shape.rectangle) {
                                        shape.MoveTo(new ShapeEdit.Location(0, rectangle.topright.y - shape.rectangle.bottomleft.y));
                                    }
                                });
                            }
                            break;
                        case 7:
                            {
                                let rectangle = _.maxBy(this.Selected(), 'rectangle.topleft.x').rectangle;
                                this.Selected().forEach((shape) => {
                                    if (rectangle != shape.rectangle) {
                                        shape.MoveTo(new ShapeEdit.Location(rectangle.topleft.x - shape.rectangle.topright.x, 0));
                                    }
                                });
                            }
                            break;
                    }
                });
            }
            catch (e) {
                this.Exception(e);
            }
        }
        DeselectAll() {
            this.Draw(() => {
                this.shapes.Deselect();
            });
        }
        Clear() {
            try {
                this.Draw(() => {
                    this.shapes.Clear();
                });
            }
            catch (e) {
                this.Exception(e);
            }
        }
        Snap(callback = null) {
            this.context.fillStyle = '#ffffff';
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
            if (callback) {
                callback();
            }
            if (this.canvas.plugins) {
                this.plugins.Exec('draw', this.shapes, null);
            }
            if (this.shapes) {
                this.shapes.Draw();
            }
            if (this.newshape) {
                this.newshape.Draw();
            }
        }
        Draw(callback = null) {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            if (callback) {
                callback();
            }
            if (this.canvas.plugins) {
                this.plugins.Exec('draw', this.shapes, null);
            }
            if (this.shapes) {
                this.shapes.Draw();
            }
            if (this.newshape) {
                this.newshape.Draw();
            }
        }
        Tick() {
            this.shapes.Tick();
            this.Draw();
        }
        Animate() {
            if (!server) {
                let loop = () => {
                    window.requestAnimationFrame(loop);
                    this.Tick();
                };
                loop();
            }
        }
        Undo() {
            try {
                if (this.undoheap != null) {
                    this.Draw(() => {
                        this.shapes = this.undoheap;
                        this.undoheap = null;
                    });
                }
            }
            catch (e) {
                this.Exception(e);
            }
        }
        SavePoint() {
            this.undoheap = null;
            this.undoheap = _.cloneDeep(this.shapes);
        }
        IsUndoable() {
            return (this.undoheap != null);
            //   return (this.undobuffer.Count() > 0);
        }
        IsPastable() {
            return (this.copybuffer != null);
        }
        SelectedCount() {
            return this.shapes.Selected().length;
        }
        static Serialize(canvas) {
            let result = "";
            try {
                result = '{"type":"' + canvas.type + '", "shapes":' + canvas.shapes.Serialize() + ', "width":' + canvas.canvas.width + ', "height":' + canvas.canvas.height + '}';
            }
            catch (e) {
                let a = e;
            }
            return result;
        }
        Resize(x, y) {
        }
        ToSVG(callback) {
            this.adaptor.Canvas(this, callback);
        }
        ToPDF(callback) {
            this.adaptor.Canvas(this, callback);
        }
        static Load(canvas, data, handlers) {
            let result = null;
            try {
                canvas.Clear();
                canvas.canvas.style.width = data.width + "px";
                canvas.canvas.style.height = data.height + "px";
                canvas.shapes = Shapes.Load(canvas, data.shapes);
                result = canvas;
            }
            catch (e) {
            }
            return result;
        }
        static Save(canvas) {
            let result = {};
            try {
                result = {
                    type: canvas.type,
                    shapes: canvas.shapes,
                    width: canvas.canvas.width,
                    height: canvas.canvas.height
                };
            }
            catch (e) {
                let a = e;
            }
            return result;
        }
    }
    ShapeEdit.Canvas = Canvas;
})(ShapeEdit || (ShapeEdit = {}));
if (server) {
    module.exports = ShapeEdit;
}
//# sourceMappingURL=shape_edit.js.map