const express = require("express")
const path = require("path")
// 设置网页的logo
const favicon = require('serve-favicon');
// 可以将请求信息打印在控制台，便于开发调试
const logger = require('morgan');
// 引入cookie-parser方便操作客户端中的cookie值
const cookieParser = require('cookie-parser');
// 处理post请求参数
const bodyParser = require('body-parser');
// 引入session会话
const session = require('express-session');
// 创建数据库
require("./mongodb/index.js")
// 引入用户登录操作路由
const user = require("./routes/user.js")
// 引入商家路由
const index = require("./routes/index.js")


// 创建服务器
const app = express()

// 设置静态文件获取目录
app.use(express.static(path.join(__dirname, "public")))

// 自定义页面图标
app.use(favicon(path.join(__dirname, "public", "./images/logo.png")))

// 在终端打印请求信息
app.use(logger('dev'))

// 解析json格式
app.use(bodyParser.json());
// 配置body-parser模块
/*
    参数extended默认值为false 代表默认使用node中的querystring让post参数转化为对象
        如果改为 true  则会使用更强大的第三方模块qs让post参数转化为对象
*/
app.use(bodyParser.urlencoded({ extended: false }))

// 配置cookie-parser模块
app.use(cookieParser())

// 配置session会话持续时间
app.use(session({
    secret: 'vue', // 用来注册session id到cookie中，相当与一个密钥
    cookie: {maxAge: 1000*60*60*24 },  //设置maxAge是80000ms，即80s后session和相应的cookie失效过期
    resave: false, // 是否允许session重新设置
    saveUninitialized: true, // 是否设置session在存储容器中可以给修改
}))

// 注册使用路由
app.use('/', index)
app.use('/user', user)


// 定义显示错误页面根目录
app.set('views', path.join(__dirname, 'views'))
// 设置错误页面文件的后缀
app.set('view engine', 'ejs')

// 捕获404请求并转发给错误处理中间件
app.use((req, res, next) => {
    // 定义一个错误对象
    const err = new Error("未找到 ಥ﹏ಥ")
    // 给错误对象赋值状态码为404未找到
    err.status = 404
    // 交给中间件处理
    next(err)
})

// 错误处理中间件
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    // 后台显示的状态码
    res.status(err.status || 500);
    // 显示错误模板
    res.render('error');
})

// 监听端口
app.listen(4000)
