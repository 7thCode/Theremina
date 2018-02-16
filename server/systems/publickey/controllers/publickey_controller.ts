/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

"use strict";

export module PublicKeyModule {

    const share: any = require('../../common/share');
    const Config: any = share.config;
    const Wrapper: any = share.Wrapper;
    const Cipher: any = share.Cipher;

    export class PublicKey {

        public get_fixed_public_key(request: any, response: Express.Response): void {
            if (Config.use_publickey) {
                let systempassphrase: string = request.session.id;
                Wrapper.SendSuccess(response, Cipher.PublicKey(systempassphrase));
            } else {
                Wrapper.SendError(response, 1, "", null);
            }
        }

        public get_public_key(request: Express.Request, response: Express.Response): void {
            if (Config.use_publickey) {
                Wrapper.SendSuccess(response, Cipher.PublicKey(request.user.passphrase));
            } else {
                Wrapper.SendError(response, 1, "", null);
            }
        }

        public get_access_token(request: any, response: Express.Response): void {
            if (Config.use_publickey) {
                Wrapper.SendSuccess(response, Cipher.FixedCrypt(request.session.id, request.user.passphrase));
            } else {
                Wrapper.SendError(response, 1, "", null);
            }
        }

        public decrypt_test(request: Express.Request, response: Express.Response) :void {
            Wrapper.Authenticate(request, response, (req: any, res: any): void => {
                let passphrase: string = req.user.passphrase;
                let CipherText: string = req.params.text;
                let SecretKey: string = cryptico.generateRSAKey(passphrase, 1024);  //秘密鍵
                let Decryption: any = cryptico.decrypt(CipherText, SecretKey); // 復号
                let textForm: string = Decryption.plaintext;
                res.send(textForm);
            });
        }
    }
}

module.exports = PublicKeyModule;
