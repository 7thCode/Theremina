/**!
 Copyright (c) 2016 7thCode.(httpz://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
var AuthServicesModule;
(function (AuthServicesModule) {
    var AuthServices = angular.module('AuthServices', []);
    AuthServices.factory('Profile', ['$resource',
        function ($resource) {
            return $resource('/profile/api', {}, {
                get: { method: 'GET' },
                put: { method: 'PUT' },
            });
        }]);
    AuthServices.factory('Register', ['$resource',
        function ($resource) {
            return $resource('/auth/local/register', {}, {
                regist: { method: 'POST' }
            });
        }]);
    AuthServices.factory('Member', ['$resource',
        function ($resource) {
            return $resource('/auth/local/member', {}, {
                regist: { method: 'POST' }
            });
        }]);
    AuthServices.factory('Login', ['$resource',
        function ($resource) {
            return $resource('/auth/local/login', {}, {
                login: { method: 'POST' }
            });
        }]);
    AuthServices.factory('Password', ['$resource',
        function ($resource) {
            return $resource('/auth/local/password', {}, {
                change: { method: 'POST' }
            });
        }]);
    AuthServices.factory('Logout', ['$resource',
        function ($resource) {
            return $resource('/auth/logout', {}, {
                logout: { method: 'POST' }
            });
        }]);
    AuthServices.service('AuthService', ["Register", "Login", "Logout", "Password", "Member", "PublicKeyService",
        function (Register, Login, Logout, Password, Member, PublicKeyService) {
            this.Regist = function (username, password, displayName, metadata, callback, error) {
                PublicKeyService.Fixed(function (key) {
                    var regist = new Register();
                    if (key) {
                        regist.username = cryptico.encrypt(username, key).cipher;
                        regist.password = cryptico.encrypt(password, key).cipher;
                    }
                    else {
                        regist.username = username;
                        regist.password = password;
                    }
                    regist.displayName = displayName;
                    regist.metadata = metadata;
                    regist.$regist(function (account) {
                        if (account) {
                            if (account.code === 0) {
                                callback(account.value);
                            }
                            else {
                                error(account.code, account.message);
                            }
                        }
                        else {
                            error(10000, "network error");
                        }
                    });
                });
            };
            this.Member = function (username, password, displayName, metadata, callback, error) {
                PublicKeyService.Fixed(function (key) {
                    var member = new Member();
                    if (key) {
                        member.username = cryptico.encrypt(username, key).cipher;
                        member.password = cryptico.encrypt(password, key).cipher;
                    }
                    else {
                        member.username = username;
                        member.password = password;
                    }
                    member.displayName = displayName;
                    member.metadata = metadata;
                    member.$regist(function (account) {
                        if (account) {
                            if (account.code === 0) {
                                callback(account.value);
                            }
                            else {
                                error(account.code, account.message);
                            }
                        }
                        else {
                            error(10000, "network error");
                        }
                    });
                });
            };
            this.Login = function (username, password, callback, error) {
                PublicKeyService.Fixed(function (key) {
                    var login = new Login();
                    if (key) {
                        login.username = cryptico.encrypt(username, key).cipher;
                        login.password = cryptico.encrypt(password, key).cipher;
                    }
                    else {
                        login.username = username;
                        login.password = password;
                    }
                    login.$login(function (account) {
                        if (account) {
                            if (account.code === 0) {
                                callback(account.value);
                            }
                            else {
                                error(account.code, account.message);
                            }
                        }
                        else {
                            error(10000, "network error");
                        }
                    });
                });
            };
            this.Logout = function (callback) {
                var logout = new Logout();
                logout.$logout(function (account) {
                    if (account) {
                        if (account.code === 0) {
                            callback(account.value);
                        }
                    }
                });
            };
            this.Password = function (username, password, callback, error) {
                PublicKeyService.Fixed(function (key) {
                    var pass = new Password();
                    if (key) {
                        pass.username = cryptico.encrypt(username, key).cipher;
                        pass.password = cryptico.encrypt(password, key).cipher;
                    }
                    else {
                        pass.username = username;
                        pass.password = password;
                    }
                    pass.$change(function (account) {
                        if (account) {
                            if (account.code === 0) {
                                callback(account.value);
                            }
                            else {
                                error(account.code, account.message);
                            }
                        }
                        else {
                            error(10000, "network error");
                        }
                    });
                });
            };
        }]);
    AuthServices.service('ProfileService', ["Profile",
        function (Self) {
            this.Get = function (callback, error) {
                Self.get({}, function (result) {
                    if (result) {
                        switch (result.code) {
                            case 0:
                                callback(result.value);
                                break;
                            case 1:
                                callback(null);
                                break;
                            default:
                                error(result.code, result.message);
                        }
                    }
                    else {
                        error(10000, "network error");
                    }
                });
            };
            this.Put = function (content, callback, error) {
                var self = new Self();
                self.local = content;
                self.$put({}, function (result) {
                    if (result) {
                        if (result.code === 0) {
                            callback(result.value);
                        }
                        else {
                            error(result.code, result.message);
                        }
                    }
                    else {
                        error(10000, "network error");
                    }
                });
            };
        }]);
})(AuthServicesModule || (AuthServicesModule = {}));
//# sourceMappingURL=auth_services.js.map