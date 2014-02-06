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

define(['shumway/avm2/avm2Util', 'classes/Terminal', 'shumway/swf/Timeline',
        'inspectorSettings'],
       function(avm2Util, Terminal) {
  var traceTerminal = new Terminal(document.getElementById("traceTerminal"));
  traceTerminal.refreshEvery(100);

  function appendToTraceTerminal(str, color) {
    var scroll = traceTerminal.isScrolledToBottom();
    traceTerminal.buffer.append(str, color);
    if (scroll) {
      traceTerminal.gotoLine(traceTerminal.buffer.length - 1);
      traceTerminal.scrollIntoView();
    }
  }

  var console_log = console.log;
  var console_info = console.info;
  var console_warn = console.warn;

  console.log = function (str) {
    if (state.logToConsole) {
      console_log.apply(console, arguments);
    }
    appendToTraceTerminal([].join.call(arguments, " "));
  };
  console.info = function (str) {
    if (state.logToConsole) {
      console_info.apply(console, arguments);
    }
    appendToTraceTerminal([].join.call(arguments, " "), "#666600");
  };
  console.warn = function (str) {
    if (state.logToConsole) {
      console_warn.apply(console, arguments);
    }
    appendToTraceTerminal([].join.call(arguments, " "), "#FF6700");
  };

  var frameTerminal = new Terminal(document.getElementById("frameTerminal")); frameTerminal.refreshEvery(100);

  function appendToFrameTerminal(str, color) {
    var scroll = frameTerminal.isScrolledToBottom();
    frameTerminal.buffer.append(str, color);
    if (scroll) {
      frameTerminal.gotoLine(frameTerminal.buffer.length - 1);
      frameTerminal.scrollIntoView();
    }
  }

  var frameWriter = new IndentingWriter(false, function (str){
    appendToFrameTerminal(str);
  });

  var timeline = new Timeline(document.getElementById("fpsCanvas"));
});
