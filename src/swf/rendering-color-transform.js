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
