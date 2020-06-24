/**
 * Message model module.
 * @file 留言模型
 * @module model/message
 * @author kangheng <https://github.com/sun0207>
 */

const { mongoose } = require('../core/mongodb.js');
const autoIncrement = require('mongoose-auto-increment');

// 留言模型
const messageBoardSchema = new mongoose.Schema({
	// 用户 id
	user_id: { type: String, default: '' },

	// 姓名
	user: { type: String, default: '' },

	// 用户类型 0=> 管理员
	user_type: { type: Number, default: 1 },

	// 头像
	avatar: { type: String, default: 'user' },

	// 电话
	phone: { type: String, default: '' },

	// 介绍
	introduce: { type: String, default: '' },

	// 留言内容
	content: { type: String, required: true },

	// 回复留言内容
	reply_list: [
		{
            // 用户 id
            user_id: { type: String, default: '' },

            // 回复人
			user: { type: String, default: '' },
			
			// 回复人用户类型
            user_type: { type: Number, default: 1 },

            // 被回复人
            to_user: { type: String, default: '' },

            // 回复人头像
            avatar: { type: String, default: 'user' },
            
            // 回复内容
            content: { type: String, required: true },

			// 邮箱
			email: { type: String, default: '' },

			// 留言位置
			address: { type: String, default: 'CHINA' },

			// 留言内容是否违规 0=>待审核 1=>正常留言 -1=>已删除  -2=>垃圾评论
			is_illegal: { type: Number, default: 1 },
			
			// 是否已经处理过 => 1 是 / 2 否 ；新加的评论需要审核，防止用户添加 垃圾评论
			is_handle: { type: Number, default: 2 },
            
            // 创建日期
            create_time: { type: Date, default: Date.now },

            // 最后修改日期
            update_time: { type: Date, default: Date.now },
		},
	],

	// 邮箱
	email: { type: String, default: '' },

	// 留言位置
	address: { type: String, default: 'CHINA' },

	// 留言内容是否违规 0=>待审核 1=>正常留言 -1=>已删除  -2=>垃圾评论
	is_illegal: { type: Number, default: 1 },
	
	// 是否已经处理过 => 1 是 / 2 否 ；新加的评论需要审核，防止用户添加 垃圾评论
	is_handle: { type: Number, default: 2 },

	// 创建日期
	create_time: { type: Date, default: Date.now },

	// 最后修改日期
	update_time: { type: Date, default: Date.now },
});

// 自增ID插件配置
messageBoardSchema.plugin(autoIncrement.plugin, {
	model: 'MessageBoard',
	field: 'id',
	startAt: 1,
	incrementBy: 1,
});


// 留言模型
module.exports = mongoose.model('MessageBoard', messageBoardSchema);
