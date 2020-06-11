/**
 * 添加水印
 */
const _ = require('lodash')

const defaultSettings = {
  // 默认settings
  watermark_id: 'wm_canvas_id', //水印总体的id
  watermark_txt: '测试水印', //水印的内容
  watermark_x: '10px', //水印起始位置x轴坐标
  watermark_y: '10px', //水印起始位置Y轴坐标
  watermark_x_space: 50, //水印x轴间隔
  watermark_y_space: 40, //水印y轴间隔
  watermark_font: '18px', //水印字体
  watermark_fillStyle: 'rgba(184, 184, 184, 0.2)', //字体颜色、水印透明度，要求设置在大于等于0.005
  watermark_angle: 15, //水印倾斜度数
  watermark_height_by_id: 'app', // 水印挂载内容区域的id，水印高度随挂载区域变化而变化
  watermark_parent_node: null //水印插件挂载的父元素element,不输入则默认挂在body上
}

class WaterMark {
  constructor (settings) {
    this.globalSetting = _.merge(defaultSettings, settings)
    this.curPageHeight = 0 // 当前水印层所处页面内容高度(默认为0，表示需要添加水印)

    this.disconnect = function () {} // 删除时，取消监控
  }
  /**
   * 初始化水印，添加load和resize事件
   */
  init () {
    this.load()
  }

  // 手动加载水印
  load (settings = {}) {
    settings = _.merge(defaultSettings, settings)
    this.remove()
    let parent = this.getParentNode(settings.watermark_parent_node)
    this.watermarked({
      parent: parent,
      watermark_txt: settings.watermark_txt,
      watermark_font: settings.watermark_font,
      watermark_angle: settings.watermark_angle,
      watermark_id: settings.watermark_id,
      watermark_x: settings.watermark_x,
      watermark_y: settings.watermark_y,
      watermark_x_space: settings.watermark_x_space,
      watermark_y_space: settings.watermark_y_space,
      watermark_height_by_id: settings.watermark_height_by_id,
      watermark_fillStyle: settings.watermark_fillStyle
    })
  }

  // 手动移除水印
  remove (watermark_id) {
    if (!watermark_id) {
      watermark_id = this.globalSetting.watermark_id
    }
    this.disconnect()
    let watermark_element = document.getElementById(watermark_id)
    if (watermark_element) {
      let _parentElement = watermark_element.parentNode
      _parentElement.removeChild(watermark_element)
    }
  }

  // 默认父级body
  getParentNode (watermark_parent_node) {
    // 如果设置水印挂载的父元素的id
    let watermark_parent_element = document.getElementById(
      watermark_parent_node
    )
    return watermark_parent_element ? watermark_parent_element : document.body
  }

  watermarked ({
    parent,
    watermark_txt,
    watermark_font,
    watermark_angle,
    watermark_fillStyle,
    watermark_id,
    watermark_x,
    watermark_y,
    watermark_x_space,
    watermark_y_space,
    watermark_height_by_id
  }) {
    let that = this
    const canvas0 = document.createElement('canvas')
    const ctx0 = canvas0.getContext('2d')
    if (/^\s*\d+(px|rem)?\s*$/.test(watermark_font)) {
      ctx0.font = ctx0.font
        .split(' ')
        .map(s => {
          if (/\d+px/.test(s)) {
            return watermark_font
          }
          return s
        })
        .join(' ')
    } else if (watermark_font) {
      ctx0.font = watermark_font
    }
    const textWidth = Math.ceil(ctx0.measureText(watermark_txt).width)
    const canvas = document.createElement('canvas')
    const angle = (Math.PI / 180) * -watermark_angle
    const sin = Math.abs(Math.sin(angle))
    const cos = Math.abs(Math.cos(angle))
    const width = textWidth
    const height = Math.ceil(sin * textWidth)
    canvas.setAttribute('width', width + 28 + watermark_x_space + 'px')
    canvas.setAttribute('height', height + 16 + watermark_y_space + 'px')
    const ctx = canvas.getContext('2d')
    ctx.font = ctx0.font
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = watermark_fillStyle
    ctx.rotate(angle + parseFloat(ctx.font) / textWidth)
    ctx.fillText(
      watermark_txt,
      textWidth / 2 - height * sin + height / 6,
      height * cos
    )

    function dataURLtoBlob (dataurl) {
      var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new Blob([u8arr], { type: mime })
    }

    let dataurl = canvas.toDataURL('image/png')
    let blob = dataURLtoBlob(dataurl)
    const base64Url = URL.createObjectURL(blob)
    // 获取内容区域页面最大高度
    let new_elem =
      document.getElementById(watermark_height_by_id) || document.body
    let page_height = Math.max(new_elem.scrollHeight, new_elem.clientHeight)
    that.curPageHeight = page_height
    function createWatermark (url) {
      const div = document.createElement('div')
      div.setAttribute('class', 'watermarked')
      div.setAttribute('id', watermark_id)
      div.setAttribute(
        'style',
        `
      visibility:visible;position:absolute;top:0;left:0;width:100%;min-height:${page_height}px;
      z-index:9999;pointer-events:none;background-repeat:repeat;background-image:url('${url}');
      background-clip: content-box;
      border-left: ${watermark_x || '0'} solid rgba(0,0,0,0);
      border-top: ${watermark_y || '0'}  solid rgba(0,0,0,0);
      `
      )
      return div
    }
    let watermarkDiv = createWatermark(base64Url)
    parent.style.position = 'relative'
    parent.insertBefore(watermarkDiv, parent.firstChild)
    const MutationObserver =
      window.MutationObserver ||
      window.WebKitMutationObserver ||
      window.MozMutationObserver
    that.lock = false

    let refresh = function () {
      try {
        that.lock = true
        let new_elem = document.getElementById(watermark_height_by_id)
        let newPageHeight = Math.max(
          new_elem.scrollHeight,
          new_elem.clientHeight
        )
        console.log(newPageHeight, that.curPageHeight)
        // 新页面的高度与原水印层高度比较，避免不必要的更新
        if (
          that.curPageHeight === 0 ||
          Math.abs(newPageHeight - that.curPageHeight) > 50
        ) {
          that.load()
        }
      } finally {
        that.lock = false
      }
    }
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(refresh)
    } else {
      window.addEventListener('resize', refresh)
    }

    const mo = new MutationObserver(records => {
      console.log(records)
      if (records.length <= 2) {
        if (that.lock) return
        that.lock = true
        try {
          let new_elem = document.getElementById(watermark_height_by_id)
          let newPageHeight = Math.max(
            new_elem.scrollHeight,
            new_elem.clientHeight
          )
          // 新页面的高度与原水印层高度比较，避免不必要的更新
          if (
            that.curPageHeight === 0 ||
            Math.abs(newPageHeight - that.curPageHeight) > 50
          ) {
            that.load()
          } else {
            records.forEach(record => {
              if (record.type === 'childList') { // 水印节点被删除，新增水印
                record.removedNodes.forEach(node => {
                  if (node === watermarkDiv) {
                    parent.insertBefore(watermarkDiv, parent.firstChild)
                  }
                })
              } else if ( // 水印属性修改，替换水印
                record.type === 'attributes' &&
                record.target === watermarkDiv
              ) {
                watermarkDiv = createWatermark(base64Url)
                parent.replaceChild(watermarkDiv, record.target)
                mo.observe(watermarkDiv, { attributes: true })
              }
            })
          }
        } finally {
          that.lock = false
        }
      }
    })
    that.disconnect = function () {
      mo.disconnect()
    }

    mo.observe(parent, { childList: true, attributes: true, subtree: true })
    mo.observe(watermarkDiv, { attributes: true })
  }
}

module.exports = WaterMark
