/* 扩展模块 */
const http = require('http');
const path = require('path');
const fs = require('fs');
const Handlebars = require('handlebars');

/* 自定义模块 */
const defaultConfig = require('./config/default_config.js');
const mime = require('./help/MIME.js');

const tplPath = path.join(__dirname, './template/dir.tpl');
const source = fs.readFileSync(tplPath); //除了require时可以采用相对路径，其他情况尽量采用绝对路径。
const template = Handlebars.compile(source.toString());

class Server{
    constructor(userConfig){
        this.config = Object.assign({}, defaultConfig, userConfig); //合并默认配置和用户输入的配置
    }

    start(){
        const that = this;
        const server = http.createServer(function(req, res){

            const filePath = path.join(that.config.root, decodeURI(req.url)); //文件的路径:绝对路径
            //console.log(filePath);
            fs.stat(filePath, function(err,stats){
                if(err){
                    res.writeHead(404, {'Content-Type': 'text/plain;charset=UTF-8'});
                    res.end('文件或者目录没找到');
                   return;
                }
                else{
                    if(stats.isFile()){
                        const ContentType = mime(filePath);
                        res.writeHead(200,{"Content-Type": ContentType});
                        fs.createReadStream(filePath).pipe(res);
                    }
                    else if(stats.isDirectory()){
                        fs.readdir(filePath,function(err, files){
                            res.writeHead(200,{"Content-Type": "text/html;charset=UTF-8"});
                            const dir = path.relative(that.config.root, filePath);
                            const data = {
                                title: path.basename(filePath),
                                dir: dir ? `/${dir}` : '',
                                files: files
                            };
                            res.end(template(data));
                        });
                    }
                }
            });
        });
        
        server.listen(that.config.port,that.config.host,function(){
            console.log('server is listening http://' + that.config.host + ':' + that.config.port);
        });
    }
}

module.exports = Server;

