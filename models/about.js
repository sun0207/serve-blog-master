/**
 * About model module
 * @file 关于我们数据模型
 * @module model/About
 * @author 康恒(sun0207) <https://github.com/sun0207>
 */

const { mongoose } = require('../core/mongodb.js');
const autoIncrement = require('mongoose-auto-increment');

const aboutSchema = new mongoose.Schema({
    // 关于我标题
    title:{ type:String, required:true, validate:/\S+/ },

    // 关键字
    keyword:[{ type:String, default:'' }],

    // 作者
    author:{ type:String, required:true,validate:/\S+/ },

    // 关于谁 : 0=>康恒 1=>亚茹 
    who:{ type:Number, default:1},

    // 是否启用 : 0=>已启用 1=>未启用 
    enabledState:{ type:Number, default:1 },

    // 描述
    desc:{ type:String, default:'' },

    // 关于我内容
    content:{ type:String, required:true, validate:/\S+/ },

    // 关于我文本
    contentHtml:{ type:String,required:true,validate:/\S+/},

    // 内容字数
    numbers:{ type:Number, default:0 },
    
    // 封面图
    img_url:{ type:String, default:'https://i.loli.net/2019/04/24/5cbfd87a7d615.jpg' },

    // 点赞用户
    like_users: [
        {
            //用户id
            id:{ type: mongoose.Schema.Types.ObjectId},

            // 用户昵称
            name: { type:String, required:true, default:''},

            // 用户类型
            type:{ type:Number, default:1 },

            // 用户头像
            avatar:{ type:String,default:'user' },

            // 创建日期
            create_time:{ type:Date,default:Date.now},
        }
    ],

    // 其他元信息
	meta: {
		views: { type: Number, default: 0 },
		likes: { type: Number, default: 0 },
		comments: { type: Number, default: 0 },
    },
    
    // 创建日期
	create_time: { type: Date, default: Date.now },

	// 最后修改日期
	update_time: { type: Date, default: Date.now },
})

// 自增 ID 插件配置
aboutSchema.plugin(autoIncrement.plugin, {
	model: 'About',
	field: 'id',
	startAt: 1,
	incrementBy: 1,
});

module.exports = mongoose.model('About',aboutSchema);

