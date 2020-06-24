import About from '../models/about';
import User from '../models/user';
import { responseClient } from '../util/util';

exports.addAboutContent = (req,res)=>{
    const { title, keyword, author, who, enabledState, content, desc, img_url} = req.body;
    let tempAbout = null;
    if(img_url){
        tempAbout=new About({
            title,
            keyword:keyword ? keyword.split(',') : [],
            author,
            who,
            enabledState,
            content,
            desc,
            number:0,
            img_url,
        })
    }else{
        tempAbout=new About({
            title,
            keyword:keyword ? keyword.split(',') : [],
            author,
            who,
            enabledState,
            content,
            desc,
            number:0,
        })
    }
    let count;
    About.countDocuments({who:who},(err,count)=>{
        count = count;
        if(enabledState == 0 && count!=0){
            var conditions = {
                $and: [
                    { who: who }
                ],
            };
            let fields = {
                enabledState:1,
            }
            About.updateMany(conditions,fields,(err,results)=>{
                tempAbout
                    .save()
                    .then(data=>{
                        responseClient(res,200,0,'添加成功',data);
                    })
                    .catch(err=>{
                        console.error('err:'+err);
                        responseClient(res)
                    })
            })
        }else{
            tempAbout
                .save()
                .then(data=>{
                    responseClient(res,200,0,'添加成功',data);
                })
                .catch(err=>{
                    console.log(err);
                    responseClient(res)
                })
        }
    })
}

exports.updateAboutContent = (req,res)=>{
    const { title, keyword, author, who, enabledState, content, desc, img_url, id} = req.body;
    About.updateOne({_id:id},{
            title,
            keyword:keyword ? keyword.split(',') : [],
            author,
            who,
            enabledState,
            content,
            desc,
            number:content.length,
            img_url,
        })
        .then(data=>{
            if(data.ok === 1 ){
                responseClient(res,200,0,'更新成功',data);
            }else{
                responseClient(res,200,1,'更新失败',data);
            }
        })
        .catch(err=>{
            console.error('err :', err);
            throw err;
        })
}

exports.deleteAbout = (req,res)=>{
    const {id} = req.body;
    About.deleteMany({_id:id})
        .then(result=>{
            if(result.ok===1){
                responseClient(res,200,0,'删除成功');
            }else{
                responseClient(res,200,1,'删除失败,请重试');
            }
        })
        .catch(err=>{
            console.error('err :', err);
            throw err;
        })
}

exports.getAboutList = (req,res) =>{
    let canditions;
    if(req.query.who == 2 && req.query.enabledState != 2){
        canditions = {
            enabledState:req.query.enabledState
        }; 
    }else if(req.query.enabledState == 2 && req.query.who != 2){
        canditions = {
            who:req.query.who
        }; 
    }else if(req.query.enabledState != 2 && req.query.who != 2){
        canditions = {
            $and:[
                {who:req.query.who},
                {enabledState:req.query.enabledState},
            ]
        };
    }else{
        canditions = {};
    }
    let responseData = {
        count: 0,
        list: [],
    };
    About.countDocuments(canditions,(err,count)=>{
        if(err){
            console.error('Error:'+err);
        }else{
            responseData.count = count;
            let fields = {
                title:1,
                keyword:1,
                author:1,
                who:1,
                enabledState:1,
                desc:1,
                number:1,
                img_url:1,
                meta:1,
                create_time: 1,
                update_time: 1,
            };
            let options = {
                sort: { create_time: -1 },
            };
            About.find(canditions,fields,options,(error,result)=>{
                if(error){
                    console.error('Error:'+error)
                }else{
                    responseData.list = result;
                }
                responseClient(res,200,0,'成功',responseData);
            })
        }
    })
}

exports.getAboutDetail = (req,res)=>{
    const { id } = req.query;
    let fields = {
        title:1,
        keyword:1,
        author:1,
        who:1,
        enabledState:1,
        desc:1,
        content:1,
        number:1,
        img_url:1,
        meta:1,
        create_time: 1,
        update_time: 1,
    };
    About.findOne({_id:id},fields,(err,data)=>{
        if(err){
            console.log('Error:' + err);
        }else{
            if(data){
                responseClient(res, 200, 0, '获取成功！', data);
            }else{
                responseClient(res, 200, 1, '暂未添加简介！', data);
            }
        }
    })
}


exports.getAboutContent = (req,res)=>{
    const {who,enabledState} = req.query;
    let canditions = {
        $and:[
            {who:who},
            {enabledState:enabledState},
        ]
    }
    let fields = {
        author:1,
        who:1,
        enabledState:1,
        desc:1,
        content:1,
        img_url:1,
    };
    About.findOne(canditions,fields,(err,data)=>{
        if(err){
            console.log('Error:' + err);
        }else{
            if(data){
                responseClient(res, 200, 0, '获取成功！', data);
            }else{
                responseClient(res, 200, 1, '暂未添加简介！', data);
            }
        }
    })
}
