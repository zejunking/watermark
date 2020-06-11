### watermark
使用Canvas实现的HTML页面水印

#####  安装
```
npm i git@github.com:zejunking/watermark.git
```

#### 使用
```js
import WaterMark from 'watermark'
```
#### WaterMarkCanvas使用
该水印方法使用div编写
```js
const watermark = new WaterMark({
      watermark_id: 'wm_canvas_id',
      watermark_height_by_id: 'app',
      watermark_txt: `测试水印`,
      watermark_y: 10,
      watermark_x_space: 10,
      watermark_width: 220,
      watermark_height: 50,
      watermark_color: '#333'
    })
watermark.load()
```

#### WaterMarkCanvas配置
```js
defaultSettings = {               // 默认settings
  watermark_id: 'wm_canvas_id',          //水印总体的id
  watermark_txt: "测试水印",             //水印的内容
  watermark_x: '10px',                     //水印起始位置x轴坐标
  watermark_y: '10px',                     //水印起始位置Y轴坐标
  watermark_x_space: 50,                     //水印x轴间隔
  watermark_y_space: 40,                     //水印y轴间隔
  watermark_font: '18px',           //水印字体
  watermark_fillStyle: 'rgba(184, 184, 184, 0.2)',               //字体颜色、水印透明度，要求设置在大于等于0.005
  watermark_angle: 15,                 //水印倾斜度数
  watermark_height_by_id: 'app',    // 水印挂载内容区域的id，水印高度随挂载区域变化而变化
  watermark_parent_node: null,     //水印插件挂载的父元素element,不输入则默认挂在body上
}
```
