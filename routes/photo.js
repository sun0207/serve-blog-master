import Photo from '../models/photo';
import Album from '../models/album';
import {responseClient} from '../util/util';

//添加照片
exports.addPhoto = (req,res) => {
    const { photo_desc, photo_url, album_id, album_name } = req.body;
    let tempPhoto = new Photo({
        photo_desc,
        photo_url,
        album_id,
        album_name
    })
    tempPhoto
        .save()
        .then(result=>{
            Album.findById({_id:album_id})
                .then(albumRes=>{
                    let album_num = albumRes.album_num+1;
                    let album_photo = albumRes.album_photo;
                    album_photo.push(result._id);
                    Album.updateOne({_id:album_id},{
                        album_num:album_num,
                        album_photo:album_photo
                    }).then(updateRes=>{
                        responseClient(res,200,0,'添加成功',result)
                    }).catch(error3=>{
                        responseClient(res,500,1,'服务器开小差了~',error3);
                    })
                }).catch(error2=>{
                    console.log(error2)
                    responseClient(res,500,1,'服务器开小差了~',error2);
                })
        })
        .catch(error=>{
            responseClient(res,500,1,'服务器开小差了~',error);
        })
}
//更新照片
exports.updatePhoto = (req,res) => {
    const { photo_id,photo_desc, photo_url} = req.body;
    Photo.update({_id:photo_id},{
        photo_desc,
        photo_url
    }).then(result=>{
        responseClient(res,200,0,'更新成功',result)
    }).catch(error=>{
        responseClient(res,500,1,'服务器开小差了~',error);
    })
}
//删除照片
exports.deletePhoto = (req,res) => {
    const {photo_id, album_id} = req.body;
    Photo.deleteMany({_id:photo_id})
        .then(result=>{
            Album.findById({_id:album_id})
                .then(albumRes=>{
                    let album_num = albumRes.album_num-1;
                    let album_photo = albumRes.album_photo;
                    album_photo = album_photo.filter(item=>{
                        return item!=photo_id
                    })
                    //更新相册
                    Album.updateOne({_id:album_id},{
                        album_num:album_num<=0?0:album_num,
                        album_photo:album_photo
                    }).then(updateRes=>{
                        responseClient(res,200,0,'删除成功',result)
                    }).catch(error3=>{
                        responseClient(res,500,1,'服务器开小差了~',error3);
                    })
                }).catch(error2=>{
                    responseClient(res,500,1,'服务器开小差了~',error2);
                })
        }).catch(error=>{
            responseClient(res,500,1,'服务器开小差了~',error);
        })
}
//根据相册删除照片
exports.deletePhotoByAlbum = (req,res) => {
    const {album_id} = req.body;
    Photo.deleteMany({album_id:album_id})
        .then(result=>{
            responseClient(res,200,0,'删除成功',result)
        }).catch(error=>{
            responseClient(res,500,1,'服务器开小差了~',error);
        })
}
//查询相册列表
exports.getPhotoList = (req,res) => {
    let { album_id } = req.query;
    let conditions = { };
    if(album_id){
        conditions = {
            album_id,
        }   
    }
    let fields = {
        photo_desc:1,
        photo_url:1,
        album_id:1,
        album_name:1,
        create_time:1,
    }
    let responseData = {
        count: 0,
        list: [],
    };
    Photo.countDocuments(conditions,(err,count)=>{
        if(err){
            responseClient(res,500,1,'服务器开小差了~',error);
        }else{
            responseData.count = count;
            Photo.find(conditions,fields,(error,result)=>{
                if(error){
                    responseClient(res,500,1,'服务器开小差了~',error);
                    return;
                }
                if(result){
                    responseData.list = result;
                    responseClient(res,200,0,'更新成功',responseData);
                }else{
                    responseClient(res,500,1,'服务器开小差了~',error);
                }
            })
        }
    })
}