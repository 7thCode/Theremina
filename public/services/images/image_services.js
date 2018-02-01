/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var ImageServicesModule;
(function (ImageServicesModule) {
    var ImageServices = angular.module('ImageServices', []);
    ImageServices.service('ImageService', [
        function () {
            this.DecodeImage = function (original, callback) {
                var type = original.substring(5, original.indexOf(";"));
                var image = new Image();
                image.onload = function () {
                    callback(image, type);
                };
                image.src = original;
            };
            var dataURLtoBlob = function (original) {
                var result = {};
                if (original.length > 5) {
                    var arr = original.split(',');
                    // let mime:string = arr[0].match(/:(.*?);/)[1];
                    var mime_1 = original.substring(5, original.indexOf(";"));
                    var bstr = atob(arr[1]);
                    var n = bstr.length;
                    var u8arr = new Uint8Array(n);
                    while (n--) {
                        u8arr[n] = bstr.charCodeAt(n);
                    }
                    result = new Blob([u8arr], { type: mime_1 });
                }
                return result;
            };
            this.ResizeImage = function (original, width, height, callback) {
                if (original.length > 5) {
                    var type_1 = original.substring(5, original.indexOf(";"));
                    var image_1 = new Image();
                    image_1.onload = function () {
                        var canvas = document.createElement('canvas');
                        canvas.width = width;
                        canvas.height = height;
                        var ctx = canvas.getContext('2d');
                        ctx.drawImage(image_1, 0, 0, width, height);
                        callback(canvas.toDataURL(type_1));
                    };
                    image_1.src = original;
                }
                else {
                    callback(original);
                }
            };
            this.RotateImage = function (original, resize, orientation, callback) {
                if (original.length > 5) {
                    var type_2 = original.substring(5, original.indexOf(";"));
                    var image_2 = new Image();
                    image_2.onload = function () {
                        var canvas = document.createElement('canvas');
                        var width = image_2.width;
                        var height = image_2.height;
                        if (resize) {
                            width = image_2.height;
                            height = image_2.width;
                        }
                        canvas.width = width;
                        canvas.height = height;
                        var ctx = canvas.getContext('2d');
                        var rad = orientation * Math.PI;
                        ctx.clearRect(0, 0, width, height);
                        ctx.rotate(rad);
                        switch (orientation) {
                            case 0.5:
                                ctx.translate(0, -1 * image_2.height);
                                break;
                            case 1.0:
                                ctx.translate(-1 * image_2.width, -1 * image_2.height);
                                break;
                            case 1.5:
                                ctx.translate(-1 * image_2.width, 0);
                                break;
                            default:
                        }
                        ctx.drawImage(image_2, 0, 0);
                        callback(canvas.toDataURL(type_2));
                    };
                    image_2.src = original;
                }
                else {
                    callback(original);
                }
                /*
                 if (original.length > 5) {
                 let options: any = {canvas: true};
                 let blob = dataURLtoBlob(original);
                 loadImage.parseMetaData(
                 blob, (data) => {
                 if (data.exif) {
                 options.orientation = orientation;
                 loadImage(blob, (canvas) => {
                 callback(canvas.toDataURL());
                 }, options);
                 } else {
                 callback(original);
                 }
                 });
                 } else {
                 callback(original);
                 }*/
            };
            this.Brightness = function (original, adjustment, callback) {
                if (original.length > 5) {
                    var type_3 = original.substring(5, original.indexOf(";"));
                    var image_3 = new Image();
                    image_3.onload = function () {
                        var canvas = document.createElement('canvas');
                        canvas.width = image_3.width;
                        canvas.height = image_3.height;
                        var ctx = canvas.getContext('2d');
                        ctx.drawImage(image_3, 0, 0, image_3.width, image_3.height);
                        var bitmap = ctx.getImageData(0, 0, image_3.width, image_3.height);
                        for (var i = 0; i < bitmap.data.length; i += 4) {
                            bitmap.data[i] += adjustment;
                            bitmap.data[i + 1] += adjustment;
                            bitmap.data[i + 2] += adjustment;
                        }
                        ctx.putImageData(bitmap, 0, 0);
                        callback(canvas.toDataURL(type_3));
                    };
                    image_3.src = original;
                }
                else {
                    callback(original);
                }
            };
            this.ImageExif = function (original, callback) {
                if (original.length > 5) {
                    var blob = dataURLtoBlob(original);
                    loadImage.parseMetaData(blob, function (data) {
                        //         console.log(data.exif.getAll());
                        callback(data.exif);
                    });
                }
            };
        }
    ]);
})(ImageServicesModule || (ImageServicesModule = {}));
//# sourceMappingURL=image_services.js.map