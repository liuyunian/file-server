/* 扩展模块 */
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars'); //模板引擎
const promisify = require('util').promisify;

/* 自定义模块 */
const mime = require('../help/MIME.js');

const templatePath = path.join(__dirname, '../template/showDirectory.tpl'); //除了require时可以采用相对路径，其他情况尽量采用绝对路径。
const source = fs.readFileSync(templatePath); //同步保证了首先将模板读入内存
const template = Handlebars.compile(source.toString());

const fileStat = promisify(fs.stat);
const fileReaddir = promisify(fs.readdir); 

async function show(res, currentPath, rootPath){
    try{
        const currentFileStats = await fileStat(currentPath);

        if (currentFileStats.isFile()) { //要显示文件内容
            const ContentType = mime(currentPath);
            res.writeHead(200, {"Content-Type": ContentType});
            fs.createReadStream(currentPath).pipe(res);
        }
        else if (currentFileStats.isDirectory()) { //要列出文件下的信息
            const subFileNameArray = await fileReaddir(currentPath);

            let subFileInformationArray = Array(subFileNameArray.length); //目录文件信息对象数组
            for (let subFileName of subFileNameArray) { 
                subFileInformationArray.push(getSubFileInformation(currentPath, subFileName));
            }

            const pageTitle = path.basename(currentPath); //页面的标题，当前的目录名
            const subFileDir = path.relative(rootPath, currentPath); //文件的相对路径，用于模板的超链接
            const lastFileDir = path.dirname(subFileDir); //上级目录
            const templateData = {
                title: pageTitle,
                lastDir: lastFileDir ? `/${lastFileDir}` : '',
                dir: subFileDir ? `/${subFileDir}` : '',
                filesInformation: subFileInformationArray
            };

            res.writeHead(200, {
                "Content-Type": "text/html;charset=UTF-8",
                "Cache-Control": "no-store"
            });
            res.end(template(templateData));
        }
    }
    catch(Exception){
        console.error(Exception); 
        res.writeHead(404, { 'Content-Type': 'text/plain;charset=UTF-8' });
        res.end('文件或者目录没找到');
    }
}

function getSubFileInformation(currentPath, subFileName){
    const subFilePath = path.join(currentPath, subFileName); //获取目录下子文件的绝对路径      
    const subFileStats = fs.statSync(subFilePath); //获取文件信息

    const fileSize = getFileSize(subFileStats.size);
    const fileAuthor = getFileAuthor(subFileName);
    const fileBirthTime = `${subFileStats.birthtime.getFullYear()}-${subFileStats.birthtime.getMonth()+1}-${subFileStats.birthtime.getDate()}`;

    const fileinformation = {
        name: subFileName,
        author: fileAuthor,
        size: fileSize,
        time: fileBirthTime
    };

    return fileinformation;
}

function getFileSize(fileSize){
    if(fileSize/(1024*1024) >= 1){ //文件大小大于等于1M
        const fileSize_MB = fileSize/(1024*1024);
        return fileSize_MB.toFixed(2).toString() + 'MB'; //四舍五入保留两位小数
    }
    else if(fileSize/1024 >= 1){
        const fileSize_KB = fileSize/1024;
        return fileSize_KB.toFixed(2).toString() + 'KB';
    }
    else{
        return fileSize.toString()+'字节'
    } 
}

function getFileAuthor(fileName){
    let start = fileName.indexOf('（');
    let end = fileName.indexOf('）');
    
    if(start === -1){
        start = fileName.indexOf('(');
    }
    if(end === -1){
        end = fileName.indexOf(')');
    }
    if(start === -1 || end === -1){
        return 'root';
    }
    else{
        return fileName.slice(start+1, end);
    }
}

module.exports = show;