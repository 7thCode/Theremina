/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ImagePageRouter;
(function (ImagePageRouter) {
    var express = require('express');
    ImagePageRouter.router = express.Router();
    var core = require(process.cwd() + '/gs');
    var share = core.share;
    var auth = core.auth;
    var exception = core.exception;
    var config = share.config;
    var services_config = share.services_config;
    var webfonts = services_config.webfonts;
    var message = config.message;
    ImagePageRouter.router.get("/", [exception.page_guard, auth.page_valid, auth.page_is_system, function (request, response) {
            response.render("services/images/index", {
                config: config,
                user: request.user,
                message: message,
                status: 200,
                fonts: webfonts
            });
        }]);
    ImagePageRouter.router.get('/dialogs/image_create_dialog', [exception.page_guard, auth.page_valid, function (request, response, next) {
            response.render('services/images/dialogs/image_create_dialog', { message: message });
        }]);
    ImagePageRouter.router.get('/dialogs/image_show_dialog', [exception.page_guard, auth.page_valid, function (request, response, next) {
            response.render('services/images/dialogs/image_show_dialog', { message: message });
        }]);
    ImagePageRouter.router.get('/dialogs/image_delete_dialog', [exception.page_guard, auth.page_valid, function (request, response, next) {
            response.render('services/images/dialogs/image_delete_dialog', { message: message });
        }]);
    ImagePageRouter.router.get('/dialogs/image_resize_dialog', [exception.page_guard, auth.page_valid, function (request, response, next) {
            response.render('services/images/dialogs/image_resize_dialog', { message: message });
        }]);
})(ImagePageRouter = exports.ImagePageRouter || (exports.ImagePageRouter = {}));
module.exports = ImagePageRouter.router;
//# sourceMappingURL=pages.js.map