/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var NotifierModule;
(function (NotifierModule) {
    class Notifier {
        constructor() {
            this.notification = window.Notification || window.mozNotification || window.webkitNotification;
        }
        Pass(data) {
            if (this.notification) {
                this.notification.requestPermission(function (permission) {
                    switch (permission) {
                        case "granted":
                            {
                                let instance = new Notification(data.value, // 通知タイトル
                                {
                                    body: data.value,
                                    icon: "http://scrap.php.xdomain.jp/wp-content/uploads/favicon.ico",
                                });
                                instance.config({ autoClose: 1000 });
                                instance.onclick = function () {
                                };
                                instance.onerror = function () {
                                };
                                instance.onshow = function () {
                                };
                                instance.onclose = function () {
                                };
                            }
                            break;
                        case "default":
                            {
                            }
                            break;
                        case "denied":
                            {
                            }
                            break;
                        default:
                    }
                });
            }
        }
        ;
    }
    NotifierModule.Notifier = Notifier;
})(NotifierModule || (NotifierModule = {}));
//# sourceMappingURL=notify.js.map