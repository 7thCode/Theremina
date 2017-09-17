/**
 * Created by oda on 2017/07/05.
 */

const fs: any = require('graceful-fs');

let source_path = "/Users/oda/Desktop/public";
let target_path = "/Users/oda/Desktop/target";


let dir = (path, callback:(file_path) => void) => {
    if (fs.statSync(path).isDirectory()) {
        let files = fs.readdirSync(path);
        files.forEach((file) => {
            dir(path + "/" + file , callback);
        });
    } else {
        callback(path);
    }
};

dir(source_path, (file_path) => {

    let target = file_path.substr(source_path.length + 1);
    let target2 = target.replace(/\u002f/g, "_");
    let target3 = target_path + "/" + target2;
    console.log("file : " + target3);

    fs.createReadStream(file_path).pipe(fs.createWriteStream(target3));

});
