/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace PicturesApiRouter {

    const express: any = require("express");
    export const router = express.Router();

    const core = require(process.cwd() + "/gs");
    const share: any = core.share;
    const event: any = share.Event;

    const ExceptionController: any = require(share.Server("systems/common/controllers/exception_controller"));
    const exception: any = new ExceptionController.Exception();

    const PicturesModule: any = require(share.Server("services/pictures/controllers/pictures_controller"));
    const pictures: any = new PicturesModule.Pictures;

    router.get('/:userid/:namespace/doc/img/:name', pictures.get_picture);

}

module.exports = PicturesApiRouter.router;