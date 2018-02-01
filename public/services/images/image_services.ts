/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace ImageServicesModule {

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


            let dataURLtoBlob = (original: string): any => {
                let result = {};
                if (original.length > 5) {
                    let arr: string[] = original.split(',');
                    // let mime:string = arr[0].match(/:(.*?);/)[1];

                    let mime = original.substring(5, original.indexOf(";"));

                    let bstr = atob(arr[1]);
                    let n = bstr.length;
                    let u8arr = new Uint8Array(n);
                    while (n--) {
                        u8arr[n] = bstr.charCodeAt(n);
                    }
                    result = new Blob([u8arr], {type: mime});
                }
                return result;
            };

            this.ResizeImage = (original: string, width: number, height: number, callback: (resized: string) => void): void => {
                if (original.length > 5) {
                    let type = original.substring(5, original.indexOf(";"));
                    let image = new Image();
                    image.onload = () => {
                        let canvas = document.createElement('canvas');
                        canvas.width = width;
                        canvas.height = height;
                        let ctx:any = canvas.getContext('2d');

                        ctx.drawImage(image, 0, 0, width, height);

                        callback(canvas.toDataURL(type));
                    };
                    image.src = original;
                } else {
                    callback(original);
                }
            };

            this.RotateImage = (original: string, resize: boolean, orientation: number, callback: (rotate: string) => void) => {

                if (original.length > 5) {
                    let type = original.substring(5, original.indexOf(";"));
                    let image = new Image();

                    image.onload = () => {
                        let canvas = document.createElement('canvas');

                        let width = image.width;
                        let height = image.height;

                        if (resize) {
                            width = image.height;
                            height = image.width;
                        }

                        canvas.width = width;
                        canvas.height = height;

                        let ctx:any = canvas.getContext('2d');
                        let rad = orientation * Math.PI;
                        ctx.clearRect(0, 0, width, height);

                        ctx.rotate(rad);

                        switch (orientation) {
                            case 0.5:
                                ctx.translate(0, -1 * image.height);
                                break;
                            case 1.0:
                                ctx.translate(-1 * image.width, -1 * image.height);
                                break;
                            case 1.5:
                                ctx.translate(-1 * image.width, 0);
                                break;
                            default:
                        }

                        ctx.drawImage(image, 0, 0);

                        callback(canvas.toDataURL(type));
                    };
                    image.src = original;
                } else {
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

            this.Brightness = (original: string, adjustment: any, callback: (exif: any) => void) => {
                if (original.length > 5) {
                    let type = original.substring(5, original.indexOf(";"));
                    let image = new Image();
                    image.onload = () => {
                        let canvas = document.createElement('canvas');
                        canvas.width = image.width;
                        canvas.height = image.height;
                        let ctx:any = canvas.getContext('2d');
                        ctx.drawImage(image, 0, 0, image.width, image.height);
                        let bitmap = ctx.getImageData(0, 0, image.width, image.height);

                        for (var i = 0; i < bitmap.data.length; i += 4) {
                            bitmap.data[i] += adjustment;
                            bitmap.data[i + 1] += adjustment;
                            bitmap.data[i + 2] += adjustment;
                        }
                        ctx.putImageData(bitmap, 0, 0);
                        callback(canvas.toDataURL(type));
                    };
                    image.src = original;
                } else {
                    callback(original);
                }
            };

            this.ImageExif = (original: string, callback: (exif: any) => void) => {
                if (original.length > 5) {
                    let blob = dataURLtoBlob(original);
                    loadImage.parseMetaData(
                        blob, (data) => {
                            //         console.log(data.exif.getAll());
                            callback(data.exif);
                        });
                }
            }

        }]);
}