const fs = require('fs');
const path = require('path');

const archiver = require('archiver');


function download(res, filePath, fileName){
    fs.stat(filePath, (err, fileStats) => {
        if (err) {
            console.error(err);
            return;
        }
        else{
            if(fileStats.isFile()){
                downloadSingleFile(res, filePath, fileName);
            }
            else if(fileStats.isDirectory()){
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
        }
    });
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
        fs.unlink(filePath, (err) => {
            if (err) throw err;
        });
        res.end();
    });
}

module.exports = download;