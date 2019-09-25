var renderer = null

window.onload = () => {
  document.onkeydown = (ev) => keydown(ev)

  var canvas = document.getElementById('canvas')

  renderer = new Renderer(canvas)
  draw()
}

function draw () {
  renderer.draw()
}