/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

namespace FrontControllersModule {

    let FrontControllers: angular.IModule = angular.module("FrontControllers", ["ui.bootstrap", "ngAnimate", "flow", "ui.ace"]);

    FrontControllers.controller("EventController", ["$scope",
        ($scope: any): void => {

            //    $scope.$on('change_controller', (event, value) => {
            //        $scope.controller_name = value;
            //    });

        }]);

    FrontControllers.controller("FrontController", ["$scope", "$rootScope", "$log", "$compile", "$uibModal", "ProfileService",
        ($scope: any, $rootScope: any, $log: any, $compile: any, $uibModal: any, ProfileService: any): void => {

            let progress = (value) => {
                $scope.$emit("progress", value);
            };

            $scope.$on("progress", (event, value) => {
                $scope.progress = value;
            });

            let error_handler: (code: number, message: string) => void = (code: number, message: string): void => {
                progress(false);
                $scope.message = message;
                $log.error(message);
                alert(message);
            };

            let alert = (message): void => {
                let modalInstance: any = $uibModal.open({
                    controller: "AlertDialogController",
                    templateUrl: "/common/dialogs/alert_dialog",
                    resolve: {
                        items: (): any => {
                            return message;
                        }
                    }
                });
                modalInstance.result.then((answer: any): void => {
                }, (): void => {
                });
            };

            $scope.BuildSite = (): void => {

                let modalRegist: any = $uibModal.open({
                    controller: "BuildSiteDialogController",
                    templateUrl: "/front/dialogs/build_site_dialog",
                    resolve: {
                        items: $scope
                    }
                });

                modalRegist.result.then((resource: any): void => {
                    $rootScope.$emit("change_files", {});
                    //  Query();
                }, (): void => {
                });
            };

            ProfileService.Get((self: any): void => {
                if (self) {
                    if (!self.local.address) {
                        //         SelfInit(self);
                    }
                }
            }, error_handler);

            // tinymce
            $scope.tinymceOptions = {
                onChange: function (e) {
                    // put logic here for keypress and cut/paste changes
                },
                mode : "textareas",
                theme : "advanced",
                force_br_newlines : false,
                force_p_newlines : false,
                inline: false,
                cleanup : false,
                valid_elements : '*[*]',
                plugins: "visualblocks code table advlist autolink link image lists charmap print preview textcolor",
                menubar: "table tools",
                toolbar: "code formatselect | forecolor backcolor bold italic strikethrough underline forecolor backcolor | link image | alignleft aligncenter alignright alignjustify  | numlist bullist outdent indent  | removeformat",
                style_formats: [
                    {
                        title: "Headers", items: [
                            {title: "h1", block: "h1"},
                            {title: "h2", block: "h2"},
                            {title: "h3", block: "h3"},
                            {title: "h4", block: "h4"},
                            {title: "h5", block: "h5"},
                            {title: "h6", block: "h6"}
                        ]
                    },
                    {
                        title: "Blocks", items: [
                            {title: "p", block: "p"},
                            {title: "div", block: "div"},
                            {title: "pre", block: "pre"}
                        ]
                    },
                    {
                        title: "Containers", items: [
                            {title: "section", block: "section", wrapper: true, merge_siblings: false},
                            {title: "article", block: "article", wrapper: true, merge_siblings: false},
                            {title: "blockquote", block: "blockquote", wrapper: true},
                            {title: "hgroup", block: "hgroup", wrapper: true},
                            {title: "aside", block: "aside", wrapper: true},
                            {title: "figure", block: "figure", wrapper: true}
                        ]
                    }
                ],
                visualblocks_default_state: true,
                end_container_on_empty_block: true,
                entity_encoding: "raw",
                skin: "lightgray",
                theme: "modern"
            };

        }]);

    FrontControllers.controller("UserSettingController", ["$scope", "$rootScope", "$q", "$document", "$uibModal", "$log", "ProfileService", "SessionService", "DataService",
        ($scope: any, $rootScope: any, $q: any, $document: any, $uibModal: any, $log: any, ProfileService, SessionService, DataService: any): void => {

            let progress = (value): void => {
                $scope.$emit("progress", value);
            };

            $scope.$on("progress", (event, value): void => {
                $scope.progress = value;
            });

            let error_handler: (code: number, message: string) => void = (code: number, message: string): void => {
                progress(false);
                $scope.message = message;
                $log.error(message);
                alert(message);
            };

            let alert = (message): void => {
                let modalInstance: any = $uibModal.open({
                    controller: "AlertDialogController",
                    templateUrl: "/common/dialogs/alert_dialog",
                    resolve: {
                        items: (): any => {
                            return message;
                        }
                    }
                });
                modalInstance.result.then((answer: any): void => {
                }, (): void => {
                });
            };

            ProfileService.Get((self: any): void => {
                if (self) {
                    $scope.userid = self.username;
                }
            }, error_handler);

            $document.on("drop dragover", (e: any): void => {
                e.stopPropagation();
                e.preventDefault();
            });

            //$rootScope.$on('get_namespaces', (event, value): void => {
            //         $scope.namespaces = value;
            //});

            $rootScope.$on("change_namespace", (event, value): void => {
                $scope.namespace = value;
            });

            $scope.UploadBackup = (file: any): void => {
                progress(true);
                let fileReader: any = new FileReader();
                fileReader.onload = (event: any): void => {
                    DataService.Upload(event.target.result, file[0].name, (result: any) => {

                    }, (code: number, message: string) => {

                    });
                };

                fileReader.readAsDataURL(file[0].file);
            };

        }]);

    FrontControllers.controller("BuildSiteDialogController", ["$scope", "$log", "$uibModalInstance", "SiteService", "items",
        ($scope: any, $log: any, $uibModalInstance: any, SiteService: any, items: any): void => {

            let file = items.file;
            let target = items.target;
            let parent_scope = items;

            $scope.name = "sample";

            if (file) {
                $scope.title = file.name;
                $scope.mimetype = file.type;
            }

            let progress = (value) => {
                $scope.$emit("progress", value);
            };

            $scope.$on("progress", (event, value) => {
                parent_scope.progress = value;
            });

            let error_handler: (code: number, message: string) => void = (code: number, message: string): void => {
                progress(false);
                $scope.message = message;
                $log.error(message);
            };

            $scope.type = 20;

            $scope.hide = (): void => {
                $uibModalInstance.close();
            };

            $scope.cancel = (): void => {
                $uibModalInstance.dismiss();
            };

            $scope.answer = (name): void => {
                progress(true);
                let namespace = $scope.namespace;
                SiteService.Build(name, namespace, (result: any): void => {
                    progress(false);
                    $scope.message = "";
                    $uibModalInstance.close(result);
                }, error_handler);
            };

        }]);

}