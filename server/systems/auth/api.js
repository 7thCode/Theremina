/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AuthApiRouter;
(function (AuthApiRouter) {
    const express = require('express');
    AuthApiRouter.router = express.Router();
    const passport = require("passport");
    const share = require('../common/share');
    const AuthController = require(share.Server("systems/auth/controllers/auth_controller"));
    const auth = new AuthController.Auth;
    const ExceptionController = require(share.Server("systems/common/controllers/exception_controller"));
    const exception = new ExceptionController.Exception();
    AuthApiRouter.router.post("/local/register", [exception.exception, exception.guard, auth.is_enabled_regist_user, auth.post_local_register]);
    AuthApiRouter.router.get("/register/:token", auth.get_register_token);
    AuthApiRouter.router.post("/local/member", [exception.exception, exception.guard, exception.authenticate, auth.is_enabled_regist_member, auth.post_member_register]);
    AuthApiRouter.router.get("/member/:token", auth.get_member_token);
    AuthApiRouter.router.post("/local/username", [exception.exception, exception.guard, exception.authenticate, auth.post_local_username]);
    AuthApiRouter.router.get("/username/:token", auth.get_username_token);
    AuthApiRouter.router.post("/local/password", [exception.exception, exception.guard, auth.post_local_password]);
    AuthApiRouter.router.get("/password/:token", auth.get_password_token);
    AuthApiRouter.router.post("/local/login", [exception.exception, exception.guard, auth.post_local_login]);
    AuthApiRouter.router.post("/logout", [exception.exception, exception.guard, exception.authenticate, auth.logout]);
    // facebook
    AuthApiRouter.router.get("/facebook", passport.authenticate("facebook", { scope: ["email"], session: true }));
    AuthApiRouter.router.get("/facebook/callback", passport.authenticate("facebook", { failureRedirect: "/" }), auth.auth_facebook_callback);
    // twitter
    AuthApiRouter.router.get('/twitter', passport.authenticate('twitter'));
    AuthApiRouter.router.get('/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/' }), auth.auth_twitter_callback);
    // instagram
    AuthApiRouter.router.get('/instagram', passport.authenticate("instagram"));
    AuthApiRouter.router.get('/instagram/callback', passport.authenticate("instagram", { failureRedirect: '/' }), auth.auth_instagram_callback);
    // line
    AuthApiRouter.router.get('/line', passport.authenticate('line'));
    AuthApiRouter.router.get('/line/callback', passport.authenticate('line', { failureRedirect: '/' }), auth.auth_line_callback);
})(AuthApiRouter = exports.AuthApiRouter || (exports.AuthApiRouter = {}));
module.exports = AuthApiRouter.router;
//# sourceMappingURL=api.js.map