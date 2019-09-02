<template>
    <article v-cloak>
        <section id="parent">
            <!-- <div class="logo">
                <div class="text-box">
                    <h1 class="platform">物流链云平台</h1>
                    <h2 class="idea">智慧物流&nbsp;云端畅想</h2>
                </div>
            </div> -->
            <div class="box-center">
                <div class="box-middle">
                    <div id="login">
                        <h1 class="log-title">用户登陆</h1>
                        <h1 class="log-title-en">User Login</h1>
                        <input type="text" id="account"  v-model="account" placeholder="手机号/邮箱"/>
                        <input type="password" id="pwd" v-model="pwd" placeholder="登陆密码" />
                        <slide-verify height="40" sliderBg="#5BBFDE" id="mslide" @call-back="verifyCb"></slide-verify>
                        <span class="error-remind">{{errorRemind}}</span>
                        <a class="btn-login blueClick" @click="btnLogin">登陆</a>
                        <div class="footer clearfix">
                            <a class="btn-forget pull-left" >忘记密码</a>
                            <a class="btn-register pull-right" >免费注册</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </article>
</template>
<script>
import slideVerify from '@components/slide-verify';
export default {
    data(){
        return{
            account:"",
            pwd:"",
            errorRemind:"",
            verify:false
        }
    },
    components:{
        slideVerify:slideVerify
    },
    methods:{
        verifyCb(){
            this.verify=true;
        },
        btnLogin(){
            const {Login} = this;
            Login("123");
            this.$router.push({name:'index'});
        }
    }
}
</script>

<style scoped>
    #parent{
        width:100vw;height: 100vh;position:relative;padding: 15px;
    }
    #parent:after{
        content: '';width:100%;height: 100%;position:absolute;top:0;left:0;background-image: url(../assets/image/reg_bg_web.jpg);background-size:100% 100%;opacity: 0.2;z-index: -1;
    }
    .logo{
        width: auto;height: 80px;background: url(../assets/image/logo.png) no-repeat left center;background-size:80px 100%; padding-left: 85px;position: absolute;top:15px;left:15px;
    }
    .text-box{
        padding-top:8px;
    }
    .platform{
        font-size: 30px;line-height: 1.5;
    }
    .idea{
        font-size: 16px;line-height: 1.7;
    }
    .box-center{
        max-width: 500px;height: 100%;display: table;margin: 0 auto;
    }
    .box-middle{
        width: 100%;height: 100%;display: table-cell;vertical-align: middle;
    }

    #login{
        width:400px;background-color: #fff; border-radius: 4px;height: auto;padding: 20px 30px;text-align: center;
    }
    .log-title{
        font-size: 26px;line-height: 1;
    }
    .log-title-en{
        color:#189BEC;font-size: 16px;
    }
    #login input{
        width:100%;height: 40px;line-height: 40px;border-radius: 4px;text-indent: 15px;border: solid 1px #dddddd;outline: none;margin-top:15px; 
    }
    #mslide{
        margin-top: 15px;
    }
    .error-remind{
        display: inline-block;margin-top:10px; color:#FF0000 ;
    }
    .btn-login{
        width:100%;height: 40px;text-align: center;line-height: 40px; display:inline-block; background-color:#5BBFDE;color:#fff;border-radius:4px;margin-top: 20px; font-size: 16px;cursor: pointer;
    }
    .footer{
        margin-top:15px; 
    }
    .footer a{
        color: #189BEC;cursor: pointer;
    }
</style>
