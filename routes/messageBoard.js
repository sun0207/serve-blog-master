import {responseClient} from './../util/util';
import wsServer from './../util/webscoket';
import MessageBoard from './../models/messageBoard';
import User from './../models/user';
const nodemailer  = require('nodemailer');

// 发送邮件
async function initEmail (title,content,email){
    let emailTemp = {
		htmlBody: '<h2>'+ title +'</h2><p style="font-size: 18px;color:#000;">'+ content +'</p><p style="font-size: 14px;color:#666;">前往查看<a href="https://www.qianyaru.cn/message" style="font-size:14px;color:#14B9F7;">Khari & Yaru的美好回忆</a></p>'
	}
    let transporter = nodemailer.createTransport({
        host:'smtp.163.com',
        port:465,
        secure:true,// 如果是 true 则port填写465, 如果 false 则可以填写其它端口号
        auth:{
            user:'15517929272@163.com',
            pass:'sun0207'
        }
    })
    let info = await transporter.sendMail({
        from: '"Khari(隼)" <15517929272@163.com>', // sender address
        to: email, // list of receivers
        subject: title, // Subject line
        text: '感谢您的留言', // plain text body
        html: emailTemp.htmlBody // html body
    });
    // console.log('Message sent: %s', info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

// 建立websocket服务
function originIsAllowed(origin) {
    console.log(origin)
    // put logic here to detect whether the specified origin is allowed.
    return true;
}   
wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
        // 确保我们只接受来自允许来源的请求
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }
    
    var connection = request.accept('echo-protocol', request.origin);
    // console.log((new Date()) + ' Connection accepted.'); //链接被允许
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            connection.sendUTF(message.utf8Data);
        }
        else if (message.type === 'binary') {
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

/**
 * 添加最新留言
 */
exports.addMessageBoard = (req,res) => {
    if(!req.session.userInfo){
        responseClient(res,200,1,'您还没有登录,或者登录信息已过期');
        return;
    }
    let {message_id,user_id,to_user,to_user_id,content} = req.body;
    User.findById({
        _id: user_id,
    }).then(user=>{
        if(user && user.email){
            if(message_id){
                MessageBoard.findById({
                    _id: message_id,
                }).then(result=>{
                    let replyList = result.reply_list;
                    replyList.push({
                        user_id: user._id,
                        user_type:user.type,
                        user: user.name,
                        to_user:to_user,
                        avatar: user.avatar,
                        email: user.email || '',
                        address:user.address || 'CHINA',
                        phone: user.phone || '',
                        introduce: user.introduce || '',
                        content: content,
                        is_handle: 2,
                        isIllegal: 1,
                    });
                    MessageBoard.updateOne(
                        {_id: message_id},
                        {
                            reply_list:replyList
                        }
                    ).then(data => {
                        responseClient(res,200,0,'回复成功',data);
                        User.findById({
                            _id: to_user_id,
                        }).then(toUserResult=>{
                            if(toUserResult.email){
                                initEmail('您的留言收到回复！',content,toUserResult.email)
                                    .catch(sendErr=>{
                                        console.error(sendErr)
                                    });
                            }
                        })
                    })
                    .catch(err1 => {
                        console.error('err1:', err1);
                        responseClient(res);
                        throw err1;
                    });
                }).catch(err=>{
                    console.log('err:',err)
                    throw err;
                })
            }else{
                let messageBoard = new MessageBoard({
                    user_id: user._id,
                    user_type:user.type,
                    user: user.name,
                    avatar: user.avatar,
                    email: user.email || '',
                    address:user.address || 'CHINA',
                    phone: user.phone || '',
                    introduce: user.introduce || '',
                    content: content,
                    is_handle: 2,
                    isIllegal: 1,
                });
                messageBoard
                .save()
                .then(data=>{
                    responseClient(res,200,0,'留言成功',data);
                    initEmail(user.name+'来新留言了~',content,'kangheng0207@gmail.com')
                        .catch(sendErr=>{
                            console.error(sendErr)
                        });
                })
                .catch(err=>{
                    console.log('err:',err)
                    throw err;
                })
            }
        }else{
            responseClient(res,200,2,'请先补充邮箱信息');
        }
    })
}

/**
 * 更新一级留言状态,违规留言前台不做展示
 */
exports.updateMessageBoard = (req,res) => {
    let {message_id,reply_id,is_illegal}  = req.body;
    MessageBoard.findById({
        _id:message_id
    }).then(messageRes=>{
        if(reply_id){
            messageRes.reply_list.forEach((item,i)=>{
                if(item._id == reply_id){
                    messageRes.reply_list[i].is_illegal=Number(is_illegal)
                    messageRes.reply_list[i].is_handle=1;                    
                }
            })
            MessageBoard.updateOne({
                _id:message_id
            },{
                reply_list:messageRes.reply_list
            }).then(result => {
                if(result){
                    responseClient(res,200,0,'更新成功',result);
                }else{
                    responseClient(res,200,1,'更新失败',result);
                }
            })
        }else{
            MessageBoard.updateOne({
                _id:message_id
            },{
                is_illegal: Number(is_illegal),
                is_handle: 1,
            }).then(result => {
                if(result){
                    responseClient(res,200,0,'更新成功',result);
                }else{
                    responseClient(res,200,1,'更新失败',result);
                }
            })
        }
    }).catch(err=>{
        console.error(err)
    })
}

/**
 * 删除留言
 */
exports.delMessageBoard = (req,res) => {
    console.err('删除')
}

/**
 * 获取留言列表
 */
exports.getMessageBoardList = (req,res) => {
    let {keyword,is_illegal,is_handle,filter} = req.body;
    filter = Number(filter) || 1; //是否过滤垃圾数据 => 1: 过滤，2: 不过滤
	let pageNum = parseInt(req.query.pageNum) || 1;
	let pageSize = parseInt(req.query.pageSize) || 10;
    let conditions = {};
    if(filter == 1){
        if(keyword){
            const reg = new RegExp(keyword, 'i'); //不区分大小写
            conditions = {
                content: { $regex: reg } ,
                is_illegal:Number(is_illegal) || 1
            }
        }else{
            conditions = {
                is_illegal:Number(is_illegal) || 1
            }
        }
    }else{
        conditions = {}
    }
    let skip = pageNum - 1 < 0 ? 0 : (pageNum - 1) * pageSize;
    // 待返回的字段
    let fields = {};
    let options = {
        skip: skip,
        limit: 10,
        sort: { create_time: -1 },
    };
    MessageBoard.countDocuments(conditions, (err, count) => {
        MessageBoard.find(conditions,fields,options,(error, results) => {
            if(error){
                console.error('error:',error)
            }else{
                let majorCount = count;
                for (let i = 0; i < results.length; i++) {
                    for (let j = 0; j < results[i].reply_list.length; j++) {
                        count = parseInt(count) + 1;
                        if(results[i].reply_list[j].is_illegal != 1){
                            results[i].reply_list.splice(j,1);
                        }           
                    }
                }
                let data = {
                    majorCount,
                    count,
                    results,
                }
                responseClient(res,200,0,'获取成功',data);
            }
        })
    })
}
/**
 * 后台获取留言列表
 */
exports.getMessageBoardListAdmin = (req,res) => {
    let {keyword,is_illegal,is_handle,filter} = req.query;
    filter = Number(filter) || 1; //是否过滤垃圾数据 => 1: 过滤，2: 不过滤
	let pageNum = parseInt(req.query.pageNum) || 1;
	let pageSize = parseInt(req.query.pageSize) || 10;
    let conditions = {};
    if(filter == 1){
        if(keyword){
            const reg = new RegExp(keyword, 'i'); //不区分大小写
            if(is_handle){
                conditions = {
                    content: { $regex: reg } ,
                    is_handle:Number(is_handle),
                }
            }else{
                conditions = {
                    content: { $regex: reg } ,
                }
            }
        }else{
            if(is_handle){
                conditions = {
                    is_handle:Number(is_handle)
                }
            }else{
                conditions = {

                }
            }
        }
    }else{
        conditions = {}
    }
    let skip = pageNum - 1 < 0 ? 0 : (pageNum - 1) * pageSize;
    // 待返回的字段
    let fields = {};
    let options = {
        skip: skip,
        limit: 10,
        sort: { create_time: -1 },
    };
    MessageBoard.countDocuments(conditions, (err, count) => {
        MessageBoard.find(conditions,fields,options,(error, results) => {
            if(error){
                console.error('error:',error)
            }else{
                let majorCount = count;
                for (let i = 0; i < results.length; i++) {
                    for (let j = 0; j < results[i].reply_list.length; j++) {
                        count = parseInt(count) + 1;                    
                    }
                }
                let data = {
                    count:majorCount,
                    results,
                }
                responseClient(res,200,0,'获取成功',data);
            }
        })
    })
}

/**
 * 获取单个留言
 */
exports.getMessageBoardDetail = (req,res) =>{
    let {message_id} = req.query;
    MessageBoard.findById({
        _id:message_id
    }).then((result)=>{
        if(result){
            responseClient(res,200,0,'获取成功',result);
        }else{
            responseClient(res,200,1,'失败',result);
        }
    }).catch(error=>{
        console.error(error)
    })
}
