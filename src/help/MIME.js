const path = require('path');

const MIMETypes = {
    'css': 'text/css;charset=UTF-8',
    'gif': 'image/gif',
    'html': 'text/html;charset=UTF-8',
    'ico': 'image/x-icon',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
    'js': 'text/javascript;charset=UTF-8',
    'json': 'application/json',
    'pdf': 'application/pdf',
    'png': 'image/png',
    'svg': 'image/svg+xml',
    'tiff': 'text/x-shockwave-flash',
    'txt': 'text/plain;charset=UTF-8',
    'wav': 'audio/x-wav',
    'wma': 'audio/x-ms-wma',
    'wmv': 'audio/x-ms-wmv',
    'xml': 'text/xml;charset=UTF-8'
};

module.exports = function(filePath){
    let extensionName = path.extname(filePath).split('.').pop().toLowerCase(); //用Path模块获取文件的扩展名
    if(!extensionName){
        extensionName = 'txt';
    }
    return MIMETypes[extensionName] || MIMETypes['txt'];
}