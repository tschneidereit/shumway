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

declare var useNewParserOption: {value: boolean};

module Shumway {
  import assert = Shumway.Debug.assert;
  import Parser = Shumway.SWF.Parser;
  import IPipe = Shumway.SWF.Parser.IPipe;
  import SwfTag = Shumway.SWF.Parser.SwfTag;
  import createSoundStream = Shumway.SWF.Parser.createSoundStream;

  export class LoadProgressUpdate {
    constructor(public bytesLoaded: number,
                public bytesTotal: number,
                public framesLoaded: number,
                public framesLoadedDelta: number,
                public totalFrames: number,
                public abcBlocks: ABCBlock[],
                public abcBlocksLoadedDelta) {
    }
  }
  export interface ILoadListener {
    onLoadOpen: (SWFFile) => void;
    onLoadProgress: (update: LoadProgressUpdate) => void;
    onLoadComplete: () => void;
    onLoadError: () => void;
  }

  export class FileLoader {
    private _listener: ILoadListener;
    private _loadingServiceSession: FileLoadingSession;
    private _file: SWFFile;

    private _parsingPipe: IPipe;

    constructor(listener: ILoadListener) {
      release || assert(listener);
      this._listener = listener;
      this._loadingServiceSession = null;
      this._parsingPipe = null;
      this._file = null;
    }

    // TODO: strongly type
    loadFile(request: any) {
      var session = this._loadingServiceSession = FileLoadingService.instance.createSession();
      session.onopen = this.processLoadOpen.bind(this);
      session.onprogress = this.processNewData.bind(this);
      session.onerror = this.processError.bind(this);
      session.onclose = this.processLoadClose.bind(this);
      session.open(request);
    }
    abortLoad() {
      // TODO: implement
    }
    loadBytes(bytes: Uint8Array) {
      if (useNewParserOption.value) {
        this._file = createFileInstanceForHeader(bytes, bytes.length);
      } else {
        Parser.parse(bytes, this.createParsingContext(this.commitData.bind(this)));
      }
    }

    processLoadOpen() {
      if (useNewParserOption.value) {
        release || assert(!this._file);
      } else {
        this._parsingPipe =
            Parser.parseAsync(this.createParsingContext(this.commitData.bind(this)));
      }
    }
    processNewData(data: Uint8Array, progressInfo: {bytesLoaded: number; bytesTotal: number}) {
      if (useNewParserOption.value) {
        var prevFramesLoaded = 0;
        var prevAbcBlocksLoaded = 0;
        var file = this._file;
        if (!file) {
          file = this._file = createFileInstanceForHeader(data, progressInfo.bytesTotal);
          this._listener.onLoadOpen(file);
        } else {
          prevFramesLoaded = file.framesLoaded;
          prevAbcBlocksLoaded = file.abcBlocks.length;
          file.appendLoadedData(data);
        }
        var update = new LoadProgressUpdate(progressInfo.bytesLoaded, progressInfo.bytesTotal,
                                            file.framesLoaded, file.framesLoaded - prevFramesLoaded,
                                            file.frameCount,
                                            file.abcBlocks,
                                            file.abcBlocks.length - prevAbcBlocksLoaded);
        this._listener.onLoadProgress(update);
      } else {
        this._parsingPipe.push(data, progressInfo);
      }
    }
    processError(error) {
      Debug.warning('Loading error encountered:', error);
    }
    processLoadClose() {
      if (useNewParserOption.value) {
        if (this._file.bytesLoaded !== this._file.bytesTotal) {
          Debug.warning("Not Implemented: processing loadClose when loading shouldn't be finished");
        }
      } else {
        this._parsingPipe.close();
      }
    }

    commitData(data) {
      this._listener.onLoadProgress(data);
    }

    createParsingContext(commitData) {
      var commands = [];
      var symbols = {};
      var frame:any = { type: 'frame' };
      var tagsProcessed = 0;
      var soundStream = null;
      var bytesLoaded = 0;

      return {
        onstart: function (result) {
          commitData({command: 'init', result: result});
        },
        onimgprogress: function (bytesTotal) {
          // image progress events are sent with 1K increments
          while (bytesLoaded <= bytesTotal) {
            commitData({command: 'progress', result: {
              bytesLoaded: bytesLoaded,
              bytesTotal: bytesTotal,
              open: true
            }});
            bytesLoaded += Math.min(bytesTotal - bytesLoaded || 1024, 1024);
          }
        },
        onprogress: function (result) {
          // sending progress events with 64K increments
          if (result.bytesLoaded - bytesLoaded >= 65536) {
            while (bytesLoaded < result.bytesLoaded) {
              if (bytesLoaded) {
                commitData({command: 'progress', result: {
                  bytesLoaded: bytesLoaded,
                  bytesTotal: result.bytesTotal
                }});
              }
              bytesLoaded += 65536;
            }
          }

          var tags = result.tags;
          for (var n = tags.length; tagsProcessed < n; tagsProcessed++) {
            var tag = tags[tagsProcessed];
            if ('id' in tag) {
              var symbol = defineSymbol(tag, symbols, commitData);
              commitData(symbol, symbol.transferables);
              continue;
            }

            switch (tag.code) {
              case SwfTag.CODE_DEFINE_SCENE_AND_FRAME_LABEL_DATA:
                frame.sceneData = tag;
                break;
              case SwfTag.CODE_DEFINE_SCALING_GRID:
                var symbolUpdate = {
                  isSymbol: true,
                  id: tag.symbolId,
                  updates: {
                    scale9Grid: tag.splitter
                  }
                };
                commitData(symbolUpdate);
                break;
              case SwfTag.CODE_DO_ABC:
              case SwfTag.CODE_DO_ABC_DEFINE:
                commitData({
                             type: 'abc',
                             flags: tag.flags,
                             name: tag.name,
                             data: tag.data
                           });
                break;
              case SwfTag.CODE_DO_ACTION:
                var actionBlocks = frame.actionBlocks;
                if (actionBlocks)
                  actionBlocks.push(tag.actionsData);
                else
                  frame.actionBlocks = [tag.actionsData];
                break;
              case SwfTag.CODE_DO_INIT_ACTION:
                var initActionBlocks = frame.initActionBlocks ||
                                       (frame.initActionBlocks = []);
                initActionBlocks.push({spriteId: tag.spriteId, actionsData: tag.actionsData});
                break;
              case SwfTag.CODE_START_SOUND:
                commands.push(tag);
                break;
              case SwfTag.CODE_SOUND_STREAM_HEAD:
                try {
                  // TODO: make transferable
                  soundStream = createSoundStream(tag);
                  frame.soundStream = soundStream.info;
                } catch (e) {
                  // ignoring if sound stream codec is not supported
                  // console.error('ERROR: ' + e.message);
                }
                break;
              case SwfTag.CODE_SOUND_STREAM_BLOCK:
                if (soundStream) {
                  frame.soundStreamBlock = soundStream.decode(tag.data);
                }
                break;
              case SwfTag.CODE_EXPORT_ASSETS:
                var exports = frame.exports;
                if (exports)
                  frame.exports = exports.concat(tag.exports);
                else
                  frame.exports = tag.exports.slice(0);
                break;
              case SwfTag.CODE_SYMBOL_CLASS:
                var symbolClasses = frame.symbolClasses;
                if (symbolClasses)
                  frame.symbolClasses = symbolClasses.concat(tag.exports);
                else
                  frame.symbolClasses = tag.exports.slice(0);
                break;
              case SwfTag.CODE_FRAME_LABEL:
                frame.labelName = tag.name;
                break;
              case SwfTag.CODE_PLACE_OBJECT:
              case SwfTag.CODE_PLACE_OBJECT2:
              case SwfTag.CODE_PLACE_OBJECT3:
                commands.push(tag);
                break;
              case SwfTag.CODE_REMOVE_OBJECT:
              case SwfTag.CODE_REMOVE_OBJECT2:
                commands.push(tag);
                break;
              case SwfTag.CODE_SET_BACKGROUND_COLOR:
                frame.bgcolor = tag.color;
                break;
              case SwfTag.CODE_SHOW_FRAME:
                frame.repeat = tag.repeat;
                frame.commands = commands;
                frame.complete = !!tag.finalTag;
                commitData(frame);
                commands = [];
                frame = { type: 'frame' };
                break;
              default:
                Debug.warning('Dropped tag during parsing. Code: ' + tag.code + ' (' +
                                                                     SwfTag[tag.code] + ')');
            }
          }

          if (result.bytesLoaded >= result.bytesTotal) {
            commitData({command: 'progress', result: {
              bytesLoaded: result.bytesLoaded,
              bytesTotal: result.bytesTotal
            }});
          }
        },
        oncomplete: function (result) {
          commitData(result);

          var stats;
          if (typeof result.swfVersion === 'number') {
            // Extracting stats from the context object
            var bbox = result.bbox;
            stats = {
              topic: 'parseInfo', // HACK additional field for telemetry
              parseTime: result.parseTime,
              bytesTotal: result.bytesTotal,
              swfVersion: result.swfVersion,
              frameRate: result.frameRate,
              width: (bbox.xMax - bbox.xMin) / 20,
              height: (bbox.yMax - bbox.yMin) / 20,
              isAvm2: !!result.fileAttributes.doAbc
            };
          }

          commitData({command: 'complete', stats: stats});
        },
        onexception: function (e) {
          commitData({type: 'exception', message: e.message, stack: e.stack});
        }
      };
    }
  }

  function createFileInstanceForHeader(header: Uint8Array, fileLength: number) {
    var magic1 = header[0];
    var magic2 = header[1];
    var magic3 = header[2];

    // check for SWF
    if (magic2 === 87 && magic3 === 83) {
      return new SWFFile(header, fileLength);
    }

    // check for JPG
    if (magic1 === 0xff && magic2 === 0xd8 && magic3 === 0xff) {
      //return new JPEGFile(header);
    }

    // check for JPG
    if (magic1 === 0x89 && magic2 === 0x50 && magic3 === 0x4e) {
      //return new PNGFile(header);
    }

    // TODO: throw instead of returning null? Perhaps?
    return null;
  }

  import SWFTag = Shumway.SWF.Parser.SwfTag;
  import ControlTags = Shumway.SWF.Parser.ControlTags;
  import DefinitionTags = Shumway.SWF.Parser.DefinitionTags;
  import ImageDefinitionTags = Shumway.SWF.Parser.ImageDefinitionTags;
  import FontDefinitionTags = Shumway.SWF.Parser.FontDefinitionTags;

  import Stream = Shumway.SWF.Stream;
  import Inflate = Shumway.ArrayUtilities.Inflate;
  import ImageDefinition = Shumway.SWF.Parser.ImageDefinition;

  export class SWFFile {
    isCompressed: boolean;
    swfVersion: number;
    useAVM1: boolean;
    bytesLoaded: number;
    bytesTotal: number;
    bounds: Bounds;
    backgroundColor: number;
    attributes: any; // TODO: type strongly
    sceneAndFrameLabelData: any; // TODO: type strongly
    frameRate: number;
    frameCount: number;
    framesLoaded: number;
    frames: SWFFrame[];
    abcBlocks: ABCBlock[];
    dictionary: DictionaryEntry[];
    symbolsMap: string[];

    private uncompressedLength: number;
    private uncompressedLoadedLength: number;
    private data: Uint8Array;
    private dataView: DataView;
    private dataStream: Stream;
    private decompressor: Inflate;
    private currentSymbolsList: DictionaryEntry[];
    private eagerParsedSymbolsPending: number;
    private currentDisplayListCommands: UnparsedTag[];
    private currentFrameScripts: Uint8Array[];
    private currentActionBlocks: Uint8Array[];
    private currentInitActionBlocks: {spriteId: number; actionsData: Uint8Array}[];

    constructor(initialBytes: Uint8Array, length: number) {
      // TODO: cleanly abort loading/parsing instead of just asserting here.
      release || assert(initialBytes[0] === 67 || initialBytes[0] === 70,
                        "Unsupported compression format: " + (initialBytes[0] === 90 ?
                                                              "LZMA" :
                                                              initialBytes[0] + ''));
      release || assert(initialBytes[1] === 87);
      release || assert(initialBytes[2] === 83);
      release || assert(initialBytes.length >= 30, "At least the header must be complete here.");

      this.currentSymbolsList = [];
      this.currentDisplayListCommands = [];
      this.currentFrameScripts = [];
      this.currentActionBlocks = [];
      this.currentInitActionBlocks = [];
      this.eagerParsedSymbolsPending = 0;
      this.dictionary = [];
      this.symbolsMap = [];
      this.frames = [];
      this.abcBlocks = [];
      this.framesLoaded = 0;
      this.bytesTotal = length;
      this.attributes = null;
      this.sceneAndFrameLabelData = null;
      this.useAVM1 = true;
      this.backgroundColor = 0xffffffff;
      this.readHeaderAndInitialize(initialBytes);
    }

    getSymbol(id: number) {
      var unparsed = this.dictionary[id];
      if (!unparsed) {
        return null;
      }
      var handler = Parser.LowLevel.tagHandler[unparsed.tagCode];
      this.dataStream.align();
      this.dataStream.pos = unparsed.byteOffset;
      var tag = {code: unparsed.tagCode};
      var definition = handler(this.data, this.dataStream, tag, this.swfVersion, unparsed.tagCode);
      definition.className = this.symbolsMap[tag.code] || null;
      if (tag.code === SWFTag.CODE_DEFINE_SPRITE) {
        // TODO: replace this whole silly `type` business with tagCode checking.
        definition.type = 'sprite';
        parseSpriteTimeline(definition, unparsed, this.data, this.dataStream, this.dataView,
                            this.useAVM1);
        return definition;
      }
      release || assert(this.dataStream.pos === unparsed.byteOffset + unparsed.byteLength);
      return defineSymbol(definition, this.dictionary, null);
    }

    getParsedTag(unparsed: UnparsedTag) {
      var handler = Parser.LowLevel.tagHandler[unparsed.tagCode];
      this.dataStream.align();
      this.dataStream.pos = unparsed.byteOffset;
      var tag = {code: unparsed.tagCode};
      handler(this.data, this.dataStream, tag, this.swfVersion, unparsed.tagCode);
      release || assert(this.dataStream.pos === unparsed.byteOffset + unparsed.byteLength);
      return tag;
    }

    appendLoadedData(bytes: Uint8Array) {
      // TODO: only report decoded or sync-decodable bytes as loaded.
      this.bytesLoaded += bytes.length;
      release || assert(this.bytesLoaded <= this.bytesTotal);
      if (this.isCompressed) {
        this.decompressor.push(bytes);
      } else {
        this.processDecompressedData(bytes);
      }
    }

    private readHeaderAndInitialize(initialBytes: Uint8Array) {
      this.isCompressed = initialBytes[0] === 67;
      this.swfVersion = initialBytes[3];
      this.uncompressedLength = readSWFLength(initialBytes);
      this.bytesLoaded = initialBytes.length;
      this.data = new Uint8Array(this.uncompressedLength);
      this.dataStream = new Stream(this.data.buffer);
      this.dataStream.pos = 8;
      this.dataView = <DataView><any>this.dataStream;

      if (this.isCompressed) {
        this.data.set(initialBytes.subarray(0, 8));
        this.uncompressedLoadedLength = 8;
        this.decompressor = new Inflate(true);
        var self = this;
        // Parts of the header are compressed. Get those out of the way before starting tag parsing.
        this.decompressor.onData = function(data: Uint32Array) {
          self.data.set(data, self.uncompressedLoadedLength);
          self.uncompressedLoadedLength += data.length;
          // TODO: clean up second part of header parsing.
          var obj = Parser.LowLevel.readHeader(self.data, self.dataStream, null);
          self.bounds = Bounds.FromUntyped(obj.bbox);
          self.frameRate = obj.frameRate;
          self.frameCount = obj.frameCount;
          self.decompressor.onData = self.processDecompressedData.bind(self);
          self.scanLoadedData();
        }
        this.decompressor.push(initialBytes.subarray(8));
      } else {
        this.data.set(initialBytes);
        this.uncompressedLoadedLength = initialBytes.length;
        this.decompressor = null;
        // TODO: clean up second part of header parsing.
        var obj = Parser.LowLevel.readHeader(this.data, this.dataStream, null);
        this.bounds = Bounds.FromUntyped(obj);
        this.frameRate = obj.frameRate;
        this.frameCount = obj.frameCount;
        // TODO: only report decoded or sync-decodable bytes as loaded.
        release || assert(this.bytesLoaded === 0);
        this.bytesLoaded = initialBytes.length;
        this.scanLoadedData();
      }
    }

    private processDecompressedData(data: Uint8Array) {
      this.data.set(data, this.uncompressedLoadedLength);
      this.uncompressedLoadedLength += data.length;
      this.scanLoadedData();
    }

    private scanLoadedData() {
      // `parsePos` is always at the start of a tag at this point, because it only gets updated
      // when a tag has been fully parsed.
      while (this.dataStream.pos < this.uncompressedLoadedLength - 1) {
        if (!this.scanNextTag()) {
          break;
        }
      }
    }

    private scanNextTag() {
      var stream: Stream = this.dataStream;
      stream.align();
      var tagCodeAndLength = this.dataView.getUint16(stream.pos, true);
      var tagCode = tagCodeAndLength >> 6;
      var tagLength = tagCodeAndLength & 0x3f;
      var extendedLength = tagLength === 0x3f;
      if (extendedLength) {
        if (stream.pos + 6 > this.uncompressedLoadedLength) {
          return false;
        }
        tagLength = this.dataView.getUint32(stream.pos + 2, true);
      }
      if (stream.pos + tagLength > this.uncompressedLoadedLength) {
        return false;
      }
      var byteOffset = stream.pos = stream.pos + (extendedLength ? 6 : 2);

      if (tagCode === SWFTag.CODE_DEFINE_SPRITE) {
        // According to Chapter 13 of the SWF format spec, no nested definition tags are
        // allowed within DefineSprite. However, they're added to the symbol dictionary
        // anyway, and some tools produce them. Notably swfmill.
        // We essentially treat them as though they came before the current sprite. That
        // should be ok because it doesn't make sense for them to rely on their parent being
        // fully defined - so they don't have to come after it -, and any control tags within
        // the parent will just pick them up the moment they're defined, just as always.
        this.addLazySymbol(tagCode, byteOffset, tagLength);
        var spriteTagEnd = byteOffset + tagLength;
        stream.pos += 4; // Jump over symbol ID and frameCount.
        while (stream.pos < spriteTagEnd) {
          var tagCodeAndLength = this.dataView.getUint16(stream.pos, true);
          var tagCode = tagCodeAndLength >> 6;
          var tagLength = tagCodeAndLength & 0x3f;
          var extendedLength = tagLength === 0x3f;
          stream.pos += 2;
          if (extendedLength) {
            tagLength = this.dataView.getUint32(stream.pos, true);
            stream.pos += 4;
          }
          if (stream.pos + tagLength > spriteTagEnd) {
            Debug.warning("DefineSprite child tags exceed DefineSprite tag length and are dropped");
            stream.pos = spriteTagEnd;
            return true;
          }
          if (DefinitionTags[tagCode]) {
            this.addLazySymbol(tagCode, stream.pos, tagLength);
          }
          this.jumpToNextTag(tagLength);
        }
        return true;
      }
      if (ImageDefinitionTags[tagCode]) {
        // Images are decoded asynchronously, so we have to deal with them ahead of time to
        // ensure they're ready when used.
        this.decodeEmbeddedImage(tagCode, tagLength, byteOffset);
        return true;
      }
      if (!inFirefox && FontDefinitionTags[tagCode]) {
        // Firefox decodes fonts synchronously, so we can do it when the font is used the first
        // time. For other browsers, decode it eagerly so it's guaranteed to be available on use.
        this.decodeEmbeddedFont(tagCode, tagLength, byteOffset);
        return true;
      }
      if (DefinitionTags[tagCode]) {
        this.addLazySymbol(tagCode, byteOffset, tagLength);
        this.jumpToNextTag(tagLength);
        return true;
      }

      switch (tagCode) {
        case SWFTag.CODE_FILE_ATTRIBUTES:
          this.setFileAttributes(tagLength);
          break;
        case SWFTag.CODE_DEFINE_SCENE_AND_FRAME_LABEL_DATA:
          this.setSceneAndFrameLabelData(tagLength);
          break;
        case SWFTag.CODE_SET_BACKGROUND_COLOR:
          this.backgroundColor = Parser.LowLevel.rgb(this.data, this.dataStream);
          break;
        case SWFTag.CODE_DO_ABC:
        case SWFTag.CODE_DO_ABC_DEFINE:
          if (!this.useAVM1) {
            var tagEnd = byteOffset + tagLength;
            var abcBlock = new ABCBlock();
            if (tagCode === SwfTag.CODE_DO_ABC) {
              abcBlock.flags = Parser.readUi32(this.data, stream);
              abcBlock.name = Parser.readString(this.data, stream, 0);
            }
            else {
              abcBlock.flags = 0;
              abcBlock.name = "";
            }
            abcBlock.data = this.data.subarray(stream.pos, tagEnd);
            this.abcBlocks.push(abcBlock);
            stream.pos = tagEnd;
          } else {
            this.jumpToNextTag(tagLength);
          }
          break;
        case SWFTag.CODE_SYMBOL_CLASS:
          var tagEnd = byteOffset + tagLength;
          var symbolCount = Parser.readUi16(this.data, stream);
          while (symbolCount--) {
            var symbolId = Parser.readUi16(this.data, stream);
            var symbolClassName = Parser.readString(this.data, stream, 0);
            this.symbolsMap[symbolId] = symbolClassName;
          }
          // Make sure we move to end of tag even if the content is invalid.
          stream.pos = tagEnd;
          break;
        case SWFTag.CODE_DO_INIT_ACTION:
          if (this.useAVM1) {
            var initActionBlocks = this.currentInitActionBlocks ||
                                   (this.currentInitActionBlocks = []);
            var spriteId = this.dataView.getUint16(stream.pos, true);
            var byteOffset = stream.pos + 2;
            var actionsData = this.data.subarray(byteOffset, byteOffset + tagLength);
            initActionBlocks.push({spriteId: spriteId, actionsData: actionsData});
          }
          this.jumpToNextTag(tagLength);
          break;
        case SWFTag.CODE_DO_ACTION:
          if (this.useAVM1) {
            var actionBlocks = this.currentActionBlocks || (this.currentActionBlocks = []);
            actionBlocks.push(this.data.subarray(stream.pos, stream.pos + tagLength));
          }
          this.jumpToNextTag(tagLength);
          break;
        case SWFTag.CODE_PLACE_OBJECT:
        case SWFTag.CODE_PLACE_OBJECT2:
        case SWFTag.CODE_PLACE_OBJECT3:
        case SWFTag.CODE_REMOVE_OBJECT:
        case SWFTag.CODE_REMOVE_OBJECT2:
        case SWFTag.CODE_SOUND_STREAM_HEAD:
        case SWFTag.CODE_SOUND_STREAM_HEAD2:
        case SWFTag.CODE_SOUND_STREAM_BLOCK:
        case SWFTag.CODE_START_SOUND:
        case SWFTag.CODE_START_SOUND2:
        case SWFTag.CODE_VIDEO_FRAME:
          this.addControlTag(tagCode, byteOffset, tagLength);
          break;
        case SWFTag.CODE_SHOW_FRAME:
          this.finishFrame();
          break;
        // TODO: Support this grab-bag of tags.
        case SWFTag.CODE_CSM_TEXT_SETTINGS:
        case SWFTag.CODE_DEFINE_BUTTON_CXFORM:
        case SWFTag.CODE_DEFINE_BUTTON_SOUND:
        case SWFTag.CODE_DEFINE_FONT_ALIGN_ZONES:
        case SWFTag.CODE_DEFINE_FONT_INFO:
        case SWFTag.CODE_DEFINE_FONT_INFO2:
        case SWFTag.CODE_DEFINE_FONT_NAME:
        case SWFTag.CODE_DEFINE_SCALING_GRID:
        case SWFTag.CODE_SCRIPT_LIMITS:
        case SWFTag.CODE_SET_TAB_INDEX:
        case SWFTag.CODE_FRAME_LABEL:
        case SWFTag.CODE_END:
        case SWFTag.CODE_EXPORT_ASSETS:
        case SWFTag.CODE_IMPORT_ASSETS:
        case SWFTag.CODE_IMPORT_ASSETS2:
          Debug.warning('Grab-bag tag ' + tagCode + ': ' + SWFTag[tagCode]);
          this.jumpToNextTag(tagLength);
          break;
        // These tags are used by the player, but not relevant to us.
        case SWFTag.CODE_ENABLE_DEBUGGER:
        case SWFTag.CODE_ENABLE_DEBUGGER2:
        case SWFTag.CODE_DEBUG_ID:
        case SWFTag.CODE_PRODUCT_INFO:
        case SWFTag.CODE_METADATA:
        case SWFTag.CODE_PROTECT:
        case SWFTag.CODE_STOP_SOUND:
          this.jumpToNextTag(tagLength);
          break;
        // These tags aren't used in the player.
        case SWFTag.CODE_CHARACTER_SET:
        case SWFTag.CODE_DEFINE_BEHAVIOUR:
        case SWFTag.CODE_DEFINE_COMMAND_OBJECT:
        case SWFTag.CODE_DEFINE_FUNCTION:
        case SWFTag.CODE_EXTERNAL_FONT:
        case SWFTag.CODE_FREE_CHARACTER:
        case SWFTag.CODE_FREE_ALL:
        case SWFTag.CODE_DEFINE_VIDEO:
        case SWFTag.CODE_GENERATE_FRAME:
        case SWFTag.CODE_SYNC_FRAME:
        case SWFTag.CODE_DEFINE_TEXT_FORMAT:
          console.info("Ignored tag (these shouldn't occur) " + tagCode + ': ' + SWFTag[tagCode]);
          this.jumpToNextTag(tagLength);
          break;
        default:
          Debug.warning('Tag not handled by the parser: ' + tagCode + ': ' + SWFTag[tagCode]);
          this.jumpToNextTag(tagLength);
      }
      return true;
    }

    private jumpToNextTag(currentTagLength: number) {
      this.dataStream.pos += currentTagLength;
    }

    private finishFrame() {
      if (this.framesLoaded === this.frames.length && this.eagerParsedSymbolsPending === 0) {
        this.framesLoaded++;
      }
      this.frames.push(new SWFFrame(this.currentDisplayListCommands,
                                    this.currentFrameScripts,
                                    this.currentActionBlocks,
                                    this.currentInitActionBlocks,
                                    this.currentSymbolsList,
                                    this.eagerParsedSymbolsPending));
      this.currentSymbolsList = [];
      this.currentDisplayListCommands = [];
      this.currentFrameScripts = null;
      this.currentActionBlocks = null;
      this.currentInitActionBlocks = null;
      this.eagerParsedSymbolsPending = 0;
    }

    private setFileAttributes(tagLength: number) {
      // TODO: check what happens to attributes tags that aren't the first tag.
      if (this.attributes) {
        this.jumpToNextTag(tagLength);
      }
      this.attributes = Parser.LowLevel.fileAttributes(this.data, this.dataStream, null);
      this.useAVM1 = !this.attributes.doAbc;
    }

    private setSceneAndFrameLabelData(tagLength: number) {
      if (this.sceneAndFrameLabelData) {
        this.jumpToNextTag(tagLength);
      }
      this.sceneAndFrameLabelData = Parser.LowLevel.defineScene(this.data, this.dataStream, null);
    }

    private addControlTag(tagCode: number, byteOffset: number, tagLength: number) {
      Debug.warning('control tag ' + tagCode + ': ' + SWFTag[tagCode]);
      this.currentDisplayListCommands.push(new UnparsedTag(tagCode, byteOffset, tagLength));
      this.jumpToNextTag(tagLength);

    }
    private addLazySymbol(tagCode: number, byteOffset: number, tagLength: number) {
      var id = this.dataStream.getUint16(this.dataStream.pos, true);
      console.log("Lazy symbol: " + tagCode + ' (' + SWFTag[tagCode] + '), id: ' + id);
      var symbol = new DictionaryEntry(id, tagCode, byteOffset, tagLength);
      this.currentSymbolsList.push(symbol);
      this.dictionary[id] = symbol;
    }

    private decodeEmbeddedFont(tagCode: number, tagLength: number, byteOffset: number) {
      var tag;
      switch (tagCode) {
        case SWFTag.CODE_DEFINE_FONT:
          tag = Shumway.SWF.Parser.LowLevel.defineFont(this.data, this.dataStream, null,
                                                       this.swfVersion, tagCode);
          break;
        case SWFTag.CODE_DEFINE_FONT2:
        case SWFTag.CODE_DEFINE_FONT3:
          tag = Shumway.SWF.Parser.LowLevel.defineFont2(this.data, this.dataStream, null,
                                                        this.swfVersion, tagCode);
          break;
        case SWFTag.CODE_DEFINE_FONT4:
          tag = Shumway.SWF.Parser.LowLevel.defineFont4(this.data, this.dataStream, null,
                                                        this.swfVersion, tagCode);
          break;
        default:
          release || Debug.assertUnreachable("Invalid tag passed to decodeEmbeddedFont: " +
                                             tagCode);
      }
      var definition = Shumway.SWF.Parser.defineFont(tag);
      var symbol = new EagerlyParsedDictionaryEntry(tag.id, tagCode, byteOffset, tagLength,
                                                    definition, this.frames.length);
      this.currentSymbolsList.push(symbol);
      Shumway.registerCSSFont(definition.id, definition.data);
      setTimeout(this.markSymbolAsDecoded.bind(this, symbol), 400);
    }

    private decodeEmbeddedImage(tagCode: number, tagLength: number, byteOffset: number) {
      var definition: ImageDefinition;
      if (tagCode === SWFTag.CODE_DEFINE_BITS_LOSSLESS ||
          tagCode === SWFTag.CODE_DEFINE_BITS_LOSSLESS2) {
        var tag = Shumway.SWF.Parser.LowLevel.defineBitmap(this.data, this.dataStream, null,
                                                           this.swfVersion, tagCode);
        definition = Shumway.SWF.Parser.defineBitmap(tag);
      } else {
        var tag = Shumway.SWF.Parser.LowLevel.defineImage(this.data, this.dataStream, null,
                                                          this.swfVersion, tagCode);
        definition = Shumway.SWF.Parser.defineImage(tag, null);
      }
      var symbol = new EagerlyParsedDictionaryEntry(tag.id, tagCode, byteOffset, tagLength,
                                                    definition, this.frames.length);
      this.currentSymbolsList.push(symbol);
      decodeImage(definition, this.markSymbolAsDecoded.bind(this, symbol));
    }

    private markSymbolAsDecoded(symbol: EagerlyParsedDictionaryEntry, event?: any) {
      // TODO: handle decoding errors
      symbol.ready = true;
      var frame = this.frames[symbol.frameIndex];
      if (frame) {
        frame.pendingSymbolsCount--;
        release || assert(frame.pendingSymbolsCount >= 0);
        var index = symbol.frameIndex;
        while (frame && frame.pendingSymbolsCount === 0) {
          this.framesLoaded++;
          frame = this.frames[++index];
        }
      } else {
        this.eagerParsedSymbolsPending--;
        release || assert(this.eagerParsedSymbolsPending >= 0);
      }
    }
  }

  function decodeImage(definition: ImageDefinition, oncomplete: (event: any) => void) {
    var image = new Image();
    image.src = URL.createObjectURL(new Blob([definition.data]));
    image.onload = oncomplete;
    image.onerror = oncomplete;
  }

  function parseSpriteTimeline(tag, unparsed: DictionaryEntry, data: Uint8Array, stream: Stream,
                               dataView: DataView, useAVM1: boolean) {
    var spriteTagEnd = unparsed.byteOffset + unparsed.byteLength;
    var frames = tag.frames = [];
    var commands: UnparsedTag[] = [];
    var scripts: Uint8Array[] = null;
    var actionBlocks: Uint8Array[] = null;
    var initActionBlocks:  {spriteId: number; actionsData: Uint8Array}[] = null;
    while (stream.pos < spriteTagEnd) {
      var tagCodeAndLength = dataView.getUint16(stream.pos, true);
      var tagCode = tagCodeAndLength >> 6;
      var tagLength = tagCodeAndLength & 0x3f;
      var extendedLength = tagLength === 0x3f;
      stream.pos += 2;
      if (extendedLength) {
        tagLength = dataView.getUint32(stream.pos, true);
        stream.pos += 4;
      }
      if (stream.pos + tagLength > spriteTagEnd) {
        Debug.warning("DefineSprite child tags exceed DefineSprite tag length and are dropped");
        return;
      }
      if (ControlTags[tagCode]) {
        commands.push(new UnparsedTag(tagCode, stream.pos, tagLength));
      } else if (tagCode === SWFTag.CODE_DO_ACTION && useAVM1) {
        if (!actionBlocks) {
          actionBlocks = [];
        }
        actionBlocks.push(data.subarray(stream.pos, stream.pos + tagLength));
      } else if (tagCode === SWFTag.CODE_DO_INIT_ACTION && useAVM1) {
        if (!initActionBlocks) {
          initActionBlocks = [];
        }
        var spriteId = dataView.getUint16(stream.pos, true);
        stream.pos += 2;
        var actionsData = data.subarray(stream.pos, stream.pos + tagLength);
        initActionBlocks.push({spriteId: spriteId, actionsData: actionsData});
      } else if (tagCode === SWFTag.CODE_SHOW_FRAME) {
        frames.push(new SWFFrame(commands, scripts, actionBlocks, initActionBlocks, null, null));
        commands = [];
        scripts = null;
      }
      stream.pos += tagLength;
    }
  }

  export class SWFFrame {
    displayListCommands: UnparsedTag[];
    scripts: Uint8Array[];
    actionBlocks: Uint8Array[];
    initActionBlocks:  {spriteId: number; actionsData: Uint8Array}[];
    symbols: DictionaryEntry[];
    pendingSymbolsCount: number;
    constructor(commands: UnparsedTag[], scripts: Uint8Array[], actionBlocks: Uint8Array[],
                initActionBlocks: {spriteId: number; actionsData: Uint8Array}[],
                symbols: DictionaryEntry[], pendingSymbolsCount: number) {
      release || Object.freeze(commands);
      this.displayListCommands = commands;
      release || Object.freeze(scripts);
      this.scripts = scripts;
      release || Object.freeze(actionBlocks);
      this.actionBlocks = actionBlocks;
      release || Object.freeze(initActionBlocks);
      this.initActionBlocks = initActionBlocks;
      release || Object.freeze(symbols);
      this.symbols = symbols;
      this.pendingSymbolsCount = pendingSymbolsCount;
    }
  }

  export class ABCBlock {
    name: string;
    flags: number;
    data: Uint8Array;
  }

  export class UnparsedTag {
    constructor(public tagCode: number, public byteOffset: number, public byteLength: number) {
    }
  }

  export class DictionaryEntry extends UnparsedTag {
    public id: number;
    constructor(id: number, tagCode: number, byteOffset: number, byteLength: number) {
      super(tagCode, byteOffset, byteLength);
      this.id = id;
    }
  }

  class EagerlyParsedDictionaryEntry extends DictionaryEntry {
    definition: any;
    frameIndex: number;
    ready: boolean;
    constructor(id: number, tagCode: number, byteOffset: number, tagLength: number, definition: any,
                frameIndex: number) {
      super(id, tagCode, byteOffset, tagLength);
      this.definition = definition;
      this.frameIndex = frameIndex;
      this.ready = false;
    }
  }

  function readSWFLength(bytes: Uint8Array) {
    // We read the length manually because creating a DataView just for that is silly.
    return bytes[4] | bytes[5] << 8 | bytes[6] << 16 | bytes[7] << 24;
  }

  var inFirefox = typeof navigator !== 'undefined' && navigator.userAgent.indexOf('Firefox') >= 0;

  function defineSymbol(swfTag, symbols, commitData) {
    var symbol;

    switch (swfTag.code) {
      case SwfTag.CODE_DEFINE_BITS:
      case SwfTag.CODE_DEFINE_BITS_JPEG2:
      case SwfTag.CODE_DEFINE_BITS_JPEG3:
      case SwfTag.CODE_DEFINE_BITS_JPEG4:
      case SwfTag.CODE_JPEG_TABLES:
        symbol = Shumway.SWF.Parser.defineImage(swfTag, symbols);
        break;
      case SwfTag.CODE_DEFINE_BITS_LOSSLESS:
      case SwfTag.CODE_DEFINE_BITS_LOSSLESS2:
        symbol = Shumway.SWF.Parser.defineBitmap(swfTag);
        break;
      case SwfTag.CODE_DEFINE_BUTTON:
      case SwfTag.CODE_DEFINE_BUTTON2:
        symbol = Shumway.SWF.Parser.defineButton(swfTag, symbols);
        break;
      case SwfTag.CODE_DEFINE_EDIT_TEXT:
        symbol = Shumway.SWF.Parser.defineText(swfTag, symbols);
        break;
      case SwfTag.CODE_DEFINE_FONT:
      case SwfTag.CODE_DEFINE_FONT2:
      case SwfTag.CODE_DEFINE_FONT3:
      case SwfTag.CODE_DEFINE_FONT4:
        symbol = Shumway.SWF.Parser.defineFont(swfTag);
        break;
      case SwfTag.CODE_DEFINE_MORPH_SHAPE:
      case SwfTag.CODE_DEFINE_MORPH_SHAPE2:
      case SwfTag.CODE_DEFINE_SHAPE:
      case SwfTag.CODE_DEFINE_SHAPE2:
      case SwfTag.CODE_DEFINE_SHAPE3:
      case SwfTag.CODE_DEFINE_SHAPE4:
        symbol = Shumway.SWF.Parser.defineShape(swfTag, symbols);
        break;
      case SwfTag.CODE_DEFINE_SOUND:
        symbol = Shumway.SWF.Parser.defineSound(swfTag, symbols);
        break;
      case SwfTag.CODE_DEFINE_BINARY_DATA:
        symbol = {
          type: 'binary',
          id: swfTag.id,
          // TODO: make transferable
          data: swfTag.data
        };
        break;
      case SwfTag.CODE_DEFINE_SPRITE:
        var commands = [];
        var frame:any = { type: 'frame' };
        var frames = [];
        var tags = swfTag.tags;
        var frameScripts = null;
        var frameIndex = 0;
        var soundStream = null;
        for (var i = 0, n = tags.length; i < n; i++) {
          var tag:any = tags[i];
          if ('id' in tag) {
            // According to Chapter 13 of the SWF format spec, no nested definition tags are
            // allowed within DefineSprite. However, they're added to the symbol dictionary
            // anyway, and some tools produce them. Notably swfmill.
            // We essentially treat them as though they came before the current sprite. That
            // should be ok because it doesn't make sense for them to rely on their parent being
            // fully defined - so they don't have to come after it -, and any control tags within
            // the parent will just pick them up the moment they're defined, just as always.
            var symbol = defineSymbol(tag, symbols, commitData);
            commitData(symbol, symbol.transferables);
            continue;
          }
          switch (tag.code) {
            case SwfTag.CODE_DO_ACTION:
              if (!frameScripts)
                frameScripts = [];
              frameScripts.push(frameIndex);
              frameScripts.push(tag.actionsData);
              break;
            // case SwfTag.CODE_DO_INIT_ACTION: ??
            case SwfTag.CODE_START_SOUND:
              commands.push(tag);
              break;
            case SwfTag.CODE_SOUND_STREAM_HEAD:
              try {
                // TODO: make transferable
                soundStream = createSoundStream(tag);
                frame.soundStream = soundStream.info;
              } catch (e) {
                // ignoring if sound stream codec is not supported
                // console.error('ERROR: ' + e.message);
              }
              break;
            case SwfTag.CODE_SOUND_STREAM_BLOCK:
              if (soundStream) {
                frame.soundStreamBlock = soundStream.decode(tag.data);
              }
              break;
            case SwfTag.CODE_FRAME_LABEL:
              frame.labelName = tag.name;
              break;
            case SwfTag.CODE_PLACE_OBJECT:
            case SwfTag.CODE_PLACE_OBJECT2:
            case SwfTag.CODE_PLACE_OBJECT3:
              commands.push(tag);
              break;
            case SwfTag.CODE_REMOVE_OBJECT:
            case SwfTag.CODE_REMOVE_OBJECT2:
              commands.push(tag);
              break;
            case SwfTag.CODE_SHOW_FRAME:
              frameIndex += tag.repeat;
              frame.repeat = tag.repeat;
              frame.commands = commands;
              frames.push(frame);
              commands = [];
              frame = { type: 'frame' };
              break;
            default:
              Debug.warning('Dropped tag during parsing. Code: ' + tag.code + ' (' +
                                                                   SwfTag[tag.code] + ')');
          }
        }
        if (frames.length === 0) {
          // We need at least one frame
          frame.repeat = 1;
          frame.commands = commands;
          frames.push(frame);
        }
        symbol = {
          type: 'sprite',
          id: swfTag.id,
          frameCount: swfTag.frameCount,
          frames: frames,
          frameScripts: frameScripts
        };
        break;
      case SwfTag.CODE_DEFINE_TEXT:
      case SwfTag.CODE_DEFINE_TEXT2:
        symbol = Shumway.SWF.Parser.defineLabel(swfTag, symbols);
        break;
      default:
        Debug.warning('Dropped tag during parsing. Code: ' + tag.code + ' (' +
                                                             SwfTag[tag.code] + ')');
    }

    if (!symbol) {
      return {command: 'error', message: 'unknown symbol type: ' + swfTag.code};
    }

    symbol.isSymbol = true;
    symbols[swfTag.id] = symbol;
    return symbol;
  }
}
