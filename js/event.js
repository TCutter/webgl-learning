var g_eyeX = 0.2, g_eyeY = 0.25, g_eyeZ = 0.25 // 视点

function keydown (ev) {
  if (ev.keyCode === 39) {
    g_eyeZ += 0.1
  } else if (ev.keyCode === 37) {
    g_eyeZ -= 0.1
  } else {
    return
  }
  draw()
}