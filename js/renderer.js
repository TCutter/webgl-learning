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

    // this._setModelMatrix()
    // this._setViewMatrix()
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

    var vertices = new Float32Array([
      // 顶点坐标和颜色      
      0.0, 0.5, -0.4, 0.4, 1.0, 0.4, // 绿色三角形在最后面
      -0.5, -0.5, -0.4, 0.4, 1.0, 0.4,
      0.5, -0.5, -0.4, 1.0, 0.4, 0.4,

      0.5, 0.4, -0.2, 1.0, 0.4, 0.4, // 黄色三角形在中间
      -0.5, 0.4, -0.2, 1.0, 1.0, 0.4,
      0.0, -0.6, -0.2, 1.0, 1.0, 0.4,

      0.0, 0.5, 0.0, 0.4, 0.4, 1.0, // 蓝色三角形在最前面
      -0.5, -0.5, 0.0, 0.4, 0.4, 1.0,
      0.5, -0.5, 0.0, 1.0, 0.4, 0.4
    ])

    // 创建缓冲区对象
    var buffer = webgl.createBuffer()
    webgl.bindBuffer(webgl.ARRAY_BUFFER, buffer)
    webgl.bufferData(webgl.ARRAY_BUFFER, vertices, webgl.STATIC_DRAW)
    const FSIZE = vertices.BYTES_PER_ELEMENT

    var a_Position = webgl.getAttribLocation(Renderer.sProgram, 'a_Position')
    webgl.vertexAttribPointer(a_Position, 3, webgl.FLOAT, false, FSIZE * 6, 0)
    webgl.enableVertexAttribArray(a_Position) 

    var a_Color = webgl.getAttribLocation(Renderer.sProgram, 'a_Color')
    webgl.vertexAttribPointer(a_Color, 3, webgl.FLOAT, false, FSIZE * 6, FSIZE * 3)
    webgl.enableVertexAttribArray(a_Color) 
  }

  // 设置模型视图矩阵，将 u_ViewMatrix 和 u_ModelMatrix 计算后的结果传给着色器
  _setViewModelMatrix () {
    var gl = Renderer.sWebgl

    var viewMatrix = mat4.lookAt(
      [g_eyeX, g_eyeY, g_eyeZ],
      [0, 0, 0],
      [0, 1, 0]
    )

    var modelMatrix = mat4.create()
    mat4.identity(modelMatrix)
    mat4.rotateZ(modelMatrix, -Math.PI * 10 / 180)
    
    var matrix = mat4.multiply(viewMatrix, modelMatrix)
    var u_Matrix = gl.getUniformLocation(Renderer.sProgram, 'u_Matrix')
    gl.uniformMatrix4fv(u_Matrix, false, matrix)
  }

  // 设置视图矩阵
  _setViewMatrix () {
    var gl = Renderer.sWebgl
    var u_ViewMatrix = gl.getUniformLocation(Renderer.sProgram, 'u_ViewMatrix')

    // 设置视点、视线和上方向
    var matrix = mat4.lookAt(
      [0.2, 0.25, 0.25],
      [0, 0, 0],
      [0, 1, 0]
    )
    gl.uniformMatrix4fv(u_ViewMatrix, false, matrix)
  }
  // 设置模型矩阵
  _setModelMatrix () {
    var gl = Renderer.sWebgl
    var u_ModelMatrix = gl.getUniformLocation(Renderer.sProgram, 'u_ModelMatrix')
    var matrix = mat4.create()
    mat4.identity(matrix)
    mat4.rotateZ(matrix, -Math.PI * 10 / 180)
    gl.uniformMatrix4fv(u_ModelMatrix, false, matrix)
  }

  _doDraw () {
    var webgl = Renderer.sWebgl

    webgl.canvas.width = this._canvas.width
    webgl.canvas.height = this._canvas.height
    webgl.viewport(0, 0, webgl.canvas.width, webgl.canvas.height)

    webgl.clearColor(0.0, 1.0, 1.0, 1.0)
    webgl.clear(webgl.COLOR_BUFFER_BIT)
    webgl.drawArrays(webgl.TRIANGLES, 0, 9) // 绘制三角形，从第1个顶点开始绘制3个顶点

    var ctx = this._canvas.getContext('2d')
    ctx && ctx.drawImage(Renderer.sCanvas, 0, 0)
  }
}

// vertex shader program
Renderer.sVshPgm = [
  'precision mediump float;',
  'attribute vec4 a_Position;',
  'attribute vec4 a_Color;',
  // 'uniform mat4 u_ModelMatrix;',
  // 'uniform mat4 u_ViewMatrix;',
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
  'varying vec2 v_TexCoord;',
  'varying vec4 v_Color;',
  'void main()',
  '{',
  '   gl_FragColor = v_Color;',
  '}'
].join('\n')
