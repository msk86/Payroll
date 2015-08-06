##Payroll
####如何开发
1. 根据使用的环境不同，从这里<https://github.com/nwjs/nw.js/> 下载合适的nodewebkit安装包
2. 把下载好的安装包解压到不同的文件夹（例如：example文件夹）
3. 在example文件夹中创建一个新的目录，然后在该目录中创建一个package.json文件和一个index.html文件
4. package.json文件的内容如下：

   {
    "name": "hello-node-webkit",
    "version": "0.1.0",
    "main": "index.html"
   }
5. 然后将index.html和package.json打在一个zip格式压缩包中:
 
    $ zip -r hello-node-webkit.zip *
6. 然后将这个文件重命名为hello-node-webkit.nw，最后使用node-webkit来启动这个应用程序:

    $ ~/Tools/node-webkit.app/Contents/MacOS/node-webkit hello-node-webkit.nw

####如何构建
Grunt

####Window中如何打包成可执行的包
Inno
