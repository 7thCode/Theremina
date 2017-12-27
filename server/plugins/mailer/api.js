/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MailerApiRouter;
(function (MailerApiRouter) {
    var express = require('express');
    MailerApiRouter.router = express.Router();
    var core = require(process.cwd() + '/gs');
    var share = core.share;
    var event = share.Event;
    var exception = core.exception;
    var MailerModule = require(share.Server("plugins/mailer/controllers/mailer_controller"));
    var mailer = new MailerModule.Mailer();
    MailerApiRouter.router.post("/api/send", [exception.exception, exception.guard, exception.authenticate, mailer.send]);
    MailerApiRouter.router.get("/api/query/:query/:option", [exception.exception, exception.guard, exception.authenticate, mailer.get_mail_query_query]);
    MailerApiRouter.router.get("/api/count/:query", [mailer.get_mail_count]);
    MailerApiRouter.router.get("/api/:id", [mailer.get_mail]);
    MailerApiRouter.router.delete("/api/:id", [exception.exception, exception.guard, exception.authenticate, mailer.delete_mail]);
    event.emitter.on('mail', function (mail) {
        mailer.receive(mail);
    });
})(MailerApiRouter = exports.MailerApiRouter || (exports.MailerApiRouter = {}));
module.exports = MailerApiRouter.router;
//# sourceMappingURL=api.js.map