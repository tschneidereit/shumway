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

var DEFAULT_SETTINGS = {
  sysCompiler: true,
  appCompiler: true,
  verifier: true,
  trace: false,
  traceCalls: false,
  traceRuntime: false,
  allocator: false,
  render: true,
  mouse: true,
  qtree: false,
  redraw: false,
  wireframe: false,
  release: true,
  logToConsole: false,
  mute: false,
  turbo: true
};
var c4Options = systemOptions.register(new OptionSet("C4 Options"));
var enableC4 = c4Options.register(new Option("c4", "c4", "boolean", false, "Enable the C4 compiler."));
var c4TraceLevel = c4Options.register(new Option("tc4", "tc4", "number", 0, "Compiler Trace Level"));
var enableRegisterAllocator = c4Options.register(new Option("ra", "ra", "boolean", false, "Enable register allocator."));
var rendererOptions = coreOptions.register(new OptionSet("Renderer Options"));
var traceRenderer = rendererOptions.register(new Option("tr", "traceRenderer", "number", 0, "trace renderer execution"));
var disableRenderVisitor = rendererOptions.register(new Option("drv", "disableRenderVisitor", "boolean", false, "disable render visitor"));
var disableMouseVisitor = rendererOptions.register(new Option("dmv", "disableMouseVisitor", "boolean", false, "disable mouse visitor"));
var showRedrawRegions = rendererOptions.register(new Option("rr", "showRedrawRegions", "boolean", false, "show redraw regions"));
var renderAsWireframe = rendererOptions.register(new Option("raw", "renderAsWireframe", "boolean", false, "render as wireframe"));
var showQuadTree = rendererOptions.register(new Option("qt", "showQuadTree", "boolean", false, "show quad tree"));
var turboMode = rendererOptions.register(new Option("", "turbo", "boolean", false, "turbo mode"));
var forceHidpi = rendererOptions.register(new Option("", "forceHidpi", "boolean", false, "force hidpi"));
var skipFrameDraw = rendererOptions.register(new Option("", "skipFrameDraw", "boolean", true, "skip frame when not on time"));
var hud = rendererOptions.register(new Option("", "hud", "boolean", false, "show hud mode"));

var enableConstructChildren = rendererOptions.register(new Option("", "constructChildren", "boolean", true, "Construct Children"));
var enableEnterFrame = rendererOptions.register(new Option("", "enterFrame", "boolean", true, "Enter Frame"));
var enableAdvanceFrame = rendererOptions.register(new Option("", "advanceFrame", "boolean", true, "Advance Frame"));

var runtimeOptions = systemOptions.register(new OptionSet("Runtime Options"));

var traceScope = runtimeOptions.register(new Option("ts", "traceScope", "boolean", false, "trace scope execution"));
var traceExecution = runtimeOptions.register(new Option("tx", "traceExecution", "number", 0, "trace script execution"));
var traceCallExecution = runtimeOptions.register(new Option("txc", "traceCallExecution", "number", 0, "trace call execution"));

var functionBreak = runtimeOptions.register(new Option("fb", "functionBreak", "number", -1, "Inserts a debugBreak at function index #."));
var compileOnly = runtimeOptions.register(new Option("co", "compileOnly", "number", -1, "Compiles only function number."));
var compileUntil = runtimeOptions.register(new Option("cu", "compileUntil", "number", -1, "Compiles only until a function number."));
var debuggerMode = runtimeOptions.register(new Option("dm", "debuggerMode", "boolean", false, "matches avm2 debugger build semantics"));
var enableVerifier = runtimeOptions.register(new Option("verify", "verify", "boolean", false, "Enable verifier."));

var globalMultinameAnalysis = runtimeOptions.register(new Option("ga", "globalMultinameAnalysis", "boolean", false, "Global multiname analysis."));
var traceInlineCaching = runtimeOptions.register(new Option("tic", "traceInlineCaching", "boolean", false, "Trace inline caching execution."));

var compilerEnableExceptions = runtimeOptions.register(new Option("cex", "exceptions", "boolean", false, "Compile functions with catch blocks."));
var compilerMaximumMethodSize = runtimeOptions.register(new Option("cmms", "maximumMethodSize", "number", 4 * 1024, "Compiler maximum method size."));

var domainOptions = systemOptions.register(new OptionSet("ApplicationDomain Options"));
var traceClasses = domainOptions.register(new Option("tc", "traceClasses", "boolean", false, "trace class creation"));
var traceDomain = domainOptions.register(new Option("td", "traceDomain", "boolean", false, "trace domain property access"));

var EXECUTION_MODE = {
  INTERPRET: 0x1,
  COMPILE: 0x2
};

function loadState() {
  var settings = {};
  if (localStorage["Inspector-Settings"]) {
    settings = JSON.parse(localStorage["Inspector-Settings"]);
  }
  for (var key in DEFAULT_SETTINGS) {
    if (settings[key] === undefined) {
      settings[key] = DEFAULT_SETTINGS[key];
    }
  }
  return settings;
}

function saveState(state) {
  localStorage["Inspector-Settings"] = JSON.stringify(state);
}

var state = loadState();

updateAVM2State();

function updateAVM2State() {
  enableC4.value = true;
  enableVerifier.value = state.verifier;
  enableRegisterAllocator.value = state.allocator;
  traceExecution.value = state.trace ? 2 : 0;
  traceRenderer.value = state.trace ? 2 : 0;
  disableRenderVisitor.value = state.render ? false : true;
  disableMouseVisitor.value = state.mouse ? false : true;
  showQuadTree.value = state.qtree ? true : false;
  turboMode.value = state.turbo ? true : false;
  showRedrawRegions.value = state.redraw ? true : false;
  renderAsWireframe.value = state.wireframe ? true : false;
  traceCallExecution.value = state.traceCalls ? 1 : 0;
  traceCallExecution.value = state.traceRuntime ? 2 : traceCallExecution.value;
  debuggerMode.value = true;
  release = state.release;
  AVM1_TRACE_ENABLED = state.trace;
}

var lastCounts = {};

//setTimeout(function displayInfo() {
//  var output = "";
//  var pairs = [];
//
//  for (var name in Counter.counts) {
//    pairs.push([name, Counter.counts[name]]);
//  }
//
//  pairs.sort(function (a, b) {
//    return b[1] - a[1];
//  });
//
//  var totalCount = 0;
//  pairs.forEach(function (pair) {
//    var color;
//    if (pair[1] > 100000) {
//      color = "magenta";
//    } else if (pair[1] > 10000) {
//      color = "purple";
//    } else if (pair[1] > 1000) {
//      color = "red";
//    } else if (pair[1] > 100) {
//      color = "orange";
//    } else {
//      color = "green";
//    }
//    output += "<div style='padding: 2px; background-color: " + color + "'>" + pair[0] + ": " + pair[1] + " " + (pair[1] - lastCounts[pair[0]]) + "</div>";
//    totalCount += pair[1];
//  });
//  if (totalCount > 30000000) {
//    // Don't delete me, this is meant to be annoying.
//    throw "The Counters Are Too Damn High (> 30,000,000).";
//  }
//
//  document.getElementById("info").innerHTML = output;
//
//  copyProperties(lastCounts, Counter.counts);
//
//  output = "";
//  for (var name in Timer.flat.timers) {
//    var timer = Timer.flat.timers[name];
//    var str = timer.name + ": " + timer.total.toFixed(2) + " ms" +
//      ", count: " + timer.count +
//      ", avg: " + (timer.total / timer.count).toFixed(2) + " ms" +
//      ", last: " + timer.last.toFixed(2) + " ms";
//    output += str + "<br>";
//  }
//  document.getElementById("timerInfo").innerHTML = output;
//
//  setTimeout(displayInfo, 500);
//}, 500);

Array.prototype.forEach.call(document.querySelectorAll(".avm2Option"), function(element) {
  function setElementState(pressed) {
    if (pressed)
      element.classList.add("pressedState");
    else
      element.classList.remove("pressedState");
  }

  var id = element.getAttribute("id");
  element.addEventListener("click", function () {
    setElementState(state[id] = !state[id]);
    updateAVM2State();
    saveState(state);
    if (id === "wireframe" && swfController.stage) {
      swfController.stage._invalid = true;
    }
  });
  setElementState(state[id]);
});

document.getElementById("sample").addEventListener("click", function () {
  triggerSampling(5);
});

(function() {
  var chkLogToConsole = document.getElementById("chkLogToConsole")
  chkLogToConsole.checked = state.logToConsole;
  chkLogToConsole.addEventListener("click", function (event) {
    state.logToConsole = event.target.checked;
    saveState(state);
  });
})();

(function() {
  var muteButton = document.getElementById("muteButton");
  function setElementState() {
    if (state.mute) {
      muteButton.classList.remove("icon-volume-up");
      muteButton.classList.add("icon-volume-off");
    } else {
      muteButton.classList.add("icon-volume-up");
      muteButton.classList.remove("icon-volume-off");
    }
  }
  muteButton.addEventListener("click", function (event) {
    state.mute = !state.mute;
    avm2.systemDomain.getClass("flash.media.SoundMixer").native.static._setMasterVolume(state.mute ? 0 : 1);
    setElementState();
    saveState(state);
  });
  setElementState();
})();

(function () {
  var gui = new dat.GUI({ autoPlace: false });

  function addOptionSet(parent, set, open) {
    var folder = parent.addFolder(set.name);
    set.options.forEach(function (option) {
      if (option instanceof OptionSet) {
        addOptionSet(folder, option);
      } else {
        folder.add(option, "value", option.details).name(option.longName);
      }
    });
    open && folder.open();
  }

  // addOptionSet(gui, webGLOptions);
  addOptionSet(gui, rendererOptions, true);
  addOptionSet(gui, systemOptions);

  var folder = gui.addFolder("Debug Canvas");
  for (var k in DebugCanvasRenderingContext2D.Options) {
    folder.add(DebugCanvasRenderingContext2D.Options, k);
  }
  folder.open();

  document.getElementById("settingsContainer").appendChild(gui.domElement);
})();
