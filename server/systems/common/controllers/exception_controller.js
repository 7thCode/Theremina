/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ExceptionModule;
(function (ExceptionModule) {
    const share = require(process.cwd() + '/server/systems/common/share');
    const Wrapper = share.Wrapper;
    class Exception {
        exception(request, response, next) {
            Wrapper.Exception(request, response, (request, response) => {
                next();
            });
        }
        guard(request, response, next) {
            Wrapper.Guard(request, response, (request, response) => {
                next();
            });
        }
        authenticate(request, response, next) {
            Wrapper.Authenticate(request, response, (request, response) => {
                next();
            });
        }
        page_catch(request, response, next) {
            try {
                next();
            }
            catch (e) {
                response.status(500).render('error', {
                    status: 500,
                    message: "Internal Server Error...",
                    url: request.url
                });
            }
        }
        page_guard(request, response, next) {
            try {
                if (request.user) {
                    if (request.isAuthenticated()) {
                        next();
                    }
                    else {
                        response.status(403).render('error', { status: 403, message: "Forbidden...", url: request.url });
                    }
                }
                else {
                    response.status(403).render('error', { status: 403, message: "Forbidden...", url: request.url });
                }
            }
            catch (e) {
                response.status(500).render('error', {
                    status: 500,
                    message: "Internal Server Error...",
                    url: request.url
                });
            }
        }
    }
    ExceptionModule.Exception = Exception;
})(ExceptionModule = exports.ExceptionModule || (exports.ExceptionModule = {}));
module.exports = ExceptionModule;
//# sourceMappingURL=exception_controller.js.map