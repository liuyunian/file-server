/* 扩展模块 */
const http = require('http');
const path = require('path');
const url = require('url');
const querystring = require('querystring');

/* 自定义模块 */
const defaultConfig = require('./config/defaultConfig.js');
const show = require('./route/show.js');
const upload = require('./route/upload.js');
const newFolder = require('./route/newfolder.js');
const download = require('./route/download');

class Server {
  constructor(userConfig) { 
    this.config = Object.assign({}, defaultConfig, userConfig);
    this.currentPath = this.config.root;
  }

  start() { 
    const server = http.createServer((req, res) => {
      /* 路由 */
      const relativeURL = req.url.split('?');
      if (req.method.toLowerCase() === 'post' && relativeURL[0] == '/upload') {
        /* 处理上传的文件 */
        upload(req, res, this.currentPath, this.config.root);
      } else if (req.method.toLowerCase() === 'post' && relativeURL[0] == '/newFolder') {
        /* 处理新建文件夹 */
        newFolder(req, res, this.currentPath, this.config.root);
      } else if (req.method.toLowerCase() === 'get' && relativeURL[0] == '/downloadSingle') {
        /* 处理单个文件下载 */
        const query = querystring.parse(url.parse(req.url).query);
        const downFileName = query.name;
        const downFilePath = path.join(this.currentPath, downFileName);
        download(res, downFilePath, downFileName);
      } else if(req.method.toLowerCase() === 'post' && relativeURL[0] == '/downloadAll') {
        /* 处理所有文件下载 */
        const currentDirectoryName = path.basename(this.currentPath);
        download(res, this.currentPath, currentDirectoryName);
      } else {
        this.currentPath = path.join(this.config.root, decodeURI(relativeURL[0]));
        show(res, this.currentPath, this.config.root);
      }
    });

    server.listen(this.config.port, this.config.host, () => {
      console.log('server is listening http://' + this.config.host + ':' + this.config.port);
    });
  }
}

module.exports = Server;