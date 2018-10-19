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

    <script>
        function gotoWikiMainPage(){
            window.location.href="http://10.15.5.93:8000";
        }

        function downLoad(){
            alert("全部下载");
        }
    </script>
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
            <td>{{this.size}}</td>
            <td>{{this.time}}</td>
        </tr>
        {{/each}}
    </table>

    <form action = "/upload" method = "post" enctype = "multipart/form-data">
        <input type = "file" name = 'file'/>
        <input type = "submit" value = "上传"/>
    </form>

    <button type = "button" onclick = "gotoWikiMainPage()">wiki首页</button>

    <button type = "button" onclick = "downLoad()">全部下载</button>

    <form action = "/newFolder" method = "post">
        <input type = "text" placeholder = "文件夹名称" name = "folder"/>
        <input type = "submit" value = "新建文件夹"/>
    </form>
</body>
</html>