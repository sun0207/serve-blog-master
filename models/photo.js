/**
 * About model module
 * @file 关于照片墙数据模型
 * @module model/Photo
 * @author 康恒(sun0207) <https://github.com/sun0207>
 */

const { mongoose } = require('../core/mongodb.js');
const autoIncrement = require('mongoose-auto-increment');

const photoSchema = new mongoose.Schema({
    // 照片描述
    photo_desc:{ type:String, validate:/\S+/ },

    // 照片地址
    photo_url:{ type:String,required:true, default:'https://i.loli.net/2019/04/24/5cbfd87a7d615.jpg' },

	// 所属相册id
	album_id:{ type:String, required:true, default:'' },
	
    // 所属相册名称
	album_name:{ type:String, required:true, default:''},
	
    // 创建日期
	create_time: { type: Date, default: Date.now },

	// 最后修改日期
	update_time: { type: Date, default: Date.now },
})

// 自增 ID 插件配置
photoSchema.plugin(autoIncrement.plugin, {
	model: 'Photo',
	field: 'id',
	startAt: 1,
	incrementBy: 1,
});

module.exports = mongoose.model('Photo',photoSchema);

