/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace MailerApiRouter {

    const express: any = require("express");
    export const router = express.Router();

    const core = require(process.cwd() + "/gs");
    const share: any = core.share;

    const ExceptionController: any = require(share.Server("systems/common/controllers/exception_controller"));
    const exception: any = new ExceptionController.Exception();

    const MailerModule: any = require(share.Server("services/mailer/controllers/mailer_controller"));
    const mailer: any = new MailerModule.Mailer;

    router.post('/api/mailsend', mailer.send);

}

module.exports = MailerApiRouter.router;