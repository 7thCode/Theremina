"use strict";

let Controllers: angular.IModule = angular.module('Controllers', []);

Controllers.controller('InquiryController', ["$scope", "$log", 'MailerService', 'AssetService', 'ZipService','ArticleService',
    function ($scope: any, $log: any, MailerService: any, AssetService: any, ZipService: any,ArticleService:any): void {

        $scope.form = {};

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

Controllers.controller('DatepickerPopupController', function ($scope) {

    $scope.today = function () {
        $scope.form.dt = new Date();
    };
    $scope.today();

    $scope.clear = function () {
        $scope.form.dt = null;
    };

    $scope.inlineOptions = {
        customClass: getDayClass,
        minDate: new Date(),
        showWeeks: true
    };

    $scope.dateOptions = {
        dateDisabled: disabled,
        formatYear: 'yy',
        maxDate: new Date(2020, 5, 22),
        minDate: new Date(),
        startingDay: 1
    };

    function disabled(data) {
        var date = data.date, mode = data.mode;
        return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
    }

    $scope.toggleMin = function () {
        $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
        $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
    };

    $scope.toggleMin();

    $scope.open = function () {
        $scope.popup.opened = true;
    };

    $scope.setDate = function (year, month, day) {
        $scope.form.dt = new Date(year, month, day);
    };

    $scope.popup = {
        opened: false
    };

    $scope.events = [

    ];

    function getDayClass(data) {
        var date = data.date, mode = data.mode;
        if (mode === 'day') {
            var dayToCheck = new Date(date).setHours(0, 0, 0, 0);
            for (var i = 0; i < $scope.events.length; i++) {
                var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);
                if (dayToCheck === currentDay) {
                    return $scope.events[i].status;
                }
            }
        }
        return '';
    }


});
