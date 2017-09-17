/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FileApiRouter;
(function (FileApiRouter) {
    const express = require('express');
    FileApiRouter.router = express.Router();
    const share = require(process.cwd() + '/server/systems/common/share');
    const ExceptionController = require(share.Server("systems/common/controllers/exception_controller"));
    const exception = new ExceptionController.Exception();
    const FileModule = require(share.Server("systems/files/controllers/file_controller"));
    const file = new FileModule.Files();
    const temporaryfiles = new FileModule.TemporaryFiles();
    FileApiRouter.router.get('/api/query/:query/:option', [exception.exception, exception.guard, exception.authenticate, file.get_file_query_query]);
    FileApiRouter.router.get('/api/count/:query', [exception.exception, exception.guard, exception.authenticate, file.get_file_query_count]);
    FileApiRouter.router.get('/api/data/:name', [exception.exception, file.get_file_data_name]);
    FileApiRouter.router.post('/api/:name/:key', [exception.exception, exception.guard, exception.authenticate, file.post_file_name]);
    FileApiRouter.router.put('/api/:name/:key', [exception.exception, exception.guard, exception.authenticate, file.put_file_name]);
    FileApiRouter.router.get('/api/:userid/:name', [exception.exception, file.get_file]);
    FileApiRouter.router.delete('/api/own', [exception.exception, exception.guard, exception.authenticate, file.delete_own]);
    FileApiRouter.router.delete('/api/:name/:key', [exception.exception, exception.guard, exception.authenticate, file.delete_file_name]);
    FileApiRouter.router.post('/api/temporary/upload/:filename', [temporaryfiles.upload]);
    FileApiRouter.router.get("/api/temporary/download/:filename", [temporaryfiles.download]);
})(FileApiRouter = exports.FileApiRouter || (exports.FileApiRouter = {}));
module.exports = FileApiRouter.router;
//# sourceMappingURL=api.js.map