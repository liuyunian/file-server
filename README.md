# anydoor

## 使用方法
```
将项目克隆到本地，cd到anydoor目录下，执行下面的脚本命令
```

## 脚本命令
```
npm start # 默认方式运行，主机：127.0.0.1；端口：3333；根目录：anydoor目录

npm start -- -p 8080 # 设置端口号为8080

npm start -- -h 10.15.5.200 # 设置host为10.15.5.200

npm start -- -d /usr # 设置根目录为/usr
```

## 后续增加的feature
```
1. 表格列举文件夹下的内容，文件的话列举出详细信息
2. 上传文件
3. 文件或者文件夹的图标
4. 对文件信息中的文件大小进行处理，单位虽文件变化
```

## bugs
```

```

## 版本说明
#### v1.0.0 基础版本
```
实现：原生node.js + handlebars
功能：读取路径下的文件列表，以列表形式显示
```

#### v1.1.0
```
新增feature：以表格形式显示文件列表，并显示文件所有者、大小、创建日期等文件信息
```