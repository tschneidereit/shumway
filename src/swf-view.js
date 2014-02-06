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

requirejs.config({
  shim: {
      '.stage/geometry': ['./stage/util'],
      '.stage/stage': ['./stage/geometry'],
      '.stage/elements': ['./stage/stage'],
      '.stage/filters': ['./stage/elements'],
      '.stage/gl': ['./stage/filters'],
      '.stage/gl/core': ['./stage/gl/core'],
  }
});

define([
    "./swf-runtime",
    "shumway/../lib/ByteArray",
    "./avm2/options",
    "./swf/Timeline",
    "./flash/util",
    "./swf/shape",
    "./swf/rendering-color-transform",
    "./swf/embed",
  ], function() {


function SWFView(file, doc, container, config) {
  this._doc = doc;
  this._container = container;
  this._canvas = doc.createElement('canvas');
  this._file = file;
  this._config = config;

  if (typeof SWFRuntime === 'undefined') {
    this._runtime = new Worker(config.paths.runtime);
  } else {
    this._runtime = new SWFRuntimeWrapper();
  }
  this._runtime.onMessage = this._onRuntimeMessage.bind(this);
  if (this._runtime instanceof SWFRuntimeWrapper) {
    this._initRuntime(this._config);
  }
}
SWFView.prototype = {
  runSWF: function(file) {
    this._runtime.postMessage({
                                type: 'runSWF',
                                file: file,
                                viewWidth: this._container.clientWidth,
                                viewHeight: this._container.clientHeight
                              });
  },
  _initRuntime: function(config) {
    var systemInfo = {
      ua: window.navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height
    };
    this._runtime.postMessage({
                                type: 'init',
                                config: config,
                                systemInfo: systemInfo,
                                canvas: this._canvas
                              });
  },
  _initView: function(swfInfo) {
    var intrinsicWidth = swfInfo.width;
    var intrinsicHeight = swfInfo.height;
    this._frameRate = swfInfo._frameRate;
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

    if (hud.value) {
      this._initializeHUD(container);
    }
  },
  _initializeHUD: function(container) {
    var canvas = document.createElement('canvas');
    var canvasContainer = document.createElement('div');
    canvasContainer.appendChild(canvas);
    canvasContainer.style.position = "absolute";
    canvasContainer.style.top = "0px";
    canvasContainer.style.left = "0px";
    canvasContainer.style.width = "100%";
    canvasContainer.style.height = "150px";
    canvasContainer.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
    canvasContainer.style.pointerEvents = "none";
    container.appendChild(canvasContainer);
    this._hudTimeline = new Timeline(canvas);
    this._hudTimeline.setFrameRate(this._frameRate);
    this._hudTimeline.refreshEvery(10);
  },
  _onRuntimeMessage: function(event) {
    var message = event.data;
//    console.log('received by view: ' + message.type);
    switch (message.type) {
      case 'runtime-system-ready':
        this._initRuntime(this._config);
        this._config = null;
        break;
      case 'vmInit':
        this.runSWF(this._file);
        this._file = null;
        break;
      case 'viewInit':
        this._initView(message);
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

return SWFView;
});
