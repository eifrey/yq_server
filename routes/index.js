const express = require("express")
const ajax = require('../api/ajax.js')

// 引入商家数据库
const BusinessModel = require("../mongodb/db/business.js")
// 引入分类数据库
const CategoryModel = require("../mongodb/db/category.js")
// 创建路由
const router = express.Router()

/* 根据经纬度获取位置详情 */
router.get('/position/:geohash', function (req, res) {
    const {geohash} = req.params
    ajax(`http://cangdu.org:8001/v2/pois/${geohash}`)
        .then(data => {
            res.send({code: 0, data})
        })
})

/* 获取首页分类列表 */
router.get('/category', function (req, res) {
    CategoryModel.find().then(result => {
        res.send({code: 0, data: result})
    }).catch(err => {
        res.send({code: 1, data: err})
    })
})

/* 根据经纬度获取商铺列表 */
router.get('/shops', function (req, res) {
    // 获取传递过来的经纬度
    const latitude = req.query.latitude
    const longitude = req.query.longitude
    // 根据经纬度查询
    BusinessModel.find({latitude: latitude, longitude: longitude}).then(result => {
        res.send({code: 0, data: result})
    }).catch(err => {
        res.send({code: 1, data: err})
    })
})

/* 查询商铺 */
router.get('/search_shops', function (req, res) {
    const { keyword } = req.query
    // 根据传过来的数据过滤数据库中的数据返回
    // 定义模糊查询条件
    var _filter = {
        $or: [ // 多字段同时匹配
            {name: {$regex: keyword}},
            {category: {$regex: keyword}}
        ]
    }
    BusinessModel.find(_filter).then(result => {
        // console.log(result)
        // 成功返回数据
        res.send({code: 0, data: result})
    }).catch(err => {
        // 失败
        res.send({code: 1, data: []})
    })
})

module.exports = router
