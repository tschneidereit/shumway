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

var earlyScripts = [
  "options.js",
  "settings.js",
  "avm2Util.js",
  "metrics.js",
  "../../lib/ByteArray.js",
];
var scripts = [
  "constants.js",
  "errors.js",
  "opcodes.js",
  "parser.js",
  "analyze.js",
  "compiler/lljs/src/estransform.js",
  "compiler/lljs/src/escodegen.js",
  "compiler/inferrer.js",
  "compiler/c4/ir.js",
  "compiler/builder.js",
  "compiler/c4/looper.js",
  "compiler/c4/transform.js",
  "compiler/c4/backend.js",
  "domain.js",
  "class.js",
  "xregexp.js",
  "runtime.js",
  "hacks.js",
  "array.js",
  "vectors-numeric.js",
  "vectors-generic.js",
  "xml.js",
  "json2.js",
  "amf.js",
  "proxy.js",
  "dictionary.js",
  "native.js",
  "disassembler.js",
  "interpreter.js",
  
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
  
  "../io/BinaryFileReader.js"
];

if (isWorker) {
  print = function() {};
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
  importScripts.apply(null, earlyScripts);
  // OMTTODO: clean up these export
  var Counter = new metrics.Counter(true);
  var FrameCounter = new metrics.Counter(true);
  var CanvasCounter = new metrics.Counter(true);
  var Timer = metrics.Timer;
  var disassemble = systemOptions.register(new Option("d", "disassemble", "boolean", false, "disassemble"));
  var traceLevel = systemOptions.register(new Option("t", "traceLevel", "number", 0, "trace level"));
  importScripts.apply(null, scripts);
}

var instances = {};

self.addEventListener('message', function createVMListener(e) {
  if (e.data.type === 'createVM') {
    instances[e.data.id] = new AVM2(e.data.id, e.data.config);
  }
//  self.removeEventListener('message', createVMListener);
});


//postMessage('foo');
function AVM2(id, config) {
  this._id = id;
  this._config = config;
  this._global = isWorker ? self : window;
  // TODO: get rid of the global avm2, or set it when entering an instance
  this._global.avm2 = this;
  this._global.addEventListener('message', this._onmessage.bind(this));
  this._init();
  this._loadAbcs();
}
/*
 * We sometimes need to know where we came from, such as in
 * |ApplicationDomain.currentDomain|.
 */
AVM2.currentAbc = function() {
  var caller = arguments.callee;
  var maxDepth = 20;
  for (var i = 0; i < maxDepth && caller; i++) {
    var mi = caller.methodInfo;
    if (mi) {
      return mi.abc;
    }
    caller = caller.caller;
  }
  return null;
};
AVM2.currentDomain = function () {
  var abc = this.currentAbc();
  assert (abc && abc.applicationDomain,
          "No domain environment was found on the stack, increase STACK_DEPTH or " +
          "make sure that a compiled / interpreted function is on the call stack.");
  return abc.applicationDomain;
};
AVM2.prototype = {
  _onmessage: function(event) {
    this._postMessage(event);
  },
  _postMessage: function(message, transferList) {
    this._global.postMessage(message, transferList);
  },
  _init: function() {
    this.loadedAbcs = Object.create(null);
    // All runtime exceptions are boxed in this object to tag them as having
    // originated from within the VM.
    this.exception = { value: undefined };
    this.exceptions = [];
    this.builtinsLoaded = false;
    this.isAVM1Loaded = false;
  },
  _signalReady: function() {
    this._postMessage({type: 'ready', id: this._id});
  },
  _loadAbcs: function() {
    var self = this;
    var config = this._config;
    var modes = config.modes;
    var paths = config.paths;
    // TODO: this will change when we implement security domains.
    var systemDomain = this.systemDomain = new ApplicationDomain(this, null,
                                                                 modes.sys,
                                                                 true);
    this.applicationDomain = new ApplicationDomain(this, systemDomain,
                                                   modes.app, false);
    new BinaryFileReader(paths.builtins).readAll(null, function(buffer) {
      systemDomain.onMessage.register('classCreated', Stubs.onClassCreated);
      systemDomain.executeAbc(new AbcFile(new Uint8Array(buffer),
                                          "builtin.abc"));
      self.builtinsLoaded = true;
      new BinaryFileReader(paths.library).readAll(null, function (buffer) {
        if (config.initLibraryEagerly) {
          systemDomain.executeAbc(new AbcFile(new Uint8Array(buffer),
                                              path.library));
        } else {
          self.libraryAbcs = buffer;
        }
        if (!config.loadAVM1) {
          self._signalReady();
          return;
        }
        new BinaryFileReader(paths.avm1).readAll(null, function (buffer) {
          systemDomain.executeAbc(new AbcFile(new Uint8Array(buffer),
                                              "avm1.abc"));
          self._signalReady();
        });
      });
    });
  },
  findDefiningAbc: function(mn) {
    if (!avm2.builtinsLoaded) {
      return null;
    }
    for (var i = 0; i < mn.namespaces.length; i++) {
      var name = mn.namespaces[i].originalURI + ":" + mn.name;
      var abcName = playerGlobalNames[name];
      if (abcName) {
        break;
      }
    }
    if (abcName) {
      return grabAbc(abcName);
    }
    return null;
  },
  notifyConstruct: function(instanceConstructor, args) {
    // REMOVEME
  }
};
