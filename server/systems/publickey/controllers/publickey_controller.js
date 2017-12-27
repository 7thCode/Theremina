/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PublicKeyModule;
(function (PublicKeyModule) {
    var share = require('../../common/share');
    var Config = share.config;
    var Wrapper = share.Wrapper;
    var Cipher = share.Cipher;
    var PublicKey = (function () {
        function PublicKey() {
        }
        PublicKey.prototype.get_fixed_public_key = function (request, response) {
            if (Config.use_publickey) {
                var systempassphrase = request.session.id;
                Wrapper.SendSuccess(response, Cipher.PublicKey(systempassphrase));
            }
            else {
                Wrapper.SendError(response, 1, "", null);
            }
        };
        PublicKey.prototype.get_public_key = function (request, response) {
            if (Config.use_publickey) {
                Wrapper.SendSuccess(response, Cipher.PublicKey(request.user.passphrase));
            }
            else {
                Wrapper.SendError(response, 1, "", null);
            }
        };
        PublicKey.prototype.get_access_token = function (request, response) {
            if (Config.use_publickey) {
                Wrapper.SendSuccess(response, Cipher.FixedCrypt(request.session.id, request.user.passphrase));
            }
            else {
                Wrapper.SendError(response, 1, "", null);
            }
        };
        PublicKey.prototype.decrypt_test = function (request, response) {
            Wrapper.Authenticate(request, response, function (req, res) {
                var passphrase = req.user.passphrase;
                var CipherText = req.params.text;
                var SecretKey = cryptico.generateRSAKey(passphrase, 1024); //秘密鍵
                var Decryption = cryptico.decrypt(CipherText, SecretKey); // 復号
                var textForm = Decryption.plaintext;
                res.send(textForm);
            });
        };
        return PublicKey;
    }());
    PublicKeyModule.PublicKey = PublicKey;
})(PublicKeyModule = exports.PublicKeyModule || (exports.PublicKeyModule = {}));
module.exports = PublicKeyModule;
//# sourceMappingURL=publickey_controller.js.map