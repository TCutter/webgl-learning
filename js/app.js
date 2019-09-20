var renderer = null
var gPoints = []

window.onload = () => {
  var canvas = document.getElementById('canvas')

  renderer = new Renderer(canvas)
  renderer.draw()
}
