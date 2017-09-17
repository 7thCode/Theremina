/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EventModule;
(function (EventModule) {
    const Emitter = require('events');
    class Event {
        constructor() {
            this.emitter = null;
            this.emitter = new Emitter();
        }
    }
    EventModule.Event = Event;
})(EventModule = exports.EventModule || (exports.EventModule = {}));
module.exports = EventModule;
//# sourceMappingURL=event.js.map