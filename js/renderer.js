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

    loadImage('https://cn.bing.com/th?id=OHR.FeatherSerpent_ZH-CN5706017355_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp')
    .then((image) => {
      this._loadTexture(image)
      this._doDraw()
      // var ctx = this._canvas.getContext('2d')
      // ctx && ctx.drawImage(image, 0, 0)
    })
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
      // 顶点坐标，纹理坐标可由顶点坐标坐标变换得到
      -0.5, 0.5,
      -0.5, -0.5,
      0.5, 0.5,
      0.5, -0.5
    ])

    // 创建缓冲区对象
    var buffer = webgl.createBuffer()
    webgl.bindBuffer(webgl.ARRAY_BUFFER, buffer)
    webgl.bufferData(webgl.ARRAY_BUFFER, vertices, webgl.STATIC_DRAW)
    
    var a_Position = webgl.getAttribLocation(Renderer.sProgram, 'a_Position')
    webgl.vertexAttribPointer(a_Position, 2, webgl.FLOAT, false, 0, 0)
    webgl.enableVertexAttribArray(a_Position) 
  }

  _loadTexture(image) {
    var gl = Renderer.sWebgl

    var textureObj = gl.createTexture() // 创建纹理对象
    var imageTexture = gl.getUniformLocation(Renderer.sProgram, 'imageTexture')
    
    gl.activeTexture(gl.TEXTURE0) // 开启0号纹理单元
    // 向targe绑定纹理对象，TEXTURE_2D 表示二维纹理
    gl.bindTexture(gl.TEXTURE_2D, textureObj)
    // 对纹理图像进行Y轴反转， 因为webgl坐标系统与图片（png、jpg等）的坐标系统的 Y 轴方向是相反的
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    
    // 配置纹理参数
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    /**
     * 将纹理图像（image）分配给纹理对象（TEXTURE_2D），同时告诉webgl一些图像的特性
     * gl.RGB 表示图像的内部格式
     */
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)
    
    gl.uniform1i(imageTexture, 0) // 将 0 号纹理传给着色器
  }

  _doDraw () {
    var webgl = Renderer.sWebgl

    webgl.canvas.width = this._canvas.width
    webgl.canvas.height = this._canvas.height
    webgl.viewport(0, 0, webgl.canvas.width, webgl.canvas.height)

    webgl.clearColor(0.0, 1.0, 1.0, 1.0)
    webgl.clear(webgl.COLOR_BUFFER_BIT)
    webgl.drawArrays(webgl.TRIANGLE_STRIP, 0, 4) // 绘制三角形，从第1个顶点开始绘制3个顶点

    var ctx = this._canvas.getContext('2d')
    ctx && ctx.drawImage(Renderer.sCanvas, 0, 0)
  }
}

// vertex shader program
Renderer.sVshPgm = [
  'precision mediump float;',
  'attribute vec4 a_Position;',
  'varying vec2 v_TexCoord;',
  'void main()',
  '{',
  '   gl_Position = a_Position;', // 设置坐标
  '   v_TexCoord = vec2(a_Position.x + 0.5, a_Position.y + 0.5);',
  '}'
].join('\n')

// fragment shader program
Renderer.sFshPgm = [
  'precision mediump float;',
  'varying vec2 v_TexCoord;',
  'uniform sampler2D imageTexture;',
  'void main()',
  '{',
  '   gl_FragColor = texture2D(imageTexture, v_TexCoord);',
  '}'
].join('\n')
