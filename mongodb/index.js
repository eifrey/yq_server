/*
    创建数据库
 */
const mongoose = require("mongoose")
mongoose.connect("mongodb://localhost:27017/yq_app", { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => console.log("疫情数据库连接成功"))
    .catch(() => console.log("疫情数据库连接失败"))
