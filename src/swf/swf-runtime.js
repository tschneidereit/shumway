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

var isWorker = typeof window === 'undefined';

SHUMWAY_ROOT = "../";

var earlyScripts = [
  "../avm2/options.js",
  "../avm2/settings.js",
  "../avm2/avm2Util.js",
  "../avm2/metrics.js",
    "../../lib/ByteArray.js",
];
var scripts = [
  "config.js",
  "../flash/util.js",
  "swf.js",
  "inflate.js",
  "stream.js",
  "bitmap.js",
  "button.js",
  "font.js",
  "image.js",
  "label.js",
  "shape.js",
  "rendering-color-transform.js",
  "sound.js",
  "text.js",
  "mp3worker.js",

  "types.js",
  "structs.js",
  "tags.js",
  "templates.js",
  "generator.js",
  "handlers.js",
  "parser.js",
  "resourceloader.js",

  "../avm2/constants.js",
  "../avm2/errors.js",
  "../avm2/opcodes.js",
  "../avm2/parser.js",
  "../avm2/analyze.js",
  "../avm2/compiler/lljs/src/estransform.js",
  "../avm2/compiler/lljs/src/escodegen.js",
  "../avm2/compiler/inferrer.js",
  "../avm2/compiler/c4/ir.js",
  "../avm2/compiler/builder.js",
  "../avm2/compiler/c4/looper.js",
  "../avm2/compiler/c4/transform.js",
  "../avm2/compiler/c4/backend.js",
  "../avm2/domain.js",
  "../avm2/class.js",
  "../avm2/xregexp.js",
  "../avm2/runtime.js",
  "../avm2/hacks.js",
  "../avm2/array.js",
  "../avm2/vectors-numeric.js",
  "../avm2/vectors-generic.js",
  "../avm2/xml.js",
  "../avm2/json2.js",
  "../avm2/amf.js",
  "../avm2/proxy.js",
  "../avm2/dictionary.js",
  "../avm2/native.js",
  "../avm2/disassembler.js",
  "../avm2/interpreter.js",

  "../avm1/stream.js",
  "../avm1/interpreter.js",

  "../flash/util.js",
  "../flash/accessibility/Accessibility.js",
  "../flash/avm1lib/AS2Button.js",
  "../flash/avm1lib/AS2Globals.js",
  "../flash/avm1lib/AS2MovieClip.js",
  "../flash/avm1lib/AS2MovieClipLoader.js",
  "../flash/avm1lib/AS2TextField.js",
  "../flash/avm1lib/AS2Utils.js",
  "../flash/display/Bitmap.js",
  "../flash/display/BitmapData.js",
  "../flash/display/DisplayObject.js",
  "../flash/display/DisplayObjectContainer.js",
  "../flash/display/FrameLabel.js",
  "../flash/display/Graphics.js",
  "../flash/display/InteractiveObject.js",
  "../flash/display/Loader.js",
  "../flash/display/LoaderInfo.js",
  "../flash/display/MorphShape.js",
  "../flash/display/MovieClip.js",
  "../flash/display/NativeMenu.js",
  "../flash/display/NativeMenuItem.js",
  "../flash/display/Scene.js",
  "../flash/display/Shader.js",
  "../flash/display/ShaderData.js",
  "../flash/display/Shape.js",
  "../flash/display/SimpleButton.js",
  "../flash/display/Sprite.js",
  "../flash/display/Stage.js",
  "../flash/events/Event.js",
  "../flash/events/EventDispatcher.js",
  "../flash/events/KeyboardEvent.js",
  "../flash/events/MouseEvent.js",
  "../flash/events/TextEvent.js",
  "../flash/events/TimerEvent.js",
  "../flash/external/ExternalInterface.js",
  "../flash/filters/BevelFilter.js",
  "../flash/filters/BitmapFilter.js",
  "../flash/filters/BlurFilter.js",
  "../flash/filters/ColorMatrixFilter.js",
  "../flash/filters/ConvolutionFilter.js",
  "../flash/filters/DisplacementMapFilter.js",
  "../flash/filters/DropShadowFilter.js",
  "../flash/filters/GlowFilter.js",
  "../flash/filters/GradientBevelFilter.js",
  "../flash/filters/GradientGlowFilter.js",
  "../flash/filters/ShaderFilter.js",
  "../flash/geom/ColorTransform.js",
  "../flash/geom/Matrix.js",
  "../flash/geom/Matrix3D.js",
  "../flash/geom/Point.js",
  "../flash/geom/Rectangle.js",
  "../flash/geom/Transform.js",
  "../flash/geom/Vector3D.js",
  "../flash/media/ID3Info.js",
  "../flash/media/Microphone.js",
  "../flash/media/Sound.js",
  "../flash/media/SoundChannel.js",
  "../flash/media/SoundMixer.js",
  "../flash/media/SoundTransform.js",
  "../flash/media/StageVideo.js",
  "../flash/media/Video.js",
  "../flash/net/FileFilter.js",
  "../flash/net/LocalConnection.js",
  "../flash/net/NetConnection.js",
  "../flash/net/NetStream.js",
  "../flash/net/ObjectEncoding.js",
  "../flash/net/Responder.js",
  "../flash/net/SharedObject.js",
  "../flash/net/Socket.js",
  "../flash/net/URLLoader.js",
  "../flash/net/URLRequest.js",
  "../flash/net/URLStream.js",
  "../flash/system/ApplicationDomain.js",
  "../flash/system/Capabilities.js",
  "../flash/system/FSCommand.js",
  "../flash/system/Security.js",
  "../flash/system/SecurityDomain.js",
  "../flash/system/System.js",
  "../flash/text/engine/ContentElement.js",
  "../flash/text/engine/ElementFormat.js",
  "../flash/text/engine/FontDescription.js",
  "../flash/text/engine/GroupElement.js",
  "../flash/text/engine/SpaceJustifier.js",
  "../flash/text/engine/TextBlock.js",
  "../flash/text/engine/TextElement.js",
  "../flash/text/engine/TextJustifier.js",
  "../flash/text/engine/TextLine.js",
  "../flash/text/Font.js",
  "../flash/text/StaticText.js",
  "../flash/text/StyleSheet.js",
  "../flash/text/TextField.js",
  "../flash/text/TextFormatClass.js",
  "../flash/ui/ContextMenu.js",
  "../flash/ui/ContextMenuItem.js",
  "../flash/ui/Keyboard.js",
  "../flash/ui/Mouse.js",
  "../flash/ui/MouseCursorData.js",
  "../flash/utils/Dictionary.js",
  "../flash/utils/Timer.js",

  "../flash/stubs.js",
  "../flash/playerglobal.js",

  "../io/BinaryFileReader.js",

  "../avm2/vm.js",
  "renderer.js",
];

if (isWorker) {
  print = function() {};
  if (typeof console === 'undefined') {
    console = {
      time: function (name) {
        Timer.start(name)
      },
      timeEnd: function (name) {
        Timer.stop(name)
      },
      warn: function (s) {
        if (traceWarnings.value) {
          print(s);
        }
      },
      info: function (s) {
        print(s);
      }
    };
  }
  importScripts.apply(null, earlyScripts);
  // OMTTODO: clean up these export
  var Counter = new metrics.Counter(true);
  var FrameCounter = new metrics.Counter(true);
  var CanvasCounter = new metrics.Counter(true);
  var Timer = metrics.Timer;
  var disassemble = systemOptions.register(new Option("d", "disassemble", "boolean", false, "disassemble"));
  var traceLevel = systemOptions.register(new Option("t", "traceLevel", "number", 0, "trace level"));
  var c4Options = systemOptions.register(new OptionSet("C4 Options"));
  var enableC4 = c4Options.register(new Option("c4", "c4", "boolean", false, "Enable the C4 compiler."));
  var c4TraceLevel = c4Options.register(new Option("tc4", "tc4", "number", 0, "Compiler Trace Level"));
  var enableRegisterAllocator = c4Options.register(new Option("ra", "ra", "boolean", false, "Enable register allocator."));
  importScripts.apply(null, scripts);
} else {
  self = window;
}

var instances = {};

self.addEventListener('message', function createVMListener(e) {
  if (e.data.type === 'init') {
    instances[e.data.id] = new SWFRuntime(e.data.id, e.data.config);
  }
  self.removeEventListener('message', createVMListener);
});

function SWFRuntime(id, config) {
  this._id = id;
  this._config = config;
  this._global = isWorker ? self : window;
  // TODO: get rid of the global avm2, or set it when entering an instance
  this._global.avm2 = this;
  this._global.addEventListener('message', this._onmessage.bind(this));
  this._init();
}
SWFRuntime.prototype = {
  updateRenderList: function(renderList) {
    this._global.postMessage({type: 'render', list: renderList.entries});
  },
  _onmessage: function(event) {
    var message = event.data;
    switch (message.type) {
      case 'runSWF':
        this._runSWF(message.file);
        break;
      case 'mouseEvent':
        this._onMouseEvent(message);
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
    this._global.postMessage(message, transferList);
  },
  _init: function() {
    this._vm = new AVM2(this._id, this._config, this._onVMReady.bind(this));
  },
  _onVMReady: function(vm) {
    this._postMessage({type: 'vmInit', id: this._id});
  },
  _runSWF: function(file) {
    var stage = this._stage = new flash.display.Stage();
    var loader = this._stageLoader = new flash.display.Loader();
    var loaderInfo = loader._contentLoaderInfo;
    stage._loader = loader;
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
    this._postMessage({type: 'viewInit', id: this._id});

    var root = this._stageLoader._content;
    root._dispatchEvent("added", undefined, true);
    root._dispatchEvent("addedToStage");

    renderStage(this._stage, null, {}, this);
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
      this._stage._mouseTarget._dispatchEvent('click');
    }
    this._stage._mouseOver = type !== 'mouseout';
    this._stage._mouseMoved = type === 'mousemove' || type === 'mouseover' ||
                              type === 'mouseout';
  },
  _onViewResize: function(width, height) {
    this._stage._swfFrameWidth = width;
    this._stage._swfFrameHeight = height;
  },
  _onVisibilityChange: function(hidden) {
    this._stage._viewHidden = hidden;
  }
};
