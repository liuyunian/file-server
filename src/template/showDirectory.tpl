<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>{{title}}</title>
</head>

<body>
    <table border="1">
        <tr>
            <th>文件名</th>
            <th>上传者</th>
            <th>文件大小</th>
            <th>上传日期</th>
        </tr>
        {{#each filesInformation}}
        <tr>
            <td><a href="{{../dir}}/{{this.name}}">{{this.name}}</a></td>
            <td>{{this.author}}</td>
            <td>{{this.size}}KB</td>
            <td>{{this.time}}</td>
        </tr>
        {{/each}}
    </table>
</body>

</html>