function loadImage (path) {
  return new Promise((resolve, reject) => {      
    var img = new Image()
    img.setAttribute('crossorigin', 'anonymous') // 设置允许跨域加载图片
    img.onload = () => resolve(img)
    img.onerror = reject;
    img.src = path
  })
}