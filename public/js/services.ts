"use strict";

let Services: angular.IModule = angular.module('Services', []);

Services.factory('MailSend', ['$resource',
    ($resource: any): angular.resource.IResource<any> => {
        return $resource('/api/mailsend', {}, {});
    }]);

Services.service('MailerService', ["MailSend",
    function (MailSend: any, Mail: any, $http: any): void {
        this.Send = (content: any, callback: (result: any) => void, error: (code: number, message: string) => void): void => {
            let mail = new MailSend();
            mail.content = content;
            mail.$save({}, (result: any): void => {
                if (result) {
                    if (result.code === 0) {
                        callback(result.value);
                    } else {
                        error(result.code, result.message);
                    }
                } else {
                    error(10000, "network error");
                }
            });
        };
    }]);

