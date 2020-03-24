const express = require("express")
// 引入一次性图形码模块
const svgCaptcha = require('svg-captcha')
// 引入密码加密模块
const md5 = require('blueimp-md5')
// 短信发送
const sms_util = require('../util/sms_util')

// 引入用户数据库
const UserModel = require("../mongodb/db/user.js")
// 创建路由
const router = express.Router()
// 存储发送短信用户的信息
const users = {}

/* 密码登陆 */
router.post('/login_pwd', function (req, res) {
    const name = req.body.name
    // 加密获取密码
    // const pwd = md5(req.body.pwd)
    const pwd = req.body.pwd
    const captcha = req.body.captcha.toLowerCase()
    // console.log('/user/login_pwd', name, pwd, captcha, req.session)

    // 可以对用户名/密码格式进行检查, 如果非法, 返回提示信息
    if(captcha!==req.session.captcha) {
        return res.send({code: 1, msg: '验证码不正确'})
    }
    // 删除保存的验证码
    delete req.session.captcha

    UserModel.findOne({name}, function (err, user) {
        console.log(user)
        if (user) { // 如果存在用户则验证
            console.log('findUser', user.pwd, pwd)
            if (user.pwd !== pwd) {
                res.send({code: 1, msg: '用户名或密码不正确!'})
            } else {
                req.session.userid = user._id
                res.send({code: 0, data: {_id: user._id, name: user.name, phone: user.phone, orders: user.orders}})
            }
        } else { // 不存在则创建用户
            const userModel = new UserModel({name, pwd})
            userModel.save(function (err, user) {
                // 暂时在session会话中存储用户id值，用于刷新登录
                req.session.userid = user._id
                const data = {_id: user._id, name: user.name}
                // 3.2. 返回数据(新的user)
                res.send({code: 0, data})
            })
        }
    })
})

/* 一次性图形验证码 */
router.get('/captcha', function (req, res) {
    let captcha = svgCaptcha.create({
        ignoreChars: '0o1l',
        noise: 2,
        color: true
    });
    req.session.captcha = captcha.text.toLowerCase();
    console.log(req.session.captcha)
    res.type('svg');
    res.send(captcha.data)
});

/* 发送验证码短信 */
router.get('/sendcode', function (req, res, next) {
    //1. 获取请求参数数据
    const phone = req.query.phone;
    //2. 处理数据
    //生成验证码(6位随机数)
    const code = sms_util.randomCode(6);
    //发送给指定的手机号
    console.log(`向${phone}发送验证码短信: ${code}`);
    sms_util.sendCode(phone, code, function (success) {//success表示是否成功
        if (success) {
            users[phone] = code
            console.log('保存验证码: ', phone, code)
            res.send({"code": 0})
        } else {
            //3. 返回响应数据
            res.send({"code": 1, msg: '短信验证码发送失败'})
        }
    })
})

/* 短信登陆 */
router.post('/login_sms', function (req, res, next) {
    const phone = req.body.phone;
    const code = req.body.code;
    console.log('/login_sms', phone, code);
    if (users[phone] !== code) {
        res.send({code: 1, msg: '手机号或验证码不正确'});
        return;
    }
    //删除保存的code
    delete users[phone];
    // 查找是否存在此手机号的用户
    UserModel.findOne({phone}, function (err, user) {
        if (user) { // 存在则返回改用户
            // 在session会话中保存用户id值，用于刷新登录
            req.session.userid = user._id
            res.send({code: 0, data: user})
        } else { // 不存在则创建用户并返回
            //存储数据
            UserModel.create({phone: phone}).then(user => {
                req.session.userid = user._id
                res.send({code: 0, data: user})
            })
            /*const userModel = new UserModel({phone: phone})
            userModel.save(function (err, user) {
                req.session.userid = user._id
                res.send({code: 0, data: user})
            })*/
        }
    })

})

/* 根据session会话中的userid, 查询对应的user, 用于刷新后登录 */
router.get('/userinfo', function (req, res) {
    // 取出userid
    const userid = req.session.userid
    // 查询时过滤掉密码
    const _filter = {'pwd': 0, '__v': 0}
    // 查询
    UserModel.findOne({_id: userid}, _filter, function (err, user) {
        // 如果没有, 返回错误提示
        if (!user) {
            // 清除浏览器保存的userid的cookie
            delete req.session.userid

            res.send({code: 1, msg: '请先登陆'})
        } else {
            // 如果有, 返回user
            res.send({code: 0, data: user})
        }
    })
})

/* 用户登出 */
router.get('/logout', function (req, res) {
    // 清除浏览器保存的userid的cookie
    delete req.session.userid
    // 返回数据
    res.send({code: 0})
})

/* 用户单向评价 */
router.get('/assess', function (req, res) {
    // 获取更新评价的索引位置
    const id = req.query.userId
    const index = req.query.index
    UserModel.findOne({_id: id}).then(user => {
        // 修改评价状态
        user.orders[index].status = 1
        // 更新
        UserModel.updateOne({_id: id}, user, () => {
            res.send({code: 0, msg: "更新成功"})
        })
    })
})

/* 修改用户信息 */
router.post('/updateInfo', function (req, res) {
    const id = req.body.id
    const name = req.body.name
    const phone = req.body.phone

    UserModel.findOne({_id: id}, function (err, user) {
        if (user) {
            user.name = name
            user.phone = phone
            UserModel.updateOne({_id: id}, user, (err, user) => { // 修改成功，查询修改后的数据
                console.log(user)
                UserModel.findOne({_id: id}).then(result => { // 查询成功
                    res.send({code: 0, data: {_id: result._id, name: result.name, phone: result.phone, orders: result.orders}})
                })
            })
        } else {
            res.send({code: 0, data: "修改失败"})
        }
    })
})

/* 修改用户密码 */
router.post('/updateUserPw', function (req, res) {
    // 传递过来的数据
    const id = req.body.id
    const oldPassword = req.body.oldPassword
    const newPassword = req.body.newPassword

    // 查询用户信息，对比密码
    UserModel.findOne({_id: id}, function (err, user) {
        // console.log(user)
        if (user.pwd === oldPassword) { // 密码吻合则修改面
            // 更新密码
            UserModel.updateOne({'_id': id}, {'pwd': newPassword}, (err, user) => {
                if (!err) {
                    // 清除浏览器会话中的id
                    delete req.session.userid
                    // 返回修改信息
                    res.send({code: 0, msg: "修改成功"} )
                } else {
                    res.send({code: 1, msg: "修改失败"})
                }
            })
        } else { // 密码不吻合，返回错误信息
            res.send({code: 1, msg: "旧密码错误"})
        }
    })
})
module.exports = router
