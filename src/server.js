/* 扩展模块 */
const http = require('http');
const path = require('path');
const fs = require('fs');
const Handlebars = require('handlebars'); //模版引擎

/* 自定义模块 */
const defaultConfig = require('./config/default_config.js');
const mime = require('./help/MIME.js');
const dealUpload = require('./upload.js');

const templatePath = path.join(__dirname, './template/showDirectory.tpl'); //除了require时可以采用相对路径，其他情况尽量采用绝对路径。
const source = fs.readFileSync(templatePath); //同步保证了首先将模板读入内存
const template = Handlebars.compile(source.toString());

class Server {
    constructor(userConfig) { 
        this.config = Object.assign({}, defaultConfig, userConfig); //合并默认配置和用户输入的配置
        this.currentFilePath = this.config.root; //默认的当前文件路径
    }

    start(){ 
        const server = http.createServer((req, res) => {
            if (req.url == '/upload' && req.method.toLowerCase() === 'post') {  // 处理上传的文件
                dealUpload(req, res, this.currentFilePath, this.config.root);
            }
            else{
                this.currentFilePath = path.join(this.config.root, decodeURI(req.url)); //文件的路径:绝对路径
                fs.stat(this.currentFilePath, (err, currentFileStats) => {
                    if (err) {
                        res.writeHead(404, { 'Content-Type': 'text/plain;charset=UTF-8' });
                        res.end('文件或者目录没找到');
                        return;
                    }
                    else {
                        if (currentFileStats.isFile()) { //要显示文件内容
                            const ContentType = mime(this.currentFilePath);
                            res.writeHead(200, { "Content-Type": ContentType });
                            fs.createReadStream(this.currentFilePath).pipe(res);
                        }
                        else if (currentFileStats.isDirectory()) { //要列出文件下的信息
                            fs.readdir(this.currentFilePath, (err, subFileNameArray) => {
                                if(err){
                                    console.error(err);
                                    return;
                                }
                                else{
                                    let subFileInformationArray = Array(subFileNameArray.length); //目录文件信息对象数组
                                    for (let subFileName of subFileNameArray) { 
                                        subFileInformationArray.push(this.getSubFileInformation(subFileName));
                                    }

                                    const pageTitle = path.basename(this.currentFilePath); //页面的标题
                                    const subFileDir = path.relative(this.config.root, this.currentFilePath); //文件路径

                                    const templateData = {
                                        title: pageTitle,
                                        dir: subFileDir ? `/${subFileDir}` : '',
                                        filesInformation: subFileInformationArray
                                    };
        
                                    res.writeHead(200, { "Content-Type": "text/html;charset=UTF-8" });
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
        const subFilePath = path.join(this.currentFilePath, subFileName); //获取目录下子文件的绝对路径      
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

