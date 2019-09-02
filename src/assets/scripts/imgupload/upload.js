var upload = upload || {};
(function () {
    "use strict";
    upload.init = function (opt, _div) {
        if (_div.length == 0) return;
        var _this = upload;
        _this.mFiles = opt.mFiles||[];//要传输到后台保存的图片
        _this.delPic = opt.delPic || [];//编辑时删除的文件路径
        _this.existFile = opt.existFile || [];//编辑时在后台存在的图片路径，格式[{id: "" ,url: ""}],
        _this.fileCompressedSize = opt.fileCompressedSize || 0.3;//图片大小超过多少开始压缩
        _this.fileCompressedRate = opt.fileCompressedRate || 0.92;//图片压缩率(在前端调用时要定义的5个变量,前三个必须)

        _this.fileLimit = opt.fileLimit || 0;//文件上传个数限制，0表示不限制，默认不限制
        _this._div = _div;
        _this.existFileLen = opt.existFile.length;
        _this.id = (_this._div.getAttribute("id") || Math.random(0, 1) * 100) + "-upload-img-add-btn";//用父div或随机数作为新增按钮前缀
        _this._div.classList.add("upload-img-box");
        _this.chooseFile = [];//当前选中的文件。用于FileReader异步加载时读取文件信息
        var input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("multiple", "multiple");
        input.setAttribute("accept", "image/gif,image/jpeg,image/jpg,image/png,image/svg");
        var parent = document.createElement("div");
        parent.setAttribute("id", _this.id);
        parent.classList.add("upload-img-add-btn");
        var child = document.createElement("div");
        child.innerHTML = '<i class="fa fa-plus"></i><p>批量传图</p>';
        parent.appendChild(input);
        parent.appendChild(child);
        _this._div.appendChild(parent);
        if (opt.existFile.length >= _this.fileLimit && _this.fileLimit != 0) {
            document.getElementById(_this.id).style.display = "none";
        }
        for (var index in opt.existFile) {
            _this.addPic(opt.existFile[index].url, opt.existFile[index].url, opt.existFile[index].id)
        }
        input.onchange = _this.changImage;
    },
    //input的change事件
    upload.changImage = function (that) {
        var _this = upload;
        var fileOnloadIndex = 0;
        var files = that.target.files;
        _this.chooseFile.length = 0;;
        if ((_this.existFileLen + _this.mFiles.length + files.length) > _this.fileLimit && _this.fileLimit != 0) {
            _this.tips('文件不可以超过' + _this.fileLimit + "个");
        } else {
            if ((_this.existFileLen + _this.mFiles.length + files.length) == _this.fileLimit && _this.fileLimit != 0) {
                document.getElementById(_this.id).style.display = "none";
            }
            for (var index = 0; index < files.length; index++) {
                var file = files[index];
                if (!/image\/\w+/.test(file.type)) {
                    files.splice(index, 1);
                    continue;
                }
                _this.chooseFile.push(file);
                //文件预览和压缩保存至数组中
                var reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function (e) {
                    var mFile = _this.chooseFile[fileOnloadIndex];
                    var canvas = document.createElement('canvas');
                    if (!canvas || !canvas.getContext || _this.fileCompressedSize * 1024 * 1024 >= mFile.size) {
                        _this.mFiles.push(mFile);
                    } else {
                        var image = new Image();
                        image.src = e.target.result;
                        image.onload = function () {
                            var context = canvas.getContext('2d');
                            canvas.width = image.width;
                            canvas.height = image.height;
                            context.drawImage(image, 0, 0, image.width, image.height);
                            _this.mFiles.push(_this.dataURLtoFile(canvas.toDataURL(mFile.type, _this.fileCompressedRate), mFile.name));
                        }
                    }
                    _this.addPic(e.target.result, '');
                    fileOnloadIndex += 1;
                }
            }
        }
        that.target.value = "";
    },
    //弹出提示框
    upload.tips = function (msg) {
        var str = '<div id="img-upload-tips" style="width:auto;padding:5px 15px;position:fixed;top:50%;left:50%;transform:translate(-50% -50%);-webkit-transform:translate(-50% -50%); background-color:rgba(0,0,0,.8);color:#fff;">' + msg + '</div>';
        document.body.insertAdjacentHTML("beforeend", str);
        setTimeout(function () {
            var tips = document.getElementById("img-upload-tips");
            document.body.removeChild(tips);
        }, 2000)
    },
    //将base64转换为文件
    upload.dataURLtoFile = function (dataurl, filename) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    },
    //把文件添加到页面中，并绑定事件
    upload.addPic = function (pic, url, id) {
        var _this = upload;
        var div = document.createElement("div");
        if (url.length > 0) {
            var image = new Image();
            image.src = pic;
            div.setAttribute("class", "upload-img-prview");
            div.innerHTML = '<img src="' + pic + '" /><span class="upload-img-remove-btn" style="display:none"><i class="fa fa-remove"></i></span><input type="hidden" id="' + id + '" value="' + url + '">';
            image.onerror = function () {
                image.onerror = null;
                _this.children(div, "img")[0].src = "/Content/images/no-image.jpg";
            }
            //$div = $('<div class="upload-img-prview"><img src="' + pic + '" /><span class="upload-img-remove-btn hide"><i class="fa fa-remove"></i></span><input type="hidden" id="' + id + '" value="' + url + '"></div>');

        } else {
            div.classList.add("upload-img-prview", "new-file");
            div.innerHTML = '<img src="' + pic + '" /><span class="upload-img-remove-btn" style="display:none"><i class="fa fa-remove"></i></span>';
        }
        _this._div.insertBefore(div, document.getElementById(_this.id));
        div.onmouseover = function () {
            _this.children(div, ".upload-img-remove-btn")[0].style.display = "";
        }
        div.onmouseout = function () {
            _this.children(div, ".upload-img-remove-btn")[0].style.display = "none";
        }
        _this.children(div, "img")[0].onclick = function () {
            var img = new Image();
            img.src = _this.children(div, "img")[0].src;
            if (img.complete) {
                var mDiv = document.createElement("div");
                mDiv.style.cssText = "position:absolute;top:0;left:0;z-index:100002;width:100vw;height:100vh;background:rgba(0,0,0,.4);padding:0;display:flex;align-items:center;";
                mDiv.innerHTML = '<img src="' + _this.children(div, "img")[0].src + '" style="max-width:60%;max-height:100%;margin:auto">';
                mDiv.onclick = function () {
                    window.top.document.body.removeChild(mDiv);
                }
                _this.children(mDiv, "img")[0].onclick = function (event) {
                    event.stopPropagation();
                }
                window.top.document.body.appendChild(mDiv);
            }
        }
        _this.children(div, ".upload-img-remove-btn")[0].onclick = function () {
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
                _this.mFiles.splice(index, 1);
            }
            document.getElementById(_this.id).style.display = "";
            _this._div.removeChild(div);
        }
    },
    //原生js 获取指定元素的指定子元素
    upload.children = function (parent, tagName) {
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
})()
//upload.addPic = function (pic, url, id) {
//    var _this = upload;
//    var $div;
//    if (url.length > 0) {
//        var image = new Image();
//        image.src = url;
//        $div = $('<div class="upload-img-prview"><img src="' + pic + '" /><span class="upload-img-remove-btn hide"><i class="fa fa-remove"></i></span><input type="hidden" id="' + id + '" value="' + url + '"></div>');
//        image.onerror = function () {
//            image.error = null;
//            $div.find("img").attr("src", "/Content/images/no-image.jpg")
//        }
//        //$div = $('<div class="upload-img-prview"><img src="' + pic + '" /><span class="upload-img-remove-btn hide"><i class="fa fa-remove"></i></span><input type="hidden" id="' + id + '" value="' + url + '"></div>');

//    } else {
//        $div = $('<div class="upload-img-prview new-file"><img src="' + pic + '" /><span class="upload-img-remove-btn hide"><i class="fa fa-remove"></i></span></div>');
//    }
//    $("#" + _this.id).before($div);
//    $div.hover(function () {
//        $(this).find(".upload-img-remove-btn").toggleClass("hide");
//    })
//    $div.find("img").showBigImg();
//    $div.find(".upload-img-remove-btn").on("click", function () {
//        $div.remove();
//        if (url.length > 0) {
//            _this.delPic.push(url);
//            _this.existFileLen--;
//        } else {
//            var index = $("#" + _this.prefix + "upload-img-add-btn .new-file").index($div);
//            _this.mFiles.splice(index, 1);
//        }
//        $("#" + _this.id).show();
//    })
//}