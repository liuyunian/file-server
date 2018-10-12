<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{title}}</title>  
</head>
<body>
    <ul>
        {{#each files}}
        <li>
            <a href= "{{../dir}}/{{this}}">{{this}}</a>
        </li>
        {{/each}}
    </ul>
</body>
</html>