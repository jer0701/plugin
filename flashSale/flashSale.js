//限时抢购
function flashSale(config) {

    if (!(this instanceof flashSale)) {
        return new flashSale(config).init();
    }

    //配置
    config = $.extend(true, {}, flashSale.defaults, config);

    this.config = config;

};

//配置
flashSale.defaults = {

    //抢购父容器节点
    $box: null,

    //菜单jquery节点
    $menus: null,

    //内容jquery节点
    $cts: null,

    //选中时 抢购菜单节点样式
    menuActCls: "active",

    //选中时 抢购内容节点样式
    ctActCls: "active",

    //等待抢抢添加样式
    readyCls: "in-ready",

    //正在抢购天就样式
    saleCls: "in-sale",

    //抢购结束后添加样式
    endCls: "in-end",

    //当前日期
    nowDate: window.ServerTime || new Date(),

    //是否定时修改
    isTimeChange: true,

    //是否鼠标进入暂停定时修改
    mouseEnterUnChange: true,

    //选中当前选项回调函数
    setActiveFn: null,

    //所有未开始抢购回调函数
    allUnStartFn: null,

    //等待抢购回调函数
    readyFn: null,

    //开始抢购回调函数
    saleFn: null,

    //抢购结束回调函数
    endFn: null,

    //所有抢购结束回调函数
    allEndFn: null,

    //初始化后回调函数
    initFn:null

};


flashSale.prototype = {

    //初始化
    init: function () {

        var that = this;
        var config = that.config;
        var statusClsList = [];
        var items = [];
        var $menus = config.$menus;
        var $cts = config.$cts;

        for (var o in config) {
            if (!/Fn$/.test(o)) {
                that[o] = config[o];
            }
            
        }
     
        if (!$menus ||
            !$menus.length ||
            !$cts||
            !$cts.length) {
            console.log("menus or cts is empty.");
            return;
        }
       

        //状态状态列表
        statusList = [];

        //等待抢购
        statusList.push({
            status:0,
            cls: that.readyCls,
        })

        //正在抢购
        statusList.push({
            status: 1,
            cls: that.saleCls,
        })

        //抢购结束
        statusList.push({
            status: 2,
            cls: that.endCls,
        })
     
        $menus.each(function (i) {

            items.push({
                //索引
                index: i,

                //菜单元素
                $menu: $(this),

                //内容元素
                $ct: $cts.eq(i),

                //默认状态
                status: -1,

                //是否选中状态
                active:false

                
            });
        });

        //选项状态列表集合
        that.statusList = statusList;

        //选项初始对象集合
        that.items = items;

        //选项数量
        that.itemCount = items.length;

        //最后一个索引号
        that.lastIndex = items.length - 1;

        //当前进行的
        that.activeIndex = -1;

        //是否所有已经结束
        that.allEnd = false;

        //是否定时检测状态
        that.change = true;

        //等待抢购选项数量
        that.readyNum = 0;

        //正在抢购选项数量
        that.saleNum = 0;

        //已结束选项数量
        that.endNum = 0;

        //传入字符串 则 转为date对象
        if (typeof that.nowDate == "string") {
            that.nowDate = new Date(that.nowDate);
        }

        //绑定所有事件
        that.bindEvent();

        //初始化回调函数
        if (config.initFn) {
            config.initFn.call(this);
        }

        return this;
    },

    //设置服务器时间
    setServerTime: function (callBack) {
        var that = this;
        that.serverTimer = setInterval(function () {
            that.nowDate = new Date(that.nowDate.getTime() + 1000);
            callBack && callBack();
        }, 1000);
    },

    //选中选项
    setActive: function (index) {

        var that = this;
        var cf = that.config;
        var $menus = that.$menus;
        var $cts = that.$cts;
        var menuActCls = that.menuActCls;
        var ctActCls = that.ctActCls;
        var items = that.items;
        var item = items[index];

        that.activeIndex = index;

        $.each(items, function (i) {
            var $menu = this.$menu;
            var $ct = this.$ct;
            if (i == index) {
                this.active = true;
                $menu.addClass(that.menuActCls);
                $ct.addClass(that.ctActCls);
            } else {
                this.active = false;
                $menu.removeClass(that.menuActCls);
                $ct.removeClass(that.ctActCls);
            }
        });

        if (cf.setActiveFn) {
            cf.setActiveFn.call(this,item);
        }
    },

    //重置状态
    resetStatus: function () {

        var that = this;
        var items = that.items;
        $.each(items, function () {
            this.status = -1;
            this.active = false;
        });
    },

    //设置状态class
    setStatusCls: function (index, status) {

   
        var i = 0;
        var that = this;
        var cls, statusObj;
        var item = that.items[index];
        var statusList = that.statusList;
        var length = statusList.length;

        for (; i < length; i++) {

            statusObj = statusList[i];
            cls = statusObj.cls;

            if (status == statusObj.status) {
                item.$menu.addClass(cls);
                item.$ct.addClass(cls);
            } else {
                item.$menu.removeClass(cls);
                item.$ct.removeClass(cls);
            }
        }

    },

    //格式化日期
    formatDate: function (Date, format) {

        format = format || "yyyy-MM-dd HH:mm:ss";

        var o = {
            "yyyy": Date.getFullYear(),
            "MM": Date.getMonth() + 1, //month 
            "dd": Date.getDate(), //day 
            "HH": Date.getHours(), //hour 
            "mm": Date.getMinutes(), //minute 
            "ss": Date.getSeconds(), //second 
            "SS": Date.getMilliseconds() //millisecond 
        }
        for (var i in o) {
            if ((o[i] + "").length < 2) o[i] = "0" + o[i];
            format = format.replace(i, o[i]);
        }

        return format;
    },

    //绑定事件
    bindEvent: function () {

        var that = this;
 
        var $box = that.$box;
        that.timeChange();
      

        if (that.isTimeChange) {

            //that.change = false;

            that.setServerTime(function () {

                var d = that.formatDate(that.nowDate, "yyyy:MM:dd HH:mm:ss");

                if (that.allEnd) {
                    clearInterval(that.serverTimer);
                    return;
                }

                if (!that.change) return;

                that.timeChange();
              
            })

            if (that.mouseEnterUnChange) {

                var timer;

                $box.bind("mouseenter", function () {
                    that.change = false;

                    if (timer) {
                        clearTimeout(timer);
                    }
                    //定时10秒 不修改状态
                    timer = setTimeout(function () {
                        that.change = true;
                        that.resetStatus();


                    }, 1000 * 60);
                })

                $box.bind("mouseleave", function () {

                    that.change = true;
                    clearTimeout(timer);
                    that.resetStatus();
                    //that.timeChange();


                })
            }

        }
    

    },

    //定时修改
    timeChange: function () {

        var that = this;
        var readyNum = 0;
        var saleNum = 0;
        var endNum = 0;
        var $menus = that.$menus;
        var $cts = that.$cts;
        var items = that.items;
        var nowDate = that.nowDate;
        var nowTime  = nowDate.getTime();
   
        $menus.each(function (index) {

            var $that = $(this);
            var startStr = $that.data("start");
            var endStr = $that.data("end");

            if (!startStr || !endStr) return;

            var startDate = new Date(startStr);
            var endDate = new Date(endStr);
            var startMinDate = new Date(that.formatDate(startDate, "yyyy/MM/dd"));
            var startTime = startDate.getTime();
            var endTime = endDate.getTime();
            var startMinTime = startMinDate.getTime();
            var item = items[index];
            var status = item.status;
            var active = item.active;
           

            if (nowTime < startTime && status != 0) {
                readyNum += 1;
                that.readFn(index);
            }

            if (nowTime >= startMinTime && nowTime < endTime) {
               
                if (nowTime >= startTime && nowTime < endTime && status != 1) {

                    saleNum += 1;
                    that.saleFn(index);

                } else if (!item.active) {
                    that.setActive(index);
                }
        
            }

            if (nowTime >= endTime && status != 2) {

                endNum += 1;
                that.endFn(index);
            }

       

        });

        that.readyNum = readyNum;
        that.saleNum = saleNum;
        that.endNum = endNum;

        //所有未开始回调函数
        if (readyNum == that.itemCount) {

            that.allUnStartFn();
        }

        //所有结束回调函数
        if (endNum == that.itemCount) {
            that.allEndFn();
        }

    },

    //所有未开始执行函数
    allUnStartFn: function () {

        var that = this;
        var cf = that.config;

        //选中第一个选项
        that.setActive(0);

        if (cf.allUnStartFn) {
            cf.allUnStartFn.call(this);
        }
    },

    //所有都结束后执行函数
    allEndFn: function () {

        var that = this;
        var cf = that.config;

        //选中最后一个选项
        that.setActive(that.lastIndex);

        if (cf.allEndFn) {
            cf.allEndFn.call(this);
        }

        //所有已经结束
        that.allEnd = true;
    },

    //准备抢购执行函数
    readFn: function (index) {

        var that = this;
        var cf = that.config;
        var item = that.items[index];

        item.active = false;
        item.status = 0;
        that.setStatusCls(index, 0);

        if (cf.readyFn) {
            cf.readyFn.call(this, item);
        }
    },

    //正在抢购执行函数
    saleFn: function (index) {

        var that = this;
        var cf = that.config;
        var item = that.items[index];

        item.active = true;
        item.status = 1;
        that.setStatusCls(index, 1);
        that.setActive(index);

        if (cf.saleFn) {
            cf.saleFn.call(this, item);
        }
    },

    //结束执行函数
    endFn: function (index) {

        var that = this;
        var cf = that.config;
        var item = that.items[index];

        item.active = false;
        item.status = 2;
        that.setStatusCls(index, 2);

        if (cf.endFn) {
            cf.endFn.call(this, item);
        }    
    }



};
