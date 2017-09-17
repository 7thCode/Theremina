/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ApiRouter;
(function (ApiRouter) {
    const express = require("express");
    ApiRouter.router = express.Router();
    const core = require(process.cwd() + "/gs");
    const share = core.share;
    const event = share.Event;
    const ExceptionController = require(share.Server("systems/common/controllers/exception_controller"));
    const exception = new ExceptionController.Exception();
    const FrontModule = require(share.Server("applications/front/controllers/front_controller"));
    const pages = new FrontModule.Pages;
    const mailer = new FrontModule.Mailer;
    const asset = new FrontModule.Asset;
    const pictures = new FrontModule.Pictures;
    ApiRouter.router.get('/:userid/doc/img/:name', pictures.get_photo);
    ApiRouter.router.put('/api/upload/:name', [exception.exception, exception.authenticate, pages.put_all]);
    ApiRouter.router.get('/api/download', [exception.exception, exception.authenticate, pages.get_all]);
    ApiRouter.router.post('/api/mailsend', mailer.send);
    ApiRouter.router.post('/api/createasset', asset.create);
    ApiRouter.router.post('/api/buildsite/:name', pages.build);
    const members = new FrontModule.Members;
    ApiRouter.router.get("/members/api/:username", [exception.exception, exception.guard, exception.authenticate, members.get_member]);
    ApiRouter.router.put("/members/api/:username", [exception.exception, exception.guard, exception.authenticate, members.put_member]);
    ApiRouter.router.get('/members/api/query/:query/:option', [exception.exception, exception.guard, exception.authenticate, members.get_member_query_query]);
    ApiRouter.router.get('/members/api/count/:query', [exception.exception, exception.guard, exception.authenticate, members.get_member_count]);
    ApiRouter.router.delete('/members/api/own', [exception.exception, exception.guard, exception.authenticate, members.delete_own]);
    event.emitter.on('register', (param) => {
        pages.create_init_user_resources(param.user);
        pages.create_init_user_articles(param.user);
    });
})(ApiRouter = exports.ApiRouter || (exports.ApiRouter = {}));
module.exports = ApiRouter.router;
//# sourceMappingURL=api.js.map