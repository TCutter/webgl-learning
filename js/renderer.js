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

    this._setTransform()
    this._setColor()
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

  _setTransform () {
    var webgl = Renderer.sWebgl
    var mvMatrix = mat4.create()
    mat4.identity(mvMatrix)
    mat4.rotate(mvMatrix, Math.PI * 45 / 180, [0, 0, 1]) // 角度为正表示逆时针    
    mat4.translate(mvMatrix, [0.5, 0, 0]) // 沿X轴平移0.5的距离

    webgl.uniformMatrix4fv(webgl.getUniformLocation(Renderer.sProgram, 'mvMatrix'), false, mvMatrix)
  }

  /**
   * 只有描点时才能设置 gl_PointSize
   */
  _setSize () {
    var webgl = Renderer.sWebgl
    var a_PointSize = webgl.getAttribLocation(Renderer.sProgram, 'a_PointSize')
    if (a_PointSize < 0) {
      window.alert('Failed to get the storage location of a_PointSize')
      return
    }
    webgl.vertexAttrib1f(a_PointSize, 10.0)
  }

  _setColor () {
    var webgl = Renderer.sWebgl
    var u_FragColor = webgl.getUniformLocation(Renderer.sProgram, 'u_FragColor')
    if (u_FragColor == null) { // 不是 -1
      window.alert('Failed to get the storage location of u_FragColor')
      return
    }
    webgl.uniform4f(u_FragColor, 1.0, 0.0, 1.0, 1.0)
  }

    /**
   * 使用缓冲区对象一次性绘制多个顶点
   */
  _initVertexBuffers () {
    var webgl = Renderer.sWebgl

    // 三个顶点
    var vertices = [
      -0.5, 0.5, 
      -0.5, -0.5,
      0.5, 0.5
    ]

    // 每个顶点的分量个数（1 到 4）
    var size = 2

    // 创建缓冲区对象
    var buffer = webgl.createBuffer()
    // 将缓冲区对象绑定到 "目标"(即webgl.ARRAY_BUFFER)
    webgl.bindBuffer(webgl.ARRAY_BUFFER, buffer)
    // 向缓冲区对象中写入数据（不能直接向缓冲区写入数据， 只能向 “目标写入”）
    webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array(vertices), webgl.STATIC_DRAW)
    
    var a_Position = webgl.getAttribLocation(Renderer.sProgram, 'a_Position')
    // 将缓冲区对象(引用或指针)分配给 a_Position 变量
    webgl.vertexAttribPointer(a_Position, size, webgl.FLOAT, false, 0, 0)
    // 激活 a_Position 变量，使分配生效
    webgl.enableVertexAttribArray(a_Position)    
    return vertices.length / size
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
  'uniform mat4 mvMatrix;',
  'void main()',
  '{',
  '   gl_Position = mvMatrix * a_Position;', // 设置坐标
  '}'
].join('\n')

// fragment shader program
Renderer.sFshPgm = [
  'precision mediump float;',
  'uniform vec4 u_FragColor;',
  'void main()',
  '{',
  '   gl_FragColor = u_FragColor;',
  '}'
].join('\n')
