/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FormPageRouter;
(function (FormPageRouter) {
    const express = require('express');
    FormPageRouter.router = express.Router();
    const core = require(process.cwd() + '/gs');
    const share = core.share;
    const exception = core.exception;
    const config = share.config;
    const services_config = share.services_config;
    const webfonts = services_config.webfonts;
    let message = config.message;
    const AuthController = require(share.Server("systems/auth/controllers/auth_controller"));
    FormPageRouter.auth = new AuthController.Auth();
    const AnalysisModule = require(share.Server("systems/analysis/controllers/analysis_controller"));
    const analysis = new AnalysisModule.Analysis;
    FormPageRouter.router.get("/", [exception.page_guard, FormPageRouter.auth.page_valid, FormPageRouter.auth.page_is_system, (request, response) => {
            response.render("services/forms/player/index", {
                config: config,
                user: request.user,
                message: message,
                status: 200,
                fonts: webfonts
            });
        }]);
    FormPageRouter.router.get("/builder", [exception.page_guard, FormPageRouter.auth.page_valid, FormPageRouter.auth.page_is_system, (request, response) => {
            response.render("services/forms/builder/index", {
                config: config,
                domain: share.config.domain,
                user: request.user,
                message: message,
                status: 200,
                fonts: webfonts
            });
        }]);
    FormPageRouter.router.get('/dialogs/add_style_dialog', [exception.page_guard, FormPageRouter.auth.page_valid, FormPageRouter.auth.page_is_system, (req, result, next) => {
            result.render('services/forms/builder/dialogs/add_style_dialog', { message: message });
        }]);
    FormPageRouter.router.get('/dialogs/add_attribute_dialog', [exception.page_guard, FormPageRouter.auth.page_valid, FormPageRouter.auth.page_is_system, (req, result, next) => {
            result.render('services/forms/builder/dialogs/add_attribute_dialog', { message: message });
        }]);
    FormPageRouter.router.get('/dialogs/elements/add_tag_dialog', [exception.page_guard, FormPageRouter.auth.page_valid, FormPageRouter.auth.page_is_system, (req, result, next) => {
            result.render('services/forms/builder/dialogs/elements/add_tag_dialog', { message: message });
        }]);
    FormPageRouter.router.get('/dialogs/elements/add_div_dialog', [exception.page_guard, FormPageRouter.auth.page_valid, FormPageRouter.auth.page_is_system, (req, result, next) => {
            result.render('services/forms/builder/dialogs/elements/add_div_dialog', { message: message });
        }]);
    FormPageRouter.router.get('/dialogs/elements/add_field_dialog', [exception.page_guard, FormPageRouter.auth.page_valid, FormPageRouter.auth.page_is_system, (req, result, next) => {
            result.render('services/forms/builder/dialogs/elements/add_field_dialog', { message: message });
        }]);
    FormPageRouter.router.get('/dialogs/elements/add_textarea_dialog', [exception.page_guard, FormPageRouter.auth.page_valid, FormPageRouter.auth.page_is_system, (req, result, next) => {
            result.render('services/forms/builder/dialogs/elements/add_textarea_dialog', { message: message });
        }]);
    FormPageRouter.router.get('/dialogs/elements/add_number_dialog', [exception.page_guard, FormPageRouter.auth.page_valid, FormPageRouter.auth.page_is_system, (req, result, next) => {
            result.render('services/forms/builder/dialogs/elements/add_number_dialog', { message: message });
        }]);
    FormPageRouter.router.get('/dialogs/elements/add_img_dialog', [exception.page_guard, FormPageRouter.auth.page_valid, FormPageRouter.auth.page_is_system, (req, result, next) => {
            result.render('services/forms/builder/dialogs/elements/add_img_dialog', { message: message });
        }]);
    FormPageRouter.router.get('/dialogs/elements/add_select_dialog', [exception.page_guard, FormPageRouter.auth.page_valid, FormPageRouter.auth.page_is_system, (req, result, next) => {
            result.render('services/forms/builder/dialogs/elements/add_select_dialog', { message: message });
        }]);
    FormPageRouter.router.get('/dialogs/elements/add_chips_dialog', [exception.page_guard, FormPageRouter.auth.page_valid, FormPageRouter.auth.page_is_system, (req, result, next) => {
            result.render('services/forms/builder/dialogs/elements/add_chips_dialog', { message: message });
        }]);
    FormPageRouter.router.get('/dialogs/elements/edit_element_dialog', [exception.page_guard, FormPageRouter.auth.page_valid, FormPageRouter.auth.page_is_system, (req, result, next) => {
            result.render('services/forms/builder/dialogs/elements/edit_element_dialog', { message: message });
        }]);
    FormPageRouter.router.get('/dialogs/create_dialog', [exception.page_guard, FormPageRouter.auth.page_valid, FormPageRouter.auth.page_is_system, (req, result, next) => {
            result.render('services/forms/builder/dialogs/create_dialog', { message: message });
        }]);
    FormPageRouter.router.get('/dialogs/open_dialog', [exception.page_guard, FormPageRouter.auth.page_valid, FormPageRouter.auth.page_is_system, (req, result, next) => {
            result.render('services/forms/builder/dialogs/open_dialog', { message: message });
        }]);
    FormPageRouter.router.get('/dialogs/delete_confirm_dialog', [exception.page_guard, FormPageRouter.auth.page_valid, FormPageRouter.auth.page_is_system, (req, result, next) => {
            result.render('services/forms/builder/dialogs/delete_confirm_dialog', { message: message });
        }]);
    // localhost:8000/forms/render/000000000000000000000000/test1
})(FormPageRouter = exports.FormPageRouter || (exports.FormPageRouter = {}));
module.exports = FormPageRouter.router;
//# sourceMappingURL=pages.js.map