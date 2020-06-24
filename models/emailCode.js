/**
 * emailCode model module
 * @module models/emailCode
 * @author kangheng <https://github.com/sun0207>
 */
const { mongoose} = require('../core/mongodb');
const autoIncrement = require('mongoose-auto-increment');

// 邮箱验证码模型
const emailCodeSchema = new mongoose.Schema({
    // 邮箱
    email:{ type: String, require: true },

    // 六位验证码
    code:{ type: String, require:true },

    // 添加时间
    create_time:{ type: Date, default: Date.now},
    
    // 修改时间
    update_time:{ type: Date, default: Date.now}
})
emailCodeSchema.plugin(autoIncrement.plugin,{
    model: 'emailCode',
    field: 'id',
    startAt: 1,
    incrementBy: 1
})
module.exports = mongoose.model('EmailCode',emailCodeSchema);