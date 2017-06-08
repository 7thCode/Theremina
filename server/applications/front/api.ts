/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace ApiRouter {

    const express: any = require("express");
    export const router = express.Router();

    const core = require(process.cwd() + "/core");
    const share: any = core.share;
    const event: any = share.Event;

    const ExceptionController: any = require(share.Server("systems/common/controllers/exception_controller"));
    const exception: any = new ExceptionController.Exception();

    const FrontModule: any = require(share.Server("applications/front/controllers/front_controller"));
    const pages: any = new FrontModule.Pages;
    const mailer: any = new FrontModule.Mailer;
    const asset: any = new FrontModule.Asset;

    const FileModule: any = require(share.Server("systems/files/controllers/file_controller"));
    const file: any = new FileModule.Files();

    router.get('/photos/api/:userid/:name', file.get_file_name);

    router.get('/api/download', pages.get_all);
    router.post('/api/mailsend', mailer.send);
    router.post('/api/createasset', asset.create);

    const members: any = new FrontModule.Members;

    router.get("/members/api/:username", [exception.exception, exception.guard, exception.authenticate, members.get_member]);
    router.put("/members/api/:username", [exception.exception, exception.guard, exception.authenticate, members.put_member]);
    router.get('/members/api/query/:query/:option', [exception.exception, exception.guard, exception.authenticate, members.get_member_query_query]);
    router.get('/members/api/count/:query', [exception.exception, exception.guard, exception.authenticate, members.get_member_count]);
    router.delete('/members/api/own', [exception.exception, exception.guard, exception.authenticate, members.delete_own]);

    event.emitter.on('register', (param:any):void => {
        pages.create_init_user_resources(param.user);
    });

}

module.exports = ApiRouter.router;