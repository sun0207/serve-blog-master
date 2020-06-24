import Album from '../models/album';
import {responseClient} from '../util/util';

exports.addAlbum = (req,res) => {
    const { album_desc,album_name, album_state, } = req.body;
    let tempAlbum = new Album({
        album_name,
        album_desc,
        album_state,
    })
    tempAlbum
        .save()
        .then(result=>{
            responseClient(res,200,0,'创建成功',result);
        })
        .catch(error=>{
            responseClient(res,500,1,'服务器开小差了~',error);
        })
}
exports.updateAlbum = (req,res) => {
    const { album_id,album_name, album_desc, album_state} = req.body;
    Album.update({_id:album_id},{
        album_name,
        album_desc,
        album_state,
    }).then(result=>{
        responseClient(res,200,0,'更新成功',result)
    }).catch(error=>{
        responseClient(res,500,1,'服务器开小差了~',error);
    })
}
exports.deleteAlbum = (req,res) => {
    const {album_id} = req.body;
    Album.deleteMany({_id:album_id})
        .then(result=>{
            responseClient(res,200,0,'删除成功',result)
        }).catch(error=>{
            responseClient(res,500,1,'服务器开小差了~',error);
        })
}
exports.getAlbumList = (req,res) => {
    let { album_state } = req.query;
    let conditions = { };
    if(album_state){
        conditions = {
            album_state,
        }   
    }
    let fields = {
        album_name:1,
        album_desc:1,
        album_state:1,
        album_num:1,
        album_photo:1,
        create_time:1,
    }
    Album.find(conditions,fields,(error,result)=>{
        if(error){
            responseClient(res,500,1,'服务器开小差了~',error);
            return;
        }
        if(result){
            responseClient(res,200,0,'更新成功',result);
        }else{
            responseClient(res,500,1,'服务器开小差了~',error);
        }
    })
    .populate([
        { path: 'album_photo', },
    ])
}
exports.getAlbumById = (req,res) => {
    let { album_id } = req.query;
    Album.findOne({_id:album_id},(error,result)=>{
        if(error){
            responseClient(res,500,1,'服务器开小差了~',error);
            return;
        }
        if(result){
            responseClient(res,200,0,'更新成功',result);
        }else{
            responseClient(res,500,1,'服务器开小差了~',error);
        }
    })
    .populate([
        { path: 'album_photo', },
    ])
}
exports.getAlbumIdByName = (req,res)=>{
    let {album_name} = req.query;
    Album.findOne({album_name:album_name},(error,result)=>{
        if(error){
            responseClient(res,500,1,'服务器开小差了~',error);
            return;
        }
        if(result){
            responseClient(res,200,0,'更新成功',result);
        }else{
            responseClient(res,500,1,'服务器开小差了~',error);
        }
    }).populate([
        { path: 'album_photo', },
    ])
}