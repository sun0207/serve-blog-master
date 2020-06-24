let qiniu = require('qiniu');
let formidable = require('formidable');
let fs = require('fs');
let qiniuConfig = require('./qiniu.config.js');

let qn = {};

//要上传的空间
let bucket = qiniuConfig.bucket;   //七牛云存储的存储空间名

//构建上传策略函数   （获取七牛上传token）
qn.uptoken = function(bucket) {
    var putPolicy = new qiniu.rs.PutPolicy({ scope: bucket });
    var accessKey = qiniuConfig.accessKey;   
    var secretKey = qiniuConfig.secretKey;
    var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    var uploadToken=putPolicy.uploadToken(mac);
    return uploadToken;
}

qn.upImg = function(req,callback){
    let callbackObj = {};   //回调函数返回的对象
    var form = new formidable.IncomingForm();   //创建上传表单
    form.encoding = 'utf-8';        //设置编辑
    //form.uploadDir = '../../uploadimg';     //设置上传目录 设置则会存储在中控服务器，不设置则建立一个临时文件 最后要上传到七牛，所以不用设置
    form.keepExtensions = true;     //保留后缀
    form.maxFieldsSize = 5 * 1024 * 1024;   //文件大小5M    报错413上传文件太大了
    form.parse(req, function(err, fields, files) {
        if (err) {
            // res.locals.error = err;
            callbackObj.status = 1;
            callbackObj.msg = err;
            console.log('err==',err);
            return callback(callbackObj);
        }

        //上传到七牛后保存的文件名
        let key = new Date().getTime();
        //生成上传 Token
        let token = qn.uptoken(bucket);

        //要上传文件的本地路径
        let filePath='';
        if(files.file){
            filePath=files.file.path
        }else if(files.avatar){
            filePath=files.avatar.path
        }else{
            filePath=files.file.path
        }     
        //如果是表单的数据提交会存储在fields中，图片文件提交会存储在files中 files.file中的file指的是前端设定input的name一般设置为file
        
        //构造上传函数
        // 文件上传（以下四行代码都是七牛上传文件的配置设置）
        var config = new qiniu.conf.Config();
        config.zone = qiniu.zone.zone2;  //设置传输机房的位置根据自己的设置选择
        var formUploader = new qiniu.form_up.FormUploader(config);
        var putExtra = new qiniu.form_up.PutExtra();
        formUploader.putFile(token, key, filePath, putExtra, function(respErr,respBody, respInfo) {
            if (respErr) {
                callbackObj.status = 1;
                callbackObj.msg = respErr;
                return callback(callbackObj);
            }
            if (respInfo.statusCode == 200) {//上传成功
                let url = 'https://'+qiniuConfig.url+'/'+key
                callbackObj.status = 0;
                callbackObj.data = url;
                return callback(callbackObj);
            } else {//上传失败
                callbackObj.status = 1;
                callbackObj.msg = respBody;
                return callback(callbackObj);
            }
        });
    });
}
module.exports = qn;
