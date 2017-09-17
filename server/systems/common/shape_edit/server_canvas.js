/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var server = (typeof window === 'undefined');
var Server;
(function (Server) {
    class Context {
        constructor() {
            this.webkitBackingStorePixelRatio = 1;
            this.mozBackingStorePixelRatio = 1;
            this.msBackingStorePixelRatio = 1;
            this.oBackingStorePixelRatio = 1;
            this.backingStorePixelRatio = 1;
        }
        scale(a, b) {
        }
        clearRect(x, y, width, height) {
        }
        beginPath() {
        }
        stroke() {
        }
        rect(x, y, w, h) {
        }
        ellipse(cx, cy, rx, ry, a, b, c, d) {
        }
        drawImage(image, x, y, w, h) {
        }
        fill() {
        }
        save() {
        }
        restore() {
        }
        measureText(s) {
            return { width: 10 };
        }
        fillText(Line, x, y) {
        }
        moveTo(x, y) {
        }
        lineTo(x, y) {
        }
    }
    Server.Context = Context;
    class Style {
        constructor() {
        }
    }
    Server.Style = Style;
    class StubCanvas {
        constructor(width, height) {
            this.context = new Context();
            this.style = new Style();
            this.width = width;
            this.height = height;
        }
        getContext(name) {
            return this.context;
        }
        addEventListener(name, callback, boolean) {
        }
        focus() {
        }
    }
    Server.StubCanvas = StubCanvas;
})(Server || (Server = {}));
if (server) {
    module.exports = Server;
}
//# sourceMappingURL=server_canvas.js.map