/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

let NamespaceControllers: angular.IModule = angular.module('NamespaceControllers', []);

NamespaceControllers.controller('NamespaceController', ['$scope',"$rootScope", "$log",'$uibModal', 'SessionService', 'NamespaceService',
    ($scope: any,$rootScope, $log, $uibModal :any, SessionService: any, NamespaceService: any): void => {

        let progress = (value): void => {
            $scope.$emit('progress', value);
        };

        let error_handler: (code: number, message: string) => void = (code: number, message: string): void => {
            progress(false);
            $scope.message = message;
            $log.error(message);
        };

        let GetNamespaces = (): void => {
            NamespaceService.Get(
                (namespaces) => {
                    $scope.namespaces = namespaces;
                //    $rootScope.$emit('get_namespaces', namespaces);
                    GetNamespace();
                }, error_handler);
        };

        let SetNamespace = (namespace: string): void => {
            SessionService.Put({namespace: namespace}, (data: any): void => {
                $scope.namespace = namespace;
                $rootScope.$emit('change_namespace', data.namespace);
            }, error_handler);
        };

        let GetNamespace = (): void => {
            SessionService.Get((session: any): void => {
                if (session) {
                    let data = session.data;
                    if (data) {
                        $scope.namespace = data.namespace;
                        $rootScope.$emit('change_namespace', data.namespace);
                    }
                }
            }, error_handler);
        };

        $rootScope.$on('change_files', (event, value): void => {
            GetNamespaces();
      //      GetNamespace();
        });

        window.onfocus = () => {
            GetNamespaces();
      //      GetNamespace();
        };

        $scope.GetNamespace = GetNamespace;
        $scope.SetNamespace = SetNamespace;

        GetNamespaces();

        $scope.OpenSetNamespaceDialog = (): void => {

            let modalRegist: any = $uibModal.open({
                controller: 'SetNamespaceDialogController',
                templateUrl: '/namespace/dialogs/set_dialog',
                resolve: {
                    items: $scope
                }
            });

            modalRegist.result.then((dialog_scope: any): void => {
                let namespace: string = dialog_scope.namespace;
                SetNamespace(namespace);
            }, (): void => {
            });
        };


    }]);

DataControllers.controller('SetNamespaceDialogController', ['$scope', '$uibModalInstance', 'items',
    ($scope: any, $uibModalInstance: any, items: any): void => {

        $scope.hide = (): void => {
            $uibModalInstance.close();
        };

        $scope.cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        $scope.answer = (): void => {
            $uibModalInstance.close($scope);
        };

    }]);


/*! Controllers  */

