//给图片添加点击事件
$.fn.showBigImg = function () {
    if ($(this).is("img")) {
        $(this).on("click", function () {
            //$(this).error(function () {
            //    return false;
            //})
            var img = new Image();
            img.src = $(this).attr("src");
            if (img.complete) {
                var $div = $('<div style="position:absolute;top:0;left:0;z-index:100002;width:100vw;height:100vh;background:rgba(0,0,0,.4);padding:0;display:flex;align-items:center;"><img src="' + $(this).attr("src") + '" style="max-width:60%;max-height:100%;margin:auto"></div>');
                $div.click(function () {
                    $div.remove();
                })
                $div.find("img").click(function (event) {
                    event.stopPropagation();
                })
                $('body', window.top.document).append($div);
            }
        })
    }
    return $(this);
}

 //string转化成日期类型
 String.prototype.toDate = function (type, count) {
    var self = this;
    var dateTime = new Date(self);
    var timeObject = {};
    switch (type) {
        case "year":
            timeObject.year = dateTime.getFullYear() + count;
            dateTime.setYear(timeObject.year);
            break;
        case "month":
            timeObject.month = dateTime.getMonth() + 1 + count;
            dateTime.setMonth(timeObject.month);
            break;
        case "day":
            timeObject.day = dateTime.getDate() + count;
            dateTime.setDate(timeObject.day);
            break;
        case "h":
            timeObject.h = dateTime.getHours();
            dateTime.setHours(timeObject.h);
            break;
        case "m":
            timeObject.m = dateTime.getMinutes() + count;
            dateTime.setMinutes(timeObject.m);
            break;
        case "s":
            timeObject.s = dateTime.getSeconds() + count;
            dateTime.setSeconds(timeObject.s);
            break;
        default:
            break;
    }
    timeObject.year = dateTime.getFullYear();
    timeObject.month = Number(dateTime.getMonth()) + 1;
    timeObject.day = dateTime.getDate();
    timeObject.h = dateTime.getHours();
    timeObject.m = dateTime.getMinutes();
    timeObject.s = dateTime.getSeconds();

    return timeObject.year + "-" + learun.changeDoubleStr(timeObject.month) + "-" + learun.changeDoubleStr(timeObject.day) + " " + learun.changeDoubleStr(timeObject.h) + ":" + learun.changeDoubleStr(timeObject.m) + ":" + learun.changeDoubleStr(timeObject.s);
};

//创建一个GUID
createGuid: function () {
    var guid = "";
    for (var i = 1; i <= 32; i++) {
        var n = Math.floor(Math.random() * 16.0).toString(16);
        guid += n;
        if ((i == 8) || (i == 12) || (i == 16) || (i == 20)) guid += "-";
    }
    return guid;
};

//从富文本中截取图片src
function getSrc(text) {
    var imgArr = text.match(/<img[^>]*>/gim)||[];
    var urlArr = [];
    var regExp = /(?<=src=")[^"]+(?=")|(?<=src=')[^']+(?=')/gi;
    imgArr.forEach(function (item, index, arr) {
        urlArr = urlArr.concat(item.match(regExp) || []);
    })
    return urlArr;
}
//对比两个数组找出第一个数组比第二个数组多的项，返回数组
function campare(arr1,arr2){
    arr1.forEach(function(item,index,arr){
        arr2.forEach(function(item2,index2,arr2){
            if(item==item2){
                arr.splice(index,1);
            }
        })
    })
    return arr1;
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
//将数字转换成金额显示
function toMoney(num) {
    num = Number(num);
    num = num.toFixed(2);
    num = parseFloat(num);
    num = num.toLocaleString();
    var s = num.toString();
    var rs = s.indexOf('.');
    if (rs < 0) {
        rs = s.length;
        s += '.';
    }
    while (s.length <= rs + 2) {
        s += '0';
    }
    return s;//返回的是字符串23,245.12保留2位小数
}

 //获取、设置表单数据
 $.fn.getWebControls = function (keyValue) {
    var reVal = "";
    $(this).find('input,select,textarea,.ui-select,.uploadify,.webUploader').each(function (r) {
        var id = $(this).attr('id');
        var type = $(this).attr('type');
        switch (type) {
            case "checkbox":
                if ($("#" + id).is(":checked")) {
                    reVal += '"' + id + '"' + ':' + '"1",'
                } else {
                    reVal += '"' + id + '"' + ':' + '"0",'
                }
                break;
            case "select":
                var value = $("#" + id).attr('data-value');
                if (value == "") {
                    value = "&nbsp;";
                }
                reVal += '"' + id + '"' + ':' + '"' + $.trim(value) + '",'
                break;
            case "selectTree":
                var value = $("#" + id).attr('data-value');
                if (value == "") {
                    value = "&nbsp;";
                }
                reVal += '"' + id + '"' + ':' + '"' + $.trim(value) + '",'
                break;
            case "webUploader":
            case "uploadify":
                var value = $("#" + id).attr('data-value');
                if (value == "" || value == undefined) {
                    value = "&nbsp;";
                }
                reVal += '"' + filedid + '"' + ':' + '"' + $.trim(value) + '",'
                break;
            case "radio":
                if ($(this).is(":checked")) {
                    var id = $(this).attr("name");
                    var value = $(this).val();
                    reVal += '"' + id + '"' + ':' + '"' + $.trim(value) + '",'
                }
                break;
            default:
                var value = $("#" + id).val();
                if (value == "") {
                    value = "&nbsp;";
                }
                reVal += '"' + id + '"' + ':' + '"' + $.trim(value) + '",'
                break;
        }
    });
    reVal = reVal.substr(0, reVal.length - 1);
    if (!keyValue) {
        reVal = reVal.replace(/&nbsp;/g, '');
    }
    reVal = reVal.replace(/\\/g, '\\\\');
    reVal = reVal.replace(/\n/g, '\\n');
    var postdata = jQuery.parseJSON('{' + reVal + '}');
    return postdata;
};
$.fn.setWebControls = function (data) {
    var $id = $(this)
    for (var key in data) {
        var id = $id.find('#' + key);
        if(id.length===0){
            id = $id.find("[name=" + key + "]");
        }
        if (id.length>0) {
            var type = id.attr('type');
            if (id.hasClass("input-datepicker")) {
                type = "datepicker";
            }
            var value = $.trim(data[key]).replace(/&nbsp;/g, '');
            switch (type) {
                case "file":
                    break;
                case "checkbox":
                    if (value == 1) {
                        id.attr("checked", 'checked');
                    } else {
                        id.removeAttr("checked");
                    }
                    break;
                case "select":
                    id.comboBoxSetValue(value);
                    break;
                case "selectTree":
                    id.comboBoxTreeSetValue(value);
                    break;
                case "datepicker":
                    id.val(formatDate(value, 'yyyy-MM-dd'));
                    break;
                case "uploadify":
                case "webUploader":
                    id.uploadifyExSet(value);
                    break;
                case "radio":
                    $("input[type=radio][name=" + key + "][value=" + value + "]").prop("checked", true);
                    break;
                default:
                    id.val(value);
                    break;
            }
        }
    }
};
//datetable插入数据
$.fn.setWebControls2 = function (data) {
    $(this).find("input,select,.ui-select,textarea").each(function () {
        var cur = $(this);
        var id = cur.attr("id") || cur.attr("name");
        if (!!id) {
            var val = data[id] || data[id.toLowerCase()];
            if (cur.is('input,textarea')) {
                switch (cur.attr("type")) {
                    case "radio": case "checkbox":
                        if (cur.val() == val) {
                            cur.prop("checked", true);
                        }
                        break;
                    default: cur.val(val); break;

                }
            } else if (cur.is('select')) {
                cur.find("option[value=" + val + "]").prop("selected", true);
            } else if (cur.is(".ui-select")) {
                cur.comboBoxSetValue(val);
            }
        }
    })
}