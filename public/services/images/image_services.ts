/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

let ImageServices: angular.IModule = angular.module('ImageServices', []);

ImageServices.service('ImageService', [
    function (): void {

        this.DecodeImage = (original: any, callback: (image: any, type: string) => void): void => {
            let type = original.substring(5, original.indexOf(";"));
            let image = new Image();
            image.onload = () => {
                callback(image, type);
            };
            image.src = original;
        };

        this.ResizeImage = (original: any, width: number, height: number, callback: (resized: any) => void): void => {
            let type = original.substring(5, original.indexOf(";"));
            let image = new Image();
            image.onload = () => {
                let canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                let ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0, width, height);
                let resized = canvas.toDataURL(type);
                callback(resized);
            };
            image.src = original;
        };

    }]);