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
/*global toStringRgba, fromCharCode */

function defineLabel(tag, dictionary) {
  var records = tag.records;
  var m = tag.matrix;
  var transform = 'matrix(' + [m.a, m.b, m.c, m.d, m.tx, m.ty].join(',') + ')';
  var html = '<div class="shumway-static-text">';
  var dependencies = [];
  var fontHeight = 0;
  var x = 0;
  var y = 0;
  var i = 0;
  var record;
  var styleOpen = false;
  while ((record = records[i++])) {
    if (record.eot) {
      break;
    }
    var style = '';
    if (record.hasFont) {
      var font = dictionary[record.fontId];
      assert(font, 'undefined font', 'label');
      var codes = font.codes;
      fontHeight = record.fontHeight/20;
      style += 'font-family: ' + font.name +
               '; font-size: ' + fontHeight + 'px;';
      dependencies.push(font.id);
    }
    if (record.hasColor) {
      style += 'color: ' + toStringRgba(record.color) + ';';
    }
    if (style.length) {
      if (styleOpen) {
        html += '</span>';
      }
      styleOpen = true;
      html += '<span style="' + style + '">';
    }
    if (record.hasMoveX){
      x = record.moveX;
    }
    if (record.hasMoveY) {
      y = record.moveY / 20 - fontHeight;
    }
    var entries = record.entries;
    var j = 0;
    var entry;
    while (entry = entries[j++]) {
      var code = codes[entry.glyphIndex];
      assert(code, 'undefined glyph', 'label');
      var text = code >= 32 && code != 34 && code != 92
                 ? fromCharCode(code)
                 : '\\u' + (code + 0x10000).toString(16).substring(1);
      html += '<span style="transform: translate(' +
              x/20 + 'px,' + y + 'px);">' + text + '</span>';
      x += entry.advance;
    }
  }
  if (styleOpen) {
    html += '</span>';
  }
  html += '</div>';
  var label = {
    type: 'label',
    id: tag.id,
    bbox: tag.bbox,
    transform : transform,
    html : html
  };
  if (dependencies.length) {
    label.require = dependencies;
  }
  return label;
}
