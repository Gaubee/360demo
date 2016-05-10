```html
{{#teleporter "main"}}
<script type="text/vm" >
```
```js
	function(vm){
		var _pathname = "__pathname__".replace("/app-pages/html","").replace(/\/+/,"/");
		var _pathname_root =  jSouper.$.lst(_pathname, "/")+"/"
		Path.registerjSouperRoute(_pathname_root+"*", function(loc) {
			var pathname = this.params[0];
			var door_root = jSouper.$.lst(pathname, "/");
			if (door_root) {// !=="" && !== false  /*/的情况
				Path.renderDoor(_pathname_root, {
					tel: "`main"
				});
			} else { //和@door同级的文件
				return ({
					stop_emit: true, //子路由触发的时候，阻止这个事件再次被捕获触发
					href: loc.href,
					html: "/app-pages/html"+_pathname_root,
					js: "/app-pages/js"+_pathname_root,
					css: "/app-pages/css"+_pathname_root,
					prefix: _pathname_root, //URL-pathname中无用的前缀部分，用来过滤href得出pagename
					tel: "main", //渲染到main节点上
					default: "index", //默认使用index.html
					pagename_handler: function(pagename) { //过滤出来的pagename在这里处理·二次处理pagename
						//过滤掉后缀
						return jSouper.$.lst(pagename, ".") || pagename;
					},
					vm: vm
				});
			}
		});
	}
```
```html
</script>
```

