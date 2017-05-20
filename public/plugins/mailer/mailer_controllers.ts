/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

let MailerControllers: angular.IModule = angular.module('MailerControllers', ["ngResource"]);

MailerControllers.controller('MailerController', ['$scope', '$document', '$log', '$compile', '$uibModal', "MailerService", "MailQueryService", 'Socket',
    ($scope: any, $document: any, $log: any, $compile: any, $uibModal: any, MailerService: any, MailQueryService: any, Socket: any): void => {

        let progress = (value) => {
            $scope.$emit('progress', value);
        };

        $scope.$on('progress', (event, value) => {
            $scope.progress = value;
        });

        let error_handler: (code: number, message: string) => void = (code: number, message: string): void => {
            progress(false);
            $scope.message = message;
            $log.error(message);
            window.alert(message);
        };

        window.addEventListener('beforeunload', (e) => {
            if ($scope.opened) {

            }
        }, false);

        $document.on('drop dragover', (e: any): void => {
            e.stopPropagation();
            e.preventDefault();
        });

        Socket.on("client", (data: any): void => {
            let notifier: any = new NotifierModule.Notifier();
            notifier.Pass(data);
        });

        let Notify = (message: string): void => {
            Socket.emit("server", {value: message}, () => {

            });
        };

        //let hoge = MailerService.sender;

        let SendMail = (): void => {

            let modalRegist: any = $uibModal.open({
                controller: 'SendMailDialogController',
                templateUrl: '/mailer/dialogs/send_mail_dialog',
                resolve: {
                    items: (): any => {
                        return {sender:[],userid:"", formname:"", article:{}};
                    }
                }
            });

            modalRegist.result.then((dialog_scope: any): void => {

                let modalRegist: any = $uibModal.open({
                    controller: 'MailSendConfirmController',
                    templateUrl: '/mailer/dialogs/send_mail_confirm_dialog',
                    resolve: {
                        items: (): any => {
                        }
                    }
                });

                modalRegist.result.then((content: any): void => {
                    SendDraw();
                    progress(false);
                }, (): void => {
                });

            }, (): void => {
            });
        };

        let OpenMail = (mail): void => {

            let modalRegist: any = $uibModal.open({
                controller: 'OpenMailDialogController',
                templateUrl: '/mailer/dialogs/open_mail_dialog',
                resolve: {
                    items: (): any => {
                        return mail;
                    }
                }
            });

            modalRegist.result.then((content): void => {
                progress(true);
            }, (): void => {
            });
        };



        let DeleteMail = (mail): void => {

            let modalRegist: any = $uibModal.open({
                controller: 'MailDeleteConfirmController',
                templateUrl: '/mailer/dialogs/delete_mail_confirm_dialog',
                resolve: {
                    items: (): any => {
                    }
                }
            });

            modalRegist.result.then((content): void => {
                progress(true);
                MailerService.Delete(mail, (result: any): void => {
                    SendDraw();
                    ReceiveDraw();
                }, error_handler);
            }, (): void => {
            });
        };


        let SendFind = (newValue: string): void => {

            MailQueryService.SetQuery(null);
            if (newValue) {
                MailQueryService.SetQuery({"content.subject": {$regex: newValue}});
            }

            SendDraw();
        };

        let SendCount: () => void = (): void => {
            MailQueryService.Count(true, (result: any): void => {
                if (result) {
                    $scope.sendcount = result;
                }
            }, error_handler);
        };

        let SendNext = (): void => {
            progress(true);
            MailQueryService.Next(true, (result) => {
                if (result) {
                    $scope.sendmails = result;
                }
                progress(false);
            }, error_handler);
        };

        let SendPrev = (): void => {
            progress(true);
            MailQueryService.Prev(true, (result) => {
                if (result) {
                    $scope.sendmails = result;
                }
                progress(false);
            }, error_handler);
        };

        let SendDraw = (): void => {
            progress(true);
            MailQueryService.Query(true, (result) => {
                if (result) {
                    $scope.sendmails = result;
                }
                progress(false);
            }, error_handler);
        };


        let ReceiveFind = (newValue: string): void => {
            MailQueryService.SetQuery(null);
            if (newValue) {
                MailQueryService.SetQuery({"content.subject": {$regex: newValue}});
            }
            ReceiveDraw();
        };

        let ReceiveCount: () => void = (): void => {
            MailQueryService.Count(false, (result: any): void => {
                if (result) {
                    $scope.receivecount = result;
                }
            }, error_handler);
        };

        let ReceiveNext = (): void => {
            progress(true);
            MailQueryService.Next(false, (result) => {
                if (result) {
                    $scope.receivemails = result;
                }
                progress(false);
            }, error_handler);
        };

        let ReceivePrev = (): void => {
            progress(true);
            MailQueryService.Prev(false, (result) => {
                if (result) {
                    $scope.receivemails = result;
                }
                progress(false);
            }, error_handler);
        };

        let ReceiveDraw = (): void => {
            progress(true);
            MailQueryService.Query(false, (result) => {
                if (result) {
                    $scope.receivemails = result;
                }
                progress(false);
            }, error_handler);
        };

        let onDrop = (data, evt, id): void => {
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

MailerControllers.filter('mailer', [(): any => {
    return (mail: any, field: string): string => {
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

MailerControllers.controller('SendMailDialogController', ['$scope', '$log', '$uibModalInstance', 'MailerService','ArticleService', 'items',
    ($scope: any, $log: any, $uibModalInstance: any, MailerService: any,ArticleService:any, items: any): void => {

        let progress = (value) => {
            $scope.$emit('progress', value);
        };

        $scope.$on('progress', (event, value) => {
            $scope.progress = value;
        });

        let error_handler: (code: number, message: string) => void = (code: number, message: string): void => {
            progress(false);
            $scope.message = message;
            $log.error(message);
            window.alert(message);
        };

        $scope.sender = items.sender;
        $scope.subject = items.subject;

        let userid =  items.userid;
        let formname =  items.formname;
        let article =  items.article;

        if ((userid + formname) != "") {
            ArticleService.RenderFragment(userid, formname, article, (result: any): void => {
                $scope.$evalAsync(   // $apply
                    function ($scope) {
                        $scope.doc = result.resource;

                        // $scope.doc = '<DIV><DIV style="background:#e8e8e8;text-align:center;"  align="center" ><DIV style="margin:0 auto;padding:30px 0 15px;width:540px;" > <DIV style="background:#ffffff;border-radius:4px;border:1px solid #d4d4d4;font-size:14px;margin:0 auto;text-align:left;width:540px;"  align="left" > <DIV style="color:#222;margin:0 auto;padding:40px 0;width:460px;" ><TABLE><TBODY><TR><TD>件名：【○○おまかせネット】ご紹介企業様の選定結果について。</TD></TR><TR><TD></TD></TR><TR><TD>○○様</TD></TR><TR><TD></TD></TR><TR><TD>お世話になっております。</TD></TR><TR><TD>おまかせネット受付窓口の○○と申します。</TD></TR><TR><TD></TD></TR><TR><TD>先日は、「○○おまかせネット」にお問い合わせいただきまして、誠にありがとうございました。</TD></TR><TR><TD>本日は、ご紹介企業様の選定結果をご連絡させていただきました。</TD></TR><TR><TD></TD></TR><TR><TD>お問い合わせ内容を基に、○○様にサービスをご提供いただける企業様をお探しいたしましたが、</TD></TR><TR><TD>弊社と提携している企業様では、エリアや条件などの問題で、</TD></TR><TR><TD>ご紹介できる企業様を見つけることができませんでした。</TD></TR><TR><TD></TD></TR><TR><TD>企業様の選定にお時間をいただきましたが、</TD></TR><TR><TD>このような結果となり、○○様のお力になれず申し訳ございません。</TD></TR><TR><TD></TD></TR><TR><TD>弊社では、引き続きお客様に喜んでいただけるサービスを提供できるよう</TD></TR><TR><TD>サービスの向上に努めてまいります。</TD></TR><TR><TD></TD></TR><TR><TD>またの機会がございましたら、</TD></TR><TR><TD>弊社サービスを何卒よろしくお願い申し上げます。</TD></TR> </TBODY></TABLE></DIV></DIV></DIV></DIV></DIV>';
                    }
                );
            }, error_handler);
        }

        $scope.hide = (): void => {
            $uibModalInstance.close();
        };

        $scope.cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        $scope.answer = (): void => {
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
            }, (result: any): void => {
                $uibModalInstance.close($scope);
            }, error_handler);

        };

    }]);

MailerControllers.controller('OpenMailDialogController', ['$scope', '$uibModalInstance', 'items',
    ($scope: any, $uibModalInstance: any, items: any): void => {

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

        $scope.hide = (): void => {
            $uibModalInstance.close();
        };

        $scope.cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        $scope.answer = (): void => {
            $uibModalInstance.close({});
        };

    }]);

MailerControllers.controller('MailSendConfirmController', ['$scope', '$uibModalInstance', 'items',
    ($scope: any, $uibModalInstance: any, items: any): void => {

        $scope.hide = (): void => {
            $uibModalInstance.close();
        };

        $scope.cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        $scope.answer = (): void => {
            $uibModalInstance.close({});
        };

    }]);

MailerControllers.controller('MailDeleteConfirmController', ['$scope', '$uibModalInstance', 'items',
    ($scope: any, $uibModalInstance: any, items: any): void => {

        $scope.hide = (): void => {
            $uibModalInstance.close();
        };

        $scope.cancel = (): void => {
            $uibModalInstance.dismiss();
        };

        $scope.answer = (): void => {
            $uibModalInstance.close({});
        };

    }]);