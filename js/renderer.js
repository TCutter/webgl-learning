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
    this._setViewModelMatrix()
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

    var vertices = [
      // 顶点坐标和颜色      
      1.0, 1.0, 1.0, 1.0, 1.0, 1.0, // v0, 白色
      -1.0, 1.0, 1.0, 1.0, 1.0, 0.0,
      -1.0, -1.0, 1.0, 1.0, 0.0, 0.0,
      1.0, -1.0, 1.0, 1.0, 0.0, 1.0,
      1.0, -1.0, -1.0, 0.0, 1.0, 1.0,
      1.0, 1.0, -1.0, 0.0, 1.0, 0.0,
      -1.0, 1.0, -1.0, 0.0, 0.0, 1.0,
      -1.0, -1.0, -1.0, 0.0, 0.0, 0.0 // v7
    ]
    vertices = vertices.map(item => item / 2)
    vertices = new Float32Array(vertices)

    // var indices = new Uint8Array([
    //   0, 1, 2, 0, 2, 3, // 前
    //   0, 3, 4, 0, 4, 5, // 右
    //   0, 5, 6, 0, 6, 1, // 上
    //   1, 6, 7, 1, 7, 2, // 左
    //   7, 4, 3, 7, 3, 2, // 下
    //   4, 7, 6, 4, 6, 5 // 后
    // ])

    // 调换面的顺序也没有影响
    var indices = new Uint8Array([
      0, 1, 2, 0, 2, 3, // 前
      7, 4, 3, 7, 3, 2, // 下
      0, 5, 6, 0, 6, 1, // 上
      1, 6, 7, 1, 7, 2, // 左
      0, 3, 4, 0, 4, 5, // 右
      4, 7, 6, 4, 6, 5 // 后
    ])

    
    // 创建缓冲区对象
    var buffer = webgl.createBuffer()    
    // 将顶点坐标和颜色写入缓冲区对象
    webgl.bindBuffer(webgl.ARRAY_BUFFER, buffer)
    webgl.bufferData(webgl.ARRAY_BUFFER, vertices, webgl.STATIC_DRAW)
    const FSIZE = vertices.BYTES_PER_ELEMENT
    var a_Position = webgl.getAttribLocation(Renderer.sProgram, 'a_Position')
    webgl.vertexAttribPointer(a_Position, 3, webgl.FLOAT, false, FSIZE * 6, 0)
    webgl.enableVertexAttribArray(a_Position) 
    var a_Color = webgl.getAttribLocation(Renderer.sProgram, 'a_Color')
    webgl.vertexAttribPointer(a_Color, 3, webgl.FLOAT, false, FSIZE * 6, FSIZE * 3)
    webgl.enableVertexAttribArray(a_Color) 

    // 将顶点索引数据写入缓冲区对象
    var indexBuffer = webgl.createBuffer()
    webgl.bindBuffer(webgl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    webgl.bufferData(webgl.ELEMENT_ARRAY_BUFFER, indices, webgl.STATIC_DRAW)
  }

  // 设置模型视图矩阵和正交投影矩阵，将 u_ViewMatrix 和 u_ModelMatrix 以及 u_ProjMatrix 计算后的结果传给着色器
  _setViewModelMatrix () {
    var gl = Renderer.sWebgl

    var modelMatrix = mat4.create()
    mat4.identity(modelMatrix)

    // 视图矩阵
    var viewMatrix = mat4.lookAt(
      [g_eyeX, 0.25, 0.25],
      [0, 0, 0],
      [0, 1, 0]
    )
    // var matrix = mat4.multiply(viewMatrix, modelMatrix)
    // 正交投影矩阵
    var projMatrix = mat4.ortho(-1, 1, -1, 1, g_near, g_far)
    var matrix = mat4.multiply(projMatrix, mat4.multiply(viewMatrix, modelMatrix))
    
    var u_Matrix = gl.getUniformLocation(Renderer.sProgram, 'u_Matrix')
    gl.uniformMatrix4fv(u_Matrix, false, matrix)
  }

  _doDraw () {
    var webgl = Renderer.sWebgl

    webgl.canvas.width = this._canvas.width
    webgl.canvas.height = this._canvas.height
    webgl.viewport(0, 0, webgl.canvas.width, webgl.canvas.height)

    webgl.enable(webgl.DEPTH_TEST) // 开启隐藏面消除

    webgl.clearColor(1.0, 1.0, 1.0, 1.0)
    webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT)
    webgl.drawElements(webgl.TRIANGLES, 36, webgl.UNSIGNED_BYTE, 0) // 绘制三角形，从第1个顶点开始绘制3个顶点

    var ctx = this._canvas.getContext('2d')
    ctx && ctx.drawImage(Renderer.sCanvas, 0, 0)
  }
}

// vertex shader program
Renderer.sVshPgm = [
  'precision mediump float;',
  'attribute vec4 a_Position;',
  'attribute vec4 a_Color;',
  'uniform mat4 u_Matrix;',
  'varying vec4 v_Color;',
  'void main()',
  '{',
  '   gl_Position = u_Matrix * a_Position;', // 设置坐标
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
