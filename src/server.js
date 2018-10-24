/* 扩展模块 */
const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');
const querystring = require('querystring');
const Handlebars = require('handlebars'); //模版引擎

/* 自定义模块 */
const defaultConfig = require('./config/default_config.js');
const mime = require('./help/MIME.js');
const dealUpload = require('./upload.js');
const newFolder = require('./newfolder.js');
const download = require('./download');

const templatePath = path.join(__dirname, './template/showDirectory.tpl'); //除了require时可以采用相对路径，其他情况尽量采用绝对路径。
const source = fs.readFileSync(templatePath); //同步保证了首先将模板读入内存
const template = Handlebars.compile(source.toString());

class Server {
    constructor(userConfig) { 
        this.config = Object.assign({}, defaultConfig, userConfig); //合并默认配置和用户输入的配置
        this.currentPath = this.config.root; //默认的当前文件路径
    }

    start(){ 
        const server = http.createServer((req, res) => {
            const relativeURL = req.url.split('?');
            if (req.method.toLowerCase() === 'post' && relativeURL[0] == '/upload') {  // 处理上传的文件
                dealUpload(req, res, this.currentPath, this.config.root);
            }
            else if(req.method.toLowerCase() === 'post' && relativeURL[0] == '/newFolder'){ // 处理新建文件夹
                newFolder(req, res, this.currentPath, this.config.root);
            }
            else if(req.method.toLowerCase() === 'get' && relativeURL[0] == '/downloadSingle'){
                const query = querystring.parse(url.parse(req.url).query);
                const downFileName = query.name;
                const downFilePath = path.join(this.currentPath, downFileName); //目录下要下载文件的路径
                download(res, downFilePath, downFileName);
            }
            else if(req.method.toLowerCase() === 'post' && relativeURL[0] == '/downloadAll'){
                const currentDirectoryName = path.basename(this.currentPath);
                download(res, this.currentPath, currentDirectoryName);
            }
            else{
                this.currentPath = path.join(this.config.root, decodeURI(relativeURL[0])); //记录当前的文件路径
                fs.stat(this.currentPath, (err, currentFileStats) => {
                    if (err) {
                        res.writeHead(404, { 'Content-Type': 'text/plain;charset=UTF-8' });
                        res.end('文件或者目录没找到');
                        return;
                    }
                    else {
                        if (currentFileStats.isFile()) { //要显示文件内容
                            const ContentType = mime(this.currentPath);
                            res.writeHead(200, { "Content-Type": ContentType });
                            fs.createReadStream(this.currentPath).pipe(res);
                        }
                        else if (currentFileStats.isDirectory()) { //要列出文件下的信息
                            fs.readdir(this.currentPath, (err, subFileNameArray) => {
                                if(err){
                                    console.error(err);
                                    return;
                                }
                                else{
                                    let subFileInformationArray = Array(subFileNameArray.length); //目录文件信息对象数组
                                    for (let subFileName of subFileNameArray) { 
                                        subFileInformationArray.push(this.getSubFileInformation(subFileName));
                                    }

                                    const pageTitle = path.basename(this.currentPath); //页面的标题
                                    const subFileDir = path.relative(this.config.root, this.currentPath); //文件路径
                                    const lastFileDir = path.dirname(subFileDir);

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
                            });
                        }
                        
                    }
                });
            }
        });

        server.listen(this.config.port, this.config.host, () => {
            console.log('server is listening http://' + this.config.host + ':' + this.config.port);
        });
    }

    getSubFileInformation(subFileName){
        const subFilePath = path.join(this.currentPath, subFileName); //获取目录下子文件的绝对路径      
        const subFileStats = fs.statSync(subFilePath); //获取文件信息

        const fileSize = this.getFileSize(subFileStats.size);
        const fileAuthor = this.getFileAuthor(subFileName);
        const fileBirthTime = `${subFileStats.birthtime.getFullYear()}-${subFileStats.birthtime.getMonth()+1}-${subFileStats.birthtime.getDate()}`;

        const fileinformation = {
            name: subFileName,
            author: fileAuthor,
            size: fileSize,
            time: fileBirthTime
        };
        return fileinformation;
    }

    getFileSize(fileSize){
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

    getFileAuthor(fileName){
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
}

module.exports = Server;

