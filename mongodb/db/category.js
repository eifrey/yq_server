/*
    创建分类列表集合
 */
const mongoose = require("mongoose")

// 定义主页分类集合规则
const CategorySchema = mongoose.Schema({
    title: String,
    image_url: String
})
// 创建分类集合
const CategoryModel = mongoose.model('category', CategorySchema)

// 引入JSON数据并插入到数据库中
/*const Category = require("../../data/category.json")
Array.prototype.slice.call(Category).forEach((item, index) => {
    // 插入数据
    CategoryModel.create(item).then(() => console.log("插入成功"+index))
})*/

// 向外暴露CategoryModel集合
module.exports = CategoryModel
