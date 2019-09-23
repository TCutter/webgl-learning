class Renderer { 
  static sCanvas = document.createElement('canvas')

  static sWebgl = Renderer.sCanvas.getContext('experimentation-webgl') || Renderer.sCanvas.getContext('webgl')

  static sProgram = null

  constructor (canvas) {
    this._canvas = canvas
    this._initShaders()
    this._initVertexBuffers()
  }

  draw () {
    var webgl = Renderer.sWebgl
    webgl.useProgram(Renderer.sProgram) // 要放在片段着色器前面调用

    this._doDraw()
  }

  /**
   * 将字符串形式的着色器代码从JS传给 WEBGL 系统，并建立着色器
   * 目的是为了设置 programObject 对象
   */
  _initShaders () {
    var gl = Renderer.sWebgl
    var vertexShaderObject = gl.createShader(gl.VERTEX_SHADER)
    var fragmentShaderObject = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(vertexShaderObject, Renderer.sVshPgm)
    gl.shaderSource(fragmentShaderObject, Renderer.sFshPgm)
    gl.compileShader(vertexShaderObject)
    gl.compileShader(fragmentShaderObject)
    if (!gl.getShaderParameter(vertexShaderObject, gl.COMPILE_STATUS)) {
      window.alert(gl.getShaderInfoLog(vertexShaderObject) + 'in vertex shader')
      return false
    }

    var programObject = gl.createProgram()
    gl.attachShader(programObject, vertexShaderObject)
    gl.attachShader(programObject, fragmentShaderObject)
    gl.linkProgram(programObject)
    if (!gl.getShaderParameter(fragmentShaderObject, gl.COMPILE_STATUS)) {
      window.alert(gl.getShaderInfoLog(fragmentShaderObject) + 'in fragment shader')
      return false
    }

    gl.deleteShader(vertexShaderObject)
    gl.deleteShader(fragmentShaderObject)

    Renderer.sProgram = programObject
  }

  /**
   * 使用缓冲区对象一次性绘制多个顶点
   */
  _initVertexBuffers () {
    var webgl = Renderer.sWebgl

    // 三个顶点
    var vertices = new Float32Array([
      0, 0.5, 10, 1.0, 0.0, 0.0,
      -0.5, -0.5, 20, 0.0, 1.0, 0.0,
      0.5, -0.5, 30, 0.0, 0.0, 1.0
    ])

    // 创建缓冲区对象
    var buffer = webgl.createBuffer()
    // 将缓冲区对象绑定到 "目标"(即webgl.ARRAY_BUFFER)
    webgl.bindBuffer(webgl.ARRAY_BUFFER, buffer)
    // 向缓冲区对象中写入数据（不能直接向缓冲区写入数据， 只能向 “目标写入”）
    webgl.bufferData(webgl.ARRAY_BUFFER, vertices, webgl.STATIC_DRAW)
    
    const FSIZE = vertices.BYTES_PER_ELEMENT

    var a_Position = webgl.getAttribLocation(Renderer.sProgram, 'a_Position')
    // 使用 2 个数据，每6个数据代表一个顶点数据（FSIZE * 6表示相邻顶点之间的字节数，默认为0），a_Position是从第0个开始
    webgl.vertexAttribPointer(a_Position, 2, webgl.FLOAT, false, FSIZE * 6, 0)
    webgl.enableVertexAttribArray(a_Position) 
    
    var a_PointSize = webgl.getAttribLocation(Renderer.sProgram, 'a_PointSize')
    webgl.vertexAttribPointer(a_PointSize, 1, webgl.FLOAT, false, FSIZE * 6, FSIZE * 2)
    webgl.enableVertexAttribArray(a_PointSize) 

    var a_Color = webgl.getAttribLocation(Renderer.sProgram, 'a_Color')
    webgl.vertexAttribPointer(a_Color, 3, webgl.FLOAT, false, FSIZE * 6, FSIZE * 3)
    webgl.enableVertexAttribArray(a_Color)
  }

  _doDraw () {
    var webgl = Renderer.sWebgl

    webgl.canvas.width = this._canvas.width
    webgl.canvas.height = this._canvas.height
    webgl.viewport(0, 0, webgl.canvas.width, webgl.canvas.height)

    webgl.clearColor(0.0, 1.0, 1.0, 1.0)
    webgl.clear(webgl.COLOR_BUFFER_BIT)
    webgl.drawArrays(webgl.TRIANGLES, 0, 3) // 绘制三角形，从第1个顶点开始绘制3个顶点

    var ctx = this._canvas.getContext('2d')
    ctx && ctx.drawImage(Renderer.sCanvas, 0, 0)
  }
}

// vertex shader program
Renderer.sVshPgm = [
  'precision mediump float;',
  'attribute vec4 a_Position;',
  'attribute float a_PointSize;',
  'attribute vec4 a_Color;',
  'varying vec4 v_Color;',
  'void main()',
  '{',
  '   gl_Position = a_Position;', // 设置坐标
  '   gl_PointSize = a_PointSize;',
  '   v_Color = a_Color;',
  '}'
].join('\n')

// fragment shader program
Renderer.sFshPgm = [
  'precision mediump float;',
  'varying vec4 v_Color;',
  'void main()',
  '{',
  '   gl_FragColor = v_Color;',
  '}'
].join('\n')
