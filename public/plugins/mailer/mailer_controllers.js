/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var MailerControllers = angular.module('MailerControllers', ["ngResource"]);
MailerControllers.controller('MailerController', ['$scope', '$document', '$log', '$compile', '$uibModal', "MailerService", "MailQueryService", 'Socket',
    function ($scope, $document, $log, $compile, $uibModal, MailerService, MailQueryService, Socket) {
        var progress = function (value) {
            $scope.$emit('progress', value);
        };
        $scope.$on('progress', function (event, value) {
            $scope.progress = value;
        });
        var error_handler = function (code, message) {
            progress(false);
            $scope.message = message;
            $log.error(message);
            alert(message);
        };
        var alert = function (message) {
            var modalInstance = $uibModal.open({
                controller: 'AlertDialogController',
                templateUrl: '/common/dialogs/alert_dialog',
                resolve: {
                    items: function () {
                        return message;
                    }
                }
            });
            modalInstance.result.then(function (answer) {
            }, function () {
            });
        };
        window.addEventListener('beforeunload', function (e) {
            if ($scope.opened) {
            }
        }, false);
        $document.on('drop dragover', function (e) {
            e.stopPropagation();
            e.preventDefault();
        });
        Socket.on("client", function (data) {
            var notifier = new NotifierModule.Notifier();
            notifier.Pass(data);
        });
        var Notify = function (message) {
            Socket.emit("server", { value: message }, function () {
            });
        };
        //let hoge = MailerService.sender;
        var SendMail = function () {
            var modalRegist = $uibModal.open({
                controller: 'SendMailDialogController',
                templateUrl: '/mailer/dialogs/send_mail_dialog',
                resolve: {
                    items: function () {
                        return { sender: [], userid: "", formname: "", article: {} };
                    }
                }
            });
            modalRegist.result.then(function (dialog_scope) {
                var modalRegist = $uibModal.open({
                    controller: 'MailSendConfirmController',
                    templateUrl: '/mailer/dialogs/send_mail_confirm_dialog',
                    resolve: {
                        items: function () {
                        }
                    }
                });
                modalRegist.result.then(function (content) {
                    SendDraw();
                    progress(false);
                }, function () {
                });
            }, function () {
            });
        };
        var OpenMail = function (mail) {
            var modalRegist = $uibModal.open({
                controller: 'OpenMailDialogController',
                templateUrl: '/mailer/dialogs/open_mail_dialog',
                resolve: {
                    items: function () {
                        return mail;
                    }
                }
            });
            modalRegist.result.then(function (content) {
                progress(true);
            }, function () {
            });
        };
        var DeleteMail = function (mail) {
            var modalRegist = $uibModal.open({
                controller: 'MailDeleteConfirmController',
                templateUrl: '/mailer/dialogs/delete_mail_confirm_dialog',
                resolve: {
                    items: function () {
                    }
                }
            });
            modalRegist.result.then(function (content) {
                progress(true);
                MailerService.Delete(mail, function (result) {
                    SendDraw();
                    ReceiveDraw();
                }, error_handler);
            }, function () {
            });
        };
        var SendFind = function (newValue) {
            MailQueryService.SetQuery(null);
            if (newValue) {
                MailQueryService.SetQuery({ "content.subject": { $regex: newValue } });
            }
            SendDraw();
        };
        var SendCount = function () {
            MailQueryService.Count(true, function (result) {
                if (result) {
                    $scope.sendcount = result;
                }
            }, error_handler);
        };
        var SendNext = function () {
            progress(true);
            MailQueryService.Next(true, function (result) {
                if (result) {
                    $scope.sendmails = result;
                }
                progress(false);
            }, error_handler);
        };
        var SendPrev = function () {
            progress(true);
            MailQueryService.Prev(true, function (result) {
                if (result) {
                    $scope.sendmails = result;
                }
                progress(false);
            }, error_handler);
        };
        var SendDraw = function () {
            progress(true);
            MailQueryService.Query(true, function (result) {
                if (result) {
                    $scope.sendmails = result;
                }
                progress(false);
            }, error_handler);
        };
        var ReceiveFind = function (newValue) {
            MailQueryService.SetQuery(null);
            if (newValue) {
                MailQueryService.SetQuery({ "content.subject": { $regex: newValue } });
            }
            ReceiveDraw();
        };
        var ReceiveCount = function () {
            MailQueryService.Count(false, function (result) {
                if (result) {
                    $scope.receivecount = result;
                }
            }, error_handler);
        };
        var ReceiveNext = function () {
            progress(true);
            MailQueryService.Next(false, function (result) {
                if (result) {
                    $scope.receivemails = result;
                }
                progress(false);
            }, error_handler);
        };
        var ReceivePrev = function () {
            progress(true);
            MailQueryService.Prev(false, function (result) {
                if (result) {
                    $scope.receivemails = result;
                }
                progress(false);
            }, error_handler);
        };
        var ReceiveDraw = function () {
            progress(true);
            MailQueryService.Query(false, function (result) {
                if (result) {
                    $scope.receivemails = result;
                }
                progress(false);
            }, error_handler);
        };
        var onDrop = function (data, evt, id) {
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
MailerControllers.filter('mailer', [function () {
        return function (mail, field) {
            var result = "";
            var delimiter = "";
            switch (field) {
                case "sender":
                    if (mail.content.from.length > 0) {
                        _.forEach(mail.content.from, function (mail) {
                            result += mail.address + delimiter;
                            delimiter = ",";
                        });
                    }
                    break;
                case "receiver":
                    if (mail.content.to.length > 0) {
                        _.forEach(mail.content.to, function (mail) {
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
    function ($scope, $log, $uibModalInstance, MailerService, ArticleService, items) {
        var progress = function (value) {
            $scope.$emit('progress', value);
        };
        $scope.$on('progress', function (event, value) {
            $scope.progress = value;
        });
        var error_handler = function (code, message) {
            progress(false);
            $scope.message = message;
            $log.error(message);
        };
        $scope.sender = items.sender;
        $scope.subject = items.subject;
        var userid = items.userid;
        var formname = items.formname;
        var article = items.article;
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
        $scope.hide = function () {
            $uibModalInstance.close();
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
        $scope.answer = function () {
            progress(true);
            var to = "";
            var delimmiter = "";
            _.forEach($scope.sender, function (address) {
                to += delimmiter + address;
                delimmiter = ",";
            });
            var subject = $scope.subject;
            var doc = $scope.doc;
            MailerService.Send({
                to: to,
                subject: subject,
                html: doc
            }, function (result) {
                $uibModalInstance.close($scope);
            }, error_handler);
        };
    }]);
MailerControllers.controller('OpenMailDialogController', ['$scope', '$uibModalInstance', 'items',
    function ($scope, $uibModalInstance, items) {
        var to = "";
        var delimmiter = "";
        _.forEach(items.content.to, function (entry) {
            to += delimmiter + entry.address;
            delimmiter = ",";
        });
        var from = "";
        delimmiter = "";
        _.forEach(items.content.from, function (entry) {
            from += delimmiter + entry.address;
            delimmiter = ",";
        });
        $scope.from = from;
        $scope.to = to;
        $scope.subject = items.content.subject;
        $scope.html = items.content.html;
        $scope.hide = function () {
            $uibModalInstance.close();
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
        $scope.answer = function () {
            $uibModalInstance.close({});
        };
    }]);
MailerControllers.controller('MailSendConfirmController', ['$scope', '$uibModalInstance', 'items',
    function ($scope, $uibModalInstance, items) {
        $scope.hide = function () {
            $uibModalInstance.close();
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
        $scope.answer = function () {
            $uibModalInstance.close({});
        };
    }]);
MailerControllers.controller('MailDeleteConfirmController', ['$scope', '$uibModalInstance', 'items',
    function ($scope, $uibModalInstance, items) {
        $scope.hide = function () {
            $uibModalInstance.close();
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
        $scope.answer = function () {
            $uibModalInstance.close({});
        };
    }]);
//# sourceMappingURL=mailer_controllers.js.map