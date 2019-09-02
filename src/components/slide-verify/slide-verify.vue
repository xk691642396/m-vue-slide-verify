<template>
   <section id="slide" >
       <div ref="uislideWrap" class="ui-slide-wrap" :style="{width:((width.indexOf('%'))>-1?width:width+'px'),height:height+'px'}">
           <div class="ui-slide-text ui-slide-noselect" :class="isMouse?'ui-slidelock':'colorWhite'" :style="{lineHeight:height+'px'}">{{slideTxtShow}}</div>
           <div ref="uislideBtn" class="ui-slide-btn init" :class="isMouse?'':'success'" :style="{height:height+'px',width:height+'px',transform:'translateX('+slideLen+'px)'} " @mousedown="isMouse&&downListen()" @touchstart="isMouse&&downListen()"></div>
           <div class="ui-slide-bg" :style="{width:slideLen+'px',height:height+'px',background:slideBg}"></div>
       </div>
   </section>
</template>
<script>
export default {
    name:'slideVerify',
    data(){
        return{
            slideLen:0,
            positionX:0,
            isMouse:true,//是否验证成功
            slideTxtShow:this.slideTxt
        }
    },
    props:{
        width:{
            type:String,
            default:"100%"
        },
        height:{
            type:[Number,String],
            default:34
        },
        slideTxt:{
            type:String,
            default:"请按住滑块，拖动到最右边"
        },
        slideBg:{
            type:String,
            default:"#7AC23C"
        }
    },
    mounted:function(){
        //document.onselectstart = function(){console.log("onselectstart")}
    },
    methods:{
        downListen(e){//滑块点击监听
            var _this=this;
            var selectTxt = window.getSelection().toString();
            if(!!selectTxt)return;
            var e = e || window.event;
            _this.positionX=e.clientX||e.targetTouches[0].pageX;
            _this.mouseListen();
        },
        mouseListen(){//鼠标事件监听
            var _this = this;
            document.onselectstart = function(){return false;}; //取消字段选择功能
            var _offsetWidth = _this.$refs.uislideWrap.offsetWidth;
            var regExplore=/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i;
            if(/*"ontouchend" in document*/regExplore.test(navigator.userAgent)){
                document.addEventListener("touchmove",_this.addtouchmove);
                document.addEventListener("touchend",_this.addtouchend);
            }else{
                document.onmousemove = function(e){
                    var e = e||window.event;
                    var movePositionX = e.clientX;
                    var movelen = movePositionX - _this.positionX;
                    if(movelen >= (_offsetWidth - _this.height)){
                        movelen = _offsetWidth - _this.height;
                        _this.verifySuccess();
                    }
                    _this.slideLen = movelen>0?movelen:0;
                }
                document.onmouseup = function(e){
                    document.onmousemove=null;
                    document.onselectstart=null;
                    _this.slideLen=0;
                    _this.positionX=0;
                    document.onmouseup=null;
                }
            }
        },
        //滑块滑动成功
        verifySuccess(){
            var _this = this;
            _this.isMouse=false;
            _this.slideTxtShow="验证成功";
            document.onmousemove=null;
            document.onselectstart=null;
            document.onmouseup=null;
            document.removeEventListener("touchmove",_this.addtouchmove);
            document.removeEventListener("touchstart",_this.downListen);
            document.removeEventListener("touchend",_this.addtouchend);
            _this.$emit('call-back');
        },
        //移动滑动端监听
        addtouchmove(e){
            var _this = this;
            var _offsetWidth = _this.$refs.uislideWrap.offsetWidth;
            var e = e||window.event;
            var movePositionX = e.targetTouches[0].pageX;
            var movelen = movePositionX - _this.positionX;
            if(movelen >= (_offsetWidth - _this.height)){
                movelen = _offsetWidth - _this.height;
                _this.verifySuccess();
            }
            _this.slideLen = movelen>0?movelen:0;
        },
        //移动端滑动停止监听
        addtouchend(e){
            var _this = this;
            document.onselectstart=null;
            document.removeEventListener("touchmove",_this.addtouchmove);
            _this.$refs.uislideBtn.removeEventListener("touchstart",_this.downListen);
            _this.slideLen=0;
            _this.positionX=0;
            
            document.removeEventListener("touchend",_this.addtouchend);
        }
    }
}
</script>
<style scoped>
    .colorWhite{
        color: #fff;
    }
    .ui-slide-wrap {
        background: #e8e8e8;
        position: relative;
    }

    .ui-slide-wrap .ui-slide-bg {
        width: 0;background-color: #7AC23C;
    }

    .ui-slide-wrap .ui-slide-btn {
        position: absolute;
        top: 0;
        left: 0;
        cursor: move;
        text-align: center;
        border: 1px solid #ccc;
        background: #fff;
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        -ms-box-sizing: border-box;
        -o-box-sizing: border-box;
        box-sizing: border-box;
    }

    .ui-slide-wrap .ui-slide-btn {
        background: #fff url(./img/slide.png) no-repeat center;
    }

    .ui-slide-wrap .ui-slide-btn.success {
        background-image: url(./img/success.png);
    }

    .ui-slide-wrap .ui-slide-text {
        width: 100%;
        height: 100%;
        font-family: "微软雅黑";
        text-align: center;
        position: absolute;
        top: 0;
        left: 0;
    }

    .ui-slide-wrap .ui-slide-no-select {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        -o-user-select: none;
        user-select: none;
    }

    .ui-slidelock {
        background: -webkit-gradient(linear, left top, right top, color-stop(0, #4d4d4d), color-stop(.4, #4d4d4d), color-stop(.5, #fff), color-stop(.6, #4d4d4d), color-stop(1, #4d4d4d));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        -webkit-animation: slidelock 2.6s infinite;
        -webkit-text-size-adjust: none;
    }

    @keyframes slidelock {
        0% {
            background-position: -140px 0;
        }
        100% {
            background-position: 140px 0;
        }
    }
</style>
