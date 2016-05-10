(function() {
    var default_style_node;
    var style_id_map = {};
    window.buildSheet = function(style_id) {
        var doc = document;
        var head = doc.getElementsByTagName("head")[0];
        var styles = head.getElementsByTagName("style");
        if (doc.createStyleSheet) { //ie
            doc.createStyleSheet();
        } else {
            style = doc.createElement('style'); //w3c
            style.setAttribute("type", "text/css");
            head.insertBefore(style, null)
        }
        console.log("styles.length:" + styles.length);
        style = styles[styles.length - 1];
        style.setAttribute("media", "all");
        style_id && (style.id = style_id);
        return style;
    };
    window.addSheet = function(css, style_id) {
        if (!css) {
            return;
        }
        css += "\n"; //增加末尾的换行符，方便在firebug下的查看。

        var doc = document;
        var style;
        if (style_id) {
            style = style_id_map[style_id] || (style_id_map[style_id] = buildSheet(style_id));
        } else {
            style = default_style_node || (default_style_node = buildSheet());
        }

        if (style.styleSheet) { //ie
            style.styleSheet.cssText += css; //添加新的内部样式
        } else if (doc.getBoxObjectFor) {
            style.innerHTML += css; //火狐支持直接innerHTML添加样式表字串
        } else {
            style.appendChild(doc.createTextNode(css))
        }
        return {
            style: style,
            css: css
        };
    };
    window.removeSheet = function(css, style_id) {
        if (!css) {
            return;
        }
        css += "\n"; //增加末尾的换行符，方便在firebug下的查看。
        if (style_id) {
            style = style_id_map[style_id];
        } else {
            style = default_style_node
        }
        if (!style) {
            return {
                style: null,
                css: css
            }
        }

        if (style.styleSheet) { //ie
            style.styleSheet.cssText = style.styleSheet.cssText.replace(css, "");
        } else {
            style.innerHTML = style.innerHTML.replace(css, "");
        }
        return {
            style: style,
            css: css
        };
    };
}());
define(function() {
    if (typeof window == "undefined") return {
        load: function(n, r, load) {
            load()
        }
    };
    var cssAPI = {};
    cssAPI.pluginBuilder = "./css-builder";
    cssAPI.normalize = function(name, normalize) {
        var name_config = name.split(">STYLE_ID:");
        var style_id = name_config[1] || "";
        style_id = style_id && (">STYLE_ID:" + style_id);
        name = name_config[0];
        if (name.substr(name.length - 4) == ".css") name = name.substr(0, name.length - 4);
        if (name.substr(name.length - 5) == ".scss") name = name + "?compile_to=";
        return normalize(name + style_id)
    };
    cssAPI.load = function(cssId, req, load, config) {
        var cssId_config = cssId.split(">STYLE_ID:");
        cssId = cssId_config[0];
        var style_id = cssId_config[1];
        require(["r_text!" + cssId + ".css"], function(css_text) {
            // console.log(cssId, css_text.substr(0, 30));
            console.time("Parse CSS And addSheet[" + cssId + "]", cssId);
            css_text = "\n/*CSS-FILE-PATH:" + cssId + ":END-PATH*/\n" + cssAPI.middleware(css_text);
            addSheet(css_text, style_id);
            console.timeEnd("Parse CSS And addSheet[" + cssId + "]", cssId);
            load(css_text);
        }, load.error);
    };
    cssAPI.toRGBA = function(hex) {
        if (hex.indexOf("#") === 0) {
            hex = hex.substr(1);
        }
        var _r = hex.substring(0, 2);
        var _g = hex.substring(2, 4);
        var _b = hex.substring(4, 6);
        return parseInt(_r, 16) + "," + parseInt(_g, 16) + "," + parseInt(_b, 16)
    }
    cssAPI.middleware = function(css_text) {
        // var themeConfig = busInfo.config.theme || {};
        // var first_color = themeConfig.first_color || "#45b97c";
        // var second_color = themeConfig.second_color || "#fa6800";
        // var font_color = themeConfig.font_color || "#FFFFFF";
        // //主色
        // css_text = css_text.replace(/#aaabb1/ig, first_color);
        // css_text = css_text.replace(new RegExp(cssAPI.toRGBA("#aaabb1").replace(/\,/g,"[\\s]*,[\\s]*"), "ig"), cssAPI.toRGBA(first_color));
        // //辅助色
        // css_text = css_text.replace(/#aaabb2/ig, second_color);
        // css_text = css_text.replace(new RegExp(cssAPI.toRGBA("#aaabb2").replace(/\,/g,"[\\s]*,[\\s]*"), "ig"), cssAPI.toRGBA(second_color));
        // //字体色
        // css_text = css_text.replace(/#aaabb3/ig, font_color);
        // css_text = css_text.replace(new RegExp(cssAPI.toRGBA("#aaabb3").replace(/\,/g,"[\\s]*,[\\s]*"), "ig"), cssAPI.toRGBA(font_color));
        return css_text;
    };
    return cssAPI
});