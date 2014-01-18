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
    var container = this._container;
    container.style.position = 'relative';
    container.appendChild(this._canvas);

    var width = intrinsicWidth / 20;
    var height = intrinsicHeight / 20;

    if (container.clientHeight) {
      width = container.clientWidth;
      height = container.clientHeight;
      // TODO: also detect other reasons for canvas resizing
      window.addEventListener('resize', this._onWindowResize.bind(this));
    }

    this._canvas.width = width;
    this._canvas.height = height;

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
    switch (message.type) {
      case 'vmInit':
        this.runSWF(this._file);
        this._file = null;
        break;
      case 'viewInit':
        this._initView(message.width, message.height);
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
