/*
    创建商铺集合
 */
const mongoose = require("mongoose")

// 定义商铺数据库规则
const BusinessSchema = mongoose.Schema({
    "name": String,
    "address": String,
    "latitude": Number,
    "longitude": Number,
    "geohash": [String],
    "phone": String,
    "category": String,
    "supports": [{description: String, icon_name: String}],
    "rating_count": Number,
    "rating": Number,
    "distribution": {tips: String, initial: String},
    "opening_hours": [String],
    "image_path": String,
    "delivery_text": String,
    "activities": []
})
// 创建商铺集合
const BusinessModel = mongoose.model('business', BusinessSchema)

// 引入JSON数据并插入到数据库中
/*const business = require("../../data/shopsList.json")
Array.prototype.slice.call(business).forEach((busines, index) => {
    // 插入数据
    BusinessModel.create(busines).then(() => console.log("插入成功"+index))
})*/

// 向外暴露BusinessModel集合
module.exports = BusinessModel
