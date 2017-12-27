/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ProfileApiRouter;
(function (ProfileApiRouter) {
    var express = require('express');
    ProfileApiRouter.router = express.Router();
    var core = require(process.cwd() + '/gs');
    var share = core.share;
    var exception = core.exception;
    var ProfileModule = require(share.Server("services/profile/controllers/profile_controller"));
    var profile = new ProfileModule.Profile;
    ProfileApiRouter.router.get("/api", [exception.exception, exception.guard, exception.authenticate, profile.get_profile]);
    ProfileApiRouter.router.put("/api", [exception.exception, exception.guard, exception.authenticate, profile.put_profile]);
})(ProfileApiRouter = exports.ProfileApiRouter || (exports.ProfileApiRouter = {}));
module.exports = ProfileApiRouter.router;
//# sourceMappingURL=api.js.map