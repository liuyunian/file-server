/* 扩展模块 */
const formidable = require('formidable'); //上传模块
const fs = require('fs');
const path = require('path');
const promisify = require('util').promisify;

const fileRename = promisify(fs.rename);

function dealUpload(req, res, filePath, rootPath){
    const form = new formidable.IncomingForm(); //创建formidable.IncomingForm对象

    form.keepExtensions = true; //保持原有的扩展名
    form.uploadDir = `${filePath}`; //修改成指定的目录
    form.parse(req, (err, Fields, files) => { //这个异步回调不容易进行改造
        if(err){
            console.error(Exception);
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end('服务器出错了！');
        }
        else{
            const uploadFileOldName = files.file.path;
            const uploadFileNewName = path.join(filePath, files.file.name);
            rename(uploadFileOldName, uploadFileNewName); //如果不重新命名的话，名字是随机的
    
            const relativePath = encodeURI(path.relative(rootPath, filePath));
            res.writeHead(302, {'Location': `/${relativePath}`});
            res.end();
        }
    });
}

async function rename(oldName, newName){
    try{
        await fileRename(oldName, newName);
    }
    catch(Exception){
        console.error(Exception);
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end('服务器出错了！');
    }
}

module.exports = dealUpload;