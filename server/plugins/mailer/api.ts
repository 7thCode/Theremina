/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace MailerApiRouter {

    const express = require('express');
    export const router = express.Router();

    const core = require(process.cwd() + '/core');
    const share: any = core.share;
    const event: any = share.Event;

    const exception: any = core.exception;

    const MailerModule: any = require(share.Server("plugins/mailer/controllers/mailer_controller"));
    const mailer: any = new MailerModule.Mailer();

    router.post("/api/send",[exception.exception,exception.guard, exception.authenticate, mailer.send]);
    router.get("/api/query/:query/:option",[exception.exception, exception.guard, exception.authenticate, mailer.get_mail_query_query]);
    router.get("/api/count/:query", [mailer.get_mail_count]);
    router.get("/api/:id", [mailer.get_mail]);

    router.delete("/api/:id", [exception.exception, exception.guard, exception.authenticate, mailer.delete_mail]);

    event.emitter.on('mail', (mail) => {
        mailer.receive(mail);


    //    const emitter = require('socket.io-emitter')("redis.host:6379");
    //    emitter.auth("zz0101", () => {
    //        emitter.emit('client', 'broadcasting');
    //    })


    });

}

module.exports = MailerApiRouter.router;

