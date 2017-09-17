/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PublicKeyModule;
(function (PublicKeyModule) {
    const share = require('../../common/share');
    const Config = share.config;
    const Wrapper = share.Wrapper;
    const Cipher = share.Cipher;
    class PublicKey {
        get_fixed_public_key(request, response) {
            if (Config.use_publickey) {
                let systempassphrase = request.session.id;
                Wrapper.SendSuccess(response, Cipher.PublicKey(systempassphrase));
            }
            else {
                Wrapper.SendError(response, 1, "", null);
            }
        }
        get_public_key(request, response) {
            if (Config.use_publickey) {
                Wrapper.SendSuccess(response, Cipher.PublicKey(request.user.passphrase));
            }
            else {
                Wrapper.SendError(response, 1, "", null);
            }
        }
        get_access_token(request, response) {
            if (Config.use_publickey) {
                Wrapper.SendSuccess(response, Cipher.FixedCrypt(request.session.id, request.user.passphrase));
            }
            else {
                Wrapper.SendError(response, 1, "", null);
            }
        }
        decrypt_test(request, response) {
            Wrapper.Authenticate(request, response, (req, res) => {
                let passphrase = req.user.passphrase;
                let CipherText = req.params.text;
                let SecretKey = cryptico.generateRSAKey(passphrase, 1024); //秘密鍵
                let Decryption = cryptico.decrypt(CipherText, SecretKey); // 復号
                let textForm = Decryption.plaintext;
                res.send(textForm);
            });
        }
    }
    PublicKeyModule.PublicKey = PublicKey;
})(PublicKeyModule = exports.PublicKeyModule || (exports.PublicKeyModule = {}));
module.exports = PublicKeyModule;
//# sourceMappingURL=publickey_controller.js.map