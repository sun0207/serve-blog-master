const User = require('../models/user');
const EmailCode = require('../models/emailCode');
import axios from 'axios';
import { MD5_SUFFIX, responseClient, md5 } from '../util/util.js';
const nodemailer = require('nodemailer');
const githubConfig = require('../util/github.config');
const qqConfig = require('../util/qq.config')
const avatarList = [
	'http://file.qianyaru.cn/avatar1.jpg',
	'http://file.qianyaru.cn/avatar2.jpg',
	'http://file.qianyaru.cn/avatar3.jpg',
	'http://file.qianyaru.cn/avatar4.jpg',
	'http://file.qianyaru.cn/avatar5.jpg',
	'http://file.qianyaru.cn/avatar6.jpg',
	'http://file.qianyaru.cn/avatar7.jpg',
	'http://file.qianyaru.cn/avatar8.jpg',
	'http://file.qianyaru.cn/avatar9.jpg',
	'http://file.qianyaru.cn/avatar10.jpg',
	'http://file.qianyaru.cn/avatar11.jpg',
	'http://file.qianyaru.cn/avatar12.jpg',
	'http://file.qianyaru.cn/avatar13.jpg',
	'http://file.qianyaru.cn/avatar14.jpg',
	'http://file.qianyaru.cn/avatar15.jpg',
	'http://file.qianyaru.cn/avatar16.jpg',
	'http://file.qianyaru.cn/avatar17.png',
	'http://file.qianyaru.cn/avatar18.jpg',
	'http://file.qianyaru.cn/avatar19.png',
	'http://file.qianyaru.cn/avatar20.png',
	'http://file.qianyaru.cn/avatar21.png',
	'http://file.qianyaru.cn/avatar21.jpg',
	'http://file.qianyaru.cn/avatar22.jpg',
	'http://file.qianyaru.cn/avatar23.jpg',
	'http://file.qianyaru.cn/avatar24.jpg',
	'http://file.qianyaru.cn/avatar25.jpg',
	'http://file.qianyaru.cn/avatar26.jpg',
	'http://file.qianyaru.cn/avatar27.jpg',
]

exports.login = (req, res) => {
	let { email, password } = req.body;
	if (!email) {
		responseClient(res, 400, 2, '用户邮箱不可为空');
		return;
	}
	if (!password) {
		responseClient(res, 400, 2, '密码不可为空');
		return;
	}
	User.findOne({
		email,
		password: md5(password + MD5_SUFFIX),
	})
		.then(userInfo => {
			if (userInfo) {
				//登录成功后设置session
				req.session.userInfo = userInfo;
				responseClient(res, 200, 0, '登录成功', userInfo);
			} else {
				responseClient(res, 200, 1, '用户名或者密码错误');
			}
		})
		.catch(err => {
			responseClient(res);
		});
};

//用户验证
exports.userInfo = (req, res) => {
	if (req.session.userInfo) {
		responseClient(res, 200, 0, '', req.session.userInfo);
	} else {
		responseClient(res, 200, 1, '请重新登录', req.session.userInfo);
	}
};

//后台当前用户
exports.currentUser = (req, res) => {
	let user = req.session.userInfo;
	if (user) {
		user.avatar = 'http://p61te2jup.bkt.clouddn.com/WechaTencentG8.jpeg';
		user.notifyCount = 0;
		user.address = '广东省';
		user.country = 'China';
		user.group = 'Khari';
		(user.title = '交互专家'), (user.signature = '海纳百川，有容乃大');
		user.tags = [];
		user.geographic = {
			province: {
				label: '广东省',
				key: '330000',
			},
			city: {
				label: '广州市',
				key: '330100',
			},
		};
		responseClient(res, 200, 0, '', user);
	} else {
		responseClient(res, 200, 1, '请重新登录', user);
	}
};

exports.logout = (req, res) => {
	if (req.session.userInfo) {
		req.session.userInfo = null; // 删除session
		responseClient(res, 200, 0, '登出成功！！');
	} else {
		responseClient(res, 200, 1, '您还没登录！！！');
	}
};

exports.loginAdmin = (req, res) => {
	let { email, password } = req.body;
	if (!email) {
		responseClient(res, 400, 2, '用户邮箱不可为空');
		return;
	}
	if (!password) {
		responseClient(res, 400, 2, '密码不可为空');
		return;
	}
	User.findOne({
		email,
		password: md5(password + MD5_SUFFIX),
	})
		.then(userInfo => {
			if (userInfo) {
				if (userInfo.type === 0) {
					//登录成功后设置session
					req.session.userInfo = userInfo;
					responseClient(res, 200, 0, '登录成功', userInfo);
				} else {
					responseClient(res, 403, 1, '只有管理员才能登录后台！');
				}
			} else {
				responseClient(res, 200, 1, '用户名或者密码错误');
			}
		})
		.catch(err => {
			responseClient(res);
		});
};
/**
 * 查询用户是否存在
 */
let queryUser = (email) => {
	return new Promise((resolve,reject) => {
		User.findOne({ 
			email,
		}).then(result => {
			resolve(result)
		}).catch(err=>{
			reject(err)
		})
	})
}
let queryEmailCode = (email) => {
	return new Promise((resolve,reject) => {
		EmailCode.findOne({
			email
		}).then(result => {
			resolve(result)
		}).catch(err => {
			reject(err)
		})
	})
} 
/**
 * 获取随机验证码
 */
let randomCode = () => {
	var code = '';
	for(let i = 0; i < 6; i++){
		let randomNumber = Math.floor(Math.random()*10);
		code += randomNumber
	};
	return code;
}
/**
 * 发送验证码至邮箱
 */
async function initEmail(emailCode,email){
	let emailTemp = {
		title: '邮箱验证码 -- Khari & Yaru的美好回忆',
		htmlBody: '<h2>您好！欢迎注册我们的博客！</h2><p style="font-size: 18px;color:#000;">您的验证码为：<u style="font-size: 16px;color:#1890ff;">'+ emailCode +'</u></p><p style="font-size: 14px;color:#666;">10分钟内有效，过期请重新发送！</p>'
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
        subject: emailTemp.title, // Subject line
        text: '验证码，十分钟内有效', 
        html: emailTemp.htmlBody // html body
    });
}
/**
 * 生成验证码保存并发送
 */
exports.sendEmailCode = async (req, res) => {
	const { email } = req.query;
	let queryUserData = await queryUser(email);
	if(queryUserData){
		responseClient(res, 200, 1, '用户邮箱已存在，请确认邮箱是否正确！', queryUserData.email);
		return;
	}
	let code = randomCode();
	EmailCode.findOne({
		email
	}).then(result => {
		if(result){
			//修改
			let currentTime = new Date().valueOf();
			let updateTime = result.update_time.valueOf();
			if(currentTime < (updateTime + 5 * 60 * 1000)){
				responseClient(res, 200, 1, '五分钟内请勿重复发送！', result);
				return;
			}
			EmailCode.updateOne({email:email},{
				code:code,
				update_time:new Date()
			}).then(updateResult => {
				responseClient(res, 200, 0, '验证码已发送！请前往邮箱查看', updateResult);
				initEmail(code, email);
			})
		}else{
			//新增
			let EmailCodeData = new EmailCode({
				email:email,
				code:code,
				create_time:new Date(),
				update_time:new Date()
			});
			EmailCodeData.save().then(saveResult => {
				initEmail(code, email);
				responseClient(res, 200, 0, '验证码已发送！请前往邮箱查看', saveResult);
			});
		}
	})
}

exports.register = async (req, res) => {
	let { name, password, phone, email, emailCode, address, introduce, type, avatar } = req.body;
	if (!email) {
		responseClient(res, 200, 2, '用户邮箱不可为空');
		return;
	}
	if (!name) {
		responseClient(res, 200, 2, '用户名不可为空');
		return;
	}
	if (!avatar) {
		let randomNumber = Math.floor(Math.random() * 27);
		avatar = avatarList[randomNumber];
	}
	if (!password) {
		responseClient(res, 200, 2, '密码不可为空');
		return;
	}

	// 验证验证码是否正确
	let emailCodeData = await queryEmailCode(email);
	if(!emailCodeData){
		responseClient(res, 200, 1, '请先获取验证码',emailCodeData);
		return;
	}else{
		if(emailCodeData.code !== emailCode){
			responseClient(res, 200, 1, '验证码错误，请重新输入！',emailCodeData.email);
			return;
		};
		let currentTime = new Date().valueOf();
		let updateTime = emailCodeData.update_time.valueOf();
		if(emailCodeData.code === emailCode && currentTime > (updateTime + ( 10 * 60 * 1000))){
			responseClient(res, 200, 1, '验证码已过期，请重新发送！',emailCodeData.email);
			return;
		}
	}
	//验证用户是否已经在数据库中
	User.findOne({ email: email })
		.then(data => {
			if (data) {
				responseClient(res, 200, 1, '用户邮箱已存在！');
				return;
			}
			//保存到数据库
			let user = new User({
				third_id:'',
				email,
				address,
				name,
				avatar,
				password: md5(password + MD5_SUFFIX),
				phone,
				type,
				introduce,
			});
			user.save().then(data => {
				responseClient(res, 200, 0, '注册成功', data);
			});
		})
		.catch(err => {
			console.log(1111)
			responseClient(res);
			return;
		});
};

exports.addUser = (req, res) => {
	let { name, password, phone, email, address, introduce, type, avatar } = req.body;
	if (!email) {
		responseClient(res, 200, 2, '用户邮箱不可为空');
		return;
	}
	if (!name) {
		responseClient(res, 200, 2, '用户名不可为空');
		return;
	}
	if (!avatar) {
		responseClient(res, 200, 2, '请上传用户头像');
		return;
	}
	if (!password) {
		responseClient(res, 200, 2, '密码不可为空');
		return;
	}
	//验证用户是否已经在数据库中
	User.findOne({ email: email })
		.then(data => {
			if (data) {
				responseClient(res, 200, 1, '用户邮箱已存在！');
				return;
			}
			//保存到数据库
			let user = new User({
				third_id:'',
				email,
				address,
				name,
				avatar,
				password: md5(password + MD5_SUFFIX),
				phone,
				type,
				introduce,
			});
			user.save().then(data => {
				responseClient(res, 200, 0, '注册成功', data);
			});
		})
		.catch(err => {
			console.log(1111)
			responseClient(res);
			return;
		});
};

exports.updateUser = (req,res) => {
	let { id, email } = req.body;
	User.findOne({ email: email })
		.then(data => {
			if (data) {
				responseClient(res, 200, 1, '用户邮箱已存在！');
				return;
			}else{
				User.updateOne({ _id: id},{
					email,
				}).then(result => {
					if(result.ok === 1){
						responseClient(res, 200, 0, '添加邮箱成功!');
					}else{
						responseClient(res, 200, 0, '添加邮箱失败，请重试~');
					}
				}).catch(error => {
					throw new Error(error);
				})
			}
		})
}

exports.delUser = (req, res) => {
	let { id } = req.body;
	User.deleteMany({ _id: id })
		.then(result => {
			if (result.n === 1) {
				responseClient(res, 200, 0, '用户删除成功!');
			} else {
				responseClient(res, 200, 1, '用户不存在');
			}
		})
		.catch(err => {
			responseClient(res);
		});
};

exports.getUserList = (req, res) => {
	let keyword = req.query.keyword || '';
	let type = req.query.type || '';
	let pageNum = parseInt(req.query.pageNum) || 1;
	let pageSize = parseInt(req.query.pageSize) || 10;
	let conditions = {};
	if (keyword) {
		const reg = new RegExp(keyword, 'i');
		conditions = { $or: [{ name: { $regex: reg } }, { email: { $regex: reg } }]};
	}
	if(type){
		conditions.type = type;
	}
	let skip = pageNum - 1 < 0 ? 0 : (pageNum - 1) * pageSize;
	let responseData = {
		count: 0,
		list: [],
	};
	User.countDocuments(conditions, (err, count) => {
		if (err) {
			console.error('Error:' + err);
		} else {
			responseData.count = count;
			// 待返回的字段
			let fields = {
				_id: 1,
				email: 1,
				name: 1,
				avatar: 1,
				phone: 1,
				introduce: 1,
				type: 1,
				create_Tencente: 1,
			};
			let options = {
				skip: skip,
				limit: pageSize,
				sort: { create_Tencente: -1 },
			};
			User.find(conditions, fields, options, (error, result) => {
				if (err) {
					console.error('Error:' + error);
					// throw error;
				} else {
					responseData.list = result;
					responseClient(res, 200, 0, 'success', responseData);
				}
			});
		}
	});
};

/**
 * 第三方授权登录回调
 */
exports.githubLogin = (req,res) => {
	res.render('thirdParty', { title: '授权登录中', data: {
		domain:'https://www.qianyaru.cn',
	}});
}

/**
 * 获取github第三方用户信息
 * @param {*} token 
 */
let queryGithubUser = async (token) => {
	let userInfoResult = await axios.get(githubConfig.user_info_path+'?access_token='+token,{
		method: 'get',
		headers: {
			'Authorization':token,
			'Content-Type': 'application/json'
		},
	}).then(function (result) {
		return result;
	}).catch(function (error) {

	});
	return userInfoResult;
}
exports.githubUserInfo = async (req,res) => {
	try {
		//根据code获取access_token
		let { code, state } = req.query;
		let path = githubConfig.access_token_path;
		const params = {
            client_id: githubConfig.client_id,
            client_secret: githubConfig.client_secret,
			code: code,
			state: state,
		}
		let info = await axios.post(path,JSON.stringify(params),{
  			method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
		}).then(function (response) {
			if(response.status == 200){
				let args = response.data.split('&');
				let arg = args[0].split('=');
				let access_token = arg[1];
				console.log(access_token);
				//根据access_token获取用户信息
				queryGithubUser(access_token).then(result=>{
					if(result.status == 200){
						//查询用户是否存在数据库中
						User.findOne({ third_id: result.data.node_id })
							.then(userInfo => {
								if (userInfo) {
									req.session.userInfo = userInfo;
									responseClient(res, 200, 0, '授权登录成功', userInfo);
									return;
								}
								let user = new User({
									third_id:result.data.node_id,
									name:result.data.login,
									avatar:result.data.avatar_url,
									type:1,
									phone:result.data.url || '',
									email:result.data.email || '',
									address:result.data.location || 'CHAIN',
									introduce:result.data.url|| '',
								});
								user.save().then(userInfo => {
									req.session.userInfo = userInfo;
									responseClient(res, 200, 0, '授权登录成功', userInfo);
								});
							})
							.catch(error3 => {
								console.log(error3)
								return;
							});
					}else{
						responseClient(res, 200, 1, '登录失败，请重新授权~',result);
					}
				}).catch(function (error2) {
					responseClient(res, 200, 1, '获取用户信息失败~',error2);
				});
			}else{
				responseClient(res, 200, 1, '获取access_token失败，请刷新重试~',response);
			}
		}).catch(function (error) {
			responseClient(res, 200, 1, '授权失败，请刷新重试~',error);
		});
	} catch (error) {
		responseClient(res, 500, 1, '服务器开小差了~',error);
	}
}


/**
 * qq第三方授权登录
 */
exports.qqLogin = (req,res) => {
	let { state } = req.query;
	let data = {
		type:'qqLogin',
		url: ` ${qqConfig.code_path}
			?response_type=code
			&display=pc 
			&client_id=${qqConfig.client_id}
			&redirect_uri=${qqConfig.redirect_uri}
			&state=${state}
			&scope=${qqConfig.scope[0]},${qqConfig.scope[1]},${qqConfig.scope[2]}
			`,
		state,
	}
	responseClient(res, 200, 0, '登录地址',data);
}

/**
 * 获取qq第三方用户信息
 * @param {*} token 
 */
let queryQqToken =  (code,state) => {
	return new Promise((resolve,reject) => {
		axios.get(qqConfig.access_token_path,{
			method:'get',
			params:{
				grant_type:'authorization_code',
				client_id:qqConfig.client_id,
				client_secret:qqConfig.client_secret,
				code:code,
				state:state,
				redirect_uri:qqConfig.redirect_uri,
				fmt:'json'
			},
			headers:{
				'Content-Type': 'application/json'
			}
		}).then(res => {
			resolve(res)
		}).catch(err => {
			reject(err)
		})
	})
}
let queryQqOpenid =  (token) => {
	return new Promise((resolve,reject) => {
		axios.get(qqConfig.openid_path,{
			method:'get',
			params: {
				access_token: token,
				fmt: 'json'
			},
			headers:{
				'Content-Type': 'application/json'
			}
		}).then(res => {
			resolve(res)
		}).catch(err => {
			reject(err)
		})
	})
}
let queryQqUserInfo =  (token,appid,openid) => {
	return new Promise((resolve,reject) => {
		axios.get(qqConfig.user_info_path,{
			method:'get',
			params:{
				access_token:token,
				oauth_consumer_key:appid,
				openid,
			},
			headers:{
				'Content-Type': 'application/json'
			}
		}).then(res => {
			resolve(res)
		}).catch(err => {
			reject(err)
		})
	})
}

exports.queryQqLoginUserInfo = async (req,res) => {
	let { code, state} = req.body;
	let tokenData = await queryQqToken(code,state);
	if(!tokenData.data.access_token){
		responseClient(res,200,1,'获取token失败，请重新授权！',tokenData.data)
		return;
	}
	let openidData = await queryQqOpenid(tokenData.data.access_token);
	if(!openidData.data.openid){
		if(!tokenData.data.access_token){
			responseClient(res,200,1,'获取openid失败，请重新授权！',tokenData.data)
			return;
		}
	}
	let userInfoData = await queryQqUserInfo(tokenData.data.access_token,openidData.data.client_id,openidData.data.openid);
	if(userInfoData.data){
		User.findOne({ third_id: openidData.data.openid })
			.then(userInfo => {
				if (userInfo) {
					req.session.userInfo = userInfo;
					responseClient(res, 200, 0, '授权登录成功！', userInfo);
					return;
				}else{
					let user = new User({
						third_id:openidData.data.openid,
						name:userInfoData.data.nickname,
						avatar:userInfoData.data.figureurl_qq,
						type:1,
						phone:userInfoData.data.year || '',
						email:userInfoData.data.email || '',
						address:userInfoData.data.province + ' - ' + userInfoData.data.city,
						introduce:userInfoData.data.gender|| '这个人很懒，什么都没有留下~',
					});
					user.save().then(userInfo => {
						req.session.userInfo = userInfo;
						responseClient(res, 200, 0, '授权登录成功！', userInfo);
					});
				}
			})
			.catch(error3 => {
				console.log(error3)
				return;
			});
	}else{
		responseClient(res,200,1,'获取QQ用户信息失败~',userInfoData)
	}
}
