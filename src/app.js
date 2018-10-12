const http = require('http');
const path = require('path');
const fs = require('fs');
const Handlebars = require('handlebars');
const config = require('./config/default_config.js');

const source = fs.readFileSync('');
const server = http.createServer(function(req, res){

    const filePath = path.join(config.root, req.url); //文件的路径

    fs.stat(filePath, function(err,stats){
        if(err){
            res.writeHead(404,{"Content-Type": "text/plain"});
            res.end('文件或者目录没找到');
            return;
        }
        else{
            if(stats.isFile()){
                res.writeHead(200,{"Content-Type": "text/plain"});
                fs.createReadStream(filePath).pipe(res);
            }else if(stats.isDirectory()){
                fs.readdir(filePath,function(err,files){
                    res.writeHead(200,{"Content-Type": "text/plain"});
                    res.end(files.join(','));
                });
            }
        }
    });
});

server.listen(config.port,config.host,function(){
    console.log('server is listening http://' + config.host + ':' + config.port);
});