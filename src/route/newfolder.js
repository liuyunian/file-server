/* 扩展模块 */
const fs = require('fs');
const path = require('path');
const util = require('util');

const mkdir = util.promisify(fs.mkdir);

function newFolder(req, res, filePath, rootPath){
  let data = [];

  req.on('data', (chunk) => {
    data.push(chunk);
  });

  req.on('end', () => { 
    const postData = Buffer.concat(data).toString();
    const folderName = decodeURI(postData.split('=')[1]);

    MakeDirectory(path.join(filePath, folderName), res);
    
    const relativePath = encodeURI(path.relative(rootPath, filePath));
    res.writeHead(302, {'Location': `/${relativePath}`});
    res.end();
  });
}

async function MakeDirectory(path, res){
  try{
    await mkdir(path);
  } 
  catch(Exception){
    res.writeHead(500, {'Content-Type': 'text/plain;charset=UTF-8'});
    res.end('服务器出错了！');
  }
}

module.exports = newFolder;