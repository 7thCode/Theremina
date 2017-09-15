/**!
 Copyright (c) 2016 7thCode.(http://seventh-code.com/)
 This software is released under the MIT License.
 //opensource.org/licenses/mit-license.php
 */

module.exports = exports = function UserDataPlugin(schema: any, options: any) {

    schema.add({userid: String});
    schema.add({content: Object});
    schema.add({namespace: String});
    schema.add({name: String});
    schema.add({open: Boolean});
    schema.add({type: Number});
    schema.add({status: Number});
    schema.add({version: Number});

    // schema.index({name: 1});

    schema.pre('save', function (next: any) {
        if (!this.userid) {
            this.userid = "";
        }
        if (!this.namespace) {
            this.namespace = "";
        }
        if (!this.name) {
            this.name = "";
        }
        if (!this.type) {
            this.type = 0;
        }
        if (!this.open) {
            this.open = true;
        }
        if (!this.status) {
            this.status = 1;
        }
        if (!this.version) {
            this.version = 1;
        }
        if (!this.content) {
            this.content = {};
        }
        next();
    });

};
