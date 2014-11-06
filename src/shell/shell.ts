/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Let's you run Shumway from the command line.
 */

declare var scriptArgs;
declare var arguments;
declare var load;
declare var quit;
declare var read;
declare var include;

var homePath = "";
var avm2Root = homePath + "src/avm2/";
var builtinLibPath = avm2Root + "generated/builtin/builtin.abc";
var shellLibPath = avm2Root + "generated/shell/shell.abc";
var avm1LibPath = avm2Root + "generated/avm1lib/avm1lib.abc";
var playerglobalInfo = {
  abcs: "build/playerglobal/playerglobal.abcs",
  catalog: "build/playerglobal/playerglobal.json"
};

/**
 * Global unitTests array, unit tests add themselves to this. The list may have numbers, these indicate the
 * number of times to run the test following it. This makes it easy to disable test by pushing a zero in
 * front.
 */
var unitTests = [];

declare var microTaskQueue: Shumway.Shell.MicroTasksQueue;

declare var help;

declare var process, require, global;
var isNode = typeof process === 'object';
if (isNode) {
  // Trying to get Node.js to work... no comments... it's everywhere when the isNode used.
  global.Shumway = Shumway;
  global.RegExp = RegExp;
  global.unitTests = unitTests;
  read = function (path, type) {
    var buffer = require('fs').readFileSync(path);
    return type !== 'binary' ? buffer.toString() : new Uint8Array(buffer);
  };
  load = function (path:string) {
    var fn = new Function(load.header + read(path) + load.footer);
    fn.call(global);
  };
  var listOfGlobals = ['Shumway', 'document', 'window', 'release', 'jsGlobal',
    'profile', 'RegExp', 'XMLHttpRequest', 'addEventListener', 'navigator',
    'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'unitTests',
    'microTaskQueue'];
  load.header = listOfGlobals.map(function (s) {
    return s + ' = this.' + s;
  }).join(';') + ';\n';
  load.footer = '\n' + listOfGlobals.map(function (s) {
    return 'if (' + s + ' !== this.' + s + ') { this.' + s + ' = ' + s + '; }';
  }).join('\n');
}

load("src/shell/domstubs.js");

/* Autogenerated player references: base= */

load("build/ts/base.js");
load("build/ts/tools.js");

load("build/ts/avm2.js");

load("build/ts/swf.js");

load("build/ts/flash.js");

load("build/ts/avm1.js");

load("build/ts/gfx-base.js");
load("build/ts/player.js");

/* Autogenerated player references end */

var systemOptions: Shumway.Options.OptionSet = Shumway.Settings.shumwayOptions;
var shellOptions = systemOptions.register(new Shumway.Options.OptionSet("Shell Options"));

if (isNode) {
  load.header += Object.keys(Shumway.Unit).map(function (s) {
    return s + ' = Shumway.Unit.' + s;
  }).join(';') + ';\n';
  load.header += Object.keys(Shumway.AVM2.Runtime).map(function (s) {
    return s + ' = Shumway.AVM2.Runtime.' + s;
  }).join(';') + ';\n';
}

load('src/shell/playerservices.js');

module Shumway.Shell {
  import assert = Shumway.Debug.assert;
  import AbcFile = Shumway.AVM2.ABC.AbcFile;
  import Option = Shumway.Options.Option;
  import OptionSet = Shumway.Options.OptionSet;
  import ArgumentParser = Shumway.Options.ArgumentParser;

  import Runtime = Shumway.AVM2.Runtime;
  import SwfTag = Shumway.SWF.Parser.SwfTag;
  import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
  import flash = Shumway.AVM2.AS.flash;

  class ShellPlayer extends Shumway.Player.Player {
    onSendUpdates(updates:DataBuffer, assets:Array<DataBuffer>, async:boolean = true):DataBuffer {
      var bytes = updates.getBytes();
      // console.log('Updates sent');
      return null;
    }
    onFSCommand(command: string, args: string) {
      if (command === 'quit') {
        // console.log('Player quit');
        microTaskQueue.stop();
      }
    }
    onFrameProcessed() {
      // console.log('Frame');
    }
  }

  var verbose = false;
  var writer = new IndentingWriter();

  var parseOption: Option;
  var parseForDatabaseOption: Option;
  var disassembleOption: Option;
  var verboseOption: Option;
  var releaseOption: Option;
  var executeOption: Option;
  var interpreterOption: Option;
  var symbolFilterOption: Option;
  var microTaskDurationOption: Option;
  var microTaskCountOption: Option;
  var loadPlayerGlobalOption: Option;
  var loadShellLibOption: Option;
  var avm1Option: Option;
  var porcelainOutputOption: Option;

  var fuzzMillOption: Option;

  export function main(commandLineArguments: string []) {
    parseOption = shellOptions.register(new Option("p", "parse", "boolean", false, "Parse File(s)"));
    parseForDatabaseOption = shellOptions.register(new Option("po", "parseForDatabase", "boolean", false, "Parse File(s)"));
    disassembleOption = shellOptions.register(new Option("d", "disassemble", "boolean", false, "Disassemble File(s)"));
    verboseOption = shellOptions.register(new Option("v", "verbose", "boolean", false, "Verbose"));
    releaseOption = shellOptions.register(new Option("r", "release", "boolean", false, "Release mode"));
    executeOption = shellOptions.register(new Option("x", "execute", "boolean", false, "Execute File(s)"));
    interpreterOption = shellOptions.register(new Option("i", "interpreter", "boolean", false, "Interpreter Only"));
    symbolFilterOption = shellOptions.register(new Option("f", "filter", "string", "", "Symbol Filter"));
    microTaskDurationOption = shellOptions.register(new Option("md", "duration", "number", 0, "Micro task duration."));
    microTaskCountOption = shellOptions.register(new Option("mc", "count", "number", 0, "Micro task count."));
    loadPlayerGlobalOption = shellOptions.register(new Option("g", "playerGlobal", "boolean", false, "Load Player Global"));
    loadShellLibOption = shellOptions.register(new Option("s", "shell", "boolean", false, "Load Shell Global"));
    avm1Option = shellOptions.register(new Option(null, "avm1lib", "boolean", false, "Load avm1lib"));
    porcelainOutputOption = shellOptions.register(new Option(null, "porcelain", "boolean", false, "Keeps outputs free from the debug messages."));

    fuzzMillOption = shellOptions.register(new Option(null, "fuzz", "string", "", "Generates random SWFs XML."));

    var argumentParser = new ArgumentParser();
    argumentParser.addBoundOptionSet(systemOptions);

    function printUsage() {
      writer.enter("Shumway Command Line Interface");
      systemOptions.trace(writer);
      writer.leave("");
    }

    argumentParser.addArgument("h", "help", "boolean", {parse: function (x) {
      printUsage();
    }});

    var files = [];

    // Try and parse command line arguments.

    try {
      argumentParser.parse(commandLineArguments).filter(function (value, index, array) {
        if (value.endsWith(".abc") || value.endsWith(".swf") || value.endsWith(".js")) {
          files.push(value);
        } else {
          return true;
        }
      });
    } catch (x) {
      writer.writeLn(x.message);
      quit();
    }

    microTaskQueue = new Shumway.Shell.MicroTasksQueue();

    if (porcelainOutputOption.value) {
      console.info = console.log = console.warn = console.error = function () {};
    }

    release = releaseOption.value;
    verbose = verboseOption.value;

    if (!verbose) {
      IndentingWriter.logLevel = Shumway.LogLevel.Error | Shumway.LogLevel.Warn;
    }

    if (fuzzMillOption.value) {
      var fuzzer = new Shumway.Shell.Fuzz.Mill(new IndentingWriter(), fuzzMillOption.value);
      fuzzer.fuzz();
    }

    Shumway.Unit.writer = new IndentingWriter();

    if (parseOption.value) {
      files.forEach(function (file) {
        var start = dateNow();
        writer.debugLn("Parsing: " + file);
        parseFile(file, parseForDatabaseOption.value, symbolFilterOption.value.split(","));
        var elapsed = dateNow() - start;
        if (verbose) {
          verbose && writer.writeLn("Total Parse Time: " + (elapsed).toFixed(4));
        }
      });
    }

    if (executeOption.value) {
      var shouldLoadPlayerGlobal = loadPlayerGlobalOption.value;
      var shouldLoadAvm1 = false;
      if (!shouldLoadPlayerGlobal) {
        // We need to load player globals if any swfs need to be executed.
        files.forEach(file => {
          if (file.endsWith(".swf")) {
            shouldLoadPlayerGlobal = true;
            shouldLoadAvm1 = avm1Option.value;
          }
        });
      }
      initializeAVM2(shouldLoadPlayerGlobal, loadShellLibOption.value, shouldLoadAvm1);
      files.forEach(function (file) {
        executeFile(file);
      });
    } else if (disassembleOption.value) {
      files.forEach(function (file) {
        if (file.endsWith(".abc")) {
          disassembleABCFile(file);
        }
      });
    }

    if (Shumway.Unit.everFailed) {
      writer.errorLn('Some unit tests failed');
      quit(1);
    }
  }

  function disassembleABCFile(file: string) {
    var buffer = read(file, "binary");
    var abc = new AbcFile(new Uint8Array(buffer), file);
    abc.trace(writer);
  }

  function executeFile(file: string): boolean {
    if (file.endsWith(".js")) {
      executeUnitTestFile(file);
    } else if (file.endsWith(".abc")) {
      executeABCFile(file);
    } else if (file.endsWith(".swf")) {
      executeSWFFile(file, microTaskDurationOption.value, microTaskCountOption.value);
    }
    return true;
  }

  function executeSWFFile(file: string, runDuration: number, runCount: number) {
    function runSWF(file: any) {
      flash.display.Loader.reset();
      flash.display.DisplayObject.reset();
      flash.display.MovieClip.reset();
      var player = new ShellPlayer();
      player.load(file);
    }
    var asyncLoading = true;
    if (asyncLoading) {
      Shumway.FileLoadingService.instance.setBaseUrl(file);
      runSWF(file);
    } else {
      Shumway.FileLoadingService.instance.setBaseUrl(file);
      runSWF(read(file, 'binary'));
    }
    console.info("Running: " + file);
    microTaskQueue.run(runDuration, runCount, true);
  }

  function executeABCFile(file: string) {
    verboseOption.value && writer.writeLn("Running ABC: " + file);
    var buffer = read(file, "binary");
    try {
      Runtime.AVM2.instance.applicationDomain.executeAbc(new AbcFile(new Uint8Array(buffer), file));
    } catch (x) {
      writer.writeLns(x.stack);
    }
    verboseOption.value && writer.outdent();
  }

  function executeUnitTestFile(file: string) {
    writer.writeLn("Running test file: " + file + " ...");
    var start = dateNow();
    load(file);
    var testCount = 0;
    while (unitTests.length) {
      var test = unitTests.shift();
      var repeat = 1;
      if (typeof test === "number") {
        repeat = test;
        test = unitTests.shift();
      }
      if (verbose && test.name) {
        writer.writeLn("Test: " + test.name);
      }
      testCount += repeat;
      try {
        for (var i = 0; i < repeat; i++) {
          test();
        }
      } catch (x) {
        writer.redLn('Exception encountered while running ' + file + ':' + '(' + x + ')');
        writer.redLns(x.stack);
      }
    }
    writer.writeLn("Completed " + testCount + " test" + (testCount > 1 ? "s" : "") + " in " + (dateNow() - start).toFixed(2) + " ms.");
    writer.outdent();
  }

  function parseSymbol(tag, symbols) {
    var symbol;
    switch (tag.code) {
      case SwfTag.CODE_DEFINE_BITS:
      case SwfTag.CODE_DEFINE_BITS_JPEG2:
      case SwfTag.CODE_DEFINE_BITS_JPEG3:
      case SwfTag.CODE_DEFINE_BITS_JPEG4:
      case SwfTag.CODE_JPEG_TABLES:
        symbol = Shumway.SWF.Parser.defineImage(tag);
        break;
      case SwfTag.CODE_DEFINE_BITS_LOSSLESS:
      case SwfTag.CODE_DEFINE_BITS_LOSSLESS2:
        symbol = Shumway.SWF.Parser.defineBitmap(tag);
        break;
      case SwfTag.CODE_DEFINE_BUTTON:
      case SwfTag.CODE_DEFINE_BUTTON2:
        // symbol = Shumway.SWF.Parser.defineButton(tag, symbols);
        break;
      case SwfTag.CODE_DEFINE_EDIT_TEXT:
        symbol = Shumway.SWF.Parser.defineText(tag, symbols);
        break;
      case SwfTag.CODE_DEFINE_FONT:
      case SwfTag.CODE_DEFINE_FONT2:
      case SwfTag.CODE_DEFINE_FONT3:
      case SwfTag.CODE_DEFINE_FONT4:
        symbol = Shumway.SWF.Parser.defineFont(tag);
        break;
      case SwfTag.CODE_DEFINE_MORPH_SHAPE:
      case SwfTag.CODE_DEFINE_MORPH_SHAPE2:
      case SwfTag.CODE_DEFINE_SHAPE:
      case SwfTag.CODE_DEFINE_SHAPE2:
      case SwfTag.CODE_DEFINE_SHAPE3:
      case SwfTag.CODE_DEFINE_SHAPE4:
        symbol = Shumway.SWF.Parser.defineShape(tag, symbols);
        break;
      case SwfTag.CODE_DEFINE_SOUND:
        symbol = Shumway.SWF.Parser.defineSound(tag, symbols);
        break;
      default:
        // TODO: Handle all cases here.
        break;
    }
    symbols[tag.id] = symbol;
  }

  function ignoreTag(code, symbolFilters) {
    if (symbolFilters[0].length === 0) {
      return false;
    }
    for (var i = 0; i < symbolFilters.length; i++) {
      var filterCode = SwfTag[symbolFilters[i]];
      if (filterCode !== undefined && filterCode === code) {
        return false;
      }
    }
    return true;
  }

  /**
   * Parses file.
   */
  function parseFile(file: string, parseForDatabase: boolean, symbolFilters: string []): boolean {
    var fileName = file.replace(/^.*[\\\/]/, '');
    function parseABC(buffer: ArrayBuffer) {
      new AbcFile(new Uint8Array(buffer), "ABC");
    }
    var buffers = [];
    if (file.endsWith(".swf")) {
      var fileNameWithoutExtension = fileName.substr(0, fileName.length - 4);
      var SWF_TAG_CODE_DO_ABC = SwfTag.CODE_DO_ABC;
      var SWF_TAG_CODE_DO_ABC_ = SwfTag.CODE_DO_ABC_DEFINE;
      try {
        var buffer = read(file, "binary");
        var startSWF = dateNow();
        var swfFile: Shumway.SWFFile;
        var loadListener: ILoadListener = {
          onLoadOpen: function(file: Shumway.SWFFile) {
            swfFile = file;
          },
          onLoadProgress: function(update: LoadProgressUpdate) {
          },
          onLoadError: function() {
          },
          onLoadComplete: function() {
            // TODO: re-enable all-tags parsing somehow. SWFFile isn't the right tool for that.
          //  var symbols = {};
          //  var tags = result.tags;
          //  var counter = new Metrics.Counter(true);
          //  for (var i = 0; i < tags.length; i++) {
          //    var tag = tags[i];
          //    assert(tag.code !== undefined);
          //    if (ignoreTag(tag.code, symbolFilters)) {
          //      continue;
          //    }
          //    var startTag = dateNow();
          //    if (!parseForDatabase) {
          //      if (tag.code === SWF_TAG_CODE_DO_ABC || tag.code === SWF_TAG_CODE_DO_ABC_) {
          //        parseABC(tag.data);
          //      } else {
          //        parseSymbol(tag, symbols);
          //      }
          //    }
          //    var tagName = SwfTag[tag.code];
          //    if (tagName) {
          //      tagName = tagName.substring("CODE_".length);
          //    } else {
          //      tagName = "TAG" + tag.code;
          //    }
          //    counter.count(tagName, 1, dateNow() - startTag);
          //  }
          //  if (parseForDatabase) {
          //    writer.writeLn(JSON.stringify({
          //                                    size: buffer.byteLength,
          //                                    time: dateNow() - startSWF,
          //                                    name: fileNameWithoutExtension,
          //                                    tags: counter.toJSON()
          //                                  }, null, 0));
          //  } else if (verbose) {
          //    writer.enter("Tag Frequency:");
          //    counter.traceSorted(writer);
          //    writer.outdent();
          //  }
          }
        };
        var loader = new Shumway.FileLoader(loadListener);
        loader.loadBytes(buffer);
      } catch (x) {
        writer.redLn("Cannot parse: " + file + ", reason: " + x);
        if (verbose) {
          writer.redLns(x.stack);
        }
        return false;
      }
    } else if (file.endsWith(".abc")) {
      parseABC(read(file, "binary"));
    }
    return true;
  }

  function createAVM2(builtinLibPath, shellLibPath?,  libraryPathInfo?, avm1LibPath?: string) {
    var buffer = read(builtinLibPath, 'binary');
    var mode = interpreterOption.value ? Runtime.ExecutionMode.INTERPRET : Runtime.ExecutionMode.COMPILE;
    Runtime.AVM2.initialize(mode, mode, null);
    var avm2Instance = Runtime.AVM2.instance;
    Shumway.AVM2.AS.linkNatives(avm2Instance);
    avm2Instance.systemDomain.executeAbc(new AbcFile(new Uint8Array(buffer), "builtin.abc"));
    if (libraryPathInfo) {
      loadPlayerglobal(libraryPathInfo.abcs, libraryPathInfo.catalog);
    }
    if (shellLibPath) {
      var buffer = read(shellLibPath, 'binary');
      avm2Instance.systemDomain.executeAbc(new AbcFile(new Uint8Array(buffer), "shell.abc"));
    }
    if (avm1LibPath) {
      console.log('Loading AVM1: ' + avm1LibPath + '...');
      buffer = read(avm1LibPath, 'binary');
      Runtime.AVM2.instance.loadAVM1 = function () { return <any>Promise.resolve(); };
      avm2Instance.systemDomain.executeAbc(new AbcFile(new Uint8Array(buffer), "avm1lib.abc"));
    } else {
      Runtime.AVM2.instance.loadAVM1 = function () {
        console.error('avm1lib is required to run the SWF.');
        return <any>Promise.reject();
      };
    }
  }

  function initializeAVM2(loadPlayerglobal: boolean, loadShellLib: boolean, loadAvm1: boolean) {
    createAVM2(builtinLibPath, loadShellLib ? shellLibPath : undefined, loadPlayerglobal ? playerglobalInfo : undefined,
               loadAvm1 ? avm1LibPath : null);
  }

  function loadPlayerglobal(abcsPath, catalogPath) {
    var playerglobal = Shumway.AVM2.Runtime.playerglobal = {
      abcs: read(abcsPath, 'binary').buffer,
      map: Object.create(null),
      scripts: Object.create(null)
    };
    var catalog = JSON.parse(read(catalogPath));
    for (var i = 0; i < catalog.length; i++) {
      var abc = catalog[i];
      playerglobal.scripts[abc.name] = abc;
      if (typeof abc.defs === 'string') {
        playerglobal.map[abc.defs] = abc.name;
        writer.writeLn(abc.defs)
      } else {
        for (var j = 0; j < abc.defs.length; j++) {
          var def = abc.defs[j];
          playerglobal.map[def] = abc.name;
        }
      }
    }
  }
}

var commandLineArguments: string [];
// Shell Entry Point
if (typeof help === "function") {
  // SpiderMonkey
  if (typeof scriptArgs === "undefined") {
    commandLineArguments = arguments;
  } else {
    commandLineArguments = scriptArgs;
  }
} else if (isNode) {
  // node.js
  var commandLineArguments: string[] =
    Array.prototype.slice.call(process.argv, 2);
}
Shumway.Shell.main(commandLineArguments);
