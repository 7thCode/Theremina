/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

let DataServices: angular.IModule = angular.module('DataServices', []);

DataServices.service('DataService', ['UploadData',
    function (UploadData: any): void {

        this.Upload = (url: string, filename: string, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            let data = new UploadData();
            data.url = url;
            data.$put({name: filename}, (result: any): void => {
                if (result) {
                    if (result.code === 0) {
                        callback(result.value);
                    } else {
                        error(result.code, result.message);
                    }
                } else {
                    error(10000, "network error");
                }
            });
        }
    }]);
