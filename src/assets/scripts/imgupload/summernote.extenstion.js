
//基于summernote的富文本操作
(function () {
    
	//var new_element = document.createElement("script");
	//new_element.setAttribute("type", "text/javascript");
	//new_element.setAttribute("src", "/Content/scripts/plugins/summernote/js/summernote.min.js");
	//document.body.appendChild(new_element);
	//var new_element = document.createElement("script");
	//new_element.setAttribute("type", "text/javascript");
	//new_element.setAttribute("src", "/Content/scripts/plugins/summernote/js/summernote-zh-CN.js");
	//document.body.appendChild(new_element);
	//var new_element = document.createElement("link");
	//new_element.setAttribute("rel", "stylesheet");
	//new_element.setAttribute("href", "/Content/scripts/plugins/summernote/css/summernote.css");
	//document.body.appendChild(new_element);
	
})()
/**
 * 初始化富文本选择器
 * opt参数
 * mArr后台已经保存的图片全局变量
 */
$.fn.snExtension = function (opt,mArr) {
    var opt = $.extend({
        lang: 'zh-CN',
        height: 300,
        minHeight: null,
        maxHeight: null,
        focus: true,
        keyFile:"item",
    }, opt);
    var $this = $(this);
    $this.summernote({
        lang: opt.lang,
        height: opt.height,
        minHeight: opt.minHeight,
        maxHeight: opt.maxHeight,
        focus: opt.focus,
        callbacks: {
            onImageUpload: function (files) {
                compressImage(files,function(compressFiles){
                    var formData = new FormData();
                    for(var i = 0;i<compressFiles.length;i++){
                        formData.append("file", compressFiles[i], compressFiles[i].name);
                    }
                    uploadFile.call($this,formData,opt.keyFile,mArr);
                },1)
            }
        }
    })
    return $this;
}
/**
 *点击取消时判断是否有要删除的图片
 *mArr后台已经保存的图片全局变量
 *addArr编辑时添加的url数组
 */
$.fn.delPic = function(mArr,addArr){
    var existArr = getRichSrc($(this).summernote("code"));
    var delArr = richArrCampare(existArr.concat(addArr),mArr);
    if(delArr.length>0){
        delOssPic(delArr);
    }
    return $(this);
}
/**
 * 压缩图片(默认300k开始压缩)返回压缩后的图片和图片的base64
 * files压缩的图片
 * cb 压缩完成后回调函数
 * beginCompress图片超过多少开始压缩（单位m，默认0.3）
 */
function compressImage(files,cb,beginCompress){
    //排除不是图片的文件
    for(var i=0;i < files.length; i++){
        if (!/image\/\w+/.test(files[i].type)) {
            files.splice(index, 1);
            continue;
        }
    }
    var fileOnloadIndex = 0;
    var compressFile = new Array();//保存压缩后的文件
    var base64File = new Array();//保存图片base64
    var canvas = document.createElement('canvas');
    for (var i = 0; i < files.length; i++) {
        var reader = new FileReader();
        reader.readAsDataURL(files[i]);
        reader.onloadend = function (e) {
            //debugger
            var mFile = files[fileOnloadIndex];
            if (!canvas || !canvas.getContext||(isNaN(beginCompress)?0.3:beginCompress) * 1024 * 1024 >= mFile.size) {
                compressFile.push(mFile);
                base64File.push(e.target.result);
                fileOnloadIndex++;
                if (fileOnloadIndex == files.length) {
                    cb(compressFile,base64File);
                }
            } else {
                var image = new Image();
                image.src = e.target.result;
                image.onload = function () {
                    fileOnloadIndex++;
                    var context = canvas.getContext('2d');
                    canvas.width = image.width;
                    canvas.height = image.height;
                    context.drawImage(image, 0, 0, image.width, image.height);
                    var data = canvas.toDataURL(mFile.type, 0.9);
                    base64File.push(data);
                    compressFile.push(dataURLtoFile2(data, mFile.name));
                    if (fileOnloadIndex == files.length) {
                        cb(compressFile,base64File);
                    }
                }
            }                            
        }
                        
    }
}
//将base64转换为文件
function dataURLtoFile2(dataurl, filename) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
    bstr = window.atob ? atob(arr[1]) : (new Base64).atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    try{
        return new File([u8arr], filename || "123." + mime.split("/")[1], { type: mime });
    } catch(ex) {
        var blob = new Blob([u8arr], { type: mime });
        blob.lastModifiedDate = new Date();
        blob.lastModified = Date.now()
        blob.name = filename || "123." + mime.split("/")[1];
        return blob;
    }
}
/**
* 上传图片到后台
* formData文件数据
* keyFile存放文件夹
* mArr对比删除数组
**/
function uploadFile(formData,keyFile,mArr){
    var $this=this;
    $.ajax({
        type: 'post',
        url: '/BaseManage/dj_item/uploadImg?keyFile='+keyFile,
        cache: false,
        data: formData,
        processData: false,
        contentType: false,
        dataType: 'text', //请求成功后，后台返回图片访问地址字符串，故此以text格式获取，而不是json格式
        success: function (data) {
            var picArr = data.split(",");
            for (var i = 0; i < picArr.length; i++) {
                $this.summernote('insertImage', picArr[i]);
                if(mArr instanceof Array){
                    mArr.push(picArr[i]);
                }
            }
        },
        error: function () {
            alert("上传失败");
        }
    });
}
/**
* 删除oss图片
* delArr要删除图片数组
**/
function delOssPic(delArr){
    var token = "";
    if ($('[name=__RequestVerificationToken]').length > 0) {
        token = $('[name=__RequestVerificationToken]').val();
    }
    window.setTimeout(function () {
        $.ajax({
            url: '/BaseManage/dj_item/delOssPic',
            data: {__RequestVerificationToken:token,delArr:delArr.join()},
            type: 'POST',
            dataType: 'JSON',
            timeout: 9000,
            success: function (data) {
               
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                
            },
            beforeSend: function () {
                
            },
            complete: function () {
            }
        });
    }, 500);
}
//从富文本中截取图片src
function getRichSrc(text) {
    var imgArr = text.match(/<img[^>]*>/gim) || [];
    var srcArr = [];
    var urlArr = [];//(?<=").*?(?=");  /(?<=src=")[^"]+(?=")|(?<=src=')[^']+(?=')/gi
    var regExp = /src="[^"]+(?=")|src='[^'][^']+(?=')/gi;
    for (var i = 0; i < imgArr.length; i++) {
        srcArr = srcArr.concat(imgArr[i].match(regExp) || []);
    }
    for (var i = 0; i < srcArr.length; i++) {



        urlArr.push(srcArr[i].substring(5, srcArr[i].length));
    }
    return urlArr;
}
//对比两个数组找出第一个数组比第二个数组多的项，返回数组
function richArrCampare(arr1,arr2){
    var returnArr = arr1.concat();
    var j = returnArr.length;
    for(var i=0;i<arr2.length;i++){
        var j = returnArr.length;
        while(j--){
            if(returnArr[j]==arr2[i]){
                returnArr.splice(j,1);
            }
        }
    }
    return returnArr;
}
//Base64加密解密，兼容IE9
// atob和btoa method
function Base64(){
    this.base64hash = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
}
Base64.prototype={
    constructor:Base64,
    atob:function(s){//解密
        s = s.replace(/\s|=/g, '');
        var cur,
            prev,
            mod,
            i = 0,
            result = [],
            base64hash = this.base64hash;
        while (i < s.length) {
            cur = base64hash.indexOf(s.charAt(i));
            mod = i % 4;

            switch (mod) {
                case 0:
                    //TODO
                    break;
                case 1:
                    result.push(String.fromCharCode(prev << 2 | cur >> 4));
                    break;
                case 2:
                    result.push(String.fromCharCode((prev & 0x0f) << 4 | cur >> 2));
                    break;
                case 3:
                    result.push(String.fromCharCode((prev & 3) << 6 | cur));
                    break;
                        
            }

            prev = cur;
            i ++;
        }

        return result.join('');
    },
    btoa:function (s) {//加密
        if (/([^\u0000-\u00ff])/.test(s)) {
            throw new Error('INVALID_CHARACTER_ERR');
        }    
        var i = 0,
            prev,
            ascii,
            mod,
            result = []
            base64hash = this.base64hash;

        while (i < s.length) {
            ascii = s.charCodeAt(i);
            mod = i % 3;

            switch(mod) {
                // 第一个6位只需要让8位二进制右移两位
                case 0:
                    result.push(base64hash.charAt(ascii >> 2));
                    break;
                    //第二个6位 = 第一个8位的后两位 + 第二个8位的前4位
                case 1:
                    result.push(base64hash.charAt((prev & 3) << 4 | (ascii >> 4)));
                    break;
                    //第三个6位 = 第二个8位的后4位 + 第三个8位的前2位
                    //第4个6位 = 第三个8位的后6位
                case 2:
                    result.push(base64hash.charAt((prev & 0x0f) << 2 | (ascii >> 6)));
                    result.push(base64hash.charAt(ascii & 0x3f));
                    break;
            }

            prev = ascii;
            i ++;
        }

        // 循环结束后看mod, 为0 证明需补3个6位，第一个为最后一个8位的最后两位后面补4个0。另外两个6位对应的是异常的“=”；
        // mod为1，证明还需补两个6位，一个是最后一个8位的后4位补两个0，另一个对应异常的“=”
        if(mod == 0) {
            result.push(base64hash.charAt((prev & 3) << 4));
            result.push('==');
        } else if (mod == 1) {
            result.push(base64hash.charAt((prev & 0x0f) << 2));
            result.push('=');
        }

        return result.join('');
    }
}

/**
 *前端展示base64图片，点击确认时再上传图片
 *opt初始化参数
 */
//初始化上传图片插件
$.fn.summernoteInit = function(opt){
    opt = $.extend({
        lang: 'zh-CN',
        height: 300,
        minHeight: 300,
        maxHeight: 1000,
        focus: true
    }, opt);
    var $this = $(this);
    $this.summernote({
        lang: opt.lang,
        height: opt.height,
        minHeight: opt.minHeight,
        maxHeight: opt.maxHeight,
        focus: opt.focus,
        callbacks: {
            onImageUpload: function (files) {
                compressImageTo64(files, function (base64File) {
                    for (var i = 0; i < base64File.length; i++) {
                        $this.summernote('insertImage', base64File[i]);
                    }
                },1)
            }
        }
    })
}
//压缩图片返回base64
function compressImageTo64(files, cb, beginCompress) {
    //排除不是图片的文件
    for (var i = 0; i < files.length; i++) {
        if (!/image\/\w+/.test(files[i].type)) {
            files.splice(index, 1);
            continue;
        }
    }
    var fileOnloadIndex = 0;
    var base64File = new Array();//保存图片base64
    var canvas = document.createElement('canvas');
    for (var i = 0; i < files.length; i++) {
        var reader = new FileReader();
        reader.readAsDataURL(files[i]);
        reader.onloadend = function (e) {
            var mFile = files[fileOnloadIndex];
            if (!canvas || !canvas.getContext || (isNaN(beginCompress) ? 0.3 : beginCompress) * 1024 * 1024 >= mFile.size) {
                base64File.push(e.target.result);
                fileOnloadIndex++;
                if (fileOnloadIndex == files.length) {
                    cb(base64File);
                }
            } else {
                var image = new Image();
                image.src = e.target.result;
                image.onload = function () {
                    fileOnloadIndex++;
                    var context = canvas.getContext('2d');
                    canvas.width = image.width;
                    canvas.height = image.height;
                    context.drawImage(image, 0, 0, image.width, image.height);
                    var data = canvas.toDataURL(mFile.type, 0.5);
                    base64File.push(data);
                    if (fileOnloadIndex == files.length) {
                        cb(base64File);
                    }
                }
            }
        }

    }
}
//从富文本中获取图片文件上传到服务器
$.fn.summernoteUpload = function (opt) {
    opt = $.extend({
        keyFile: "test",
        existUrls:[],
        success:null
    },opt)
    var $this = $(this);
    var _html = $this.summernote("code");
    var imgArr = _html.match(/<img[^>]*>/gim) || [];
    var regExp = /src="data:image\/[^"]*(?=")|src='data:image\/[^']*(?=')/gim;
    var matchArr = [];
    for (var i = 0; i < imgArr.length; i++) {
        matchArr = matchArr.concat(imgArr[i].match(regExp) || []);
    }
    if (matchArr.length == 0) {
        if (typeof opt.success === "function") {
            opt.success(_html);
        }
        return;
    }
    var formData = new FormData();
    for (var i = 0; i < matchArr.length; i++) {
        var fileData = dataURLtoFile2(matchArr[i].substring(5));
        formData.append(i, fileData, fileData.name);
    }
    $.ajax({
        type: 'post',
        url: '/BaseManage/dj_item/uploadImg2?keyFile=' + opt.keyFile,
        cache: false,
        data: formData,
        processData: false,
        contentType: false,
        dataType: 'json', //请求成功后，后台返回图片访问地址字符串，故此以text格式获取，而不是json格式
        success: function (data) {
            for (var i = 0; i < data.length; i++) {
                obj[data[i].fileName] = data[i].url;
            }
            var imgIndex = 0;
            var uploaTxt = _html.replace(/<img(\S|\s)(src="data:image\/[^"]*"|src='data:image\/[^']*')[^>]*>/gim, function (match, pos, originalText) {
                match = match.replace(/"(\S*)"|'(\S*)'/gim, obj[imgIndex]);
                imgIndex++;
                return match;
            })
            $this.summernote("code", uploaTxt);
            if (typeof opt.success === "function") {
                opt.success(uploaTxt); 
            }
        },
        error: function () {
            alert("上传失败");
        }
    });
}