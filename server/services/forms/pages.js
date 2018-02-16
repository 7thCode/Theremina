/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FormPageRouter;
(function (FormPageRouter) {
    var express = require('express');
    FormPageRouter.router = express.Router();
    var core = require(process.cwd() + '/gs');
    var share = core.share;
    var exception = core.exception;
    var config = share.config;
    var services_config = share.services_config;
    var webfonts = services_config.webfonts;
    var message = config.message;
    var AuthController = require(share.Server("systems/auth/controllers/auth_controller"));
    FormPageRouter.auth = new AuthController.Auth();
    //  const AnalysisModule: any = require(share.Server("systems/analysis/controllers/analysis_controller"));
    //  const analysis: any = new AnalysisModule.Analysis;
    FormPageRouter.router.get("/", [exception.page_guard, FormPageRouter.auth.page_valid, FormPageRouter.auth.page_is_system, function (request, response) {
            response.render("services/forms/player/index", {
                config: config,
                user: request.user,
                role: FormPageRouter.auth.role(request.user),
                message: message,
                status: 200,
                fonts: webfonts
            });
        }]);
    FormPageRouter.router.get("/builder", [exception.page_guard, FormPageRouter.auth.page_valid, FormPageRouter.auth.page_is_system, function (request, response) {
            response.render("services/forms/builder/index", {
                config: config,
                domain: share.config.domain,
                user: request.user,
                role: FormPageRouter.auth.role(request.user),
                message: message,
                status: 200,
                fonts: webfonts
            });
        }]);
    FormPageRouter.router.get('/dialogs/add_style_dialog', [exception.page_guard, FormPageRouter.auth.page_valid, FormPageRouter.auth.page_is_system, function (req, result, next) {
            result.render('services/forms/builder/dialogs/add_style_dialog', { message: message });
        }]);
    FormPageRouter.router.get('/dialogs/add_attribute_dialog', [exception.page_guard, FormPageRouter.auth.page_valid, FormPageRouter.auth.page_is_system, function (req, result, next) {
            result.render('services/forms/builder/dialogs/add_attribute_dialog', { message: message });
        }]);
    FormPageRouter.router.get('/dialogs/elements/add_tag_dialog', [exception.page_guard, FormPageRouter.auth.page_valid, FormPageRouter.auth.page_is_system, function (req, result, next) {
            result.render('services/forms/builder/dialogs/elements/add_tag_dialog', { message: message });
        }]);
    FormPageRouter.router.get('/dialogs/elements/add_div_dialog', [exception.page_guard, FormPageRouter.auth.page_valid, FormPageRouter.auth.page_is_system, function (req, result, next) {
            result.render('services/forms/builder/dialogs/elements/add_div_dialog', { message: message });
        }]);
    FormPageRouter.router.get('/dialogs/elements/add_field_dialog', [exception.page_guard, FormPageRouter.auth.page_valid, FormPageRouter.auth.page_is_system, function (req, result, next) {
            result.render('services/forms/builder/dialogs/elements/add_field_dialog', { message: message });
        }]);
    FormPageRouter.router.get('/dialogs/elements/add_textarea_dialog', [exception.page_guard, FormPageRouter.auth.page_valid, FormPageRouter.auth.page_is_system, function (req, result, next) {
            result.render('services/forms/builder/dialogs/elements/add_textarea_dialog', { message: message });
        }]);
    FormPageRouter.router.get('/dialogs/elements/add_number_dialog', [exception.page_guard, FormPageRouter.auth.page_valid, FormPageRouter.auth.page_is_system, function (req, result, next) {
            result.render('services/forms/builder/dialogs/elements/add_number_dialog', { message: message });
        }]);
    FormPageRouter.router.get('/dialogs/elements/add_img_dialog', [exception.page_guard, FormPageRouter.auth.page_valid, FormPageRouter.auth.page_is_system, function (req, result, next) {
            result.render('services/forms/builder/dialogs/elements/add_img_dialog', { message: message });
        }]);
    FormPageRouter.router.get('/dialogs/elements/add_select_dialog', [exception.page_guard, FormPageRouter.auth.page_valid, FormPageRouter.auth.page_is_system, function (req, result, next) {
            result.render('services/forms/builder/dialogs/elements/add_select_dialog', { message: message });
        }]);
    FormPageRouter.router.get('/dialogs/elements/add_chips_dialog', [exception.page_guard, FormPageRouter.auth.page_valid, FormPageRouter.auth.page_is_system, function (req, result, next) {
            result.render('services/forms/builder/dialogs/elements/add_chips_dialog', { message: message });
        }]);
    FormPageRouter.router.get('/dialogs/elements/edit_element_dialog', [exception.page_guard, FormPageRouter.auth.page_valid, FormPageRouter.auth.page_is_system, function (req, result, next) {
            result.render('services/forms/builder/dialogs/elements/edit_element_dialog', { message: message });
        }]);
    FormPageRouter.router.get('/dialogs/create_dialog', [exception.page_guard, FormPageRouter.auth.page_valid, FormPageRouter.auth.page_is_system, function (req, result, next) {
            result.render('services/forms/builder/dialogs/create_dialog', { message: message });
        }]);
    FormPageRouter.router.get('/dialogs/open_dialog', [exception.page_guard, FormPageRouter.auth.page_valid, FormPageRouter.auth.page_is_system, function (req, result, next) {
            result.render('services/forms/builder/dialogs/open_dialog', { message: message });
        }]);
    FormPageRouter.router.get('/dialogs/delete_confirm_dialog', [exception.page_guard, FormPageRouter.auth.page_valid, FormPageRouter.auth.page_is_system, function (req, result, next) {
            result.render('services/forms/builder/dialogs/delete_confirm_dialog', { message: message });
        }]);
})(FormPageRouter = exports.FormPageRouter || (exports.FormPageRouter = {}));
module.exports = FormPageRouter.router;
//# sourceMappingURL=pages.js.map