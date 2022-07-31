/* 扩展模块 */
const fs = require('fs');
const util = require('util');
const archiver = require('archiver');

const stat = util.promisify(fs.stat);
const unlink = util.promisify(fs.unlink);

async function download(res, filePath, fileName) {
  try {
    const fileStat = await stat(filePath);
    if(fileStat.isFile()) {
      downloadFile(res, filePath, fileName, false);
    } else if(fileStat.isDirectory()) {
      downloadDirectory(res, filePath, fileName);
    }
  }
  catch(Exception) {
    res.writeHead(500, { 'Content-Type': 'text/plain;charset=UTF-8' });
    res.end('服务器出错了！');
  }
}            

function downloadDirectory(res, filePath, fileName){
  const path = filePath + '.zip';
  const name = fileName + '.zip';
  const output = fs.createWriteStream(path);

  const archive = archiver('zip', {
    store: false,
    zlib: {level: 9}
  });
  archive.pipe(output);
  archive.directory(filePath, fileName);
  archive.on('error', function(err) {
    throw err;
  });

  output.on('close', function() {
    downloadFile(res, path, name, true);
  });

  archive.finalize();
}

function downloadFile(res, filePath, fileName, free){
  res.writeHead(200, {
    "Content-type": "application/octet-stream",
    "Content-Disposition": "attachment;filename=" + encodeURI(fileName)
  });

  const stm = fs.createReadStream(filePath);
  stm.on("data", (chunk) => {
    res.write(chunk,"binary");
  });
  stm.on("end", () => {
    res.end();
    if (free) deleteFile(filePath);
  });
}

async function deleteFile(filePath) {
  await unlink(filePath);
}

module.exports = download;