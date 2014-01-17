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
  _initView: function() {
    this._container.style.position = 'relative';
    this._container.appendChild(this._canvas);

    var mouseListener = this._onMouseEvent.bind(this);

    this._canvas.addEventListener('click', mouseListener);
    this._canvas.addEventListener('dblclick', mouseListener);
    this._canvas.addEventListener('mousedown', mouseListener);
    this._canvas.addEventListener('mousemove', mouseListener);
    this._canvas.addEventListener('mouseup', mouseListener);
    this._canvas.addEventListener('mouseover', mouseListener);
    this._canvas.addEventListener('mouseout', mouseListener);
  },
  runSWF: function(file) {
    this._runtime.postMessage({type: 'runSWF', file: file});
  },
  _onRuntimeMessage: function(event) {
    var message = event.data;
    switch (message.type) {
      case 'vmInit':
        this.runSWF(this._file);
        this._file = null;
        break;
      case 'viewInit':
        this._initView();
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
  }
};
