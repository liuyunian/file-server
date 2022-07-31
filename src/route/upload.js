/* 扩展模块 */
const fs = require('fs');
const path = require('path');
const util = require('util');
const formidable = require('formidable'); // 上传模块

const rename = util.promisify(fs.rename);

function upload(req, res, filePath, rootPath){
  const form = new formidable.IncomingForm();

  form.keepExtensions = true;
  form.uploadDir = `${filePath}`;
  form.parse(req, (err, Fields, files) => {
    if (err) {
      res.writeHead(500, {'Content-Type': 'text/plain;charset=UTF-8'});
      res.end('服务器出错了！');
    } else{
      const oldName = files.file.path;
      const newName = path.join(filePath, files.file.name);
      Rename(oldName, newName, res);

      const relativePath = encodeURI(path.relative(rootPath, filePath));
      res.writeHead(302, {'Location': `/${relativePath}`});
      res.end();
    }
  });
}

async function Rename(oldName, newName, res){
  try{
    await rename(oldName, newName);
  }
  catch(Exception){
    res.writeHead(500, {'Content-Type': 'text/plain;charset=UTF-8'});
    res.end('服务器出错了！');
  }
}

module.exports = upload;