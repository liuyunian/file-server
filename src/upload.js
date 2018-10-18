const formidable = require('formidable'); //上传模块
const fs = require('fs');
const path = require('path');

function dealUpload(req, res, filePath, rootPath){
    const form = new formidable.IncomingForm(); //创建formidable.IncomingForm对象

    form.keepExtensions = true; //保持原有的扩展名
    form.uploadDir = `${filePath}`; //修改成指定的目录
    form.parse(req, (err, fields, files) => {
        if(err){
            console.error(err);
            return;
        }
        else{
            const uploadFileNewName = path.join(filePath, files.file.name);
            const uploadFileOldName = files.file.path;
            fs.renameSync(uploadFileOldName, uploadFileNewName); //如果不重新命名的话，名字是随机的
    
            const relativePath = path.relative(rootPath, filePath);
            res.writeHead(302, {'Location': `/${relativePath}`});
            res.end();
        }
    });
}

module.exports = dealUpload;