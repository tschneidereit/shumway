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

function AVM2(config, initCallback)
{
  this.instanceId = AVM2.instanceId++;
  var runInWorker = true;
  this.onReady = initCallback;
  if (runInWorker) {
    this._worker = new Worker('../../src/avm2/vm.js');
    this._worker.onmessage = this._onmessage.bind(this);
    this._worker.postMessage({
                               type: 'createVM',
                               id: this.instanceId,
                               config: config
                             });
  }
}
AVM2.instanceId = 0;
AVM2.prototype = {
  _onmessage: function(event) {
    switch (event.data.type) {
      case 'ready':
        if (this.onReady) {
          this.onReady();
        }
        break;
    }
  }
};
