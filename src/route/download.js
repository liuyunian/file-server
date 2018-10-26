/* 扩展模块 */
const fs = require('fs');
const archiver = require('archiver');
const promisify = require('util').promisify;

const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);

async function download(res, filePath, fileName){
    try{
        const fileStats = await stat(filePath);
        if(fileStats.isFile()){
            downloadSingleFile(res, filePath, fileName);
        }
        else if(fileStats.isDirectory()){
            compressDirectoryAndDoadload(res, filePath, fileName);
        }
    }
    catch(Exception){
        console.error(Exception);
        res.writeHead(500, { 'Content-Type': 'text/plain;charset=UTF-8' });
        res.end('服务器出错了！');
    }
}            


function compressDirectoryAndDoadload(res, filePath, fileName){
    const archiverFilePath = filePath + '.zip';
    const archiverFileName = fileName + '.zip';
    const output = fs.createWriteStream(archiverFilePath);

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
        downloadDirectory(res, archiverFilePath, archiverFileName);
    });

    archive.finalize();
}

function downloadSingleFile(res, filePath, fileName){
    res.writeHead(200, {
        "Content-type": "application/octet-stream",
        "Content-Disposition": "attachment;filename=" + encodeURI(fileName)
    });

    const fileReadStream = fs.createReadStream(filePath);
    fileReadStream.on("data", (chunk) => {
        res.write(chunk,"binary");
    });
    fileReadStream.on("end", () => {
        res.end();
    });
}

function downloadDirectory(res, filePath, fileName){
    res.writeHead(200, {
        "Content-type": "application/octet-stream",
        "Content-Disposition": "attachment;filename=" + encodeURI(fileName)
    });

    const fileReadStream = fs.createReadStream(filePath);
    fileReadStream.on("data", (chunk) => {
        res.write(chunk,"binary");
    });

    fileReadStream.on("end", () => {
        res.end();
        deleteFile(filePath);
    });
}

async function deleteFile(filePath){
    await unlink(filePath);
}

module.exports = download;

/* 代码重构是没有解决的问题： 
1. 下载downloadSingleFile()和downloadDirectory()很类似，
只不过downloadDirectory()在发送完文件之后要将压缩文件进行删除
那么两个函数怎么能进行合并呢？？

2. 多处用到了stream操作，需要监听到特定的事件之后才能执行其他的函数，这种事件的嵌套也造成了代码的可读性较差，怎么进行改造？？

*/