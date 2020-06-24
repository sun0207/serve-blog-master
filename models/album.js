/**
 * About model module
 * @file 关于相册数据模型
 * @module model/Album
 * @author 康恒(sun0207) <https://github.com/sun0207>
 */

const { mongoose } = require('../core/mongodb.js');
const autoIncrement = require('mongoose-auto-increment');

const albumSchema = new mongoose.Schema({
    // 相册名称
    album_name:{ type:String,required:true, default:'首页banner' },
    
    // 相册描述
    album_desc:{ type:String, validate:/\S+/ },

    // 相册状态  => 0 未启用  1 启用
    album_state:{ type:Number, default: 1},

    // 照片数量
    album_num:{ type:Number, default: 0},

    // 照片id集合
    album_photo:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Photo', required: true }],
    
    // 创建日期
	create_time: { type: Date, default: Date.now },

	// 最后修改日期
	update_time: { type: Date, default: Date.now },
})

// 自增 ID 插件配置
albumSchema.plugin(autoIncrement.plugin, {
	model: 'Album',
	field: 'id',
	startAt: 1,
	incrementBy: 1,
});

module.exports = mongoose.model('Album',albumSchema);

