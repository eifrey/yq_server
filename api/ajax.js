const axios = require("axios")

// 定义ajax请求函数
function ajax (url='', data={}, type='GET') {

    return new Promise(function (resolve, reject) {
        let promise
        // get请求
        if (type === 'GET') {
            let dataStr = ''
            // 处理参数
            Object.keys(data).forEach(key => {
                dataStr = key + '=' + data[key] + '&'
            })
            if (dataStr !== '') {
                dataStr = dataStr.substring(0, dataStr.lastIndexOf('&'))
                url = url + '?' + dataStr
            }
            // 发送get请求
            promise = axios.get(url)
        }else {
            // 发送post请求
            promise = axios.post(url, data)
        }

        promise.then(response => {
            // 成功则返回数据
            resolve(response.data)
        }).catch(err => {
            // 失败返回错误
            reject(err)
        })
    })
}

// 向外暴露ajax函数
module.exports = ajax
