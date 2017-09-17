/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CipherModule;
(function (CipherModule) {
    const cipher_crypto = require('crypto');
    const cipher_cryptico = require('cryptico');
    class Cipher {
        static FixedCrypt(name, password) {
            let cipher = cipher_crypto.createCipher('aes192', password);
            try {
                let crypted = cipher.update(name, 'utf8', 'hex');
                crypted += cipher.final('hex');
                return crypted;
            }
            catch (ex) {
            }
        }
        static FixedDecrypt(name, password) {
            let decipher = cipher_crypto.createDecipher('aes192', password);
            try {
                let decrypted = decipher.update(name, 'hex', 'utf8');
                decrypted += decipher.final('utf8');
                return decrypted;
            }
            catch (ex) {
            }
        }
        static PublicKey(passphrase) {
            let secretkey = cipher_cryptico.generateRSAKey(passphrase, 1024);
            return cipher_cryptico.publicKeyString(secretkey);
        }
        static PublicKeyDecrypt(passphrase, crypted) {
            let secretkey = cipher_cryptico.generateRSAKey(passphrase, 1024);
            return cipher_cryptico.decrypt(crypted, secretkey);
        }
    }
    CipherModule.Cipher = Cipher;
})(CipherModule = exports.CipherModule || (exports.CipherModule = {}));
module.exports = CipherModule;
//# sourceMappingURL=cipher.js.map