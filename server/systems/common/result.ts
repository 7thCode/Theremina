/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

class Result {
    private code: number;
    private message: string;
    private value: any;

    constructor(code: number, message: string, value: any) {
        this.code = code;
        this.message = message;
        this.value = value;
    }
}

module.exports = Result;
