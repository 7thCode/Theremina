"use strict";

let Controllers: angular.IModule = angular.module('Controllers', []);

Controllers.controller('InquiryController', ["$scope","$log",'MailerService',
    function ($scope: any, $log: any, MailerService:any): void {

        let progress = (value) => {
            $scope.progress = value;
        };

        let error_handler: (code: number, message: string) => void = (code: number, message: string): void => {
            progress(false);
            $scope.error = message;
            $log.error(message);
        };

        $scope.Send = (): void => {
            $scope.error = "";
            progress(true);
            let name = $scope.name;
            let email = $scope.email;
            let phone = $scope.phone;
            let message = $scope.message;
            MailerService.Send({
                name:name,
                email: email,
                phone: phone,
                message: message
            }, (result: any): void => {
                $scope.error = "お問い合わせありがとうございます";
                progress(false);
            }, error_handler);

        };

    }]);

