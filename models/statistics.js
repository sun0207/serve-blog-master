/**
 * Statistics model module
 * @file 统计类型
 * @module model/link
 * @author kangheng <https://github.com/sun0207>
 */
const { mongoose } = require('../core/mongodb.js');
const autoIncrement = require('mongoose-auto-increment');

// 统计模型
const statisticsSchema = new mongoose.Schema({
    // 访问ip
    visitIp: {type: String, default: ''},
    // 当前ip访问次数
    ipVisitNum: {type: Number, default: 0},
	// 创建日期
	create_time: { type: Date, default: Date.now },
	// 最后修改日期
	update_time: { type: Date, default: Date.now },
})
// 自增ID插件配置
statisticsSchema.plugin(autoIncrement.plugin,{
    model:'Statistics',
    field: 'id',
    startAt: 1,
    incrementBy: 1
});
// 统计模型
module.exports = mongoose.model('Statistics',statisticsSchema);