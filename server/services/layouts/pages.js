/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LayoutsPageRouter;
(function (LayoutsPageRouter) {
    var express = require('express');
    LayoutsPageRouter.router = express.Router();
    var core = require(process.cwd() + '/gs');
    var share = core.share;
    var auth = core.auth;
    var exception = core.exception;
    var config = share.config;
    var services_config = share.services_config;
    var webfonts = services_config.webfonts || [];
    var LayoutsModule = require(share.Server("services/layouts/controllers/layouts_controller"));
    var message = config.message;
    /* GET home page. */
    LayoutsPageRouter.router.get('/', [exception.page_guard, auth.page_valid, auth.page_is_system, function (request, result, next) {
            result.render('services/layouts/player/index', {
                config: config,
                user: request.user,
                role: auth.role(request.user),
                message: message,
                status: 200,
                fonts: webfonts
            });
        }]);
    LayoutsPageRouter.router.get('/builder', [exception.page_guard, auth.page_valid, auth.page_is_system, function (request, result, next) {
            result.render('services/layouts/builder/index', {
                config: config,
                user: request.user,
                role: auth.role(request.user),
                message: message,
                status: 200,
                fonts: webfonts
            });
        }]);
    LayoutsPageRouter.router.get('/player/dialogs/create_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, function (req, result, next) {
            result.render('services/layouts/player/dialogs/create_dialog', { message: message });
        }]);
    LayoutsPageRouter.router.get('/player/dialogs/open_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, function (req, result, next) {
            result.render('services/layouts/player/dialogs/open_dialog', { message: message });
        }]);
    LayoutsPageRouter.router.get('/player/dialogs/saveas_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, function (req, result, next) {
            result.render('services/layouts/player/dialogs/saveas_dialog', { message: message });
        }]);
    LayoutsPageRouter.router.get('/player/dialogs/delete_confirm_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, function (req, result, next) {
            result.render('services/layouts/player/dialogs/delete_confirm_dialog', { message: message });
        }]);
    LayoutsPageRouter.router.get('/builder/dialogs/create_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, function (req, result, next) {
            result.render('services/layouts/builder/dialogs/create_dialog', { message: message });
        }]);
    LayoutsPageRouter.router.get('/builder/dialogs/open_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, function (req, result, next) {
            result.render('services/layouts/builder/dialogs/open_dialog', { message: message });
        }]);
    LayoutsPageRouter.router.get('/builder/dialogs/saveas_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, function (req, result, next) {
            result.render('services/layouts/builder/dialogs/saveas_dialog', { message: message });
        }]);
    LayoutsPageRouter.router.get('/builder/dialogs/delete_confirm_dialog', [exception.page_guard, auth.page_valid, auth.page_is_system, function (req, result, next) {
            result.render('services/layouts/builder/dialogs/delete_confirm_dialog', { message: message });
        }]);
    LayoutsPageRouter.router.get("/render/:userid/:name", [exception.page_catch, function (request, response) {
            LayoutsModule.Layout.get_svg(request, response, 2);
        }]);
})(LayoutsPageRouter = exports.LayoutsPageRouter || (exports.LayoutsPageRouter = {}));
module.exports = LayoutsPageRouter.router;
//# sourceMappingURL=pages.js.map