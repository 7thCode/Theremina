/**!
 Copyright (c) 2016 7thCode.(https://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace ResourcesProvidersModule {

    let ResourcesProviders: angular.IModule = angular.module('ResourcesProviders', []);

    ResourcesProviders.provider('HtmlEdit', [function (): void {

        this.$get = (): any => {
            return {
                toHtml: (object: any, init: string): string => {
                    return HtmlEdit.Render.toHtml(object, init);
                },
                fromHtml: (html: string, callback: (errors, doc) => void): void => {
                    HtmlEdit.Render.fromHtml(html, callback);
                },
            }
        }

    }
    ]);
}