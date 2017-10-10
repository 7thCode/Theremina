/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace ApiRouter {

    const express: any = require("express");
    export const router = express.Router();

    const core = require(process.cwd() + "/gs");
    const share: any = core.share;
    const event: any = share.Event;

    const ExceptionController: any = require(share.Server("systems/common/controllers/exception_controller"));
    const exception: any = new ExceptionController.Exception();

    const FrontModule: any = require(share.Server("applications/front/controllers/front_controller"));
    const front: any = new FrontModule.Front;

    router.put('/api/upload/:name', [exception.exception, exception.authenticate,front.put_all]);
    router.get('/api/download', [exception.exception, exception.authenticate, front.get_all]);

    router.post('/api/buildsite/:name/:namespace', front.build);

    event.emitter.on('register', (param: any): void => {
    //    pages.create_init_user_resources(param.user);
    //    pages.create_init_user_file(param.user);
     //   pages.create_init_user_articles(param.user);
    });

}

module.exports = ApiRouter.router;