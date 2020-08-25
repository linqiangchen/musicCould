class Music {
    constructor() {
        this.init();
    }
    init() { //初始化数据
        this.music = document.querySelector(".music"); //audio标签
        this.music.volume = 0.5;
        this.host = 'http://eveal.cn:3003'
        this.$play = $('.c_play img'); //播放按钮
        this.musicId = []; //音乐id
        this.nextMusicId = [];
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
        this.type = '0';
        this.playPage = 0;
        this.order = $('.order');
        this.playOrder = 0;
        this.songName = $('.songName');
        this.isSearch = false;
        this.initSearch();
        this.prevId = '';
        this.curId = '';
        this.isList = false;

    }
    toggleActive(){
      let active =  [...$('tbody tr')].filter(item => $(item).attr('_id') == this.curId)
     if(active){
        $('tbody tr').removeClass('activeMusic')
         $(active).addClass('activeMusic')
     }
    }
    loadRight(id) { //加载歌曲海报
        $.ajax({
            type: 'get',
            url: `${this.host}/song/detail?ids=${id}`,
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
        $('.tit i').click(function () { //全屏
            requestFullScreen();
        })
        $('.update').click(function () {

            let _id = prompt('请输入歌单id(登录网页版网易云，然后点击我的音乐，输入地址栏最后的数字)');
            if(!_id.trim()){
                // alert('请输入id')
                return;
            }
            that.playListId = _id;
            $.ajax({
                type: 'get',
                url: `${that.host}/playlist/detail?id=${that.playListId}`,
                dataType: 'json',
                success: (data) => {
                    that.musicId = data.playlist.trackIds.slice(0, 200).map(item => item.id)
                    that.offsetLoadPage()
                    let pageLi = ''
                    for (let i = 0; i < that.musicId.length / 10; i++) {
                        pageLi += ` <li class="num"><a >${i+1}</a></li>`
                    }
                    that.offsetPage.html(`<li class="prevPage">
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
                    that.isId = true;
                    that.num = $('.num');
                    that.num.eq(0).addClass('myActive');
                    localStorage.setItem('playListId', _id);
                    $('.my').attr('_id', _id)
                },
                error: function () {
                    alert('无效id')
                }
            })
        })
        document.onscroll = function (e) { //计算控制条位置
            $('.bottomWrap').css('transform', `translateY(${document.documentElement.scrollTop}px)`)
        }
        $('tbody').on('click', 'tr', function () { //点击歌曲播放
            that.initBar() //初始化控制条
            that.isList = false;
            that.nextMusicId = [];
            $('.nextPlayUl').html('')
            that.Index = $(this).index('tbody tr') + (that.page - 1) * 10; //切换当前播放歌曲索引
            $('.musicImg').removeClass('ani')
            that.pauseMusic();
            that.toggleMusic()
        })
        $('tbody').on('click', '.add', function () { //点击歌曲播放
            that.nextMusicId.unshift({
                id: $(this).parent().attr('_id'),
                name: $(this).parent().find('.songName p').text()
            });
            that.isList = true;
            $('.nextPlayUl').append(`<li>${$(this).parent().find('.songName p').text()}</li>`)
            $(this).addClass('nextPlay')
            return false;
        })
        $('.hot').on('click', 'li', function (e) { //点击热搜搜索
            that.inpSearch.val($(this).attr('keyword'))
            that.isSearch = true;
            that.searchSong()
            return false;
        })
        that.inpSearch.focus(function () { //控制热搜隐藏于显示
            $('.hot').css('transition', '0.2s')
            $('.hot').css('height', '450px')
        })
        that.inpSearch.blur(function () { //控制热搜隐藏于显示
            $('.hot').css('transition', '0s')
            setTimeout(() => {
                $('.hot').css('height', '0')
            }, 200)
        })
        $(document).keydown(function (e) { //空格播放与暂停歌曲
            if (e.keyCode === 32) {
                e.preventDefault()
                if (that.isPlay) {
                    that.pauseMusic()
                } else {
                    that.playMusic()
                }
            }
        })
        this.order.click(function () { //切换播放顺序
            that.playOrder++;
            that.playOrder %= 3;
            $(this).attr('src', `./image/${that.playOrder}.png`)
            if (that.playOrder == 1) {
                $(this).attr('title', `随机播放`)
            } else if(that.playOrder == 1) {
                $(this).attr('title', `顺序播放`)
            }else{
                $(this).attr('title', `顺序播放`)
            }
        })
        this.offsetPage.on('click', '.num', function () { //点击页数跳转列表
            that.page = $(this).index('.num') + 1;
            that.offsetLoadPage();
        
        })
        this.offsetPage.on('click', '.prevPage', function () { //分页--上一页
            that.page -= 1;
            if (that.page <= 0) {
                that.page = that.num.length
            }
            that.offsetLoadPage();
          
        })
        this.offsetPage.on('click', '.nextPage', function () { //分页--下一页
            that.page += 1;
            if (that.page > that.num.length) {
                that.page = 1
            }
            that.offsetLoadPage();
            
        })
        this.$play.click(() => { //播放与暂停
            if (this.isPlay) {
                this.pauseMusic()
            } else {
                this.playMusic()
            }
        });
        $('.tit .ply').click(function (e) { //切换歌单
            that.page = 1;
            that.type = $(this).attr('_id');
            that.playListId = $(this).attr('_id');
            that.isSearch = false
            that.loadPlayList();
            $('.tit span').removeClass('playlist')
            $(this).addClass('playlist')
        })
        this.next.click(function () { //下一首
            $('.musicImg').removeClass('ani')
            if (!that.isList) {
                if (that.Index === that.musicId.length - 1) {
                    return;
                }
                that.initBar() //初始化控制条
                if (that.playOrder) {
                    that.randomMusic()
                } else {
                    that.Index++;
                }
                if (that.Index % 10 === 0) {
                    that.page++;
                    that.offsetLoadPage() //切换播放歌曲
                }

                if (that.Index > that.musicId.length) {
                    that.Index = 0
                }
                that.toggleMusic() //切换播放歌曲
            } else {
                that.Index = that.nextMusicId.length - 1;
                that.toggleMusic()
                $('.nextPlayUl li:first-child').remove()
            }

        })
        this.prev.click(function () { //下一首
            $('.musicImg').removeClass('ani')
            if (that.Index === 0) {
                return
            }
            that.initBar() //初始化控制条
            that.Index--;
            if (that.Index % 9 === 0 && that.Index != 0) {
                that.page--;
                that.offsetLoadPage() //切换播放歌曲
            }

            if (that.Index < 0) {
                that.Index = that.musicId.length - 1
            }
            that.toggleMusic() //切换播放歌曲
        })
        this.music.onended = function () { //播放结束播放下一首
            $('.musicImg').removeClass('ani')
            that.initBar() //初始化控制条
            console.log(that.playOrder)
            if (that.nextMusicId.length === 0) {
                if (that.playOrder == 1) {
                    that.randomMusic()
                } else if(that.playOrder == 0) {
                    that.Index++;
                } 
                if (that.Index > that.musicId.length) {
                    that.Index = 0
                }
                if (that.Index % 10 === 0) {
                    that.page++;
                    that.offsetLoadPage(); //切换播放歌曲
                }

                that.toggleMusic() //切换播放歌曲
            } else {

                that.Index = that.nextMusicId.length - 1;
                that.toggleMusic()
                $('.nextPlayUl li:first-child').remove()

            }

        }
        this.bar.click(function (e) { //点击进度条快进
            if (!that.isPlay) { //判断播放状态
                return;
            }
            clearInterval(that.timer) //清除定时器
            that.timeBal.width(e.offsetX); //设置进度条宽度
            that.moveBar() //开启进度条运动
            that.music.currentTime = e.offsetX * that.dt / 900000;
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
        $('.volume').click(function (e) { //控制音量  
            that.music.volume = e.offsetX / 100
            $('.ball').width(e.offsetX + 'px');
        })
        this.inpSearch.keyup(function (e) { //回车搜索歌曲
            if (e.keyCode === 13 && that.inpSearch.val().trim()) {
                that.isSearch = true;
                that.searchSong();
            }
        })
        this.search.click(function () { //搜索歌曲
            if (!that.inpSearch.val().trim()) {
                that.inpSearch.val(that.inpSearch.attr('default'))
            }
            that.isSearch = true;
            that.searchSong();
        })
    }
    initBar() { //初始化进度条
        clearInterval(this.timer);
        this.timeBal.width(0);
        this.curTime = 0;
        this.startTime.text(this.min(this.curTime * 1000));
    }
    toggleLyric() { //切换歌词
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
                this.currLyric = 0;
            }
        }
    }
    searchSong() { //搜索歌曲
        $.ajax({
            type: 'get',
            url: ` ${this.host}/search?keywords=${this.inpSearch.val()}&limit=100&type=1`,
            dataType: 'json',
            success: (data) => {
                let res = data.result.songs;
                let div = ''
                this.page = 1;
                this.Index = 0;
                this.musicId = res.map(item => item.id)
                this.offsetLoadPage()
                let pageLi = ''
                for (let i = 0; i < res.length / 10; i++) {
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
                $('tbody').html(div);
                this.num = $('.num')
                this.num.eq(0).addClass('myActive');
            }
        })
    }
    moveBar() { //控制进度条
        clearInterval(this.timer);
        this.timer = setInterval(() => {
            let _width = this.timeBal.width();
            this.curTime++;
            // 歌词滚动
            this.toggleLyric()
            this.startTime.text(this.min(this.curTime * 1000))
            _width += 900000 / this.dt
            if (_width >= 900) {
                _width = 900
                clearInterval(this.timer);
                this.timeBal.css('width', 0 + 'px');
                this.currLyric = 0;
            }
            this.timeBal.css('width', _width + 'px');
        }, 1000)
    }
    toggleMusic() { //切换播放歌曲
        let id = ''
        if (this.isList) {
            id = this.nextMusicId[this.Index].id;
            this.nextMusicId.pop();
            if(this.nextMusicId.length === 0){
                this.isList = false
            } 
        } else {
            id = this.musicId[this.Index]
        }
        this.loadMusic(id);
        this.loadSongs(id);
        this.loadLyric(id);
        this.loadComment(id);
        this.lyric = "";
        $('.show_lyric').text('')
        this.currLyric = 0;
        this.prevLyric = 0;
        this.playPage = this.page;

    }
    loadCor(id, dt) { //加载进度条
        $.ajax({
            type: 'get',
            url: `${this.host}/song/url?id=${id}`,
            dataType: 'json',
            success: (data) => {
                $(this.music).attr('src', data.data[0].url);
                this.endTime.text(this.min(dt));
                this.dt = dt
            }
        })
    }
    randomMusic() { //随机歌曲索引
        this.Index = parseInt(Math.random() * (this.musicId.length));
    }
    loadMusic(id) { //加载歌曲
        $.ajax({
            type: 'get',
            url: `${this.host}/song/url?id=${id}`,
            dataType: 'json',
            success: (data) => {
            // let active =  [...$('tbody tr')].filter(item.attr('_id') == this.prevId);
            // console.log(active)
                if (!data.data[0].url) {
                    this.Index += 1;
                    this.toggleMusic();
                    return;
                } else {
                    $(this.music).attr('src', data.data[0].url);
                    this.curId = id;
                    this.toggleActive()
                    setTimeout(() => {
                        this.playMusic();
                    }, 150)
                }
            }
        })
    }
    loadComment(id) { //加载热评
        $.ajax({
            type: 'get',
            url: `${this.host}/comment/hot?id=${id}&type=0`,
            dataType: 'json',
            success: (data) => {
                let res = data.hotComments;
                let li = '';
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
                $('.left .comment').html(li);
            }
        })
    }
    loadNextPlay() {
        let li = ''
        this.nextMusicId.forEach(item => {
            li += `<li>${item.name}</li>`
        })
        $('.nextPlayUl').html(li)
    }
    loadSongs(id) { //加载歌曲信息
        $.ajax({
            type: 'get',
            url: `${this.host}/song/detail?ids=${id}`,
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
        // this.playListId = 523519208
        let Index = localStorage.getItem('playListId');
        this.playListId = Index || 523519208;

        $.ajax({
            type: 'get',
            url: `${this.host}/playlist/detail?id=${this.playListId}`,
            dataType: 'json',
            success: (data) => {
                this.musicId = data.playlist.trackIds.slice(0, 200).map(item => item.id)
                this.offsetLoadPage()
                let pageLi = ''
                for (let i = 0; i < this.musicId.length / 10; i++) {
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
                this.num.eq(0).addClass('myActive');
                if (localStorage.getItem('musicId')) {
                    this.updateTable(localStorage.getItem('musicId'), localStorage.getItem('dt'));
                } else {
                    this.updateTable(data.playlist.tracks[0].id, data.playlist.tracks[0].dt);
                }

            }
        })
    }
    offsetLoadPage() {
        let arrId = this.musicId.slice((this.page - 1) * 10, this.page * 10).join(',');
        $.ajax({
            type: 'get',
            url: `${this.host}/song/detail?ids=${arrId}`,
            dataType: 'json',
            success: (data) => {
                let res = data.songs;
                let div = '';
                res.forEach((item, index) => {
                    div += `<tr _id=${item.id}>
                        <td class="table-1">${(this.page - 1)*10+index+1}</td>
                        <td class="songName table-2"><p>${item.name}</p></td>
                    <td class="table-3">${this.min(item.dt)}</td>
                    <td class="table-4">${item.ar[0].name}</td>
                    <td class="add table-5"><img src="./image/add.png" alt=""></td>
                </tr>`
                })
                $('tbody').html(div);
                this.toggleActive()
                this.num.removeClass('myActive')
                this.num.eq(this.page - 1).addClass('myActive');
            }
        })
    }
    loadPlayList(id) { //加载歌单
        $.ajax({
            type: 'get',
            url: `${this.host}/playlist/detail?id=${this.playListId}`,
            dataType: 'json',
            success: (data) => {
                this.musicId = data.playlist.trackIds.slice(0, 200).map(item => item.id)
                this.offsetLoadPage()
                let pageLi = ''
                for (let i = 0; i < this.musicId.length / 10; i++) {
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
                this.isId = true;
                this.num = $('.num');
                this.num.eq(0).addClass('myActive');

            },
            error: function () {
                alert('无效id')
            }
        })
    }
    loadLyric(id) { //加载歌词
        let that = this;
        $.ajax({
            type: 'get',
            url: `${this.host}/lyric?id=${id}`,
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
    updateTable(id, dt) { //更新歌单
        this.loadLyric(id);
        this.loadComment(id)
        this.loadRight(id)
        this.loadCor(id, dt)
        this.bindEvent()
    }
    add(str) { //补零
        return str < 10 ? ('0' + str) : str
    }
    min(s) { //毫秒转换为分秒
        s = parseInt(s)
        let mins = this.add(parseInt(s / 60000))
        let _s = this.add(parseInt((s % 60000) / 1000))
        return mins + ':' + _s
    }
    toggleDate(time) { //加载评论时间
        let date = new Date(time)
        let year = date.getFullYear();
        let mouth = this.add(date.getMonth() + 1);
        let day = this.add(date.getDate())
        return year + '年' + mouth + '月' + day + '日'
    }
    playMusic() { //播放歌曲
        this.music.play();
        this.isPlay = true;
        this.prevId = this.musicId[this.Index];
        localStorage.setItem('musicId', this.prevId)
        localStorage.setItem('dt', this.dt)
        // localStorage.getItem('musicId')
        // 
        $('.musicImg').addClass('ani')
        $('.musicImg span').css({
            'animation-play-state': 'running'
       })
        this.musicImg.css({
            'animation-play-state': 'running'
       })
        this.$play.attr('src', './image/暂停.png');
        this.moveBar()
    }
    pauseMusic() { //暂停歌曲
        this.music.pause();
        this.isPlay = false;
        // this.musicImg.removeClass('ani')
        $('.musicImg span').css({
            'animation-play-state': 'paused'
       })
        this.musicImg.css({
             'animation-play-state': 'paused'
        })
        this.$play.attr('src', './image/播放.png')
        clearInterval(this.timer)
    }
    initSearch() { //初始化搜索框数据
        $.ajax({
            type: 'get',
            url: `${this.host}/search/default`,
            dataType: 'json',
            success: (data) => {
                this.inpSearch.attr('placeholder', data.data.showKeyword);
                this.inpSearch.attr('default', data.data.realkeyword);
            }
        });
        $.ajax({
            type: 'get',
            url: `${this.host}/search/hot/detail`,
            dataType: 'json',
            success: (data) => {
                let li = '';
                data.data.slice(0, 15).forEach(item => {
                    li += `<li keyword=${item.searchWord}>${item.searchWord}<span>${item.content}</span></li>`
                })
                $('.hot').html(li)
            }
        })
        setInterval(() => {
            $.ajax({
                type: 'get',
                url: `${this.host}/search/default`,
                dataType: 'json',
                success: (data) => {
                    this.inpSearch.attr('placeholder', data.data.showKeyword);
                    this.inpSearch.attr('default', data.data.realkeyword);
                }
            });
        }, 120000)
    }
    //历史播放
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