/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace EventModule {

    const Emitter = require('events');
    export class Event {
        public emitter = null;
        constructor() {
            this.emitter = new Emitter();
        }
    }

}

module.exports = EventModule;
