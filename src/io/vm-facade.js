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

function AVM2(runInWorker, sysMode, appMode, findDefiningAbc, loadAVM1,
              onReadyCallback)
{
  this.onReady = onReadyCallback;
  if (runInWorker) {
    this.worker = new Worker('../../src/avm2/vm.js');
    this.worker.onmessage = function() {
      if (this.onReady) {
        this.onReady();
      }
    }
  }
}
AVM2.prototype = {

};
var AVM2 = (function () {

  function avm2(runInWorker, sysMode, appMode, findDefiningAbc, loadAVM1,
                onReadyCallback)
  {
    this.onReady = onReadyCallback;
    if (runInWorker) {
      this.worker = new Worker('../../src/avm2/vm.js');
      this.worker.onmessage = function() {
        if (this.onReady) {
          this.onReady();
        }
      }
    }
    // TODO: this will change when we implement security domains.
    this.systemDomain = new ApplicationDomain(this, null, sysMode, true);
    this.applicationDomain = new ApplicationDomain(this, this.systemDomain, appMode, false);
    this.findDefiningAbc = findDefiningAbc;
    this.loadAVM1 = loadAVM1;
    this.isAVM1Loaded = false;

    /**
     * All runtime exceptions are boxed in this object to tag them as having
     * originated from within the VM.
     */
    this.exception = { value: undefined };
    this.exceptions = [];
  }

  // We sometimes need to know where we came from, such as in
  // |ApplicationDomain.currentDomain|.

  avm2.currentAbc = function () {
    var caller = arguments.callee;
    var maxDepth = 20;
    var abc = null;
    for (var i = 0; i < maxDepth && caller; i++) {
      var mi = caller.methodInfo;
      if (mi) {
        abc = mi.abc;
        break;
      }
      caller = caller.caller;
    }
    return abc;
  };

  avm2.currentDomain = function () {
    var abc = this.currentAbc();
    assert (abc && abc.applicationDomain,
            "No domain environment was found on the stack, increase STACK_DEPTH or " +
            "make sure that a compiled / interpreted function is on the call stack.");
    return abc.applicationDomain;
  };

  avm2.prototype = {
    notifyConstruct: function notifyConstruct (instanceConstructor, args) {
      // REMOVEME
    }
  };

  return avm2;

})();
