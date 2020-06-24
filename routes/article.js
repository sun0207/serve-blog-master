import Article from '../models/article';
import User from '../models/user';
import { responseClient } from '../util/util';
var multiparty = require('multiparty');
var fs=require('fs');
let qn = require('../util/qiniu');

exports.addArticle = (req, res) => {
    const { title, author, keyword, content, numbers, desc, img_url, recommend, tags, tagsName, category, state, origin, owner } = req.body;
    let tempArticle = null;
    if (img_url) {
        tempArticle = new Article({
            title,
            author,
            keyword: keyword ? keyword.split(',') : [],
            content,
            numbers,
            desc,
            img_url,
            recommend,
            tags: tags ? tags.split(',') : [],
            tagsName:tagsName,
            category: category ? category.split(',') : [],
            state,
            origin,
            owner
        });
    } else {
        tempArticle = new Article({
            title,
            author,
            keyword: keyword ? keyword.split(',') : [],
            content,
            numbers,
            desc,
            recommend,
            tags: tags ? tags.split(',') : [],
            tagsName,
            category: category ? category.split(',') : [],
            state,
            origin,
            owner
        });
    }

    tempArticle
        .save()
        .then(data => {
            // let article = JSON.parse(JSON.stringify(data));
            // console.log('article :', article);
            // article.create_time = timestampToTime(article.create_time);
            // article.update_time = timestampToTime(article.update_time);
            // console.log('timestampToTime :', timestampToTime(data.create_time));
            responseClient(res, 200, 0, '保存成功', data);
        })
        .catch(err => {
            console.log(err);
            responseClient(res);
        });
};

// 图片上传 => 保存至本地文件夹
exports.uploadImgLocal = (req, res) => {
    var form = new multiparty.Form();//新建表单
    //设置编码方式
    form.encoding = 'utf-8';
    //设置图片存储路径
    form.uploadDir = "public/upload/";
    form.keepExtensions = true;   //保留后缀
    form.maxFieldsSize = 5*1024*1024; //内存大小
    form.maxFilesSize= 10*1024*1024;//文件字节大小限制，超出会报错err
    //表单解析
    form.parse(req, function(err,fields,files) {
        //报错处理
        if(err){
            console.log(err);
            var u={"status" :1,"msg":'请上传小于10M图片'};
            res.send(JSON.stringify(u));
            return false;
        }
        //获取路径
        var oldpath='';
        if(files.file){
            oldpath=files.file[0].path
        }else if(files.avatar){
            oldpath=files.avatar[0].path
        }else{
            oldpath=files.file[0].path
        }
        //文件后缀处理格式
        if(oldpath.indexOf('.jpg')>=0){
            var suffix='.jpg';      
        }else if(oldpath.indexOf('.png')>=0){                   
            var suffix='.png';      
        }else if(oldpath.indexOf('.gif')>=0){                   
            var suffix='.gif';      
        }else if(oldpath.indexOf('.jpeg')>=0){                   
            var suffix='.jpeg';      
        }else{
            var u={"status" :1,"msg":'请上传正确格式'};
            res.send(JSON.stringify(u));
            return false;
        }
        var dateNow = Date.now();
        var url='public/upload/'+dateNow+suffix;
        var note_url = '/api/upload/'+dateNow+suffix;
        //给图片修改名称
        fs.renameSync(oldpath,url);
        var u=note_url;
        res.send(u);
    });
}

//图片上传 => 七牛云服务器
exports.uploadImg = (req, res) => {
    try{
        qn.upImg(req,function(result){
            console.log(result)
            if(result.status == 0){
                res.send(result.data);
            }else{
                responseClient(res, 200, 1, '上传失败',result.msg);
            }
        });
    }catch(err){
        if(err){
            console.log('trycatch报错====',err);
            responseClient(res, 500, 1, '服务器开小差了~',result);
        }
    }
}
exports.updateArticle = (req, res) => {
    // if (!req.session.userInfo) {
    // 	responseClient(res, 200, 1, '您还没登录,或者登录信息已过期，请重新登录！');
    // 	return;
    // }
    const { title, author, keyword, content, numbers, desc, img_url, tags, tagsName, category, state, origin, owner, id } = req.body;
    Article.update({ _id: id }, {
            title,
            author,
            keyword: keyword ? keyword.split(',') : [],
            content,
            numbers,
            desc,
            img_url,
            tags: tags ? tags.split(',') : [],
            tagsName,
            category: category ? category.split(',') : [],
            state,
            origin,
            owner
        }, )
        .then(result => {
            responseClient(res, 200, 0, '操作成功', result);
        })
        .catch(err => {
            console.error(err);
            responseClient(res);
        });
};

exports.delArticle = (req, res) => {
    let { id } = req.body;
    Article.deleteMany({ _id: id })
        .then(result => {
            if (result.n === 1) {
                responseClient(res, 200, 0, '删除成功!');
            } else {
                responseClient(res, 200, 1, '文章不存在');
            }
        })
        .catch(err => {
            console.error('err :', err);
            responseClient(res);
        });
};

// 前台文章列表
exports.getArticleList = (req, res) => {
    let keyword = req.query.keyword || null;
    let state = req.query.state || 1;
    let owner = req.query.owner || '';
    let likes = req.query.likes || '';
    let tag_id = req.query.tag_id || '';
    let recommend = req.query.recommend || '';
    let category_id = req.query.category_id || '';
    let pageNum = parseInt(req.query.pageNum) || 1;
    let pageSize = parseInt(req.query.pageSize) || 10;
    let conditions = {};
    if (!state) {
        if (keyword) {
            const reg = new RegExp(keyword, 'i'); //不区分大小写
            conditions = {
                $or: [{ title: { $regex: reg } }, { desc: { $regex: reg } }],
            };
        }
    } else if (state) {
        state = parseInt(state);
        if (keyword) {
            const reg = new RegExp(keyword, 'i');
            conditions = {
                $and: [
                    { $or: [{ state: state }] },
                    { $or: [{ title: { $regex: reg } }, { desc: { $regex: reg } }, { keyword: { $regex: reg } }] },
                ],
            };
        } else if(owner){
            conditions = { state, owner };
        } else if(category_id){
            conditions = { state, category : { $in : [category_id] } };
        } else if(tag_id){
            conditions = { state, tags : { $in : [tag_id] } };
        } else if(recommend){
            conditions = { state, recommend };
        } else{
            conditions = { state };
        }
    }
    let skip = pageNum - 1 < 0 ? 0 : (pageNum - 1) * pageSize;
    let responseData = {
        count: 0,
        list: [],
    };
    Article.countDocuments(conditions, (err, count) => {
        if (err) {
            console.log('Error:' + err);
        } else {
            responseData.count = count;
            // 待返回的字段
            let fields = {
                title: 1,
                author: 1,
                keyword: 1,
                content: 1,
                desc: 1,
                img_url: 1,
                tags: 1,
                tagsName: 1,
                category: 1,
                state: 1,
                owner:1,
                origin: 1,
                comments: 1,
                like_User_id: 1,
                meta: 1,
                create_time: 1,
                update_time: 1,
            };
            let options = {
                skip: skip,
                limit: pageSize,
                sort: { create_time: -1 },
            };
            Article.find(conditions, fields, options, (error, result) => {
                if (err) {
                    console.error('Error:' + error);
                    responseClient(res,500,1,'获取失败',err)
                } else {
                    responseData.list = result;
                    responseClient(res, 200, 0, '操作成功！', responseData);
                }
            })
        }
    });
};

/**
 * 获取热门文章
 */
exports.getHotArticleList = (req,res) => {
    let options = {
        skip:0,
    }
    let fields = {
        title: 1,
        desc: 1,
        meta: 1,
    };
    Article.find( {}, fields, options, (err,result) => {
        if(err){
            console.error(err)
            responseClient(res,500,1,'获取失败',err)
        }else{
            result.sort((a,b) => {
                return b.meta.views - a.meta.views
            })
            let responseData = {
                list:result.slice(0,result.length >= 10 ? 10 : result.length)
            }
            responseClient(res,200,0,'获取成功',responseData)
        }
    })
}
// 后台文章列表
exports.getArticleListAdmin = (req, res) => {
    let keyword = req.query.keyword || null;
    let state = req.query.state || '';
    let owner = req.query.owner || 0;
    let likes = req.query.likes || '';
    let pageNum = parseInt(req.query.pageNum) || 1;
    let pageSize = parseInt(req.query.pageSize) || 10;
    let conditions = {};
    if (!state) {
        if (keyword) {
            const reg = new RegExp(keyword, 'i'); //不区分大小写
            conditions = {
                $or: [{ title: { $regex: reg } }, { desc: { $regex: reg } }],
                owner
            };
        }
    } else if (state) {
        state = parseInt(state);
        if (keyword) {
            const reg = new RegExp(keyword, 'i');
            conditions = {
                $and: [
                    { $or: [{ state: state }] },
                    { $or: [{ title: { $regex: reg } }, { desc: { $regex: reg } }, { keyword: { $regex: reg } }] },
                ],
                owner
            };
        } else {
            conditions = { state,owner };
        }
    }

    let skip = pageNum - 1 < 0 ? 0 : (pageNum - 1) * pageSize;
    let responseData = {
        count: 0,
        list: [],
    };
    Article.countDocuments(conditions, (err, count) => {
        if (err) {
            console.log('Error:' + err);
        } else {
            responseData.count = count;
            // 待返回的字段
            let fields = {
                title: 1,
                author: 1,
                keyword: 1,
                content: 1,
                desc: 1,
                img_url: 1,
                tags: 1,
                category: 1,
                state: 1,
                origin: 1,
                owner:1,
                comments: 1,
                like_User_id: 1,
                meta: 1,
                create_time: 1,
                update_time: 1,
            };
            let options = {
                skip: skip,
                limit: pageSize,
                sort: { create_time: -1 },
            };
            Article.find(conditions, fields, options, (error, result) => {
                    if (err) {
                        console.error('Error:' + error);
                        // throw error;
                    } else {
                        if (likes) {
                            result.sort((a, b) => {
                                return b.meta.views - a.meta.views;
                            });
                        }
                        responseData.list = result;
                        responseClient(res, 200, 0, '操作成功！', responseData);
                    }
                })
                .populate([
                    { path: 'tags', },
                    { path: 'comments', },
                    { path: 'category', },
                ])
                .exec((err, doc) => {
                    // console.log("doc:");          // aikin
                    // console.log("doc.tags:",doc.tags);          // aikin
                    // console.log("doc.category:",doc.category);           // undefined
                });
        }
    });
};

// 文章点赞
exports.likeArticle = (req, res) => {
    if (!req.session.userInfo) {
        responseClient(res, 200, 1, '您还没登录,或者登录信息已过期，请重新登录！');
        return;
    }
    let { id, user_id } = req.body;
    Article.findOne({ _id: id })
        .then(data => {
            let fields = {};
            data.meta.likes = data.meta.likes + 1;
            fields.meta = data.meta;
            let like_users_arr = data.like_users.length ? data.like_users : [];
            User.findOne({ _id: user_id })
                .then(user => {
                    let new_like_user = {};
                    new_like_user.id = user._id;
                    new_like_user.name = user.name;
                    new_like_user.avatar = user.avatar;
                    new_like_user.create_time = user.create_time;
                    new_like_user.type = user.type;
                    new_like_user.introduce = user.introduce;
                    like_users_arr.push(new_like_user);
                    fields.like_users = like_users_arr;
                    Article.update({ _id: id }, fields)
                        .then(result => {
                            responseClient(res, 200, 0, '操作成功！', result);
                        })
                        .catch(err => {
                            console.error('err :', err);
                            throw err;
                        });
                })
                .catch(err => {
                    responseClient(res);
                    console.error('err 1:', err);
                });
        })
        .catch(err => {
            responseClient(res);
            console.error('err 2:', err);
        });
};

// 文章详情
exports.getArticleDetail = (req, res) => {
    let { id } = req.body;
    let type = Number(req.body.type) || 1; //文章类型 => 1: 普通文章，2: 简历，3: 管理员介绍
    let filter = Number(req.body.filter) || 1; //文章的评论过滤 => 1: 过滤，2: 不过滤
    // console.log('type:', type);
    if (type === 1) {
        if (!id) {
            responseClient(res, 200, 1, '文章不存在 ！');
            return;
        }
        Article.findOne({ _id: id }, (Error, data) => {
                if (Error) {
                    console.error('Error:' + Error);
                    // throw error;
                } else {
                    data.meta.views = data.meta.views + 1;
                    Article.updateOne({ _id: id }, { meta: data.meta })
                        .then(result => {
                            if(filter === 1){
                                const arr = data.comments;
                                let CommentCount = 0;
	                            for (let i = arr.length - 1; i >= 0; i--) {
	                                const e = arr[i]
	                                if (e.state !== 1) {
	                                    arr.splice(i, 1)
	                                }else{
                                        CommentCount = CommentCount + 1;
                                    }
	                                const newArr = e.other_comments
	                                const length = newArr.length
	                                if (length) {
	                                    for (let j = length - 1; j >= 0; j--) {
	                                        const item = newArr[j]
	                                        if (item.state !== 1) {
	                                            newArr.splice(j, 1)
	                                        }else{
                                                CommentCount = CommentCount + 1;
                                            }
	                                    }
	                                }
                                }
                                data.meta.comments = CommentCount;
                            }
                            responseClient(res, 200, 0, '操作成功 ！', data);
                        })
                        .catch(err => {
                            console.error('err :', err);
                            throw err;
                        });
                }
            })
            .populate([
                { path: 'tags', },
                { path: 'category', },
                { path: 'comments', },
            ])
            .exec((err, doc) => {
                // console.log("doc:");          // aikin
                // console.log("doc.tags:",doc.tags);          // aikin
                // console.log("doc.category:",doc.category);           // undefined
            });
    } else {
        Article.findOne({ type: type }, (Error, data) => {
                if (Error) {
                    console.log('Error:' + Error);
                    // throw error;
                } else {
                    if (data) {
                        data.meta.views = data.meta.views + 1;
                        Article.updateOne({ type: type }, { meta: data.meta })
                            .then(result => {
                            	if(filter === 1){
                            	const arr = data.comments
	                            for (let i = arr.length - 1; i >= 0; i--) {
	                                const e = arr[i]
		                                if (e.state !== 1) {
		                                    arr.splice(i, 1)
		                                }
		                                const newArr = e.other_comments
		                                const length = newArr.length
		                                if (length) {
		                                    for (let j = length - 1; j >= 0; j--) {
		                                        const item = newArr[j]
		                                        if (item.state !== 1) {
		                                            newArr.splice(j, 1)
		                                        }
		                                    }
		                                }
		                            }
	                            }
                                responseClient(res, 200, 0, '操作成功 ！', data);
                            })
                            .catch(err => {
                                console.error('err :', err);
                                throw err;
                            });
                    } else {
                        responseClient(res, 200, 1, '文章不存在 ！');
                        return;
                    }
                }
            })
            .populate([
                { path: 'tags', },
                { path: 'category', },
                { path: 'comments', },
            ])
            .exec((err, doc) => {
                // console.log("doc:");          // aikin
                // console.log("doc.tags:",doc.tags);          // aikin
                // console.log("doc.category:",doc.category);           // undefined
            });
    }
};