<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">

    <title>{{title}}</title>
    <style>
        body {
            display: flex;
            flex-flow: column;
            align-items: center;
            justify-content: center
        }
    </style>
</head>

<body>
    <table border="1">
        <tr>
            <th>文件名</th>
            <th>上传者</th>
            <th>文件大小</th>
            <th>上传日期</th>
            <th>下载</th>
        </tr>
        <tr>
            <td><a href="{{lastDir}}">..</a></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        {{#each filesInformation}}
        <tr>
            <td><a href="{{../dir}}/{{this.name}}">{{this.name}}</a></td>
            <td>{{this.author}}</td>
            <td>{{this.size}}</td>
            <td>{{this.time}}</td>
            <td><a href="/downloadSingle?name={{this.name}}">下载</a></td>
        </tr>
        {{/each}}
    </table>
    <br/>
    <br/>
    <form action = "/upload" method = "post" enctype = "multipart/form-data">
        <input type = "file" name = 'file'/>
        <input type = "submit" value = "上传"/>
    </form>
    <br/>
    <form action = "/newFolder" method = "post">
        <input type = "text" placeholder = "文件夹名称" name = "folder"/>
        <input type = "submit" value = "新建文件夹"/>
    </form>
    <br/>
    <form action = "/downloadAll" method = "post">
        <input type = "submit" value = "全部下载"/>
    </form>
</body>
</html>