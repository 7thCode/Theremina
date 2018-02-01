/**!
 Copyright (c) 2016 7thCode.(https://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var ResourcesProvidersModule;
(function (ResourcesProvidersModule) {
    var ResourcesProviders = angular.module('ResourcesProviders', []);
    ResourcesProviders.provider('HtmlEdit', [function () {
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
})(ResourcesProvidersModule || (ResourcesProvidersModule = {}));
//# sourceMappingURL=resources_providers.js.map