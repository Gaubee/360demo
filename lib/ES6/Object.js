if(Object.keys){
	Object.keys = function keys (obj) {
		var res = [];
		var len = 0;
		for(var _k in obj){
			if (obj.hasOwnProperty(_k)) {
				res[len++] = _k
			}
		}
		return res;
	}
}