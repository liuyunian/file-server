/* 扩展模块 */
const fs = require('fs');
const path = require('path');
const promisify = require('util').promisify;

const fileMkdir = promisify(fs.mkdir);

function newFolder(req, res, filePath, rootPath){
    let data = [];
    
    req.on('data', (chunk) => { //data事件是继承自readStream
        data.push(chunk);
    });

    req.on('end', () => { 
        const postData = Buffer.concat(data).toString(); //拿到post提交的数据

        let subString = postData.split('='); 
        const folderName = decodeURI(subString[1]); //拿到folder name

        const newFolderPath = path.join(filePath, folderName); //构建新文件夹的路径
        makeDirectory(newFolderPath);
        
        const relativePath = encodeURI(path.relative(rootPath, filePath));
        res.writeHead(302, {'Location': `/${relativePath}`});
        res.end();
    });
}

async function makeDirectory(newFolderPath){
    try{
        await fileMkdir(newFolderPath);
    }
    catch(Exception){
        console.error(Exception);
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end('服务器出错了！');
    }
}

module.exports = newFolder;