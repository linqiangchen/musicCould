const express = require('express');
const {
    createProxyMiddleware
} = require('http-proxy-middleware');
const {
    songs,
    songs1,
    songs2,
    songs3,
    songs4,
    songs5
} = require('./js/data')
const cors = require('cors');
var app = express();
app.use(express.static('../music'))
app.all('*', function (req, res, next) {
    // 解决跨域
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Headers', 'Content-type');
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS,PATCH");
    res.header('Access-Control-Max-Age', 1728000); //预请求缓存20天
    next();
  });
app.get('/songs', (req, res) => {
    let type = +req.query.type;
    switch (type) {
        case 0:
            res.json(songs.result.tracks.slice(0,200));
            break;
        case 1:
            res.json(songs1.result.tracks);
            break;
        case 2:
            res.json(songs2.result.tracks);
            break;
        case 3:
            res.json(songs3.result.tracks);
            break;
        case 4:
            res.json(songs4.result.tracks);
            break;
            case 5:
            res.json(songs5.result.tracks);
            break;
        default:
            res.json({msg:'参数错误'});
            break;
    }
})

app.listen(3007, '0.0.0.0', function () { // 代理接口
    console.log('代理接口启动成功');
})