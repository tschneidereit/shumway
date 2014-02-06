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

if (typeof window === 'undefined') {
  importScripts(['../lib/requirejs/require.js']);
}

(function(req){
  var requirejs = req.config({
    context: 'swf-runtime',
    baseUrl: typeof SHUMWAY_ROOT !== 'undefined' ? SHUMWAY_ROOT : '.',
    shim: {
      "avm2/settings": ['avm2/options'],
      "avm2/compiler/builder": ['avm2/compiler/c4/ir'],
      "avm2/compiler/c4/backend": ['avm2/compiler/c4/ir'],
      "avm2/disassembler": ['avm2/parser'],
      "avm2/hacks": ['avm2/runtime'],
      "avm2/proxy": ['avm2/runtime'],
      "avm2/runtime": ['avm2/settings'],
      "avm2/native": ['avm2/proxy'],
      "avm2/vm": ['flash/playerglobal'],
      "avm2/class": ['avm2/domain'],
      "avm2/compiler/c4/transform": ['avm2/compiler/lljs/src/estransform'],
      "flash/geom/ColorTransform": ['avm2/domain'],
      "flash/geom/Matrix": ['avm2/domain'],
      "flash/geom/Point": ['avm2/domain'],
      "flash/geom/Rectangle": ['avm2/domain'],
      "flash/geom/Vector3D": ['avm2/domain'],
      "avm2/generated/avm1lib/AS2Button": ['avm2/domain'],
      "flash/stubs": ['avm2/native'],
      "swf/generator": ['swf/templates'],
      "swf/tags": ['swf/structs'],
    }
  });
  requirejs([
    "../lib/requirejs/require",
    "avm2/avm2Util",
    "avm2/options",
    "avm2/metrics",
    "avm2/settings",
    "../lib/ByteArray",
    "swf/config",
    "flash/util",
    "swf/swf",
    "swf/inflate",
    "swf/stream",
    "swf/bitmap",
    "swf/button",
    "swf/font",
    "swf/image",
    "swf/label",
    "swf/shape",
    "swf/rendering-color-transform",
    "swf/sound",
    "swf/text",
    "swf/mp3worker",

    "swf/types",
    "swf/structs",
    "swf/tags",
    "swf/templates",
    "swf/generator",
    "swf/handlers",
    "swf/parser",
    "swf/resourceloader",

    "avm2/constants",
    "avm2/errors",
    "avm2/opcodes",
    "avm2/parser",
    "avm2/analyze",
    "avm2/compiler/lljs/src/estransform",
    "avm2/compiler/lljs/src/escodegen",
    "avm2/compiler/inferrer",
    "avm2/compiler/c4/ir",
    "avm2/compiler/builder",
    "avm2/compiler/c4/looper",
    "avm2/compiler/c4/transform",
    "avm2/compiler/c4/backend",
    "avm2/domain",
    "avm2/class",
    "avm2/xregexp",
    "avm2/runtime",
    "avm2/hacks",
    "avm2/array",
    "avm2/vectors-numeric",
    "avm2/vectors-generic",
    "avm2/xml",
    "avm2/json2",
    "avm2/amf",
    "avm2/proxy",
    "avm2/dictionary",
    "avm2/native",
    "avm2/disassembler",
    "avm2/interpreter",

    "avm1/stream",
    "avm1/interpreter",

    "flash/util",
    "flash/accessibility/Accessibility",
    "flash/avm1lib/AS2Button",
    "flash/avm1lib/AS2Globals",
    "flash/avm1lib/AS2MovieClip",
    "flash/avm1lib/AS2MovieClipLoader",
    "flash/avm1lib/AS2TextField",
    "flash/avm1lib/AS2Utils",
    "flash/display/Bitmap",
    "flash/display/BitmapData",
    "flash/display/DisplayObject",
    "flash/display/DisplayObjectContainer",
    "flash/display/FrameLabel",
    "flash/display/Graphics",
    "flash/display/InteractiveObject",
    "flash/display/Loader",
    "flash/display/LoaderInfo",
    "flash/display/MorphShape",
    "flash/display/MovieClip",
    "flash/display/NativeMenu",
    "flash/display/NativeMenuItem",
    "flash/display/Scene",
    "flash/display/Shader",
    "flash/display/ShaderData",
    "flash/display/Shape",
    "flash/display/SimpleButton",
    "flash/display/Sprite",
    "flash/display/Stage",
    "flash/events/Event",
    "flash/events/EventDispatcher",
    "flash/events/KeyboardEvent",
    "flash/events/MouseEvent",
    "flash/events/TextEvent",
    "flash/events/TimerEvent",
    "flash/external/ExternalInterface",
    "flash/filters/BevelFilter",
    "flash/filters/BitmapFilter",
    "flash/filters/BlurFilter",
    "flash/filters/ColorMatrixFilter",
    "flash/filters/ConvolutionFilter",
    "flash/filters/DisplacementMapFilter",
    "flash/filters/DropShadowFilter",
    "flash/filters/GlowFilter",
    "flash/filters/GradientBevelFilter",
    "flash/filters/GradientGlowFilter",
    "flash/filters/ShaderFilter",
    "flash/geom/ColorTransform",
    "flash/geom/Matrix",
    "flash/geom/Matrix3D",
    "flash/geom/Point",
    "flash/geom/Rectangle",
    "flash/geom/Transform",
    "flash/geom/Vector3D",
    "flash/media/ID3Info",
    "flash/media/Microphone",
    "flash/media/Sound",
    "flash/media/SoundChannel",
    "flash/media/SoundMixer",
    "flash/media/SoundTransform",
    "flash/media/StageVideo",
    "flash/media/Video",
    "flash/net/FileFilter",
    "flash/net/LocalConnection",
    "flash/net/NetConnection",
    "flash/net/NetStream",
    "flash/net/ObjectEncoding",
    "flash/net/Responder",
    "flash/net/SharedObject",
    "flash/net/Socket",
    "flash/net/URLLoader",
    "flash/net/URLRequest",
    "flash/net/URLStream",
    "flash/system/ApplicationDomain",
    "flash/system/Capabilities",
    "flash/system/FSCommand",
    "flash/system/Security",
    "flash/system/SecurityDomain",
    "flash/system/System",
    "flash/text/engine/ContentElement",
    "flash/text/engine/ElementFormat",
    "flash/text/engine/FontDescription",
    "flash/text/engine/GroupElement",
    "flash/text/engine/SpaceJustifier",
    "flash/text/engine/TextBlock",
    "flash/text/engine/TextElement",
    "flash/text/engine/TextJustifier",
    "flash/text/engine/TextLine",
    "flash/text/Font",
    "flash/text/StaticText",
    "flash/text/StyleSheet",
    "flash/text/TextField",
    "flash/text/TextFormatClass",
    "flash/ui/ContextMenu",
    "flash/ui/ContextMenuItem",
    "flash/ui/Keyboard",
    "flash/ui/Mouse",
    "flash/ui/MouseCursorData",
    "flash/utils/Dictionary",
    "flash/utils/Timer",

    "flash/stubs",
    "flash/playerglobal",

    "io/BinaryFileReader",

    "avm2/vm",
    "swf/renderer"
  ], function() {
    workerCommChannel.onMessage = function createVMListener(e) {
      if (e.data.type === 'init') {
        instances[e.data.id] = new SWFRuntime(e.data.id, e.data.config,
                                              e.data.systemInfo, e.data.canvas);
      }
    };
    if (typeof window === 'undefined') {
      workerCommChannel.postMessage({type: 'runtime-system-ready'});
    }
  });
})(requirejs);

var instances = {};

var workerCommChannel = self;


function SWFRuntime(id, config, systemInfo, canvas) {
  this._id = id;
  this._config = config;
  CapabilitiesDefinition.setSystemInfo(systemInfo);
  this._global = isWorker ? self : window;
  // TODO: get rid of the global avm2, or set it when entering an instance
  this._global.avm2 = this;
  workerCommChannel.onMessage = this._onmessage.bind(this);
  this._init(canvas);
}
SWFRuntime.prototype = {
  updateRenderList: function(renderList) {
    workerCommChannel.postMessage({type: 'render', list: renderList.entries});
  },
  _onmessage: function(event) {
    var message = event.data;
//    console.log('received by runtime: ' + message.type);
    switch (message.type) {
      case 'runSWF':
        this._runSWF(message.file, message.viewWidth, message.viewHeight);
        break;
      case 'mouseEvent':
        this._onMouseEvent(message.data);
        break;
      case 'keyboardEvent':
        this._onKeyboardEvent(message.data);
        break;
      case 'viewResize':
        this._onViewResize(message.viewWidth, message.viewHeight);
        break;
      case 'visibilityChange':
        this._onVisibilityChange(message.hidden);
        break;
      default:
        throw new Error('Unknown SWFRuntime message: ' + message.type);
    }
  },
  _postMessage: function(message, transferList) {
    workerCommChannel.postMessage(message, transferList);
  },
  _init: function(canvas) {
    this._canvas = canvas;
    this._vm = new AVM2(this._id, this._config, this._onVMReady.bind(this));
  },
  _onVMReady: function(vm) {
    this._postMessage({type: 'vmInit', id: this._id});
  },
  _runSWF: function (file, viewWidth, viewHeight) {
    var stage = this._stage = new flash.display.Stage();
    var loader = this._stageLoader = new flash.display.Loader();
    var loaderInfo = loader._contentLoaderInfo;
    stage._loader = loader;
    stage._swfFrameWidth = viewWidth;
    stage._swfFrameHeight = viewHeight;
    loaderInfo._parameters = this._config.movieParams;
    loaderInfo._url = this._config.swfURL;
    loaderInfo._loaderURL = this._config.loaderURL || loaderInfo._url;
    loaderInfo._addEventListener('init', this._onLoaderInfoInit.bind(this));

    loader._parent = stage;
    loader._stage = stage;

    loader._load(typeof file === 'string' ? new flash.net.URLRequest(file)
                                          : file);
  },
  _onLoaderInfoInit: function(event) {
    var stage = this._stage;
    if (stage._swfFrameWidth === 0) {
      stage._swfFrameWidth = stage._stageWidth / 20;
    }
    if (stage._swfFrameHeight === 0) {
      stage._swfFrameHeight = stage._stageHeight / 20;
    }
    this._postMessage({
                        type: 'viewInit',
                        id: this._id,
                        width: stage._stageWidth / 20,
                        height: stage._stageHeight / 20,
                        frameRate: stage._frameRate
                      });


    var bgcolor = this._stageLoader._contentLoaderInfo._backgroundColor;
    var objectParams = this._config.objectParams;
    if (objectParams) {
      var m;
      if (objectParams.bgcolor &&
          (m = /#([0-9A-F]{6})/i.exec(objectParams.bgcolor))) {
        var hexColor = parseInt(m[1], 16);
        bgcolor = {
          red: (hexColor >> 16) & 255,
          green: (hexColor >> 8) & 255,
          blue: hexColor & 255,
          alpha: 255
        };
      }
      if (objectParams.wmode === 'transparent') {
        bgcolor = {red: 0, green: 0, blue: 0, alpha: 0};
      }
    }
    stage._color = bgcolor;

    var root = this._stageLoader._content;
    root._dispatchEvent("added", undefined, true);
    root._dispatchEvent("addedToStage");

    stage._layer.addChild(root._layer);

    if (options.onStageInitialized) {
      options.onStageInitialized(stage);
    }

    stage._render(this._canvas, 0, this._config);
  },
  _onMouseEvent: function(event) {
    var type = event.type;
    if (type === 'mousemove') {
      if (event.mouseX === this._stage._mouseX &&
          event.mouseY === this._stage._mouseY)
      {
        return;
      }
      this._stage._mouseX = event.mouseX * 20;
      this._stage._mouseY = event.mouseY * 20;
    } else if (type === 'mouseup' || type === 'mousedown') {
      this._stage._mouseEvents.push(type);
    } else if (type === 'click') {
      ShumwayKeyboardListener.focus = this._stage;
      this._stage._mouseTarget._dispatchEvent('click');
    }
    this._stage._mouseOver = type !== 'mouseout';
    this._stage._mouseMoved = type === 'mousemove' || type === 'mouseover' ||
                              type === 'mouseout';
  },
  _onKeyboardEvent: function(event) {
    ShumwayKeyboardListener.handleEvent(event);
  },
  _onViewResize: function(width, height) {
    this._stage._swfFrameWidth = width;
    this._stage._swfFrameHeight = height;
  },
  _onVisibilityChange: function(hidden) {
    this._stage._viewHidden = hidden;
  }
};

// Used for running the runtime on the mainthread, shims postMessage & co.
function SWFRuntimeWrapper() {
  var self = this;
  workerCommChannel = {
    set onMessage(handler) {
      self._messageHandler = handler;
    },
    get onMessage() {
      return self._messageHandler;
    },
    postMessage: function(message) {
      if (self.onMessage) {
        self.onMessage({type: 'message', data: message});
      }
    }
  };
}

SWFRuntimeWrapper.prototype = {
  postMessage : function(message) {
    if (this._messageHandler) {
      this._messageHandler({type: 'message', data: message});
    }
  }
}
