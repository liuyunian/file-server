const fs = require('fs');
const path = require('path');

function newFolder(req, res, filePath, rootPath){
    let data = [];
    
    req.on('data', (chunk) => {
        data.push(chunk);
    });

    req.on('end', () => { 
        const postData = Buffer.concat(data).toString(); //拿到post提交的数据

        let subString = postData.split('='); 
        const folderName = decodeURI(subString[1]); //拿到folder name
        console.log(folderName);

        const newFolderPath = path.join(filePath, folderName); //构建新文件夹的路径
        fs.mkdirSync(newFolderPath); //同步方式创建新文件夹，是否能改成异步
        
        const relativePath = path.relative(rootPath, filePath);
        res.writeHead(302, {'Location': `/${relativePath}`});
        res.end();
    });
}

module.exports = newFolder;