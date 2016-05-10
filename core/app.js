/*
 * 全局配置变量
 */
require(["jQuery", "jSouper"], function() {
    `${

var imports = [
    "../lib/ES6/String.js",
    "../lib/Cookies.js",
    "../lib/QueryString.js",
    "../lib/eventManager.js",
    "../lib/jquery.notify.js",
    "../lib/dataFormat_coAjax_serverNotify.js",
    "../lib/alert_confirm_loader.js",
    "../lib/jSouperHandle/common.js",
    "../lib/jSouperHandle/documentTitle.js",
    "../lib/jSouperHandle/number.js",
    "../lib/jSouperHandle/time.js",
    "../lib/jSouperHandle/useCss.js",
    "../lib/Path.js",
    // "js/lib/WX.js"
];
return IMPORT(imports); 

}`
    /*
     * 加载核心依赖
     * 应用程序启动
     */
    require(["r_css!/template/xmp.less?compile_to=.css"]);

    function initAppConfig(config) {
        App.set("App")
    }
    require(["r_text!/template/xmp.html", "/template/xmp.js"], function(xmp_html) {
        jSouper.parse(xmp_html);
        jSouper.ready(function() {
            //初始化应用程序
            jSouper.app({
                Id: "jSouperApp",
                Data: {}
            });

            var appNode = document.getElementById("jSouperApp");
            appNode.style.display = "block"; //显示App

            // //初始化路由
            // Path.initDefaultOnload();
            Path.registerjSouperRoute("*", function(loc) {
                var pathname = this.params[0];
                var door_root = jSouper.$.lst(pathname, "/");
                if (door_root !== "") { // 遇到/*/...的情况，将路由的控制权交给其它@door
                    Path.renderDoor(door_root, {
                        tel: "main"
                    });
                } else { //和@door同级的文件
                    return ({
                        stop_emit: true, //因为是2级路由，事件已经出发过了，阻止事件再次捕获触发
                        href: loc.href,
                        html: "/app-pages/html/",
                        js: "/app-pages/js/",
                        css: "/app-pages/css/",
                        prefix: "/", //URL-pathname中无用的前缀部分，用来过滤href得出pagename
                        tel: "main", //渲染到main节点上
                        default: "index", //默认使用index.html
                        pagename_handler: function(pagename) { //过滤出来的pagename在这里处理·二次处理pagename
                            //过滤掉后缀
                            return jSouper.$.lst(pagename, ".") || pagename;
                        },
                        index: 0,
                        vm: App
                    });
                }
            });
            eventManager.emitAfter("AppReady");

            require(["http://" + location.hostname + ":4100/apis/all.json?jsonp=define"], function(appconfig) {
                window.public_api = appconfig;
            });
        });
    });
});

// 时间日期格式化
window.Date.prototype.Format = function(fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "D+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(Y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};