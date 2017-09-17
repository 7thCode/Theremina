/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
let MailerControllers = angular.module('MailerControllers', ["ngResource"]);
MailerControllers.controller('MailerController', ['$scope', '$document', '$log', '$compile', '$uibModal', "MailerService", "MailQueryService", 'Socket',
    ($scope, $document, $log, $compile, $uibModal, MailerService, MailQueryService, Socket) => {
        let progress = (value) => {
            $scope.$emit('progress', value);
        };
        $scope.$on('progress', (event, value) => {
            $scope.progress = value;
        });
        let error_handler = (code, message) => {
            progress(false);
            $scope.message = message;
            $log.error(message);
            alert(message);
        };
        let alert = (message) => {
            let modalInstance = $uibModal.open({
                controller: 'AlertDialogController',
                templateUrl: '/common/dialogs/alert_dialog',
                resolve: {
                    items: () => {
                        return message;
                    }
                }
            });
            modalInstance.result.then((answer) => {
            }, () => {
            });
        };
        window.addEventListener('beforeunload', (e) => {
            if ($scope.opened) {
            }
        }, false);
        $document.on('drop dragover', (e) => {
            e.stopPropagation();
            e.preventDefault();
        });
        Socket.on("client", (data) => {
            let notifier = new NotifierModule.Notifier();
            notifier.Pass(data);
        });
        let Notify = (message) => {
            Socket.emit("server", { value: message }, () => {
            });
        };
        //let hoge = MailerService.sender;
        let SendMail = () => {
            let modalRegist = $uibModal.open({
                controller: 'SendMailDialogController',
                templateUrl: '/mailer/dialogs/send_mail_dialog',
                resolve: {
                    items: () => {
                        return { sender: [], userid: "", formname: "", article: {} };
                    }
                }
            });
            modalRegist.result.then((dialog_scope) => {
                let modalRegist = $uibModal.open({
                    controller: 'MailSendConfirmController',
                    templateUrl: '/mailer/dialogs/send_mail_confirm_dialog',
                    resolve: {
                        items: () => {
                        }
                    }
                });
                modalRegist.result.then((content) => {
                    SendDraw();
                    progress(false);
                }, () => {
                });
            }, () => {
            });
        };
        let OpenMail = (mail) => {
            let modalRegist = $uibModal.open({
                controller: 'OpenMailDialogController',
                templateUrl: '/mailer/dialogs/open_mail_dialog',
                resolve: {
                    items: () => {
                        return mail;
                    }
                }
            });
            modalRegist.result.then((content) => {
                progress(true);
            }, () => {
            });
        };
        let DeleteMail = (mail) => {
            let modalRegist = $uibModal.open({
                controller: 'MailDeleteConfirmController',
                templateUrl: '/mailer/dialogs/delete_mail_confirm_dialog',
                resolve: {
                    items: () => {
                    }
                }
            });
            modalRegist.result.then((content) => {
                progress(true);
                MailerService.Delete(mail, (result) => {
                    SendDraw();
                    ReceiveDraw();
                }, error_handler);
            }, () => {
            });
        };
        let SendFind = (newValue) => {
            MailQueryService.SetQuery(null);
            if (newValue) {
                MailQueryService.SetQuery({ "content.subject": { $regex: newValue } });
            }
            SendDraw();
        };
        let SendCount = () => {
            MailQueryService.Count(true, (result) => {
                if (result) {
                    $scope.sendcount = result;
                }
            }, error_handler);
        };
        let SendNext = () => {
            progress(true);
            MailQueryService.Next(true, (result) => {
                if (result) {
                    $scope.sendmails = result;
                }
                progress(false);
            }, error_handler);
        };
        let SendPrev = () => {
            progress(true);
            MailQueryService.Prev(true, (result) => {
                if (result) {
                    $scope.sendmails = result;
                }
                progress(false);
            }, error_handler);
        };
        let SendDraw = () => {
            progress(true);
            MailQueryService.Query(true, (result) => {
                if (result) {
                    $scope.sendmails = result;
                }
                progress(false);
            }, error_handler);
        };
        let ReceiveFind = (newValue) => {
            MailQueryService.SetQuery(null);
            if (newValue) {
                MailQueryService.SetQuery({ "content.subject": { $regex: newValue } });
            }
            ReceiveDraw();
        };
        let ReceiveCount = () => {
            MailQueryService.Count(false, (result) => {
                if (result) {
                    $scope.receivecount = result;
                }
            }, error_handler);
        };
        let ReceiveNext = () => {
            progress(true);
            MailQueryService.Next(false, (result) => {
                if (result) {
                    $scope.receivemails = result;
                }
                progress(false);
            }, error_handler);
        };
        let ReceivePrev = () => {
            progress(true);
            MailQueryService.Prev(false, (result) => {
                if (result) {
                    $scope.receivemails = result;
                }
                progress(false);
            }, error_handler);
        };
        let ReceiveDraw = () => {
            progress(true);
            MailQueryService.Query(false, (result) => {
                if (result) {
                    $scope.receivemails = result;
                }
                progress(false);
            }, error_handler);
        };
        let onDrop = (data, evt, id) => {
            $scope[id] = evt.element[0].src;
        };
        $scope.opened = false;
        $scope.OpenMail = OpenMail;
        $scope.SendMail = SendMail;
        $scope.DeleteMail = DeleteMail;
        $scope.onDrop = onDrop;
        $scope.SendFind = SendFind;
        $scope.SendCount = SendCount;
        $scope.SendNext = SendNext;
        $scope.SendPrev = SendPrev;
        SendDraw();
        $scope.ReceiveFind = ReceiveFind;
        $scope.ReceiveCount = ReceiveCount;
        $scope.ReceiveNext = ReceiveNext;
        $scope.ReceivePrev = ReceivePrev;
        ReceiveDraw();
    }]);
MailerControllers.filter('mailer', [() => {
        return (mail, field) => {
            let result = "";
            let delimiter = "";
            switch (field) {
                case "sender":
                    if (mail.content.from.length > 0) {
                        _.forEach(mail.content.from, (mail) => {
                            result += mail.address + delimiter;
                            delimiter = ",";
                        });
                    }
                    break;
                case "receiver":
                    if (mail.content.to.length > 0) {
                        _.forEach(mail.content.to, (mail) => {
                            result += mail.address + delimiter;
                            delimiter = ",";
                        });
                    }
                    break;
                case "subject":
                    if (mail.content.subject) {
                        result = mail.content.subject;
                    }
                    break;
                default:
            }
            return result;
        };
    }]);
MailerControllers.controller('SendMailDialogController', ['$scope', '$log', '$uibModalInstance', 'MailerService', 'ArticleService', 'items',
    ($scope, $log, $uibModalInstance, MailerService, ArticleService, items) => {
        let progress = (value) => {
            $scope.$emit('progress', value);
        };
        $scope.$on('progress', (event, value) => {
            $scope.progress = value;
        });
        let error_handler = (code, message) => {
            progress(false);
            $scope.message = message;
            $log.error(message);
        };
        $scope.sender = items.sender;
        $scope.subject = items.subject;
        let userid = items.userid;
        let formname = items.formname;
        let article = items.article;
        /*
        if ((userid + formname) != "") {
            ArticleService.RenderFragment(userid, formname, article, (result: any): void => {
                $scope.$evalAsync(   // $apply
                    function ($scope) {
                        $scope.doc = result.resource;
                    }
                );
            }, error_handler);
        }
        */
        $scope.hide = () => {
            $uibModalInstance.close();
        };
        $scope.cancel = () => {
            $uibModalInstance.dismiss();
        };
        $scope.answer = () => {
            progress(true);
            let to = "";
            let delimmiter = "";
            _.forEach($scope.sender, (address) => {
                to += delimmiter + address;
                delimmiter = ",";
            });
            let subject = $scope.subject;
            let doc = $scope.doc;
            MailerService.Send({
                to: to,
                subject: subject,
                html: doc
            }, (result) => {
                $uibModalInstance.close($scope);
            }, error_handler);
        };
    }]);
MailerControllers.controller('OpenMailDialogController', ['$scope', '$uibModalInstance', 'items',
    ($scope, $uibModalInstance, items) => {
        let to = "";
        let delimmiter = "";
        _.forEach(items.content.to, (entry) => {
            to += delimmiter + entry.address;
            delimmiter = ",";
        });
        let from = "";
        delimmiter = "";
        _.forEach(items.content.from, (entry) => {
            from += delimmiter + entry.address;
            delimmiter = ",";
        });
        $scope.from = from;
        $scope.to = to;
        $scope.subject = items.content.subject;
        $scope.html = items.content.html;
        $scope.hide = () => {
            $uibModalInstance.close();
        };
        $scope.cancel = () => {
            $uibModalInstance.dismiss();
        };
        $scope.answer = () => {
            $uibModalInstance.close({});
        };
    }]);
MailerControllers.controller('MailSendConfirmController', ['$scope', '$uibModalInstance', 'items',
    ($scope, $uibModalInstance, items) => {
        $scope.hide = () => {
            $uibModalInstance.close();
        };
        $scope.cancel = () => {
            $uibModalInstance.dismiss();
        };
        $scope.answer = () => {
            $uibModalInstance.close({});
        };
    }]);
MailerControllers.controller('MailDeleteConfirmController', ['$scope', '$uibModalInstance', 'items',
    ($scope, $uibModalInstance, items) => {
        $scope.hide = () => {
            $uibModalInstance.close();
        };
        $scope.cancel = () => {
            $uibModalInstance.dismiss();
        };
        $scope.answer = () => {
            $uibModalInstance.close({});
        };
    }]);
//# sourceMappingURL=mailer_controllers.js.map