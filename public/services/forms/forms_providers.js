/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var FormsProvidersModule;
(function (FormsProvidersModule) {
    var FormsProviders = angular.module('FormsProviders', []);
    FormsProviders.provider('HtmlEdit', [function () {
            this.$get = function () {
                return {
                    toHtml: function (object, init) {
                        return HtmlEdit.Render.toHtml(object, init);
                    },
                    fromHtml: function (html, callback) {
                        HtmlEdit.Render.fromHtml(html, callback);
                    },
                };
            };
        }
    ]);
})(FormsProvidersModule || (FormsProvidersModule = {}));
//# sourceMappingURL=forms_providers.js.map