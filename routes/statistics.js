import { responseClient } from '../util/util';
import Article from '../models/article';
import User from '../models/user';
import Statistics from '../models/statistics';

exports.addVisit = (req,res) => {
    const ip =  req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
        req.connection.remoteAddress || // 判断 connection 的远程 IP
        req.socket.remoteAddress || // 判断后端的 socket 的 IP
        req.connection.socket.remoteAddress;
    let fields = {
        visitIp:1,
        ipVisitNum:1,
        create_time:1,
        update_time:1,
    };
    let tempStatistics = null;
    Statistics.find({visitIp:ip},(error,result)=>{
        if(error){
            console.error(error)
            responseClient(res,400,1,'success',ip);
            return;
        }else{
            if(result.length<=0){
                tempStatistics = new Statistics({
                    visitIp:ip,
                    ipVisitNum:1
                })
                tempStatistics
                    .save()
                    .then(data=>{
                        responseClient(res,200,0,'新浏览添加成功',data);
                    })
                    .catch(err=>{
                        console.log('err:',err)
                        throw err;
                    })
            }else{
                // if(result[0].ipVisitNum>=10){
                //     return responseClient(res,200,0,'浏览量已达上限',result[0]);
                // }
                Statistics.updateOne(
                    {_id:result[0]._id}
                    ,{
                        ipVisitNum:result[0].ipVisitNum+1
                    }
                ).then(data=>{
                    responseClient(res,200,0,'浏览量更新成功',data);
                }).catch(err=>{
                    console.log('err:',err)
                    throw err;
                })
            }
        }
    })
}
exports.getSiteData =async (req,res) => {
    let articleCount = await Article.countDocuments({state:1},(error,count)=>{
            return count;
        })
    let userCount = await User.countDocuments({},(error,count)=>{
            return count;
        })
    let fields = {
        visitIp:1,
        ipVisitNum:1,
        create_time:1,
        update_time:1,
    };
    let visitList = await Statistics.find({},fields,(error,result)=>{
        if (error) {
            console.error('Error:' + error);
            throw error;
            return;
        }
        return result;
    })
    let siteData = {
        articleCount,
        userCount,
        visitList
    }
    responseClient(res,200,0,'获取统计数据成功',siteData)
}


