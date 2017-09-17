/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PublicKeyApiRouter;
(function (PublicKeyApiRouter) {
    const express = require('express');
    PublicKeyApiRouter.router = express.Router();
    const share = require('../common/share');
    const ExceptionController = require(share.Server("systems/common/controllers/exception_controller"));
    const exception = new ExceptionController.Exception();
    /*! public key */
    const PublicKeyController = require(share.Server("systems/publickey/controllers/publickey_controller"));
    const publickey = new PublicKeyController.PublicKey();
    PublicKeyApiRouter.router.get("/fixed", [publickey.get_fixed_public_key]);
    PublicKeyApiRouter.router.get("/dynamic", [exception.exception, exception.guard, exception.authenticate, publickey.get_public_key]);
    PublicKeyApiRouter.router.get("/token", [exception.exception, exception.guard, exception.authenticate, publickey.get_access_token]);
})(PublicKeyApiRouter = exports.PublicKeyApiRouter || (exports.PublicKeyApiRouter = {}));
module.exports = PublicKeyApiRouter.router;
//# sourceMappingURL=api.js.map