/**
 *用构造函数方法写上传图片插件
 */
function UploadImage(opt) {
	var _this = this;
	if (!opt._div || opt._div.length == 0) return;
	_this._div = opt._div;
	_this.existFile = opt.existFile || []; //编辑时在后台存在的图片路径，格式[{id: "" ,url: ""}],
	_this.fileCompressedSize = opt.fileCompressedSize || 0.3; //图片大小超过多少开始压缩
	_this.fileCompressedRate = opt.fileCompressedRate || 0.92; //图片压缩率
	_this.fileLimit = opt.fileLimit || 0; //文件上传个数限制，0表示不限制，默认不限制
	_this.title = opt.title || "批量传图";
	_this.width = opt.width; //上传文件框长度(从前端传过来的变量)
	_this.addFiles = []; //要传输到后台保存的图片
	_this.delPic = []; //编辑时删除的文件路径
	_this.existFileLen = opt.existFile.length;
	_this.id = (_this._div.getAttribute("id") || Math.random(0, 1) * 100) + "-upload-img-add-btn"; //用父div或随机数作为新增按钮前缀
	_this.init();
	Object.defineProperty(_this,"existFile",{
		get: function() {},
		set: function(newVal) {
			if(newVal instanceof Array||newVal.length > 0){//新数据必须是数组
				_this._div.innerHTML="";
				console.log(_this.existFile);
				_this.init();
			}
		}
	})
	
}
UploadImage.prototype = {
	constructor: UploadImage,
	init: function() {
		var _this = this;
		_this._div.classList.add("upload-img-box");
		var input = document.createElement("input");
		input.setAttribute("type", "file");
		input.setAttribute("multiple", "multiple");
		input.setAttribute("accept", "image/gif,image/jpeg,image/jpg,image/png,image/svg");
		var parent = document.createElement("div");
		if (!!_this.width && !isNaN(_this.width)) {
			parent.style.minWidth = _this.width + "px";
			parent.style.maxWidth = _this.width + "px";
		}
		parent.setAttribute("id", _this.id);
		parent.classList.add("upload-img-add-btn");
		var child = document.createElement("div");
		child.innerHTML = '<i class="fa fa-plus"></i><p>' + _this.title + '</p>';
		parent.appendChild(input);
		parent.appendChild(child);
		_this._div.appendChild(parent);
		console.log(_this.title);
		console.log(_this.existFile);
		
		if (_this.existFile.length >= _this.fileLimit && _this.fileLimit != 0) {
			document.getElementById(_this.id).style.display = "none";
		}
		for (var index in _this.existFile) {
			_this.addPic(_this.existFile[index].url, _this.existFile[index].url, _this.existFile[index].id)
		}
		input.onchange = function() {
			_this.changImage(this);
		}
	},
	//input的change事件
	changImage: function(that) {
		var _this = this;
		var fileOnloadIndex = 0;
		var chooseFile = []; //当前选中的文件。用于FileReader异步加载时读取文件信息
		var files = that.files;
		if ((_this.existFileLen + _this.addFiles.length + files.length) > _this.fileLimit && _this.fileLimit != 0) {
			_this.tips('文件不可以超过' + _this.fileLimit + "个");
		} else {
			if ((_this.existFileLen + _this.addFiles.length + files.length) == _this.fileLimit && _this.fileLimit != 0) {
				document.getElementById(_this.id).style.display = "none";
			}
			for (var index = 0; index < files.length; index++) {
				var file = files[index];
				if (!/image\/\w+/.test(file.type)) {
					files.splice(index, 1);
					continue;
				}
				chooseFile.push(file);
				//文件预览和压缩保存至数组中
				var reader = new FileReader();
				reader.readAsDataURL(file);
				reader.onload = function(e) {
					var mFile = chooseFile[fileOnloadIndex];
					var canvas = document.createElement('canvas');
					if (!canvas || !canvas.getContext || _this.fileCompressedSize * 1024 * 1024 >= mFile.size) {
						_this.addFiles.push(mFile);
					} else {
						var image = new Image();
						image.src = e.target.result;
						image.onload = function() {
							var context = canvas.getContext('2d');
							canvas.width = image.width;
							canvas.height = image.height;
							context.drawImage(image, 0, 0, image.width, image.height);
							_this.addFiles.push(_this.dataURLtoFile(canvas.toDataURL(mFile.type, _this.fileCompressedRate), mFile.name));
						}
					}
					_this.addPic(e.target.result, '', '');
					fileOnloadIndex += 1;
				}
			}
		}
		that.value = "";
	},
	//把文件添加到页面中，并绑定事件
	addPic: function(pic, url, id) {
		var _this = this;
		var div = document.createElement("div");
		if (!!_this.width && !isNaN(_this.width)) {
			div.style.minWidth = _this.width + "px";
			div.style.maxWidth = _this.width + "px";
		}
		if (url.length > 0) {
			var image = new Image();
			image.src = pic;
			div.setAttribute("class", "upload-img-prview");
			div.innerHTML = '<img src="' + pic +
				'" /><span class="upload-img-remove-btn" style="display:none"><i class="fa fa-remove"></i></span><input type="hidden" id="' +
				id + '" value="' + url + '">';
			image.onerror = function() {
				image.onerror = null;
				_this.children(div, "img")[0].src = "/Content/images/no-image.jpg";
			}

		} else {
			div.classList.add("upload-img-prview", "new-file");
			div.innerHTML = '<img src="' + pic +
				'" /><span class="upload-img-remove-btn" style="display:none"><i class="fa fa-remove"></i></span>';
		}
		_this._div.insertBefore(div, document.getElementById(_this.id));
		div.onmouseover = function() {
			_this.children(div, ".upload-img-remove-btn")[0].style.display = "";
		}
		div.onmouseout = function() {
			_this.children(div, ".upload-img-remove-btn")[0].style.display = "none";
		}
		_this.children(div, "img")[0].onclick = function() {
			var img = new Image();
			img.src = _this.children(div, "img")[0].src;
			if (img.complete) {
				var mDiv = document.createElement("div");
				mDiv.style.cssText =
					"position:absolute;top:0;left:0;z-index:100002;width:100vw;height:100vh;background:rgba(0,0,0,.4);padding:0;display:flex;align-items:center;";
				mDiv.innerHTML = '<img src="' + _this.children(div, "img")[0].src +
					'" style="max-width:60%;max-height:100%;margin:auto">';
				mDiv.onclick = function() {
					window.top.document.body.removeChild(mDiv);
				}
				_this.children(mDiv, "img")[0].onclick = function(event) {
					event.stopPropagation();
				}
				window.top.document.body.appendChild(mDiv);
			}
		}
		_this.children(div, ".upload-img-remove-btn")[0].onclick = function() {
			if (url.length > 0) {
				_this.delPic.push(url);
				_this.existFileLen--;
			} else {
				var divArr = _this.children(_this._div, ".new-file");
				var index = -1;
				for (var i = 0; i < divArr.length; i++) {
					if (divArr[i] === div) {
						index = i;
					}
				}
				_this.addFiles.splice(index, 1);
			}
			document.getElementById(_this.id).style.display = "";
			_this._div.removeChild(div);
		}
	},
	//弹出提示框
	tips: function(msg) {
		var str =
			'<div id="img-upload-tips" style="width:auto;padding:5px 15px;position:fixed;top:50%;left:50%;transform:translate(-50% -50%);-webkit-transform:translate(-50% -50%); background-color:rgba(0,0,0,.8);color:#fff;">' +
			msg + '</div>';
		document.body.insertAdjacentHTML("beforeend", str);
		setTimeout(function() {
			var tips = document.getElementById("img-upload-tips");
			document.body.removeChild(tips);
		}, 2000)
	},
	//将base64转换为文件
	dataURLtoFile: function(dataurl, filename) {
		var arr = dataurl.split(','),
			mime = arr[0].match(/:(.*?);/)[1],
			bstr = atob(arr[1]),
			n = bstr.length,
			u8arr = new Uint8Array(n);
		while (n--) {
			u8arr[n] = bstr.charCodeAt(n);
		}
		return new File([u8arr], filename, {
			type: mime
		});
	},
	//原生js 获取指定元素的指定子元素
	children: function(parent, tagName) {
		var nodeList = parent.childNodes;
		var arr = [];
		var matchArr = [];
		if (/MSIE(6|7|8)/.test(navigator.userAgent)) {
			for (var i = 0; i < nodeList.length; i++) {
				var curNode = nodeList[i];
				if (curNode.nodeType === 1) {
					arr.push(curNode);
				}
			}
		} else {
			arr = Array.prototype.slice.call(parent.children);
		}
		if (typeof tagName === "string") {
			for (var k = 0; k < arr.length; k++) {
				var curTag = arr[k];
				var comparedArr = [];
				var compareStr = tagName;
				if (tagName.indexOf(".") >= 0) {
					comparedArr = curTag.className.split(" ");
					compareStr = tagName.substring(1, tagName.length);
				} else if (tagName.indexOf("#") >= 0) {
					comparedArr = curTag.getAttribute("id").split(" ");
					compareStr = tagName.substring(1, tagName.length);
				} else {
					comparedArr.push(curTag.nodeName.toLowerCase())
				}
				for (var j = 0; j < comparedArr.length; j++) {
					if (comparedArr[j] == compareStr) {
						matchArr.push(arr[k])
						continue;
					}
				}
			}
		}
		return matchArr;
	}
}
// Object.defineProperty(UploadImage.prototype, "existFile", {
// 	get: function() {},
// 	set: function(newVal) {
// 		console.log(newVal);
// 	}
// })
/**
 *用构造函数方法写上传文件插件
 */
function UploadFile(opt) {
	UploadImage.call(this, opt);
	UploadFile.prototype = new UploadImage();
	UploadFile.prototype.constructor = UploadFile;
}
UploadFile.prototype.init = function() {
	var _this = this;
	_this._div.classList.add("upload-img-box");
	var input = document.createElement("input");
	input.setAttribute("type", "file");
	input.setAttribute("multiple", "multiple");
	input.setAttribute("accept", "image/gif,image/jpeg,image/jpg,image/png,image/svg");
	var parent = document.createElement("div");
	if (!!_this.width && !isNaN(_this.width)) {
		parent.style.minWidth = _this.width + "px";
		parent.style.maxWidth = _this.width + "px";
	}
	parent.setAttribute("id", _this.id);
	parent.classList.add("upload-img-add-btn");
	var child = document.createElement("div");
	child.innerHTML = '<i class="fa fa-plus"></i><p>' + opt.title || "上传文件" + '</p>';
	parent.appendChild(input);
	parent.appendChild(child);
	_this._div.appendChild(parent);
	if (_this.existFile.length >= _this.fileLimit && _this.fileLimit != 0) {
		document.getElementById(_this.id).style.display = "none";
	}
	for (var index in _this.existFile) {
		upload.addPic(_this.existFile[index].url, _this.existFile[index].url, _this.existFile[index].id)
	}
	input.onchange = function() {
		upload.changImage(this);
	}
}
UploadFile.prototype.init = function() {
	var fileOnloadIndex = 0;
	var chooseFile = []; //当前选中的文件。用于FileReader异步加载时读取文件信息
	var files = that.files;
	if ((obj.existFileLen + obj.mFiles.length + files.length) > obj.fileLimit && obj.fileLimit != 0) {
		upload.tips('文件不可以超过' + obj.fileLimit + "个");
	} else {
		if ((obj.existFileLen + obj.mFiles.length + files.length) == obj.fileLimit && obj.fileLimit != 0) {
			document.getElementById(obj.id).style.display = "none";
		}
		for (var index = 0; index < files.length; index++) {
			var file = files[index];
			if (/image\/\w+/.test(file.type)) {
				chooseFile.push(file);
				var reader = new FileReader();
				reader.readAsDataURL(file);
				reader.onload = function(e) {
					var mFile = chooseFile[fileOnloadIndex];
					var canvas = document.createElement('canvas');
					if (!canvas || !canvas.getContext || obj.fileCompressedSize * 1024 * 1024 >= mFile.size) {
						obj.mFiles.push(mFile);
					} else {
						var image = new Image();
						image.src = e.target.result;
						image.onload = function() {
							var context = canvas.getContext('2d');
							canvas.width = image.width;
							canvas.height = image.height;
							context.drawImage(image, 0, 0, image.width, image.height);
							obj.mFiles.push(upload.dataURLtoFile(canvas.toDataURL(mFile.type, obj.fileCompressedRate), mFile.name));
						}
					}
					upload.addPic(e.target.result, '', '', obj);
					fileOnloadIndex += 1;
				}
			} else {
				obj.mFiles.push(file);
				uploadfile.addFileTypePic(file.name, '', '', obj);
			}

		}
	}
	that.value = "";
}

var upload = new Object(); //上传图片插件
var uploadfile = new Object(); //上传文件插件
(function() {
	"use strict";
	upload.init = function(opt) {
			if (!opt._div || opt._div.length == 0) return;
			var obj = new Object();
			obj._div = opt._div;
			obj.mFiles = opt.mFiles || []; //要传输到后台保存的图片
			obj.delPic = opt.delPic || []; //编辑时删除的文件路径
			obj.existFile = opt.existFile || []; //编辑时在后台存在的图片路径，格式[{id: "" ,url: ""}],
			obj.fileCompressedSize = opt.fileCompressedSize || 0.3; //图片大小超过多少开始压缩
			obj.fileCompressedRate = opt.fileCompressedRate || 0.92; //图片压缩率(在前端调用时要定义的5个变量,前三个必须)
			obj.fileLimit = opt.fileLimit || 0; //文件上传个数限制，0表示不限制，默认不限制
			obj.width = opt.width //上传文件框长度
			obj.existFileLen = opt.existFile.length;
			obj.id = (obj._div.getAttribute("id") || Math.random(0, 1) * 100) + "-upload-img-add-btn"; //用父div或随机数作为新增按钮前缀
			obj._div.classList.add("upload-img-box");
			var input = document.createElement("input");
			input.setAttribute("type", "file");
			input.setAttribute("multiple", "multiple");
			input.setAttribute("accept", "image/gif,image/jpeg,image/jpg,image/png,image/svg");
			var parent = document.createElement("div");
			if (!!obj.width && !isNaN(obj.width)) {
				parent.style.minWidth = obj.width + "px";
				parent.style.maxWidth = obj.width + "px";
			}
			parent.setAttribute("id", obj.id);
			parent.classList.add("upload-img-add-btn");
			var child = document.createElement("div");
			child.innerHTML = '<i class="fa fa-plus"></i><p>' + opt.title || "批量传图" + '</p>';
			parent.appendChild(input);
			parent.appendChild(child);
			obj._div.appendChild(parent);
			if (obj.existFile.length >= obj.fileLimit && obj.fileLimit != 0) {
				document.getElementById(obj.id).style.display = "none";
			}
			for (var index in obj.existFile) {
				upload.addPic(obj.existFile[index].url, obj.existFile[index].url, obj.existFile[index].id, obj)
			}
			input.onchange = function() {
				upload.changImage(this, obj);
			}
		},
		//input的change事件
		upload.changImage = function(that, obj) {
			var fileOnloadIndex = 0;
			var chooseFile = []; //当前选中的文件。用于FileReader异步加载时读取文件信息
			var files = that.files;
			if ((obj.existFileLen + obj.mFiles.length + files.length) > obj.fileLimit && obj.fileLimit != 0) {
				upload.tips('文件不可以超过' + obj.fileLimit + "个");
			} else {
				if ((obj.existFileLen + obj.mFiles.length + files.length) == obj.fileLimit && obj.fileLimit != 0) {
					document.getElementById(obj.id).style.display = "none";
				}
				for (var index = 0; index < files.length; index++) {
					var file = files[index];
					if (!/image\/\w+/.test(file.type)) {
						files.splice(index, 1);
						continue;
					}
					chooseFile.push(file);
					//文件预览和压缩保存至数组中
					var reader = new FileReader();
					reader.readAsDataURL(file);
					reader.onload = function(e) {
						var mFile = chooseFile[fileOnloadIndex];
						var canvas = document.createElement('canvas');
						if (!canvas || !canvas.getContext || obj.fileCompressedSize * 1024 * 1024 >= mFile.size) {
							obj.mFiles.push(mFile);
						} else {
							var image = new Image();
							image.src = e.target.result;
							image.onload = function() {
								var context = canvas.getContext('2d');
								canvas.width = image.width;
								canvas.height = image.height;
								context.drawImage(image, 0, 0, image.width, image.height);
								obj.mFiles.push(upload.dataURLtoFile(canvas.toDataURL(mFile.type, obj.fileCompressedRate), mFile.name));
							}
						}
						upload.addPic(e.target.result, '', '', obj);
						fileOnloadIndex += 1;
					}
				}
			}
			that.value = "";
		},
		//弹出提示框
		upload.tips = function(msg) {
			var str =
				'<div id="img-upload-tips" style="width:auto;padding:5px 15px;position:fixed;top:50%;left:50%;transform:translate(-50% -50%);-webkit-transform:translate(-50% -50%); background-color:rgba(0,0,0,.8);color:#fff;">' +
				msg + '</div>';
			document.body.insertAdjacentHTML("beforeend", str);
			setTimeout(function() {
				var tips = document.getElementById("img-upload-tips");
				document.body.removeChild(tips);
			}, 2000)
		},
		//将base64转换为文件
		upload.dataURLtoFile = function(dataurl, filename) {
			var arr = dataurl.split(','),
				mime = arr[0].match(/:(.*?);/)[1],
				bstr = atob(arr[1]),
				n = bstr.length,
				u8arr = new Uint8Array(n);
			while (n--) {
				u8arr[n] = bstr.charCodeAt(n);
			}
			return new File([u8arr], filename, {
				type: mime
			});
		},
		//把文件添加到页面中，并绑定事件
		upload.addPic = function(pic, url, id, obj) {
			var div = document.createElement("div");
			if (!!obj.width && !isNaN(obj.width)) {
				div.style.minWidth = obj.width + "px";
				div.style.maxWidth = obj.width + "px";
			}
			if (url.length > 0) {
				var image = new Image();
				image.src = pic;
				div.setAttribute("class", "upload-img-prview");
				div.innerHTML = '<img src="' + pic +
					'" /><span class="upload-img-remove-btn" style="display:none"><i class="fa fa-remove"></i></span><input type="hidden" id="' +
					id + '" value="' + url + '">';
				image.onerror = function() {
					image.onerror = null;
					upload.children(div, "img")[0].src = "/Content/images/no-image.jpg";
				}
				//$div = $('<div class="upload-img-prview"><img src="' + pic + '" /><span class="upload-img-remove-btn hide"><i class="fa fa-remove"></i></span><input type="hidden" id="' + id + '" value="' + url + '"></div>');

			} else {
				div.classList.add("upload-img-prview", "new-file");
				div.innerHTML = '<img src="' + pic +
					'" /><span class="upload-img-remove-btn" style="display:none"><i class="fa fa-remove"></i></span>';
			}
			obj._div.insertBefore(div, document.getElementById(obj.id));
			div.onmouseover = function() {
				upload.children(div, ".upload-img-remove-btn")[0].style.display = "";
			}
			div.onmouseout = function() {
				upload.children(div, ".upload-img-remove-btn")[0].style.display = "none";
			}
			upload.children(div, "img")[0].onclick = function() {
				var img = new Image();
				img.src = upload.children(div, "img")[0].src;
				if (img.complete) {
					var mDiv = document.createElement("div");
					mDiv.style.cssText =
						"position:absolute;top:0;left:0;z-index:100002;width:100vw;height:100vh;background:rgba(0,0,0,.4);padding:0;display:flex;align-items:center;";
					mDiv.innerHTML = '<img src="' + upload.children(div, "img")[0].src +
						'" style="max-width:60%;max-height:100%;margin:auto">';
					mDiv.onclick = function() {
						window.top.document.body.removeChild(mDiv);
					}
					upload.children(mDiv, "img")[0].onclick = function(event) {
						event.stopPropagation();
					}
					window.top.document.body.appendChild(mDiv);
				}
			}
			upload.children(div, ".upload-img-remove-btn")[0].onclick = function() {
				if (url.length > 0) {
					obj.delPic.push(url);
					obj.existFileLen--;
				} else {
					var divArr = upload.children(obj._div, ".new-file");
					var index = -1;
					for (var i = 0; i < divArr.length; i++) {
						if (divArr[i] === div) {
							index = i;
						}
					}
					obj.mFiles.splice(index, 1);
				}
				document.getElementById(obj.id).style.display = "";
				obj._div.removeChild(div);
			}
		},
		//原生js 获取指定元素的指定子元素
		upload.children = function(parent, tagName) {
			var nodeList = parent.childNodes;
			var arr = [];
			var matchArr = [];
			if (/MSIE(6|7|8)/.test(navigator.userAgent)) {
				for (var i = 0; i < nodeList.length; i++) {
					var curNode = nodeList[i];
					if (curNode.nodeType === 1) {
						arr.push(curNode);
					}
				}
			} else {
				arr = Array.prototype.slice.call(parent.children);
			}
			if (typeof tagName === "string") {
				for (var k = 0; k < arr.length; k++) {
					var curTag = arr[k];
					var comparedArr = [];
					var compareStr = tagName;
					if (tagName.indexOf(".") >= 0) {
						comparedArr = curTag.className.split(" ");
						compareStr = tagName.substring(1, tagName.length);
					} else if (tagName.indexOf("#") >= 0) {
						comparedArr = curTag.getAttribute("id").split(" ");
						compareStr = tagName.substring(1, tagName.length);
					} else {
						comparedArr.push(curTag.nodeName.toLowerCase())
					}
					for (var j = 0; j < comparedArr.length; j++) {
						if (comparedArr[j] == compareStr) {
							matchArr.push(arr[k])
							continue;
						}
					}
				}
			}
			return matchArr;
		}
	uploadfile.init = function(opt) {
			if (!opt._div || opt._div.length == 0) return;
			var obj = new Object();
			obj._div = opt._div;
			obj.mFiles = opt.mFiles || []; //要传输到后台保存的文件
			obj.delFile = opt.delFile || []; //编辑时删除的文件路径
			obj.existFile = opt.existFile || []; //编辑时在后台存在的图片路径，格式[{id: "" ,url: ""}],
			obj.fileLimit = opt.fileLimit || 0; //文件上传个数限制，0表示不限制，默认不限制
			obj.width = opt.width //上传文件框长度
			obj.existFileLen = opt.existFile.length;
			obj.id = (obj._div.getAttribute("id") || Math.random(0, 1) * 100) + "-upload-img-add-btn"; //用父div或随机数作为新增按钮前缀
			obj._div.classList.add("upload-img-box");
			var input = document.createElement("input");
			input.setAttribute("type", "file");
			input.setAttribute("multiple", "multiple");
			//input.setAttribute("accept", "image/gif,image/jpeg,image/jpg,image/png,image/svg");
			var parent = document.createElement("div");
			if (!!obj.width && !isNaN(obj.width)) {
				parent.style.minWidth = obj.width + "px";
				parent.style.maxWidth = obj.width + "px";
			}
			parent.setAttribute("id", obj.id);
			parent.classList.add("upload-img-add-btn");
			var child = document.createElement("div");
			child.innerHTML = '<i class="fa fa-plus"></i><p>' + opt.title || "选择文件" + '</p>';
			parent.appendChild(input);
			parent.appendChild(child);
			obj._div.appendChild(parent);
			if (obj.existFile.length >= obj.fileLimit && obj.fileLimit != 0) {
				document.getElementById(obj.id).style.display = "none";
			}
			obj.existFile.forEach(function(item, index, arr) {
				if (!/\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(item.url)) {
					uploadfile.addFileTypePic(item.url, item.url, item.id, obj);
				} else {
					upload.addPic(item.url, item.url, item.id, obj);
				}
			})
			input.onchange = function() {
				uploadfile.changFile(this, obj);
			}
		},
		uploadfile.changFile = function(that, obj) {
			var fileOnloadIndex = 0;
			var chooseFile = []; //当前选中的文件。用于FileReader异步加载时读取文件信息
			var files = that.files;
			if ((obj.existFileLen + obj.mFiles.length + files.length) > obj.fileLimit && obj.fileLimit != 0) {
				upload.tips('文件不可以超过' + obj.fileLimit + "个");
			} else {
				if ((obj.existFileLen + obj.mFiles.length + files.length) == obj.fileLimit && obj.fileLimit != 0) {
					document.getElementById(obj.id).style.display = "none";
				}
				for (var index = 0; index < files.length; index++) {
					var file = files[index];
					if (/image\/\w+/.test(file.type)) {
						chooseFile.push(file);
						var reader = new FileReader();
						reader.readAsDataURL(file);
						reader.onload = function(e) {
							var mFile = chooseFile[fileOnloadIndex];
							var canvas = document.createElement('canvas');
							if (!canvas || !canvas.getContext || obj.fileCompressedSize * 1024 * 1024 >= mFile.size) {
								obj.mFiles.push(mFile);
							} else {
								var image = new Image();
								image.src = e.target.result;
								image.onload = function() {
									var context = canvas.getContext('2d');
									canvas.width = image.width;
									canvas.height = image.height;
									context.drawImage(image, 0, 0, image.width, image.height);
									obj.mFiles.push(upload.dataURLtoFile(canvas.toDataURL(mFile.type, obj.fileCompressedRate), mFile.name));
								}
							}
							upload.addPic(e.target.result, '', '', obj);
							fileOnloadIndex += 1;
						}
					} else {
						obj.mFiles.push(file);
						uploadfile.addFileTypePic(file.name, '', '', obj);
					}

				}
			}
			that.value = "";
		},
		uploadfile.addFileTypePic = function(filename, url, id, obj) {
			var suffix = "/Content/images/filetype/" + filename.split(".")[1] + ".png";
			var div = document.createElement("div");
			if (!!obj.width && !isNaN(obj.width)) {
				div.style.minWidth = obj.width + "px";
				div.style.maxWidth = obj.width + "px";
			}
			if (url.length > 0) {
				var image = new Image();
				image.src = suffix;
				div.setAttribute("class", "upload-img-prview");
				div.innerHTML = '<img src="' + suffix +
					'" /><span class="upload-img-remove-btn" style="display:none"><i class="fa fa-remove"></i></span><input type="hidden" id="' +
					id + '" value="' + url + '">';
				image.onerror = function() {
					image.onerror = null;
					upload.children(div, "img")[0].src = "/Content/images/no-image.jpg";
				}
				//$div = $('<div class="upload-img-prview"><img src="' + pic + '" /><span class="upload-img-remove-btn hide"><i class="fa fa-remove"></i></span><input type="hidden" id="' + id + '" value="' + url + '"></div>');

			} else {
				div.classList.add("upload-img-prview", "new-file");
				div.innerHTML = '<img src="' + suffix +
					'" /><span class="upload-img-remove-btn" style="display:none"><i class="fa fa-remove"></i></span>';
			}
			obj._div.insertBefore(div, document.getElementById(obj.id));
			div.onmouseover = function() {
				upload.children(div, ".upload-img-remove-btn")[0].style.display = "";
			}
			div.onmouseout = function() {
				upload.children(div, ".upload-img-remove-btn")[0].style.display = "none";
			}
			upload.children(div, ".upload-img-remove-btn")[0].onclick = function() {
				if (url.length > 0) {
					obj.delFile.push(url);
					obj.existFileLen--;
				} else {
					var divArr = upload.children(obj._div, ".new-file");
					var index = -1;
					for (var i = 0; i < divArr.length; i++) {
						if (divArr[i] === div) {
							index = i;
						}
					}
					obj.mFiles.splice(index, 1);
				}
				document.getElementById(obj.id).style.display = "";
				obj._div.removeChild(div);
			}
		}
})()
