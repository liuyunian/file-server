/* 扩展模块 */
const fs = require('fs');
const path = require('path');
const util = require('util');
const Handlebars = require('handlebars'); // 模板引擎

/* 自定义模块 */
const mime = require('../help/MIME.js');

const templatePath = path.join(__dirname, '../template/showDirectory.tpl');
const source = fs.readFileSync(templatePath);
const template = Handlebars.compile(source.toString());

const stat = util.promisify(fs.stat);
const readdir = util.promisify(fs.readdir);

async function show(res, curPath, rootPath) {
  try {
    const curFileStat = await stat(curPath);
    if (curFileStat.isFile()) {
      res.writeHead(200, {"Content-Type": mime(curPath)});
      fs.createReadStream(curPath).pipe(res);
    } else if (curFileStat.isDirectory()) {
      const files = await readdir(curPath);
      let filesInfo = Array(files.length);
      for (let file of files) {
        filesInfo.push(getFileInfo(curPath, file));
      }

      const pageTitle = path.basename(curPath);
      const subFileDir = path.relative(rootPath, curPath);
      const lastFileDir = path.dirname(subFileDir);
      const templateData = {
        title: pageTitle,
        lastDir: lastFileDir ? `/${lastFileDir}` : '',
        dir: subFileDir ? `/${subFileDir}` : '',
        filesInformation: filesInfo
      };

      res.writeHead(200, {
        "Content-Type": "text/html;charset=UTF-8",
        "Cache-Control": "no-store"
      });
      res.end(template(templateData));
    }
  }
  catch(Exception){
    res.writeHead(404, { 'Content-Type': 'text/plain;charset=UTF-8' });
    res.end('文件或者目录没找到');
  }
}

function getFileInfo(filePath, fileName) {
  const stat = fs.statSync(path.join(filePath, fileName));

  const fileInfo = {
    name: fileName,
    author: getFileAuthor(fileName),
    size: transformFileSize(stat.size),
    time: `${stat.birthtime.getFullYear()}-${stat.birthtime.getMonth()+1}-${stat.birthtime.getDate()}`
  };

  return fileInfo;
}

function transformFileSize(size) {
  if (size / (1024 * 1024) >= 1) {
    const s_MB = size / (1024 * 1024);
    return s_MB.toFixed(2).toString() + 'MB';
  } else if (size / 1024 >= 1) {
    const s_KB = size / 1024;
    return s_KB.toFixed(2).toString() + 'KB';
  } else{
    return size.toString()+'字节'
  } 
}

function getFileAuthor(file) {
  let start = file.indexOf('（');
  if (start === -1) {
    start = file.indexOf('(');
  }

  let end = file.indexOf('）');
  if (end === -1) {
    end = file.indexOf(')');
  }

  if (start === -1 || end === -1) {
    return 'root';
  } else {
    return file.slice(start + 1, end);
  }
}

module.exports = show;