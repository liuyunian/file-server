/* 扩展模块 */
const http = require('http');
const path = require('path');
const fs = require('fs');
const Handlebars = require('handlebars');
const formidable = require('formidable');

/* 自定义模块 */
const defaultConfig = require('./config/default_config.js');
const mime = require('./help/MIME.js');

const templatePath = path.join(__dirname, './template/showDirectory.tpl'); //除了require时可以采用相对路径，其他情况尽量采用绝对路径。
const source = fs.readFileSync(templatePath); //同步保证了首先将模板读入内存
const template = Handlebars.compile(source.toString());
let currentFilePath;

class Server {
    constructor(userConfig) {
        this.config = Object.assign({}, defaultConfig, userConfig); //合并默认配置和用户输入的配置
    }

    start() {
        const that = this;
        const server = http.createServer(function (req, res) {
            if (req.url == '/upload' && req.method.toLowerCase() === 'post') {  // 处理上传的文件
                const form = new formidable.IncomingForm(); //创建formidable.IncomingForm对象
                form.keepExtensions = true; //保持原有的扩展名
                form.uploadDir = `${currentFilePath}`; //修改成指定的目录
                form.parse(req, function(err, fields, files){
                    if(err){
                        console.error(err);
                    }
                    const uploadFileNewName = path.join(currentFilePath, files.file.name);
                    const uploadFileOldName = files.file.path;
                    fs.renameSync(uploadFileOldName, uploadFileNewName); //如果不重新命名的话，名字是随机的
                    const relativePath = path.relative(that.config.root, currentFilePath);
                    res.writeHead(302, {'Location': `/${relativePath}`});
                    res.end();
                });
            }
            else{
                currentFilePath = path.join(that.config.root, decodeURI(req.url)); //文件的路径:绝对路径
                fs.stat(currentFilePath, function (err, currentFileStats) {
                    if (err) {
                        res.writeHead(404, { 'Content-Type': 'text/plain;charset=UTF-8' });
                        res.end('文件或者目录没找到');
                        return;
                    }
                    else {
                        if (currentFileStats.isFile()) { //要显示文件内容
                            const ContentType = mime(currentFilePath);
                            res.writeHead(200, { "Content-Type": ContentType });
                            fs.createReadStream(currentFilePath).pipe(res);
                        }
                        else if (currentFileStats.isDirectory()) { //要列出文件下的信息
                            fs.readdir(currentFilePath, function (err, subFileNameArray) { 
                                const pageTitle = path.basename(currentFilePath); //页面的标题
                                const subFileDir = path.relative(that.config.root, currentFilePath); //文件路径
                                let subFileInformationArray = Array(subFileNameArray.length); //文件信息对象数组，用于渲染模板
    
                                for (let subFilename of subFileNameArray) { 
                                    const subFilePath = path.join(currentFilePath, subFilename); //获取当前文件的绝对路径
    
                                    const subFileStats = fs.statSync(subFilePath); //获取文件信息
                                    const size_KB = Math.round(subFileStats.size / 1024); //对文件大小进行处理
                                    const birthTime = `${subFileStats.birthtime.getFullYear()}-${subFileStats.birthtime.getMonth()+1}-${subFileStats.birthtime.getDate()}`;
    
                                    const fileinformation = {
                                        name: subFilename,
                                        author: '',
                                        size: size_KB,
                                        time: birthTime
                                    };
                                    subFileInformationArray.push(fileinformation);
                                }
    
                                const templateData = {
                                    title: pageTitle,
                                    dir: subFileDir ? `/${subFileDir}` : '',
                                    filesInformation: subFileInformationArray
                                };
    
                                res.writeHead(200, { "Content-Type": "text/html;charset=UTF-8" });
                                res.end(template(templateData));
                            });
                        }
                        
                    }
                });
            }
        });

        server.listen(that.config.port, that.config.host, function () {
            console.log('server is listening http://' + that.config.host + ':' + that.config.port);
        });
    }
}

module.exports = Server;

