/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export namespace FileApiRouter {

    const express = require('express');
    export const router = express.Router();

    const share = require(process.cwd() + '/server/systems/common/share');

    const ExceptionController: any = require(share.Server("systems/common/controllers/exception_controller"));
    const exception: any = new ExceptionController.Exception();

    const FileModule: any = require(share.Server("systems/files/controllers/file_controller"));
    const file: any = new FileModule.Files();

    router.get('/api/query/:query/:option', [exception.exception, exception.guard, exception.authenticate, file.get_file_query_query]);
    router.get('/api/count/:query', [exception.exception, exception.guard, exception.authenticate, file.get_file_query_count]);

    router.get('/api/:userid/:name', file.get_file_name);
    router.post('/api/:name/:key', [exception.exception, exception.guard, exception.authenticate, file.post_file_name]);
    router.put('/api/:name/:key', [exception.exception, exception.guard, exception.authenticate, file.put_file_name]);

    router.delete('/api/own', [exception.exception, exception.guard, exception.authenticate, file.delete_own]);
    router.delete('/api/:name/:key', [exception.exception, exception.guard, exception.authenticate, file.delete_file_name]);

}

module.exports = FileApiRouter.router;

