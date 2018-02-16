/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CipherModule;
(function (CipherModule) {
    var cipher_crypto = require('crypto');
    var cipher_cryptico = require('cryptico');
    var Cipher = /** @class */ (function () {
        function Cipher() {
        }
        Cipher.FixedCrypt = function (name, password) {
            var cipher = cipher_crypto.createCipher('aes192', password);
            try {
                var crypted = cipher.update(name, 'utf8', 'hex');
                crypted += cipher.final('hex');
                return crypted;
            }
            catch (ex) {
            }
        };
        Cipher.FixedDecrypt = function (name, password) {
            var decipher = cipher_crypto.createDecipher('aes192', password);
            try {
                var decrypted = decipher.update(name, 'hex', 'utf8');
                decrypted += decipher.final('utf8');
                return decrypted;
            }
            catch (ex) {
            }
        };
        Cipher.PublicKey = function (passphrase) {
            var secretkey = cipher_cryptico.generateRSAKey(passphrase, 1024);
            return cipher_cryptico.publicKeyString(secretkey);
        };
        Cipher.PublicKeyDecrypt = function (passphrase, crypted) {
            var secretkey = cipher_cryptico.generateRSAKey(passphrase, 1024);
            return cipher_cryptico.decrypt(crypted, secretkey);
        };
        return Cipher;
    }());
    CipherModule.Cipher = Cipher;
})(CipherModule = exports.CipherModule || (exports.CipherModule = {}));
module.exports = CipherModule;
//# sourceMappingURL=cipher.js.map