/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function SWFView(file, doc, container, config) {
  this._doc = doc;
  this._container = container;
  this._canvas = doc.createElement('canvas');
  this._ctx = this._canvas.getContext('2d');
  this._file = file;

  this._runtime = new Worker(config.paths.runtime);
  this._runtime.addEventListener('message', this._onRuntimeMessage.bind(this));
  this._initRuntime(config);
}
SWFView.prototype = {
  _initRuntime: function(config) {
    this._runtime.postMessage({type: 'init', config: config});
  },
  _initView: function(intrinsicWidth, intrinsicHeight) {
    this._renderBackend = new RenderBackend(this._ctx);
    var container = this._container;
    container.style.position = 'relative';

    var width = intrinsicWidth;
    var height = intrinsicHeight;

    if (container.clientHeight) {
      width = container.clientWidth;
      height = container.clientHeight;
      // TODO: also detect other reasons for canvas resizing
      window.addEventListener('resize', this._onWindowResize.bind(this));
    }

    this._canvas.width = width;
    this._canvas.height = height;

    container.appendChild(this._canvas);

    this._doc.addEventListener('visibilitychange',
                               this._onVisibilityChange.bind(this));

    var mouseListener = this._onMouseEvent.bind(this);

    this._canvas.addEventListener('click', mouseListener);
    this._canvas.addEventListener('dblclick', mouseListener);
    this._canvas.addEventListener('mousedown', mouseListener);
    this._canvas.addEventListener('mousemove', mouseListener);
    this._canvas.addEventListener('mouseup', mouseListener);
    this._canvas.addEventListener('mouseover', mouseListener);
    this._canvas.addEventListener('mouseout', mouseListener);
    
    var keyboardListener = this._onKeyboardEvent.bind(this);
    window.addEventListener('keydown', keyboardListener);
    window.addEventListener('keypress', keyboardListener);
    window.addEventListener('keyup', keyboardListener);
  },
  runSWF: function(file) {
    this._runtime.postMessage({
                                type: 'runSWF',
                                file: file,
                                viewWidth: this._container.clientWidth,
                                viewHeight: this._container.clientHeight
                              });
  },
  _onRuntimeMessage: function(event) {
    var message = event.data;
//    console.log('received by view: ' + message.type);
    switch (message.type) {
      case 'vmInit':
        this.runSWF(this._file);
        this._file = null;
        break;
      case 'viewInit':
        this._initView(message.width, message.height);
        break;
      case 'render':
        this._renderBackend.render(message.list);
        break;
      default:
        throw new Error('Unknown message received from SWF runtime: ' +
                        message.type);
    }
  },
  _onMouseEvent: function(event) {
    var data = {type: event.type};
    if (event.type === 'mousemove') {
      var node = this._canvas;
      var left = 0;
      var top = 0;
      if (node.offsetParent) {
        do {
          left += node.offsetLeft;
          top += node.offsetTop;
        } while ((node = node.offsetParent));
      }

      data.mouseX = event.pageX - left;
      data.mouseY = event.pageY - top;
    }
    this._runtime.postMessage({type: 'mouseEvent', data: data});
  },
  _onKeyboardEvent: function(event) {
    var data = {
      type: event.type, 
      keyCode: event.keyCode, 
      charCode: event.charCode,
      keyLocation: event.keyLocation,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      shiftKey: event.shiftKey
    };
    this._runtime.postMessage({type: 'keyboardEvent', data: data});
  },
  _onWindowResize: function(event) {
    var width = container.clientWidth;
    var height = container.clientHeight;
    if (width !== this._canvas.width || height !== this._canvas.height) {
      this._canvas.width = width;
      this._canvas.height = height;
      this._runtime.postMessage({
                                  type: 'viewResize',
                                  viewWidth: width,
                                  viewHeight: height
                                });
    }
  },
  _onVisibilityChange: function(event) {
    this._runtime.postMessage({
                                type: 'visibilityChange',
                                hidden: this._doc.hidden
                              });
  }
};


function RenderBackend(ctx) {
  this.ctx = ctx;
  this.assets = Object.create(null);
  this.transforms = Object.create(null);
  this.regions = Object.create(null);
}
RenderBackend.prototype = {
  render: function(renderList) {
//    console.log('start');
    var ctx = this.ctx;
    ctx.save();
    var invalidRegions = [];
    var invalidPath = new ShapePath();
    var cleanElements = [];
    var drawables = [];
    for (var i = 0; i < renderList.length; i++) {
      var element = renderList[i];
      assert(element);
      assert(element.id);
      assert(element.command);
      switch (element.command) {
        case 'update': {
          assert(element.data);
          assert(element.transform);
          assert(element.region);
          this.assets[element.id] = element.data;
          this.transforms[element.id] = element.transform;
          var region = element.region;
          this.regions[element.id] = region;
          invalidRegions.push(region);
          drawables.push(element);
          invalidPath.rect(region.xMin, region.yMin, region.xMax - region.xMin,
                           region.yMax - region.yMin);
          element.render = true;
          break;
        }
        case 'keep': {
          assert(this.assets[element.id]);
          assert(this.regions[element.id]);
          element.region = this.regions[element.id];
          element.transform = this.transforms[element.id];
          cleanElements.push(element);
          drawables.push(element);
          break;
        }
        case 'drop': {
//          assert(this.assets[element.id]);
          region = this.regions[element.id];
          if (region) {
            invalidRegions.push(region);
            invalidPath.rect(region.xMin/20, region.yMin/20,
                             (region.xMax - region.xMin)/20,
                             (region.yMax - region.yMin)/20);
          }
          delete this.assets[element.id];
          delete this.regions[element.id];
          break;
        }
      }
    }
    for (i = cleanElements.length; i--;) {
      element = cleanElements[i];
      for (var j = invalidRegions.length; j--;) {
        if (regionsIntersect(element, invalidRegions[j])) {
          element.render = true;
          element.data = this.assets[element.id];
          break;
        }
      }
    }
    invalidPath.draw(ctx, true);
    for (i = 0; i < drawables.length; i++) {
      element = drawables[i];
      if (element.render) {
        this.drawElement(element, ctx);
      }
    }
    ctx.restore();
  },
  drawElement: function(element, ctx) {
    switch (element.type) {
      case 'graphics': {
        var t = element.transform;
        ctx.setTransform(t.a, t.b, t.c, t.d, t.tx/20, t.ty/20);
        var paths = element.data.paths;
        for (var i = 0; i < paths.length; i++) {
          ShapePath.prototype.draw.call(paths[i], ctx, false, 0,
                                        new RenderingColorTransform());
        }
        break;
      }
      default: {
        assert(false, 'unexpected render list element type: ' + element.type);
      }
    }
  }
};

function RenderingColorTransform() {
  this.mode = null;
  this.transform = [1, 1, 1, 1, 0, 0, 0, 0];
}
RenderingColorTransform.prototype = {
  applyCXForm: function (cxform) {
    var t = this.transform;
    t = [
      t[0] * cxform.redMultiplier / 256,
      t[1] * cxform.greenMultiplier / 256,
      t[2] * cxform.blueMultiplier / 256,
      t[3] * cxform.alphaMultiplier / 256,
      t[4] * cxform.redMultiplier / 256 + cxform.redOffset,
      t[5] * cxform.greenMultiplier / 256 + cxform.greenOffset,
      t[6] * cxform.blueMultiplier / 256 + cxform.blueOffset,
      t[7] * cxform.alphaMultiplier / 256 + cxform.alphaOffset
    ];

    var mode;
    var PRECISION = 1e-4;
    if (Math.abs(t[0] - 1) < PRECISION && Math.abs(t[1] - 1) < PRECISION &&
        Math.abs(t[2] - 1) < PRECISION && t[3] >= 0 &&
        Math.abs(t[4]) < PRECISION && Math.abs(t[5]) < PRECISION &&
        Math.abs(t[6]) < PRECISION && Math.abs(t[7]) < PRECISION) {
      mode = Math.abs(t[3] - 1) < PRECISION ? null : 'simple';
    } else {
      mode = 'complex';
    }
    var clone = Object.create(RenderingColorTransform.prototype);
    clone.mode = mode;
    clone.transform = t;
    return clone;
  },
  setFillStyle: function (ctx, style) {
    if (this.mode === 'complex') {
      style = typeof style === 'function' ? style(ctx, this) : this.convertColor(style);
    } else if (typeof style === 'number') {
      style = this.convertNumericColor(style);
    } else if (typeof style === 'function') {
      style = style.defaultFillStyle;
    }
    ctx.fillStyle = style;
  },
  setStrokeStyle: function (ctx, style) {
    if (this.mode === 'complex') {
      style = typeof style === 'function' ? style(ctx, this) : this.convertColor(style);
    } else if (typeof style === 'number') {
      style = this.convertNumericColor(style);
    } else if (typeof style === 'function') {
      style = style.defaultFillStyle;
    }
    ctx.strokeStyle = style;
  },
  addGradientColorStop: function (gradient, ratio, style) {
    if (this.mode === 'complex') {
      style = this.convertColor(style);
    } else if (typeof style === 'number') {
      style = this.convertNumericColor(style);
    }
    gradient.addColorStop(ratio, style);
  },
  setAlpha: function (ctx, force) {
    if (this.mode === 'simple' || force) {
      var t = this.transform;
      ctx.globalAlpha = Math.min(1, Math.max(0, ctx.globalAlpha * t[3]));
    }
  },
  convertNumericColor: function (num) {
    return '#' + (num | 0x1000000).toString(16).substr(1);
  },
  convertColor: function (style) {
    var t = this.transform;
    var m;
    switch (typeof style) {
      case 'string':
        if (style[0] === '#') {
          m = [undefined, parseInt(style.substr(1, 2), 16),
               parseInt(style.substr(3, 2), 16), parseInt(style.substr(5, 2), 16), 1.0];
        }
        m = m || /rgba\(([^,]+),([^,]+),([^,]+),([^)]+)\)/.exec(style);
        if (!m) { // unknown string color
          return style;
        }
        break;
      case 'number':
        m = [style, style >> 16 & 0xff, style >> 8 & 0xff, style & 0xff, 1.0];
        break;
      default:
        return style;
    }

    var r = Math.min(255, Math.max(0, m[1] * t[0] + t[4])) | 0;
    var g = Math.min(255, Math.max(0, m[2] * t[1] + t[5])) | 0;
    var b = Math.min(255, Math.max(0, m[3] * t[2] + t[6])) | 0;
    var a = Math.min(1, Math.max(0, m[4] * t[3] + (t[7] / 256)));
    return "rgba(" + r + ',' + g + ',' + b + ',' + a + ')';
  },
  getTransformFingerprint: function () {
    return this.transform.join('|');
  }
};

function regionsIntersect(regionA, regionB) {
  return !(regionA.xMax < regionB.xMin || regionA.xMin > regionB.xMax ||
           regionA.yMax < regionB.yMin || regionA.yMin > regionB.yMax);
}
