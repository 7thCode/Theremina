"use strict";

let Controllers: angular.IModule = angular.module('Controllers', []);

Controllers.controller('InquiryController', ["$scope", "$log", 'MailerService', 'AssetService', 'ZipService',
    function ($scope: any, $log: any, MailerService: any, AssetService: any, ZipService: any): void {

        let progress = (value: any): void => {
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
            let form = $scope.form;
            MailerService.Send(form, (result: any): void => {
                $scope.error = result.message;
                progress(false);
            }, error_handler);
        };

        $scope.Create = (): void => {
            $scope.error = "";
            progress(true);
            let form = $scope.form;
            AssetService.Create(form, (result: any): void => {
                $scope.error = result.message;
                progress(false);
            }, error_handler);
        };
        /*
         $scope.Zip = (zip:any):void => {
         if (zip) {
         if (zip.length > 6) {
         progress(true);
         ZipService.Zip(zip, (error: any, result: any): void => {
         if (!error) {
         if (result) {
         if (result.length > 0) {
         let address = result[0];
         $scope.form.address = address.address1;
         $scope.form.city = address.address2;
         $scope.form.street = address.address3;
         }
         }
         }
         progress(false);
         });
         } else {
         $scope.form.address = "";
         $scope.form.city = "";
         $scope.form.street = "";
         }
         }
         };

         */
        $scope.Zip = (zip: any): void => {
            if (zip) {
                if (zip.length > 6) {
                    progress(true);
                    ZipService.Zip(zip, (error: any, result: any): void => {
                        if (!error) {
                            if (result) {
                                let features = result.Feature;
                                if (features.length > 0) {
                                    let feature = features[0];
                                    if (feature.Property) {
                                        let property = feature.Property;
                                        if (property.AddressElement) {
                                            let address_element = property.AddressElement;
                                            if (address_element.length >= 3) {
                                                $scope.form.address = address_element[0].Name;
                                                $scope.form.city = address_element[1].Name;
                                                $scope.form.street = address_element[2].Name;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        progress(false);
                    });
                } else {
                    $scope.form.address = "";
                    $scope.form.city = "";
                    $scope.form.street = "";
                }
            }
        };

    }]);