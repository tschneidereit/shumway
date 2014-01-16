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
  this._canvas = doc.createElement('canvas');
  this._ctx = this._canvas.getContext('2d');
  this._runtime = new Worker(config.paths.runtime);
  this._runtime.addEventListener('message', this._onRuntimeMessage.bind(this));
  this._init(config);
  this._file = file;
}
SWFView.prototype = {
  _init: function(config) {
    this._runtime.postMessage({type: 'init', config: config});
  },
  runSWF: function(file) {
    this._runtime.postMessage({type: 'runSWF', file: file});
  },
  _onRuntimeMessage: function(event) {
    console.log(event.data);
    var message = event.data;
    switch (message.type) {
      case 'ready':
        this.runSWF(this._file);
        this._file = null;
    }
  }
};
