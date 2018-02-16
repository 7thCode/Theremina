/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var server = (typeof window === 'undefined');
var Server;
(function (Server) {
    var Context = /** @class */ (function () {
        function Context() {
            this.webkitBackingStorePixelRatio = 1;
            this.mozBackingStorePixelRatio = 1;
            this.msBackingStorePixelRatio = 1;
            this.oBackingStorePixelRatio = 1;
            this.backingStorePixelRatio = 1;
        }
        Context.prototype.scale = function (a, b) {
        };
        Context.prototype.clearRect = function (x, y, width, height) {
        };
        Context.prototype.beginPath = function () {
        };
        Context.prototype.stroke = function () {
        };
        Context.prototype.rect = function (x, y, w, h) {
        };
        Context.prototype.ellipse = function (cx, cy, rx, ry, a, b, c, d) {
        };
        Context.prototype.drawImage = function (image, x, y, w, h) {
        };
        Context.prototype.fill = function () {
        };
        Context.prototype.save = function () {
        };
        Context.prototype.restore = function () {
        };
        Context.prototype.measureText = function (s) {
            return { width: 10 };
        };
        Context.prototype.fillText = function (Line, x, y) {
        };
        Context.prototype.moveTo = function (x, y) {
        };
        Context.prototype.lineTo = function (x, y) {
        };
        return Context;
    }());
    Server.Context = Context;
    var Style = /** @class */ (function () {
        function Style() {
        }
        return Style;
    }());
    Server.Style = Style;
    var StubCanvas = /** @class */ (function () {
        function StubCanvas(width, height) {
            this.context = new Context();
            this.style = new Style();
            this.width = width;
            this.height = height;
        }
        StubCanvas.prototype.getContext = function (name) {
            return this.context;
        };
        StubCanvas.prototype.addEventListener = function (name, callback, boolean) {
        };
        StubCanvas.prototype.focus = function () {
        };
        return StubCanvas;
    }());
    Server.StubCanvas = StubCanvas;
})(Server || (Server = {}));
if (server) {
    module.exports = Server;
}
//# sourceMappingURL=server_canvas.js.map