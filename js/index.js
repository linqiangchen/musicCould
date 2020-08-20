class Music {
    constructor() {
        this.init();
    }
    init() {
        this.music = document.querySelector(".music"); //audio标签
        this.$play = $('.c_play img'); //播放按钮
        this.musicId = []; //音乐id
        this.isPlay = false //播放状态
        this.Index = 0; //当前播放歌曲
        this.timer = 0; //计时器
        this.inpSearch = $('.search input') //输入框
        this.search = $('.btn'); //搜索按钮
        this.curTime = 0; //当前歌曲时间
        this.startTime = $('.time_') //音乐初始时间
        this.musicImg = $('.songs-img'); //歌曲海报
        this.loadList(), //加载歌曲列表
        this.endTime = $('.time'); //歌曲结束时间
        this.timeBal = $('.play_time'); //歌曲播放进度条
        this.bar = $('.bar'); //进度条父元素
        this.dt = 0; //歌曲总时长
        this.prev = $('.prev'); //上一曲
        this.next = $('.next'); //下一曲
        this.lyric = ""; //歌词
        this.currLyric = 0; //当前歌词
        this.prevLyric = 0; //上一条歌词
        this.page = 1; //当前页数
        this.num = "" //分页数量
        this.offsetPage = $('.pagination');
        this.type = 0;
        this.playPage = 0;
        this.order = $('.order');
        this.playOrder = 0;
        this.songName = $('.songName')
    }
    toggleActive() { //切换播放歌曲列表样式
        $('tbody tr').removeClass('activeM');
        $('tbody tr').eq(this.Index % 10).addClass('activeM')
    }
    loadRight(id) { //加载歌曲海报
        $.ajax({
            type: 'get',
            url: `https://api.imjad.cn/cloudmusic/?type=detail&id=${id}`,
            dataType: 'json',
            success: (data) => {
                if (!data.songs[0] || !data.songs[0].al.picUrl) {
                    return;
                }
                this.musicImg.attr('src', data.songs[0].al.picUrl);
                this.songName.text(data.songs[0].name);
            }
        })
    }
    bindEvent() { //绑定事件
        let that = this;
        $('.tit i').click(function () {
            requestFullScreen(); //全屏
        })
        $('tbody').on('click', 'tr', function () {
            that.initBar() //初始化控制条
            that.Index = $(this).index('tbody tr') + (that.page - 1) * 10; //切换当前播放歌曲索引
            that.pauseMusic()
            that.toggleActive()
            that.toggleMusic()
        })
        $(document).keydown(function(e){
            e.preventDefault()
            if(e.keyCode === 32){
                console.log(that.isPlay)
                if(that.isPlay) {
                    that.pauseMusic()
                }else{
                    that.playMusic()
                }
                
            }
           
        })
        this.order.click(function(){
            that.playOrder ++;
            that.playOrder %=2;
            $(this).attr('src',`./image/${that.playOrder}.png`)
            if(that.playOrder){
                $(this).attr('title',`随机播放`)
            }else{
                $(this).attr('title',`顺序播放`)
            }
        })
        this.offsetPage.on('click', '.num', function () {
            that.page = $(this).index('.num') + 1;
            that.loadListByPage();
        })
        this.offsetPage.on('click', '.prevPage', function () {
            that.page -= 1;
            if (that.page <= 0) {
                that.page = that.num.length
            }
            that.loadListByPage()
        })
        this.offsetPage.on('click', '.nextPage', function () {
            that.page += 1;
            if (that.page > that.num.length) {
                that.page = 1
            }
            that.loadListByPage()
        })
        this.$play.click(() => { //播放与暂停
            if (this.isPlay) {
                this.pauseMusic()
            } else {
                this.playMusic()
            }
        });
        $('.tit span').click(function (e) {
            that.page = 1;
            that.type = $(this).attr('_id')
            that.loadListByPage()
            
            $('.tit span').removeClass('playlist')
            $(this).addClass('playlist')

        })
        this.next.click(function () { //下一首
            if (that.Index === that.musicId - 1) {
                return
            }
            that.initBar() //初始化控制条
            if(that.playOrder){
                that.randomMusic()
            }else{
                 that.Index++;
            } 
            if (that.Index % 10 === 0) {
                that.page++;
                that.loadListByPage() //切换播放歌曲
            }
            that.toggleActive()
            if (that.Index > that.musicId.length) {
                that.Index = 0
            }

            that.toggleMusic() //切换播放歌曲
        })
        this.prev.click(function () { //下一首
            if (that.Index === 0) {
                return
            }
            that.initBar() //初始化控制条
            that.Index--;
            if (that.Index % 9 === 0 && that.Index !=0) {
                that.page--;
                that.loadListByPage() //切换播放歌曲
            }
            that.toggleActive()
            if (that.Index < 0) {
                that.Index = that.musicId.length - 1
            }

            that.toggleMusic() //切换播放歌曲
        })
        this.music.onended = function () { //播放结束播放下一首
            that.initBar() //初始化控制条
            if(that.playOrder){
                that.randomMusic()
            }else{
                 that.Index++;
            }  
            if (that.Index > that.musicId.length) {
                that.Index = 0
            }

            if (that.Index % 10 === 0) {
                that.page++;
                that.loadListByPage() //切换播放歌曲
            }
            that.toggleActive()
            that.toggleMusic() //切换播放歌曲

        }
        this.bar.click(function (e) { //点击进度条快进
            if (!that.isPlay) { //判断播放状态
                return;
            }
            clearInterval(that.timer) //清除定时器
            that.timeBal.width(e.offsetX); //设置进度条宽度
            that.moveBar() //开启进度条运动
            that.music.currentTime = e.offsetX * that.dt / 1000000;
            that.curTime = that.music.currentTime; //更新播放时间
            for (let i = 0, n = that.lyric.length; i < n; i++) {
                if (that.lyric.eq(i).attr('t') >= that.curTime * 1000) {
                    that.currLyric = i;
                    that.lyric.eq(that.currLyric).addClass('lyricActive');

                    if (that.currLyric) {
                        that.lyric.eq(that.prevLyric).removeClass('lyricActive');
                    }
                    that.prevLyric = that.currLyric;
                    break;
                }
            };
            that.startTime.text(that.min(that.curTime * 1000)) //更新播放时间
        });
        this.inpSearch.keyup(function (e) {
            if (e.keyCode === 13 && that.inpSearch.val().trim()) {
                $.ajax({
                    type: 'get',
                    url: `/api/search/pc?s=${that.inpSearch.val()}&limit=20&type=1`,
                    dataType: 'json',
                    success: (data) => {
                        $('nav').css('display', 'none')
                        let res = data.result.songs
                        let div = ''
                        that.page = 1;
                        that.Index = 0;
                        that.musicId = res.map(item => item.id)
                        res.forEach((item, index) => {

                            div += `<tr _id=${item.id}>
                                <td>${index+1}</td>
                                <td>${item.name}</td>
                            <td>${that.min(item.duration)}</td>
                            <td>${item.artists[0].name}</td>
                        </tr>`
                        })
                        $('tbody').html(div)

                    }
                })
            }
        })
        this.search.click(function () { //搜索歌曲
            if (!that.inpSearch.val().trim()) {
                return;
            }
            $.ajax({
                type: 'get',
                url: `/api/search/pc?s=${that.inpSearch.val()}&limit=20&type=1`,
                dataType: 'json',
                success: (data) => {
                    $('nav').css('display', 'none')
                    let res = data.result.songs
                    let div = ''
                    that.page = 1;
                    that.Index = 0;
                    that.musicId = res.map(item => item.id)
                    res.forEach((item, index) => {
                        div += `<tr _id=${item.id}>
                            <td>${index+1}</td>
                            <td class="songName">${item.name}</td>
                        <td>${that.min(item.duration)}</td>
                        <td>${item.artists[0].name}</td>
                    </tr>`
                    })
                    $('tbody').html(div)

                }
            })
        })
    }
    initBar() { //初始化进度条
        clearInterval(this.timer);
        this.timeBal.width(0);
        this.curTime = 0;
        this.startTime.text(this.min(this.curTime * 1000));
    }
    toggleLyric() {
        if (this.lyric.length < 2) {
            return;
        }
        if (this.music.currentTime * 1000 >= (+this.lyric.eq(this.currLyric).attr('t')) && (this.lyric.length >= 1)) {
            this.lyric.eq(this.currLyric).addClass('lyricActive');
            $('.show_lyric').text(this.lyric.eq(this.currLyric).text())

            if (this.currLyric) {
                this.lyric.eq(this.prevLyric).removeClass('lyricActive');
            }
            this.prevLyric = this.currLyric;
            this.currLyric++;
            if (this.currLyric >= this.lyric) {
                this.currLyric = 0
            }
        }
    }
    moveBar() { //控制进度条
        clearInterval(this.timer);
        this.timer = setInterval(() => {
            let _width = this.timeBal.width();
            this.curTime++;
            // 歌词滚动
            this.toggleLyric()
            this.startTime.text(this.min(this.curTime * 1000))
            _width += 1000000 / this.dt
            if (_width >= 1000) {
                _width = 1000
                clearInterval(this.timer);
                this.timeBal.css('width', 0 + 'px');
                this.currLyric = 0;
            }
            this.timeBal.css('width', _width + 'px');
        }, 1000)
    }
    toggleMusic() { //切换播放歌曲
        this.loadMusic(this.musicId[this.Index]);
        this.loadSongs(this.musicId[this.Index]);
        this.loadLyric(this.musicId[this.Index]);
        this.loadComment(this.musicId[this.Index]);
        this.lyric = "";
        $('.show_lyric').text('')
        this.currLyric = 0;
        this.prevLyric = 0;
        this.playPage = this.page;
        this.toggleActive()
    }
    toggleList(id) {
        $.ajax({
            type: 'get',
            url: `https://api.imjad.cn/cloudmusic/?limit=20&type=playlist&id=${id}`,
            dataType: 'json',
            success: (data) => {
                let res = data.playlist.tracks
                let div = '';
                this.Index = 0;
                this.page = 1
                this.musicId = res.map(item => item.id)
                res.forEach((item, index) => {
                    div += `<tr _id=${item.id}>
                        <td>${index+1}</td>
                        <td class="songName"><p>${item.name}</p></td>
                    <td>${this.min(item.dt)}</td>
                    <td>${item.ar[0].name}</td>
                </tr>`
                })

                $('tbody').html(div);
                let that = this
                // 
            }
        })
    }
    loadCor(id, dt) { //加载进度条
        $.ajax({
            type: 'get',
            url: `https://api.imjad.cn/cloudmusic/?type=song&id=${id}`,
            dataType: 'json',
            success: (data) => {
                $(this.music).attr('src', data.data[0].url);
                this.endTime.text(this.min(dt));
                this.dt = dt
            }
        })
    }
    randomMusic(){
        this.Index = parseInt(Math.random()*(this.musicId.length));

    }
    loadMusic(id) {
        //加载歌曲

        $.ajax({
            type: 'get',
            url: `https://api.imjad.cn/cloudmusic/?type=song&id=${id}`,
            dataType: 'json',
            success: (data) => {

                if (!data.data[0].url) {

                    this.Index += 1
                    this.toggleMusic()
                    return
                } else {
                    $(this.music).attr('src', data.data[0].url);
                    setTimeout(() => {
                        this.playMusic()
                    }, 150)
                }

            }
        })
    }
    loadComment(id) { //加载热评
        $.ajax({
            type: 'get',
            url: `https://api.imjad.cn/cloudmusic/?type=comments&id=${id}`,
            dataType: 'json',
            success: (data) => {
                let res = data.hotComments;

                let li = ''
                res.forEach(item => {
                    li += ` <li>
                    <img src=${item.user.avatarUrl}  alt="">
                    <p>
                        <span>${item.user.nickname} </span>
                        ${item.content} 
                        <i>${this.toggleDate(item.time)}</i>
                    </p>
                    
                </li>`
                });
                $('.left .comment').html(li)
            }
        })
    }
    loadSongs(id) { //加载歌曲信息
        $.ajax({
            type: 'get',
            url: `https://api.imjad.cn/cloudmusic/?type=detail&id=${id}`,
            dataType: 'json',
            success: (data) => {
                
                this.musicImg.attr('src', data.songs[0].al.picUrl);
                this.songName.text(data.songs[0].name)
                this.musicImg.removeClass('ani')
                this.musicImg.addClass('ani')
                this.endTime.text(this.min(data.songs[0].dt))
                this.dt = data.songs[0].dt
            }
        })
    }
    loadList() { //加载歌曲列表
        let that = this
        $.ajax({
            type: 'get',
            url: '/songs?type=0',
            dataType: 'json',
            success: (data) => {
                let res = data.slice((this.page - 1) * 10, (this.page * 10));
                let pageLi = ''
                this.musicId = data.map(item => item.id)

                for (let i = 0; i < data.length / 10; i++) {
                    pageLi += ` <li class="num"><a >${i+1}</a></li>`
                }
                this.offsetPage.html(`<li class="prevPage">
                <a aria-label="Previous">
                  <span aria-hidden="true">&laquo;</span>
                </a>
              </li>
            ${pageLi}
     
              <li class="nextPage"> 
                <a  aria-label="Next">
                  <span aria-hidden="true">&raquo;</span>
                </a>
              </li>`)
                this.num = $('.num')
                this.num.eq(0).addClass('myActive')
                this.updateTable(res);

            }
        })
    }
    loadListByPage() {
        $.ajax({
            type: 'get',
            url: '/songs?type=' + this.type,
            dataType: 'json',
            success: (data) => {
                
                let res = data.slice((this.page - 1) * 10, (this.page * 10))
                let div = ''
                this.musicId = data.map(item => item.id)
                res.forEach((item, index) => {
                    div += `<tr _id=${item.id}>
                        <td>${(this.page - 1)*10+index+1}</td>
                        <td class="songName"><p>${item.name}</p></td>
                    <td>${this.min(item.duration)}</td>
                    <td>${item.artists[0].name}</td>
                </tr>`
                })
                let pageLi = ''
                for (let i = 0; i < data.length / 10; i++) {
                    pageLi += ` <li class="num"><a >${i+1}</a></li>`
                }
                this.offsetPage.html(`<li class="prevPage">
                <a aria-label="Previous">
                  <span aria-hidden="true">&laquo;</span>
                </a>
              </li>
            ${pageLi}
     
              <li class="nextPage"> 
                <a  aria-label="Next">
                  <span aria-hidden="true">&raquo;</span>
                </a>
              </li>`)
                this.num = $('.num')
                this.num.eq(0).addClass('myActive')
                $('tbody').html(div);
                let that = this
                this.num.removeClass('myActive')
                this.num.eq(this.page - 1).addClass('myActive');
                if(this.page === this.playPage){
                     this.toggleActive()
                }
               
            }
        })
    }
    loadLyric(id) { //加载歌词
        let that = this;
        $.ajax({
            type: 'get',
            url: `https://api.imjad.cn/cloudmusic/?type=lyric&id=${id}`,
            dataType: 'json',
            success: (data) => {

                if (!data.lrc || !data.lrc.lyric) {
                    $('.right ul').html('<li>暂无歌词</li>');
                    return;
                }
                let lic = data.lrc.lyric;
                let res = createLrcObj(lic).ms;
                let li = ''
                res.forEach(item => {
                    if (item.c !== '(2X)') {
                        li += `<li t=${(item.t*1000)}>${item.c}</li>`
                    }
                })
                $('.right ul').html(li);
                this.lyric = $('.right ul li');
                this.lyric.click(function () {
                    if (!that.isPlay) {
                        return;
                    }
                    if (that.lyric.length <= 1) {
                        return;
                    }
                    let curTime = parseInt($(this).attr('t') / 1000)
                    that.music.currentTime = curTime;
                    that.curTime = curTime
                    that.startTime.text(that.min(curTime * 1000))
                    that.timeBal.width(($(this).attr('t') * 1000) / that.dt);
                    that.currLyric = $(this).index('.right ul li');
                    that.lyric.eq(that.currLyric).addClass('lyricActive');
                    if (that.currLyric) {
                        that.lyric.eq(that.prevLyric).removeClass('lyricActive');
                    }
                    that.prevLyric = that.currLyric;
                    that.currLyric++;
                })
            }
        });
    }
    updateTable(res) {
        let div = '';
        res.forEach((item, index) => {
            div += `<tr _id=${item.id}>
                <td>${index+1}</td>
                <td class="songName"><p>${item.name}</p></td>
            <td>${this.min(item.duration)}</td>
            <td>${item.artists[0].name}</td>
        </tr>`
        })
        $('tbody').html(div)
        this.loadLyric(res[0].id);
        this.loadComment(res[0].id)
        this.loadRight(res[0].id)
        this.loadCor(res[0].id, res[0].duration)
        this.bindEvent()
    }
    add(str) {
        return str < 10 ? ('0' + str) : str
    }
    min(s) {
        s = parseInt(s)
        let mins = this.add(parseInt(s / 60000))
        let _s = this.add(parseInt((s % 60000) / 1000))
        return mins + ':' + _s
    }
    toggleDate(time) {
        let date = new Date(time)
        let year = date.getFullYear();
        let mouth = this.add(date.getMonth() + 1);
        let day = this.add(date.getDate())
        return year + '年' + mouth + '月' + day + '日'
    }
    playMusic() {
        this.music.play();
        this.isPlay = true;
        this.musicImg.addClass('ani')
        this.$play.attr('src', './image/暂停.png');
        this.moveBar()
    }
    pauseMusic() {
        this.music.pause();
        this.isPlay = false;
        this.musicImg.removeClass('ani')
        this.$play.attr('src', './image/播放.png')
        clearInterval(this.timer)
    }
}
let music = new Music()


function createLrcObj(lrc) {
    var oLRC = {
        ti: "", //歌曲名
        ar: "", //演唱者
        al: "", //专辑名
        by: "", //歌词制作人
        offset: 0, //时间补偿值，单位毫秒，用于调整歌词整体位置
        ms: [] //歌词数组{t:时间,c:歌词}
    };
    if (lrc.length == 0) return;
    var lrcs = lrc.split('\n'); //用回车拆分成数组
    for (var i in lrcs) { //遍历歌词数组
        lrcs[i] = lrcs[i].replace(/(^\s*)|(\s*$)/g, ""); //去除前后空格
        var t = lrcs[i].substring(lrcs[i].indexOf("[") + 1, lrcs[i].indexOf("]")); //取[]间的内容
        var s = t.split(":"); //分离:前后文字
        if (isNaN(parseInt(s[0]))) { //不是数值
            for (var i in oLRC) {
                if (i != "ms" && i == s[0].toLowerCase()) {
                    oLRC[i] = s[1];
                }
            }
        } else { //是数值
            var arr = lrcs[i].match(/\[(\d+:.+?)\]/g); //提取时间字段，可能有多个
            var start = 0;
            for (var k in arr) {
                start += arr[k].length; //计算歌词位置
            }
            var content = lrcs[i].substring(start); //获取歌词内容
            for (var k in arr) {
                var t = arr[k].substring(1, arr[k].length - 1); //取[]间的内容
                var s = t.split(":"); //分离:前后文字
                oLRC.ms.push({ //对象{t:时间,c:歌词}加入ms数组
                    t: (parseFloat(s[0]) * 60 + parseFloat(s[1])).toFixed(3),
                    c: content
                });
            }
        }
    }
    oLRC.ms.sort(function (a, b) { //按时间顺序排序
        return a.t - b.t;
    });
    return oLRC
}

function requestFullScreen() {
    var de = document.documentElement;
    if (de.requestFullscreen) {
        de.requestFullscreen();
    } else if (de.mozRequestFullScreen) {
        de.mozRequestFullScreen();
    } else if (de.webkitRequestFullScreen) {
        de.webkitRequestFullScreen();
    }
}