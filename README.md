# m-vue-slider-verify
登陆验证滑块组件，防止恶意攻击
## 效果图
![demo](https://github.com/xk691642396/vue-dateselect-mobile/tree/master/src/assets/image/demo.jpg)

# 安装
## npm install --save m-vue-slider-verify --save-dev
# 使用
## 在需要使用的页面中引入该组件，并注册该组件
import slideVerify from 'slide-verify';<br/>
components:{
    SlideVerify
}

### Props

width:滑块宽度，支持百分数和数值，默认100%
height:滑块高度，默认34单位px,
sliderTxt:未验证时滑块内部提示文字，默认"请按住滑块，拖动到最右边"
sliderBg:滑块滑动过位置的背景颜色，默认#7AC23C
