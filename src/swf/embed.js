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
/*global SWF, renderStage, toStringRgba, ShumwayKeyboardListener */

SWF.embed = function(file, doc, container, options) {
  if (!SWF.stylesInitialized) {
    SWF.initStyles(doc);
  }
//  var canvas = doc.createElement('canvas');
//  var ctx = canvas.getContext('kanvas-2d');
  var loader = new flash.display.Loader();
  var loaderInfo = loader.contentLoaderInfo;
  var stage = new flash.display.Stage();

  stage._loader = loader;
  loaderInfo._parameters = options.movieParams;
  loaderInfo._url = options.url || (typeof file === 'string' ? file : null);

  // HACK support of HiDPI displays
  var pixelRatio = 1;
//  var pixelRatio = 'devicePixelRatio' in window ? window.devicePixelRatio : 1;
//  var canvasHolder = null;
//  canvas._pixelRatio = pixelRatio;
//  if (pixelRatio > 1) {
//    var cssScale = 'scale(' + (1 / pixelRatio) + ', ' + (1 / pixelRatio) + ')';
//    canvas.setAttribute('style', '-moz-transform: ' + cssScale + ';' +
//                                 '-webkit-transform: ' + cssScale + ';' +
//                                 'transform: ' + cssScale + ';' +
//                                 '-moz-transform-origin: 0% 0%;' +
//                                 '-webkit-transform-origin: 0% 0%;' +
//                                 'transform-origin: 0% 0%;');
//    canvasHolder = doc.createElement('div');
//    canvasHolder.setAttribute('style', 'display: inline-block; overflow: hidden;');
//    canvasHolder.appendChild(canvas);
//  }

  loader._parent = stage;
  loader._stage = stage;

  var cursorVisible = true;
  function syncCursor() {
    var newCursor;
    if (!cursorVisible) {
      newCursor = 'none';
    } else if (stage._clickTarget &&
               stage._clickTarget.shouldHaveHandCursor) {
      newCursor = 'pointer';
    } else {
      newCursor = 'auto';
    }

    container.style.cursor = newCursor;
  }

  stage._setCursorVisible = function(val) {
    cursorVisible = val;
    syncCursor();
  };
  stage._syncCursor = syncCursor;
  stage._mouseMoved = false;

  function fitCanvas(container) {
    stage._frameWidth = container.clientWidth;
    stage._frameHeight = container.clientHeight;
    stage._control.style.width = container.clientWidth + 'px';
    stage._control.style.height = container.clientHeight + 'px';
    stage._invalid = true;
  }

  loaderInfo._addEventListener('init', function () {
    if (container.clientHeight) {
      fitCanvas(container);
      window.addEventListener('resize', function () {
        fitCanvas(container);
      });
    } else {
      stage._frameWidth = stage._stageWidth;
      stage._frameHeight = stage._stageHeight;
      stage._control.style.width = stage._stageWidth + 'px';
      stage._control.style.height = stage._stageHeight + 'px';
    }

    container.setAttribute("style", "position: relative");

    stage._control.addEventListener('click', function () {
      ShumwayKeyboardListener.focus = stage;

      if (stage._clickTarget) {
        stage._clickTarget._dispatchEvent(new flash.events.MouseEvent('click'));
      }
    });
    stage._control.addEventListener('dblclick', function () {
      if (stage._clickTarget && stage._clickTarget._doubleClickEnabled) {
        stage._clickTarget._dispatchEvent(new flash.events.MouseEvent('doubleClick'));
      }
    });
    stage._control.addEventListener('mousedown', function () {
      stage._mouseMoved = true;
      if (stage._clickTarget) {
        stage._clickTarget._dispatchEvent(new flash.events.MouseEvent('mouseDown'));
      }
    });
    stage._control.addEventListener('mousemove', function (domEvt) {
      var node = this;
      var left = 0;
      var top = 0;
      if (node.offsetParent) {
        do {
          left += node.offsetLeft;
          top += node.offsetTop;
        } while ((node = node.offsetParent));
      }

      var canvasState = stage._canvasState;
      stage._mouseX = ((domEvt.pageX - left) * pixelRatio - canvasState.offsetX) /
        canvasState.scaleX;
      stage._mouseY = ((domEvt.pageY - top) * pixelRatio - canvasState.offsetY) /
        canvasState.scaleY;
      stage._mouseMoved = true;
    });
    stage._control.addEventListener('mouseup', function () {
      stage._mouseMoved = true;
      if (stage._clickTarget) {
        stage._clickTarget._dispatchEvent(new flash.events.MouseEvent('mouseUp'));
      }
    });
    stage._control.addEventListener('mouseover', function () {
      stage._mouseMoved = true;
      stage._mouseOver = true;
      stage._mouseJustLeft = false;
    });
    stage._control.addEventListener('mouseout', function () {
      stage._mouseMoved = true;
      stage._mouseOver = false;
      stage._mouseJustLeft = true;
    });

    var bgcolor = loaderInfo._backgroundColor;
    if (options.objectParams) {
      var m;
      if (options.objectParams.bgcolor &&
          (m = /#([0-9A-F]{6})/i.exec(options.objectParams.bgcolor))) {
        var hexColor = parseInt(m[1], 16);
        bgcolor = {
          red: (hexColor >> 16) & 255,
          green: (hexColor >> 8) & 255,
          blue: hexColor & 255,
          alpha: 255
        };
      }
      if (options.objectParams.wmode === 'transparent') {
        bgcolor = {red: 0, green: 0, blue: 0, alpha: 0};
      }
    }

    doc.body.appendChild(stage._control);

    stage._color = bgcolor;
    stage._control.style.backgroundColor = toStringRgba(bgcolor);

    var root = loader._content;
    stage._children[0] = root;
    stage._control.appendChild(root._control);

    root._dispatchEvent(new flash.events.Event("added"));
    root._dispatchEvent(new flash.events.Event("addedToStage"));

    syncCursor();

    if (options.onStageInitialized) {
      options.onStageInitialized(stage);
    }

    renderStage(stage, options);
  });

  if (options.onComplete) {
    loaderInfo._addEventListener("complete", function () {
      options.onComplete();
    });
  }

  loader._load(typeof file === 'string' ? new flash.net.URLRequest(file) : file);
};


SWF.styles = [
  ".shumway-static-text span {" +
  "  position: absolute;" +
  "  top: 0;" +
  "  left: 0;" +
  "  font-family: sans-serif;" +
  "  font-size: 12px;" +
  "  color: black;" +
  "}"
];

SWF.initStyles = function(doc) {
  var style = doc.createElement('style');
  doc.getElementsByTagName('head')[0].appendChild(style);
  var s = doc.styleSheets[doc.styleSheets.length - 1];
  for (var i = 0; i < SWF.styles.length; i++) {
    s.insertRule(SWF.styles[i], s.cssRules.length);
  }
  SWF.stylesInitialized = true;
}
