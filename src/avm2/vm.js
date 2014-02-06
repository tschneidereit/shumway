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

var instances = {};

var libraryAbcs;
var libraryScripts = playerGlobalScripts;
function grabAbc(abcName) {
  var entry = libraryScripts[abcName];
  if (entry) {
    var offset = entry.offset;
    var length = entry.length;
    return new AbcFile(new Uint8Array(libraryAbcs, offset, length), abcName);
  }
  return null
}

function AVM2(id, config, onReady) {
  this._id = id;
  this._config = config;
  this._onReady = onReady;
  this._global = isWorker ? self : window;
  // TODO: get rid of the global avm2, or set it when entering an instance
  this._global.avm2 = this;
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
    this._onReady(this);
    this._onReady = null;
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
          self._global.libraryAbcs = buffer;
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
