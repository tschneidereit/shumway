/// <reference path='all.ts'/>
/// <reference path="WebGL.d.ts" />

module Shumway.GL {
  var traceLevel = 0;
  var SCRATCH_CANVAS_SIZE = 1024;
  var TILE_SIZE = 128;

  enum TraceLevel {
    None,
    Brief,
    Verbose,
  }
  var release = true;
  export var writer: IndentingWriter = null;
  export var timeline: Timeline = null;

  import Point = Shumway.Geometry.Point;
  import Point3D = Shumway.Geometry.Point3D;
  import Matrix = Shumway.Geometry.Matrix;
  import Matrix3D = Shumway.Geometry.Matrix3D;
  import Rectangle = Shumway.Geometry.Rectangle;
  import RegionAllocator = Shumway.Geometry.RegionAllocator;

  import Frame = Shumway.Layers.Frame;
  import Stage = Shumway.Layers.Stage;
  import Shape = Shumway.Layers.Shape;
  import Flake = Shumway.Layers.Elements.Flake;
  import SolidRectangle = Shumway.Layers.SolidRectangle;
  import Video = Shumway.Layers.Video;
  import Filter = Shumway.Layers.Filter;
  import BlurFilter = Shumway.Layers.BlurFilter;

  import TileCache = Shumway.Geometry.TileCache;
  import Tile = Shumway.Geometry.Tile;
  import OBB = Shumway.Geometry.OBB;

  import radianToDegrees = Shumway.Geometry.radianToDegrees;
  import degreesToRadian = Shumway.Geometry.degreesToRadian;

  function count(name) {
    Counter.count(name);
    FrameCounter.count(name);
  }

  export var SHADER_ROOT = "shaders/";

  function endsWith(str, end) {
    return str.indexOf(end, this.length - end.length) !== -1;
  }

  class WebGLContextState {
    parent: WebGLContextState;
    transform: Matrix;
    target: WebGLTexture;
    constructor(parent: WebGLContextState = null) {
      this.parent = parent;
      if (parent) {
        this.target = parent.target;
        this.transform = parent.transform.clone();
      } else {
        this.target = null;
        this.transform = Matrix.createIdentity();
      }
    }
  }

  export class Color {
    public r: number;
    public g: number;
    public b: number;
    public a: number;
    constructor(r: number, g: number, b: number, a: number) {
      this.r = r;
      this.g = g;
      this.b = b;
      this.a = a;
    }
    set (other: Color) {
      this.r = other.r;
      this.g = other.g;
      this.b = other.b;
      this.a = other.a;
    }
    public static Red   = new Color(1, 0, 0, 1);
    public static Green = new Color(0, 1, 0, 1);
    public static Blue  = new Color(0, 0, 1, 1);
    public static None  = new Color(0, 0, 0, 0);
    public static White = new Color(1, 1, 1, 1);
    public static Black = new Color(0, 0, 0, 1);
    private static colorCache: { [color: string]: Color } = {};
    public static randomColor(alpha: number = 1): Color {
      return new Color(Math.random(), Math.random(), Math.random(), alpha);
    }
    public static parseColor(color: string) {
      if (!Color.colorCache) {
        Color.colorCache = Object.create(null);
      }
      if (Color.colorCache[color]) {
        return Color.colorCache[color];
      }
      // TODO: Obviously slow, but it will do for now.
      var span = document.createElement('span');
      document.body.appendChild(span);
      span.style.backgroundColor = color;
      var rgb = getComputedStyle(span).backgroundColor;
      document.body.removeChild(span);
      var m = /^rgb\((\d+), (\d+), (\d+)\)$/.exec(rgb);
      if (!m) m = /^rgba\((\d+), (\d+), (\d+), ([\d.]+)\)$/.exec(rgb);
      var result = new Color(0, 0, 0, 0);
      result.r = parseFloat(m[1]) / 255;
      result.g = parseFloat(m[2]) / 255;
      result.b = parseFloat(m[3]) / 255;
      result.a = m[4] ? parseFloat(m[4]) / 255 : 1;
      return Color.colorCache[color] = result;
    }
  }

  export class Vertex extends Shumway.Geometry.Point3D {
    constructor (x: number, y: number, z: number) {
      super(x, y, z);
    }
    static createEmptyVertices<T extends Vertex>(type: new (x: number, y: number, z: number) => T, count: number): T [] {
      var result = [];
      for (var i = 0; i < count; i++) {
        result.push(new type(0, 0));
      }
      return result;
    }
  }

  export class WebGLTextureRegion implements ILinkedListNode<WebGLTextureRegion> {
    texture: WebGLTexture;
    region: RegionAllocator.Region;
    uses: number = 0;
    next: WebGLTextureRegion;
    previous: WebGLTextureRegion;
    constructor(texture: WebGLTexture, region: RegionAllocator.Region) {
      this.texture = texture;
      this.region = region;
      this.texture.regions.push(this);
      this.next = this.previous = null;
    }
  }

  export class WebGLTextureAtlas {
    texture: WebGLTexture;

    private _context: WebGLContext;
    private _regionAllocator: RegionAllocator.IRegionAllocator;
    private _w: number;
    private _h: number;
    private _solitary: boolean;

    get w(): number {
      return this._w;
    }

    get h(): number {
      return this._h;
    }

    constructor(context: WebGLContext, texture: WebGLTexture, w: number, h: number, solitary: boolean = false) {
      this._context = context;
      this.texture = texture;
      this._w = w;
      this._h = h;
      this._solitary = solitary;
      this.reset();
    }

    add(image: any, w: number, h: number): RegionAllocator.Region {
      var gl = this._context.gl;
      var region = this._regionAllocator.allocate(w, h);
      if (!region) {
        return;
      }
      if (image) {
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        timeline.enter("texSubImage2D");
        gl.texSubImage2D(gl.TEXTURE_2D, 0, region.x, region.y, gl.RGBA, gl.UNSIGNED_BYTE, image);
        console.info("WRITE: " + region);
        timeline.leave("texSubImage2D");
        count("texSubImage2D");
      }
      return region;
    }

    remove(region: RegionAllocator.Region) {
      this._regionAllocator.free(region);
    }

    reset() {
      this._regionAllocator = new RegionAllocator.Grid(this._w, this._h, TILE_SIZE, this._solitary ? 0 : 0);
    }
  }

  export interface ILinkedListNode<T> {
    next: T;
    previous: T;
  }

  /**
   * Maintains a LRU doubly-linked list.
   */
  export class LRUList<T extends ILinkedListNode<T>> {
    private _head: T;
    private _tail: T;
    private _count: number = 0;

    public get count() {
      return this._count;
    }

    get head(): T {
      return this._head;
    }

    constructor() {
      this._head = this._tail = null;
    }

    private _unshift(node: T) {
      assert (!node.next && !node.previous);
      if (this._count === 0) {
        this._head = this._tail = node;
      } else {
        node.next = this._head;
        node.next.previous = node;
        this._head = node;
      }
      this._count ++;
    }

    private _remove(node: T) {
      assert (this._count > 0);
      if (node === this._head && node === this._tail) {
        this._head = this._tail = null;
      } else if (node === this._head) {
        this._head = node.next;
        this._head.previous = null;
      } else if (node == this._tail) {
        this._tail = node.previous;
        this._tail.next = null;
      } else {
        node.previous.next = node.next;
        node.next.previous = node.previous;
      }
      node.previous = node.next = null;
      this._count --;
    }

    put(node: T) {
      if (this._head === node) {
        return;
      }
      if (node.next || node.previous || this._tail === node) {
        this._remove(node);
      }
      this._unshift(node);
    }

    pop(): T {
      if (!this._tail) {
        return null;
      }
      var node = this._tail;
      this._remove(node);
      return node;
    }

    /**
     * Visits each node in the list in the forward or reverse direction as long as
     * the callback returns |true|;
     */
    visit(callback: (T) => boolean, forward: boolean = true) {
      var node: T = forward ? this._head : this._tail;
      while (node) {
        if (!callback(node)) {
          break;
        }
        node = forward ? node.next : node.previous;
      }
    }
  }

  export class WebGLContext {
    private static MAX_TEXTURES = 8;

    public gl: WebGLRenderingContext;
    private _canvas: HTMLCanvasElement;
    private _w: number;
    private _h: number;
    private _programCache: {};
    private _maxTextures: number;
    private _maxTextureSize: number;
    public _backgroundColor: Color;

    private _state: WebGLContextState = new WebGLContextState();
    private _geometry: WebGLGeometry;
    private _tmpVertices: Vertex [];
    private _fillColor: Color = Color.Red;

    private _textures: WebGLTexture [];
    textureRegionCache: any = new LRUList<WebGLTextureRegion>();

    private _isTextureMemoryAvailable:boolean = true;

    public modelViewProjectionMatrix: Matrix3D = Matrix3D.createIdentity();

    public isTextureMemoryAvailable() {
      return this._isTextureMemoryAvailable;
    }

    getTextures(): WebGLTexture [] {
      return this._textures;
    }

    scratch: WebGLTexture [];

    get width(): number {
      return this._w;
    }

    set width(value: number) {
      this._w = value;
      this.updateViewport();
    }

    get height(): number {
      return this._h;
    }

    set height(value: number) {
      this._h = value;
      this.updateViewport();
    }

    set fillStyle(value: any) {
      this._fillColor.set(Color.parseColor(value));
    }

    constructor (canvas: HTMLCanvasElement, options: any) {
      this._canvas = canvas;

      this.gl = <WebGLRenderingContext> (
        canvas.getContext("experimental-webgl", {
          preserveDrawingBuffer: true,
          antialias: true,
          stencil: true,
          premultipliedAlpha: false
        })
      );
      assert (this.gl, "Cannot create WebGL context.");
      this._programCache = Object.create(null);
      this.gl.viewport(0, 0, this._w, this._h);
      this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this.gl.ONE);
      this._w = canvas.width;
      this._h = canvas.height;
      this.updateViewport();
      this._backgroundColor = Shumway.Util.Color.parseColor(this._canvas.style.backgroundColor);

      this._geometry = new WebGLGeometry(this);
      this._tmpVertices = Vertex.createEmptyVertices(Vertex, 64);

      this._textures = [];
      this._maxTextures = options ? options.maxTextures : 8;
      this._maxTextureSize = options ? options.maxTextureSize : 1024;

      this.scratch = [
        this.createTexture(512, 512),
        this.createTexture(512, 512)
      ];

      // this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
      this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
      this.gl.enable(this.gl.BLEND);
      this.gl.enable(this.gl.DEPTH_TEST);
      this.modelViewProjectionMatrix = Matrix3D.create2DProjection(this._w, this._h, 2000);
    }

    public create2DProjectionMatrix(): Matrix3D {
      return Matrix3D.create2DProjection(this._w, this._h, -this._w);
    }

    public createPerspectiveMatrix(cameraDistance: number, fov: number, angle: number): Matrix3D {
      var cameraAngleRadians = degreesToRadian(angle);

      // Compute the projection matrix
      var projectionMatrix = Matrix3D.createPerspective(degreesToRadian(fov), 1, 0.1, 5000);

      var up = new Point3D(0, 1, 0);
      var target = new Point3D(0, 0, 0);
      var camera = new Point3D(0, 0, cameraDistance);
      var cameraMatrix = Matrix3D.createCameraLookAt(camera, target, up);
      var viewMatrix = Matrix3D.createInverse(cameraMatrix);

      var matrix = Matrix3D.createIdentity();
      matrix = Matrix3D.createMultiply(matrix, Matrix3D.createTranslation(-this.width / 2, -this.height / 2, 0));
      matrix = Matrix3D.createMultiply(matrix, Matrix3D.createScale(1 / this.width, -1 / this.height, 1 / 100));
      matrix = Matrix3D.createMultiply(matrix, Matrix3D.createYRotation(cameraAngleRadians));
      matrix = Matrix3D.createMultiply(matrix, viewMatrix);
      matrix = Matrix3D.createMultiply(matrix, projectionMatrix);
      return matrix;
    }

    private discardCachedImages() {
      traceLevel >= TraceLevel.Verbose && writer.writeLn("Discard Cache");
      // var count = this.textureRegionCache.count / 2 | 0;
      var count = this.textureRegionCache.count;
      for (var i = 0; i < this.textureRegionCache.count; i++) {
        var textureRegion = this.textureRegionCache.pop();
        traceLevel >= TraceLevel.Verbose && writer.writeLn("Discard: " + textureRegion);
        textureRegion.texture.atlas.remove(textureRegion.region);
        textureRegion.texture = null;
      }
    }
    public cacheImage(image: any, solitary: boolean, discardCache: boolean = true): WebGLTextureRegion {
      var w = image.width;
      var h = image.height;
      var region: RegionAllocator.Region, texture: WebGLTexture;
      if (!solitary) {
        for (var i = 0; i < this._textures.length; i++) {
          texture = this._textures[i];
          region = texture.atlas.add(image, w, h);
          if (region) {
            break;
          }
        }
      }
      if (!region) {
        var aw = solitary ? w : this._maxTextureSize;
        var ah = solitary ? h : this._maxTextureSize;
        if (this._textures.length === this._maxTextures) {
          if (discardCache) {
            this.discardCachedImages();
            return this.cacheImage(image, solitary, false);
          }
          return null;
        } else {
          texture = this.createTexture(aw, ah, solitary);
        }
        this._textures.push(texture);
        region = texture.atlas.add(image, w, h);
        assert (region);
      }
      traceLevel >= TraceLevel.Verbose && writer.writeLn("Uploading Image: @ " + region);
      var textureRegion = new WebGLTextureRegion(texture, region);
      return textureRegion;
    }

    public allocateTextureRegion(w: number, h: number): WebGLTextureRegion {
      var texture = this.createTexture(w, h, true);
      var region = texture.atlas.add(null, w, h);
      this._textures.push(texture);
      return new WebGLTextureRegion(texture, region);
    }

    public updateTextureRegion(image: any, textureRegion: WebGLTextureRegion) {
      var gl = this.gl;
      gl.bindTexture(gl.TEXTURE_2D, textureRegion.texture);
      timeline.enter("texSubImage2D");
      gl.texSubImage2D(gl.TEXTURE_2D, 0, textureRegion.region.x, textureRegion.region.y, gl.RGBA, gl.UNSIGNED_BYTE, image);
      timeline.leave("texSubImage2D");
    }

    /**
     * Find a texture with available space.
     */
    private recycleTexture(): WebGLTexture {
      traceLevel >= TraceLevel.Verbose && writer.writeLn("Recycling Texture");
      // var texture: WebGLTexture = this._textures.shift();
      var texture: WebGLTexture = this._textures.splice(Math.random() * this._textures.length | 0, 1)[0];
      var regions = texture.regions;
      for (var i = 0; i < regions.length; i++) {
        regions[i].texture = null;
      }
      texture.atlas.reset();
      count("evictTexture");
      return texture;
    }

    private updateViewport() {
      var gl = this.gl;
      gl.viewport(0, 0, this._w, this._h);

      for (var k in this._programCache) {
        this.initializeProgram(this._programCache[k]);
      }
    }

    private initializeProgram(program: WebGLProgram) {
      var gl = this.gl;
      gl.useProgram(program);
      // gl.uniform2f(program.uniforms.uResolution.location, this._w, this._h);
    }

    private createShaderFromFile(file: string) {
      var path = SHADER_ROOT + file;
      var gl = this.gl;
      var request = new XMLHttpRequest();
      request.open("GET", path, false);
      request.send();
      assert(request.status === 200 ||
             (request.status === 0 && request.response),
             "File : " + path + " not found.");
      var shaderType;
      if (endsWith(path, ".vert")) {
        shaderType = gl.VERTEX_SHADER;
      } else if (endsWith(path, ".frag")) {
        shaderType = gl.FRAGMENT_SHADER;
      } else {
        throw "Shader Type: not supported.";
      }
      return this.createShader(shaderType, request.responseText);
    }

    public createProgramFromFiles(vertex: string, fragment: string) {
      var key = vertex + "-" + fragment;
      var program = this._programCache[key];
      if (!program) {
        program = this.createProgram([
          this.createShaderFromFile(vertex),
          this.createShaderFromFile(fragment)
        ]);
        this.queryProgramAttributesAndUniforms(program);
        this.initializeProgram(program);
        this._programCache[key] = program;

      }
      return program;
    }

    private createProgram(shaders): WebGLProgram {
      var gl = this.gl;
      var program = gl.createProgram();
      shaders.forEach(function (shader) {
        gl.attachShader(program, shader);
      });
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        var lastError = gl.getProgramInfoLog(program);
        unexpected("Cannot link program: " + lastError);
        gl.deleteProgram(program);
      }
      return program;
    }

    private createShader(shaderType, shaderSource): WebGLShader {
      var gl = this.gl;
      var shader = gl.createShader(shaderType);
      gl.shaderSource(shader, shaderSource);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        var lastError = gl.getShaderInfoLog(shader);
        unexpected("Cannot compile shader: " + lastError);
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    createTexture(w: number, h: number, solitary: boolean = false, data = null): WebGLTexture {
      var gl = this.gl;
      var texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
      texture.w = w;
      texture.h = h;
      texture.atlas = new WebGLTextureAtlas(this, texture, w, h, solitary);
      texture.framebuffer = this.createFramebuffer(texture);
      texture.regions = [];
      return texture;
    }

    createFramebuffer(texture: WebGLTexture): WebGLFramebuffer {
      var gl = this.gl;
      var framebuffer: WebGLFramebuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      return framebuffer;
    }

    private queryProgramAttributesAndUniforms(program) {
      program.uniforms = {};
      program.attributes = {};

      var gl = this.gl;
      for (var i = 0, j = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES); i < j; i++) {
        var attribute = gl.getActiveAttrib(program, i);
        program.attributes[attribute.name] = attribute;
        attribute.location = gl.getAttribLocation(program, attribute.name);
      }
      for (var i = 0, j = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS); i < j; i++) {
        var uniform = gl.getActiveUniform(program, i);
        program.uniforms[uniform.name] = uniform;
        uniform.location = gl.getUniformLocation(program, uniform.name);
      }
    }

    public save() {
      this._state = new WebGLContextState(this._state);
    }

    public restore() {
      if (this._state.parent) {
        this._state = this._state.parent;
      }
    }

    public transform(a: number, b: number, c: number, d: number, tx: number, ty: number) {
      this._state.transform.transform(a, b, c, d, tx, ty);
    }

    public setTransform(transform: Matrix) {
      this._state.transform.set(transform)
    }

    public setTarget(target: WebGLTexture) {
      this._state.target = target;
      var gl = this.gl;
      gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.framebuffer : null);
    }

    public clear(color: Color = Color.None) {
      var gl = this.gl;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }

    public sizeOf(type): number {
      var gl = this.gl;
      switch (type) {
        case gl.UNSIGNED_BYTE:
          return 1;
        case gl.UNSIGNED_SHORT:
          return 2;
        case this.gl.INT:
        case this.gl.FLOAT:
          return 4;
        default:
          notImplemented(type);
      }
    }

    public beginPath() {

    }

    public closePath() {

    }

    public stroke() {

    }

    public rect() {

    }
  }

  export class WebGLStageRenderer {
    context: WebGLContext;

    private _brush: WebGLCombinedBrush;
    private _brushGeometry: WebGLGeometry;

    private _stencilBrush: WebGLCombinedBrush;
    private _stencilBrushGeometry: WebGLGeometry;

    private _tmpVertices: Vertex [] = Vertex.createEmptyVertices(Vertex, 64);

    private _scratchCanvas: HTMLCanvasElement;
    private _scratchCanvasContext: CanvasRenderingContext2D;

    constructor(context: WebGLContext) {
      this.context = context;

      this._brushGeometry = new WebGLGeometry(context);
      this._brush = new WebGLCombinedBrush(context, this._brushGeometry);

      this._stencilBrushGeometry = new WebGLGeometry(context);
      this._stencilBrush = new WebGLCombinedBrush(context, this._stencilBrushGeometry);

      this._scratchCanvas = document.createElement("canvas");
      this._scratchCanvas.width = this._scratchCanvas.height = SCRATCH_CANVAS_SIZE;
      this._scratchCanvasContext = this._scratchCanvas.getContext("2d");
    }

    private _cachedTiles = [];

    public render(stage: Stage, options: any) {

      if (options.perspectiveCamera) {
        this.context.modelViewProjectionMatrix = this.context.createPerspectiveMatrix (
          options.perspectiveCameraDistance,
          options.perspectiveCameraFOV,
          options.perspectiveCameraAngle
        );
      } else {
        this.context.modelViewProjectionMatrix = this.context.create2DProjectionMatrix();
      }

      var that = this;
      var context = this.context;

      var brush = this._brush;
      brush.reset();

      var stencilBrush = this._stencilBrush;
      var viewport = new Rectangle(0, 0, stage.w, stage.h);
      var image;
      var inverseTransform = Matrix.createIdentity();

      function cacheImageCallback(src: CanvasRenderingContext2D, srcBounds: Rectangle): WebGLTextureRegion {
        return context.cacheImage(src.getImageData(srcBounds.x, srcBounds.y, srcBounds.w, srcBounds.h), false);
      }

      var gl = context.gl;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      var depth = 0;

      brush.reset();
      brush.fillRectangle(viewport, new Color(0.2, 0, 0, 1), Matrix.createIdentity(), depth);
      brush.flush(options.drawElements);
      brush.reset();

      stage.visit(function (frame: Frame, transform?: Matrix) {
        depth += options.frameSpacing;
        that.context.setTransform(transform);
        if (frame instanceof Flake) {
          brush.fillRectangle(new Rectangle(0, 0, frame.w, frame.h), Color.parseColor((<Flake>frame).fillStyle), transform, depth);
        } else if (frame instanceof SolidRectangle) {
          brush.fillRectangle(new Rectangle(0, 0, frame.w, frame.h), Color.parseColor((<SolidRectangle>frame).fillStyle), transform, depth);
        } else if (frame instanceof Video) {
          var video = <Video>frame;
          var src = <WebGLTextureRegion>(video.source);
          brush.drawImage(src, undefined, new Color(1, 1, 1, frame.alpha), transform, depth)
        } else if (frame instanceof Shape) {
          var shape = <Shape>frame;
          var bounds = shape.source.getBounds();
          if (!bounds.isEmpty()) {
            var source = shape.source;
            var tileSize = TILE_SIZE;
            if (bounds.w < 64 || bounds.h < 64) {
              tileSize = 64;
            }
            var tileCache: RenderableTileCache = source.properties["tileCache"];
            if (!tileCache) {
              tileCache = source.properties["tileCache"] = new RenderableTileCache(source, tileSize);
            }
            transform.inverse(inverseTransform);
            var tiles = tileCache.fetchTiles(viewport, inverseTransform, that._scratchCanvasContext, cacheImageCallback);
            for (var i = 0; i < tiles.length; i++) {
              var tile = tiles[i];
              var tileTransform = Matrix.createIdentity();
              tileTransform.translate(tile.bounds.x, tile.bounds.y);
              tileTransform.concat(transform);
              var src = <WebGLTextureRegion>(tile.cachedTextureRegion);
              if (src && src.texture) {
                context.textureRegionCache.put(src);
              }

              if (!brush.drawImage(src, undefined, new Color(1, 1, 1, frame.alpha), tileTransform, depth)) {
                brush.flush(options.drawElements);
                brush.reset();
                brush.drawImage(src, undefined, new Color(1, 1, 1, frame.alpha), tileTransform, depth);
              }
              if (options.drawTiles) {
                var srcBounds = tile.bounds.clone();
                if (!tile.color) {
                  tile.color = Color.randomColor(0.2);
                }
                brush.fillRectangle(new Rectangle(0, 0, srcBounds.w, srcBounds.h), tile.color, tileTransform, depth);
              }
            }
          }
        }
      }, stage.transform);

      brush.flush(options.drawElements);

      if (options.drawTextures) {
        brush.reset();
        var textures = context.getTextures();
        var textureWindowSize = viewport.w / 5;
        var transform = Matrix.createIdentity();
        if (textureWindowSize > viewport.h / textures.length) {
          textureWindowSize = viewport.h / textures.length;
        }
        brush.fillRectangle(new Rectangle(viewport.w - textureWindowSize, 0, textureWindowSize, 1024 * 16), new Color(0, 0, 0, 0.5), transform);
        brush.flush(options.drawElements);
        brush.reset();
        for (var i = 0; i < textures.length; i++) {
          var texture = textures[i];
          var textureWindow = new Rectangle(viewport.w - textureWindowSize, i * textureWindowSize, textureWindowSize, textureWindowSize);
          brush.drawImage(new WebGLTextureRegion(texture, <RegionAllocator.Region>new Rectangle(0, 0, texture.w, texture.h)), textureWindow, Color.White, transform);
        }
        brush.flush(options.drawElements);
      }
    }
  }

  export class RenderableTileCache {
    cache: TileCache;
    source: IRenderable;
    constructor(source: IRenderable, size) {
      this.source = source;
      var bounds = source.getBounds();
      this.cache = new TileCache(bounds.w, bounds.h, size);
    }
    fetchTiles(query: Rectangle,
               transform: Matrix,
               scratchContext: CanvasRenderingContext2D,
               cacheImageCallback: (src: CanvasRenderingContext2D, srcBounds: Rectangle) => WebGLTextureRegion): Tile [] {
      var tiles = this.cache.getTiles(query, transform);
      var uncachedTilesBounds = null;
      var uncachedTiles: Tile [] = [];
      for (var i = 0; i < tiles.length; i++) {
        var tile = tiles[i];
        if (!tile.cachedTextureRegion || !tile.cachedTextureRegion.texture) {
          if (!uncachedTilesBounds) {
            uncachedTilesBounds = Rectangle.createEmpty();
          }
          uncachedTilesBounds.union(tile.bounds);
          uncachedTiles.push(tile);
        }
      }
      if (uncachedTilesBounds) {
        this.cacheTiles(scratchContext, uncachedTilesBounds, uncachedTiles, cacheImageCallback);

        var points = Point.createEmptyPoints(4);
        transform.transformRectangle(query, points);
        scratchContext.strokeStyle = "white";
        scratchContext.beginPath();
        scratchContext.moveTo(points[0].x, points[0].y);
        scratchContext.lineTo(points[1].x, points[1].y);
        scratchContext.lineTo(points[2].x, points[2].y);
        scratchContext.lineTo(points[3].x, points[3].y);
        scratchContext.closePath();
        scratchContext.stroke();
      }

      return tiles;
    }
    private cacheTiles(scratchContext: CanvasRenderingContext2D,
                       uncachedTileBounds: Rectangle,
                       uncachedTiles: Tile [],
                       cacheImageCallback: (src: CanvasRenderingContext2D, srcBounds: Rectangle) => WebGLTextureRegion) {
      var scratchBounds = new Rectangle(0, 0, scratchContext.canvas.width, scratchContext.canvas.height);
      while (true) {
        scratchContext.save();
        scratchContext.setTransform(1, 0, 0, 1, 0, 0);
        scratchContext.clearRect(0, 0, scratchBounds.w, scratchBounds.h);
        scratchContext.translate(-uncachedTileBounds.x, -uncachedTileBounds.y);
        timeline.enter("renderTiles");
        this.source.render(scratchContext);
        scratchContext.restore();
        timeline.leave("renderTiles");

        var remainingUncachedTiles = null, remainingUncachedTilesBounds = null;
        for (var i = 0; i < uncachedTiles.length; i++) {
          var tile = uncachedTiles[i];
          var region = tile.bounds.clone();
          region.x -= uncachedTileBounds.x;
          region.y -= uncachedTileBounds.y;
          if (!scratchBounds.contains(region)) {
            if (!remainingUncachedTiles) {
              remainingUncachedTiles = [];
              remainingUncachedTilesBounds = Rectangle.createEmpty();
            }
            remainingUncachedTiles.push(tile);
            remainingUncachedTilesBounds.union(tile.bounds);
          }
          tile.cachedTextureRegion = cacheImageCallback(scratchContext, region);
  //        context.fillStyle = "rgba(255, 0, 0, 0.5)";
  //        context.fillRect(tile.bounds.x, tile.bounds.y, tile.bounds.w, tile.bounds.h);
  //        context.strokeStyle = "rgba(255, 255, 255, 0.5)";
  //        context.strokeRect(tile.bounds.x, tile.bounds.y, tile.bounds.w, tile.bounds.h);
  //        context.fillStyle = "black";
  //        context.font = "12px Consolas";
  //        context.fillText(String(tile.index), tile.bounds.x + 2, tile.bounds.y + 10);
        }
        if (remainingUncachedTiles) {
          uncachedTiles = remainingUncachedTiles;
          uncachedTileBounds = remainingUncachedTilesBounds;
          continue;
        }
        break;
      }
    }
  }

  export class WebGLBrush {
    context: WebGLContext;
    geometry: WebGLGeometry;
    constructor(context: WebGLContext, geometry: WebGLGeometry) {
      this.context = context;
      this.geometry = geometry;
    }
  }

  export enum WebGLCombinedBrushKind {
    FillColor,
    FillTexture
  }

  export class WebGLCombinedBrushVertex extends Vertex {
    static attributeList: WebGLAttributeList;
    static initializeAttributeList(context) {
      var gl = context.gl;
      if (WebGLCombinedBrushVertex.attributeList) {
        return;
      }
      WebGLCombinedBrushVertex.attributeList = new WebGLAttributeList([
        new WebGLAttribute("aPosition", 3, gl.FLOAT),
        new WebGLAttribute("aCoordinate", 2, gl.FLOAT),
        new WebGLAttribute("aColor", 4, gl.UNSIGNED_BYTE, true),
        new WebGLAttribute("aKind", 1, gl.FLOAT),
        new WebGLAttribute("aSampler", 1, gl.FLOAT)
      ]);
      WebGLCombinedBrushVertex.attributeList.initialize(context);
    }
    kind: WebGLCombinedBrushKind = WebGLCombinedBrushKind.FillColor;
    color: Color = new Color(0, 0, 0, 0);
    sampler: number = 0;
    coordinate: Point = new Point(0, 0);
    constructor (x: number, y: number, z: number) {
      super(x, y, z);
    }
    public writeTo(geometry: WebGLGeometry) {
      var array = geometry.array;
      array.ensureAdditionalCapacity(68);
      array.writeVertex3DUnsafe(this.x, this.y, this.z);
      array.writeVertexUnsafe(this.coordinate.x, this.coordinate.y);
      array.writeColorUnsafe(this.color.r * 255, this.color.g * 255, this.color.b * 255, this.color.a * 255);
      array.writeFloatUnsafe(this.kind);
      array.writeFloatUnsafe(this.sampler);
    }
  }


  export class WebGLCombinedBrush extends WebGLBrush {
    static tmpVertices: WebGLCombinedBrushVertex [] = Vertex.createEmptyVertices(WebGLCombinedBrushVertex, 4);
    program: WebGLProgram;
    textures: WebGLTexture [];
    static depth: number = 1;
    constructor(context: WebGLContext, geometry: WebGLGeometry) {
      super(context, geometry);
      this.program = context.createProgramFromFiles("combined.vert", "combined.frag");
      this.textures = [];
      WebGLCombinedBrushVertex.initializeAttributeList(this.context);
    }

    public reset() {
      this.textures = [];
      this.geometry.reset();
    }

    public drawImage(src: WebGLTextureRegion, dstRectangle: Rectangle, color: Color, transform: Matrix, depth: number = 0): boolean {
      if (!src || !src.texture) {
        return true;
      }
      if (!dstRectangle) {
        dstRectangle = new Rectangle(0, 0, src.region.w, src.region.h);
      } else {
        dstRectangle = dstRectangle.clone();
      }
      var sampler = this.textures.indexOf(src.texture);
      if (sampler < 0) {
        this.textures.push(src.texture);
        if (this.textures.length > 8) {
          return false;
          notImplemented("Cannot handle more than 8 texture samplers.");
        }
        sampler = this.textures.length - 1;
      }
      var tmpVertices = WebGLCombinedBrush.tmpVertices;
      var srcRectangle = src.region.clone();
      srcRectangle.offset(0.5, 0.5).resize(-1, -1);
      srcRectangle.scale(1 / src.texture.w, 1 / src.texture.h);
      transform.transformRectangle(dstRectangle, <Point[]>tmpVertices);
      for (var i = 0; i < 4; i++) {
        tmpVertices[i].z = depth;
      }
      tmpVertices[0].coordinate.x = srcRectangle.x;
      tmpVertices[0].coordinate.y = srcRectangle.y;
      tmpVertices[1].coordinate.x = srcRectangle.x + srcRectangle.w;
      tmpVertices[1].coordinate.y = srcRectangle.y;
      tmpVertices[2].coordinate.x = srcRectangle.x + srcRectangle.w;
      tmpVertices[2].coordinate.y = srcRectangle.y + srcRectangle.h;
      tmpVertices[3].coordinate.x = srcRectangle.x;
      tmpVertices[3].coordinate.y = srcRectangle.y + srcRectangle.h;

//      for (var i = 0; i < 4; i++) {
//        tmpVertices[i].x = tmpVertices[i].x | 0;
//        tmpVertices[i].y = tmpVertices[i].y | 0;
//      }
      for (var i = 0; i < 4; i++) {
        var vertex = WebGLCombinedBrush.tmpVertices[i];
        vertex.kind = WebGLCombinedBrushKind.FillTexture;
        vertex.color.set(color);
        vertex.sampler = sampler;
        var v = this.context.modelViewProjectionMatrix.mul(vertex);
        vertex.writeTo(this.geometry);
      }
      this.geometry.addQuad();
      return true;
    }

    public fillRectangle(rectangle: Rectangle, color: Color, transform: Matrix, depth: number = 0) {
      transform.transformRectangle(rectangle, <Point[]>WebGLCombinedBrush.tmpVertices);
      for (var i = 0; i < 4; i++) {
        var vertex = WebGLCombinedBrush.tmpVertices[i];
        vertex.kind = WebGLCombinedBrushKind.FillColor;
        vertex.color.set(color);
        vertex.z = depth;
        vertex.writeTo(this.geometry);
      }
      this.geometry.addQuad();
    }

    public flush(drawElements: boolean = true) {
      var g = this.geometry;
      var p = this.program;
      var gl = this.context.gl;

      g.uploadBuffers();
      gl.useProgram(p);
      // gl.uniformMatrix3fv(p.uniforms.uTransformMatrix.location, false, Matrix.createIdentity().toWebGLMatrix());
      gl.uniformMatrix4fv(p.uniforms.uTransformMatrix3D.location, false, this.context.modelViewProjectionMatrix.toWebGLMatrix());


      // Bind textures.
      for (var i = 0; i < this.textures.length; i++) {
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
      }
      gl.uniform1iv(p.uniforms["uSampler[0]"].location, [0, 1, 2, 3, 4, 5, 6, 7]);
      // Bind vertex buffer.
      gl.bindBuffer(gl.ARRAY_BUFFER, g.buffer);
      var size = WebGLCombinedBrushVertex.attributeList.size;
      var attributeList = WebGLCombinedBrushVertex.attributeList;
      var attributes: WebGLAttribute [] = attributeList.attributes;
      for (var i = 0; i < attributes.length; i++) {
        var attribute = attributes[i];
        var position = p.attributes[attribute.name].location;
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, attribute.size, attribute.type, attribute.normalized, size, attribute.offset);
      }
      // Bind elements buffer.
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, g.elementBuffer);
      if (drawElements) {
        gl.drawElements(gl.TRIANGLES, g.triangleCount * 3, gl.UNSIGNED_SHORT, 0);
      }
    }
  }
}
