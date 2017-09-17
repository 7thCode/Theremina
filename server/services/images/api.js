/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ImageApiRouter;
(function (ImageApiRouter) {
    const express = require('express');
    ImageApiRouter.router = express.Router();
    const core = require(process.cwd() + '/gs');
    const share = core.share;
    const AuthController = require(share.Server("systems/auth/controllers/auth_controller"));
    ImageApiRouter.auth = new AuthController.Auth();
    const FileModule = require(share.Server("systems/files/controllers/file_controller"));
    const file = new FileModule.Files();
    ImageApiRouter.router.get('/api/:userid/:name', file.get_file);
})(ImageApiRouter = exports.ImageApiRouter || (exports.ImageApiRouter = {}));
module.exports = ImageApiRouter.router;
//# sourceMappingURL=api.js.map