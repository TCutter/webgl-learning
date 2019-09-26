var g_eyeX = 0.2, g_eyeY = 0.25, g_eyeZ = 0.25 // 视点
var g_near = -1.0, g_far = 1.0

function keydown (ev) {
  switch (ev.keyCode) {
    case 37:
      g_eyeX -= 0.1
      break
    case 38:
      g_far -= 0.1
      break
    case 39:
      g_eyeX += 0.1
      break
    case 40:
      g_far += 0.1
      break
    default:
      break
  }
  draw()
}