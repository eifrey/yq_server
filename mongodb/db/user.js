/*
    创建用户集合
 */
const mongoose = require("mongoose")

// 定义用户集合规则
const UserSchema = mongoose.Schema({
    name: String,
    pwd: String,
    phone: String,
    orders: []
})
// 创建用户集合
const UserModel = mongoose.model("user", UserSchema)
// 插入数据
/*const user = require("../../data/user.json")
Array.prototype.slice.call(user).forEach((item, index) => {
    UserModel.create(item).then(() => console.log("第"+index+"条数据插入成功"))
})*/
// UserModel.create({name: "admin", pwd: "123456", phone: "17786291111"}).then(() => console.log("用户创建成功"))

// 向外暴露User集合
module.exports = UserModel
