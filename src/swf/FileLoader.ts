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


module Shumway {
  import assert = Shumway.Debug.assert;
  import Parser = Shumway.SWF.Parser;
  import SwfTag = Shumway.SWF.Parser.SwfTag;

  export class LoadProgressUpdate {
    constructor(public bytesLoaded: number,
                public framesLoaded: number,
                public abcBlocksLoaded: number) {
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
    private _delayedUpdates: LoadProgressUpdate[];
    private _delayedUpdatesPromise: Promise<any>;


    constructor(listener: ILoadListener) {
      release || assert(listener);
      this._listener = listener;
      this._loadingServiceSession = null;
      this._file = null;
      this._delayedUpdates = null;
      this._delayedUpdatesPromise = null;
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
      this._file = createFileInstanceForHeader(bytes, bytes.length);
    }
    processLoadOpen() {
      release || assert(!this._file);
    }
    processNewData(data: Uint8Array, progressInfo: {bytesLoaded: number; bytesTotal: number}) {
      var file = this._file;
      if (!file) {
        file = this._file = createFileInstanceForHeader(data, progressInfo.bytesTotal);
        this._listener.onLoadOpen(file);
      } else {
        file.appendLoadedData(data);
      }
      var update = new LoadProgressUpdate(progressInfo.bytesLoaded,
                                          file.frames.length,
                                          file.abcBlocks.length);
      if (!(file.pendingSymbolsPromise || this._delayedUpdatesPromise)) {
        this._listener.onLoadProgress(update);
        return;
      }
      var promise = Promise.all([file.pendingSymbolsPromise, this._delayedUpdatesPromise]);
      var self = this;
      promise.then(function () {
        self._listener.onLoadProgress(update);
        if (self._delayedUpdatesPromise === promise) {
          self._delayedUpdatesPromise = null;
        }
      });
    }
    processError(error) {
      Debug.warning('Loading error encountered:', error);
    }
    processLoadClose() {
      if (this._file.bytesLoaded !== this._file.bytesTotal) {
        Debug.warning("Not Implemented: processing loadClose when loading was aborted");
      }
    }
    createParsingContext(commitData) {
      var commands = [];
      var symbols = {};
      var frame:any = { type: 'frame' };
      var tagsProcessed = 0;
      var soundStream = null;
      var bytesLoaded = 0;

      return {
        onprogress: function (result) {
          var tags = result.tags;
          for (var n = tags.length; tagsProcessed < n; tagsProcessed++) {
            var tag = tags[tagsProcessed];
            if ('id' in tag) {
              var symbol = defineSymbol(tag, symbols);
              commitData(symbol, symbol.transferables);
              continue;
            }

            switch (tag.code) {
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
            }
          }
        },
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

  import SWFTag = Parser.SwfTag;
  import DefinitionTags = Parser.DefinitionTags;
  import ImageDefinitionTags = Parser.ImageDefinitionTags;
  import FontDefinitionTags = Parser.FontDefinitionTags;
  import ImageDefinition = Parser.ImageDefinition;
  import ControlTags = Parser.ControlTags;

  import Stream = SWF.Stream;
  import Inflate = ArrayUtilities.Inflate;

  export class SWFFile {
    isCompressed: boolean;
    swfVersion: number;
    useAVM1: boolean;
    backgroundColor: number;
    bounds: Bounds;
    frameRate: number;
    frameCount: number;
    attributes: any; // TODO: type strongly
    sceneAndFrameLabelData: any; // TODO: type strongly

    bytesLoaded: number;
    bytesTotal: number;
    framesLoaded: number;

    frames: SWFFrame[];
    abcBlocks: ABCBlock[];
    dictionary: DictionaryEntry[];

    symbolClassesMap: string[];
    eagerlyParsedSymbols: EagerlyParsedDictionaryEntry[];
    pendingSymbolsPromise: Promise<any>;

    private uncompressedLength: number;
    private uncompressedLoadedLength: number;
    private data: Uint8Array;
    private dataView: DataView;
    private dataStream: Stream;
    private decompressor: Inflate;
    private jpegTables: any;
    private endTagEncountered: boolean;

    private currentFrameLabel: string;
    private currentSoundStreamHead: Parser.SoundStream;
    private currentSoundStreamBlock: Uint8Array;
    private currentDisplayListCommands: UnparsedTag[];
    private currentActionBlocks: Uint8Array[];
    private currentInitActionBlocks: InitActionBlock[];
    private currentExports: SymbolExport[];

    constructor(initialBytes: Uint8Array, length: number) {
      // TODO: cleanly abort loading/parsing instead of just asserting here.
      release || assert(initialBytes[0] === 67 || initialBytes[0] === 70,
                        "Unsupported compression format: " + (initialBytes[0] === 90 ?
                                                              "LZMA" :
                                                              initialBytes[0] + ''));
      release || assert(initialBytes[1] === 87);
      release || assert(initialBytes[2] === 83);
      release || assert(initialBytes.length >= 30, "At least the header must be complete here.");

      this.isCompressed = false;
      this.swfVersion = 0;
      this.useAVM1 = true;
      this.backgroundColor = 0xffffffff;
      this.bounds = null;
      this.frameRate = 0;
      this.frameCount = 0;
      this.attributes = null;
      this.sceneAndFrameLabelData = null;

      this.bytesLoaded = 0;
      this.bytesTotal = length;
      this.framesLoaded = 0;

      this.frames = [];
      this.abcBlocks = [];
      this.dictionary = [];

      this.symbolClassesMap = [];
      this.eagerlyParsedSymbols = [];
      this.pendingSymbolsPromise = null;
      this.jpegTables = null;

      this.currentFrameLabel = null;
      this.currentSoundStreamHead = null;
      this.currentSoundStreamBlock = null;
      this.currentDisplayListCommands = null;
      this.currentActionBlocks = null;
      this.currentInitActionBlocks = null;
      this.currentExports = null;
      this.endTagEncountered = false;
      this.readHeaderAndInitialize(initialBytes);
    }

    getSymbol(id: number) {
      if (this.eagerlyParsedSymbols[id]) {
        return this.eagerlyParsedSymbols[id];
      }
      var unparsed = this.dictionary[id];
      if (!unparsed) {
        return null;
      }
      var symbol;
      if (unparsed.tagCode === SWFTag.CODE_DEFINE_SPRITE) {
        // TODO: replace this whole silly `type` business with tagCode checking.
        symbol = parseSpriteTimeline(unparsed, this.data, this.dataStream, this.dataView,
                                     this.useAVM1);
      } else {
        symbol = this.getParsedTag(unparsed);
      }
      symbol.className = this.symbolClassesMap[id] || null;
      return symbol;
    }

    getParsedTag(unparsed: UnparsedTag): any {
      SWF.enterTimeline('Parse tag ' + SwfTag[unparsed.tagCode]);
      this.dataStream.align();
      this.dataStream.pos = unparsed.byteOffset;
      var tag: any = {code: unparsed.tagCode};
      var handler = Parser.LowLevel.tagHandlers[unparsed.tagCode];
      var tagEnd = unparsed.byteOffset + unparsed.byteLength;
      handler(this.data, this.dataStream, tag, this.swfVersion, unparsed.tagCode, tagEnd);
      var finalPos = this.dataStream.pos;
      release || assert(finalPos <= tagEnd);
      if (finalPos < tagEnd) {
        var consumedBytes = finalPos - unparsed.byteOffset;
        Debug.warning('Scanning ' + SWFTag[unparsed.tagCode] + ' at offset ' +
                      unparsed.byteOffset + ' consumed ' + consumedBytes + ' of ' +
                      unparsed.byteLength + ' bytes. (' + (tagEnd - finalPos) + ' left)');
        this.dataStream.pos = tagEnd;
      }
      var symbol = defineSymbol(tag, this.dictionary);
      SWF.leaveTimeline();
      return symbol;
    }

    appendLoadedData(bytes: Uint8Array) {
      this.pendingSymbolsPromise = null;
      // TODO: only report decoded or sync-decodable bytes as loaded.
      this.bytesLoaded += bytes.length;
      release || assert(this.bytesLoaded <= this.bytesTotal);
      // Tags after the end tag are simply ignored, so we don't even have to scan them.
      if (this.endTagEncountered) {
        return;
      }
      if (this.isCompressed) {
        this.decompressor.push(bytes, true);
      } else {
        this.processDecompressedData(bytes);
      }
      SWF.enterTimeline('Scan loaded SWF file tags');
      this.scanLoadedData();
      SWF.leaveTimeline();
    }

    private readHeaderAndInitialize(initialBytes: Uint8Array) {
      SWF.enterTimeline('Initialize SWFFile');
      this.isCompressed = initialBytes[0] === 67;
      this.swfVersion = initialBytes[3];
      this.uncompressedLength = readSWFLength(initialBytes);
      // TODO: only report decoded or sync-decodable bytes as loaded.
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
          var obj = Parser.LowLevel.readHeader(self.data, self.dataStream);
          self.bounds = obj.bounds;
          self.frameRate = obj.frameRate;
          self.frameCount = obj.frameCount;
          self.decompressor.onData = self.processDecompressedData.bind(self);
        };
        this.decompressor.push(initialBytes.subarray(8), true);
      } else {
        this.data.set(initialBytes);
        this.uncompressedLoadedLength = initialBytes.length;
        this.decompressor = null;
        // TODO: clean up second part of header parsing.
        var obj = Parser.LowLevel.readHeader(this.data, this.dataStream);
        this.bounds = obj.bounds;
        this.frameRate = obj.frameRate;
        this.frameCount = obj.frameCount;
      }
      SWF.leaveTimeline();
      SWF.enterTimeline('Scan loaded SWF file tags');
      this.scanLoadedData();
      SWF.leaveTimeline();
    }

    private processDecompressedData(data: Uint8Array) {
      this.data.set(data, this.uncompressedLoadedLength);
      this.uncompressedLoadedLength += data.length;
      if (this.uncompressedLoadedLength === this.uncompressedLength) {
        this.decompressor = null;
      }
    }

    private scanLoadedData() {
      // `parsePos` is always at the start of a tag at this point, because it only gets updated
      // when a tag has been fully parsed.
      while (this.dataStream.pos < this.uncompressedLoadedLength - 1) {
        var position = this.dataStream.pos;
        var tagCodeAndLength = this.dataView.getUint16(position, true);
        position += 2;
        var tagCode = tagCodeAndLength >> 6;
        var tagLength = tagCodeAndLength & 0x3f;
        var extendedLength = tagLength === 0x3f;
        if (extendedLength) {
          if (position + 4 > this.uncompressedLoadedLength) {
            return;
          }
          tagLength = this.dataView.getUint32(position, true);
          position += 4;
        }
        if (position + tagLength > this.uncompressedLoadedLength) {
          return;
        }
        this.dataStream.pos = position;
        this.scanTag(tagCode, tagLength);
        release || assert(this.dataStream.pos <= position + tagLength);
        if (this.dataStream.pos < position + tagLength) {
          var consumedBytes = this.dataStream.pos - position;
          Debug.warning('Scanning ' + SWFTag[tagCode] + ' at offset ' + position + ' consumed ' +
                        consumedBytes + ' of ' + tagLength + ' bytes. (' +
                        (tagLength - consumedBytes) + ' left)');
          this.dataStream.pos = position + tagLength;
        }
        if (this.endTagEncountered) {
          return;
        }
      }
    }

    private scanTag(tagCode: number, tagLength: number): void {
      var stream: Stream = this.dataStream;
      var byteOffset = stream.pos;

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
            return;
          }
          if (DefinitionTags[tagCode]) {
            this.addLazySymbol(tagCode, stream.pos, tagLength);
          } else if (tagCode = SWFTag.CODE_END) {
            stream.pos = spriteTagEnd;
            return;
          }
          this.jumpToNextTag(tagLength);
        }
        return;
      }
      if (ImageDefinitionTags[tagCode]) {
        // Images are decoded asynchronously, so we have to deal with them ahead of time to
        // ensure they're ready when used.
        var unparsed = this.addLazySymbol(tagCode, byteOffset, tagLength);
        this.decodeEmbeddedImage(unparsed);
        return;
      }
      if (FontDefinitionTags[tagCode]) {
        var unparsed = this.addLazySymbol(tagCode, byteOffset, tagLength);
        this.decodeEmbeddedFont(unparsed);
        return;
      }
      if (DefinitionTags[tagCode]) {
        this.addLazySymbol(tagCode, byteOffset, tagLength);
        this.jumpToNextTag(tagLength);
        return;
      }
      if (ControlTags[tagCode]) {
        this.addControlTag(tagCode, byteOffset, tagLength);
        return;
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
        case SWFTag.CODE_JPEG_TABLES:
          // Only use the first JpegTables tag, ignore any following.
          if (!this.jpegTables) {
            this.jpegTables = tagLength === 0 ?
                              new Uint8Array(0) :
                              this.data.subarray(stream.pos, stream.pos + tagLength - 2);
          }
          this.jumpToNextTag(tagLength);
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
          // TODO: check if symbols can be reassociated after instances have been created.
          while (symbolCount--) {
            var symbolId = Parser.readUi16(this.data, stream);
            var symbolClassName = Parser.readString(this.data, stream, 0);
            this.symbolClassesMap[symbolId] = symbolClassName;
          }
          // Make sure we move to end of tag even if the content is invalid.
          stream.pos = tagEnd;
          break;
        case SWFTag.CODE_DO_INIT_ACTION:
          if (this.useAVM1) {
            var initActionBlocks = this.currentInitActionBlocks ||
                                   (this.currentInitActionBlocks = []);
            var spriteId = this.dataView.getUint16(stream.pos, true);
            var actionsData = this.data.subarray(byteOffset + 2, byteOffset + tagLength);
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
        case SWFTag.CODE_SOUND_STREAM_HEAD:
        case SWFTag.CODE_SOUND_STREAM_HEAD2:
          var soundStreamTag = Parser.LowLevel.soundStreamHead(this.data, this.dataStream);
          this.currentSoundStreamHead = Parser.SoundStream.FromTag(soundStreamTag);
          break;
        case SWFTag.CODE_SOUND_STREAM_BLOCK:
          this.currentSoundStreamBlock = this.data.subarray(stream.pos, stream.pos += tagLength);
          break;
        case SWFTag.CODE_FRAME_LABEL:
          var tagEnd = stream.pos + tagLength;
          this.currentFrameLabel = Parser.readString(this.data, stream, 0);
          // TODO: support SWF6+ anchors.
          stream.pos = tagEnd;
          break;
        case SWFTag.CODE_SHOW_FRAME:
          this.finishFrame();
          break;
        // TODO: Support this grab-bag of tags.
        case SWFTag.CODE_END:
          this.endTagEncountered = true;
          return;
        case SWFTag.CODE_EXPORT_ASSETS:
          var tagEnd = stream.pos + tagLength;
          var exportsCount = Parser.readUi16(this.data, stream);
          var exports = this.currentExports || (this.currentExports = []);
          while (exportsCount--) {
            var symbolId = Parser.readUi16(this.data, stream);
            var className = Parser.readString(this.data, stream, 0);
            if (stream.pos > tagEnd) {
              stream.pos = tagEnd;
              break;
            }
            exports.push(new SymbolExport(symbolId, className));
          }
          stream.pos = tagEnd;
          break;
        case SWFTag.CODE_DEFINE_BUTTON_CXFORM:
        case SWFTag.CODE_DEFINE_BUTTON_SOUND:
        case SWFTag.CODE_DEFINE_FONT_INFO:
        case SWFTag.CODE_DEFINE_FONT_INFO2:
        case SWFTag.CODE_DEFINE_SCALING_GRID:
        case SWFTag.CODE_IMPORT_ASSETS:
        case SWFTag.CODE_IMPORT_ASSETS2:
          Debug.warning('Unsupported tag encountered ' + tagCode + ': ' + SWFTag[tagCode]);
          this.jumpToNextTag(tagLength);
          break;
        // These tags should be supported at some point, but for now, we ignore them.
        case SWFTag.CODE_CSM_TEXT_SETTINGS:
        case SWFTag.CODE_DEFINE_FONT_ALIGN_ZONES:
        case SWFTag.CODE_SCRIPT_LIMITS:
        case SWFTag.CODE_SET_TAB_INDEX:
          this.jumpToNextTag(tagLength);
          break;
        // These tags are used by the player, but not relevant to us.
        case SWFTag.CODE_ENABLE_DEBUGGER:
        case SWFTag.CODE_ENABLE_DEBUGGER2:
        case SWFTag.CODE_DEBUG_ID:
        case SWFTag.CODE_DEFINE_FONT_NAME:
        case SWFTag.CODE_PRODUCT_INFO:
        case SWFTag.CODE_METADATA:
        case SWFTag.CODE_PROTECT:
          this.jumpToNextTag(tagLength);
          break;
        // These tags aren't used in the player.
        case SWFTag.CODE_CHARACTER_SET:
        case SWFTag.CODE_DEFINE_BEHAVIOUR:
        case SWFTag.CODE_DEFINE_COMMAND_OBJECT:
        case SWFTag.CODE_DEFINE_FUNCTION:
        case SWFTag.CODE_DEFINE_TEXT_FORMAT:
        case SWFTag.CODE_DEFINE_VIDEO:
        case SWFTag.CODE_EXTERNAL_FONT:
        case SWFTag.CODE_FREE_CHARACTER:
        case SWFTag.CODE_FREE_ALL:
        case SWFTag.CODE_GENERATE_FRAME:
        case SWFTag.CODE_STOP_SOUND:
        case SWFTag.CODE_SYNC_FRAME:
          console.info("Ignored tag (these shouldn't occur) " + tagCode + ': ' + SWFTag[tagCode]);
          this.jumpToNextTag(tagLength);
          break;
        default:
          Debug.warning('Tag not handled by the parser: ' + tagCode + ': ' + SWFTag[tagCode]);
          this.jumpToNextTag(tagLength);
      }
    }

    private jumpToNextTag(currentTagLength: number) {
      this.dataStream.pos += currentTagLength;
    }

    private finishFrame() {
      if (this.framesLoaded === this.frames.length) {
        this.framesLoaded++;
      }
      this.frames.push(new SWFFrame(this.currentFrameLabel,
                                    this.currentDisplayListCommands,
                                    this.currentSoundStreamHead,
                                    this.currentSoundStreamBlock,
                                    this.currentActionBlocks,
                                    this.currentInitActionBlocks,
                                    this.currentExports));
      this.currentFrameLabel = null;
      this.currentDisplayListCommands = null;
      this.currentSoundStreamHead = null;
      this.currentSoundStreamBlock = null;
      this.currentActionBlocks = null;
      this.currentInitActionBlocks = null;
      this.currentExports = null;
    }

    private setFileAttributes(tagLength: number) {
      // TODO: check what happens to attributes tags that aren't the first tag.
      if (this.attributes) {
        this.jumpToNextTag(tagLength);
      }
      var bits = this.data[this.dataStream.pos];
      this.dataStream.pos += 4;
      this.attributes = {
        network: bits & 0x1,
        relativeUrls: bits & 0x2,
        noCrossDomainCaching: bits & 0x4,
        doAbc: bits & 0x8,
        hasMetadata: bits & 0x10,
        useGpu: bits & 0x20,
        useDirectBlit : bits & 0x40
      };
      this.useAVM1 = !this.attributes.doAbc;
    }

    private setSceneAndFrameLabelData(tagLength: number) {
      if (this.sceneAndFrameLabelData) {
        this.jumpToNextTag(tagLength);
      }
      this.sceneAndFrameLabelData = Parser.LowLevel.defineScene(this.data, this.dataStream, null);
    }

    private addControlTag(tagCode: number, byteOffset: number, tagLength: number) {
      var commands = this.currentDisplayListCommands || (this.currentDisplayListCommands = []);
      commands.push(new UnparsedTag(tagCode, byteOffset, tagLength));
      this.jumpToNextTag(tagLength);

    }
    private addLazySymbol(tagCode: number, byteOffset: number, tagLength: number) {
      var id = this.dataStream.getUint16(this.dataStream.pos, true);
      var symbol = new DictionaryEntry(id, tagCode, byteOffset, tagLength);
      this.dictionary[id] = symbol;
      return symbol;
    }

    private decodeEmbeddedFont(unparsed: UnparsedTag) {
      var definition = this.getParsedTag(unparsed);
      var symbol = new EagerlyParsedDictionaryEntry(definition.id, unparsed, 'font', definition);
      this.eagerlyParsedSymbols[symbol.id] = symbol;
      // Only register fonts with embedded glyphs.
      if (!definition.data) {
        return;
      }
      Shumway.registerCSSFont(definition.id, definition.data);
      // Firefox decodes fonts synchronously, so we don't need to delay other processing until it's
      // done. For other browsers, delay for a time that should be enough in all cases.
      setTimeout(this.markSymbolAsDecoded.bind(this, symbol), 400);
    }

    private decodeEmbeddedImage(unparsed: UnparsedTag) {
      var definition = this.getParsedTag(unparsed);
      var symbol = new EagerlyParsedDictionaryEntry(definition.id, unparsed, 'image', definition);
      this.eagerlyParsedSymbols[symbol.id] = symbol;
      var promise = decodeImage(definition, this.markSymbolAsDecoded.bind(this, symbol));
      var currentPromise = this.pendingSymbolsPromise;
      this.pendingSymbolsPromise = currentPromise ?
                                   Promise.all([currentPromise, promise]) :
                                   promise;
    }

    private markSymbolAsDecoded(symbol: EagerlyParsedDictionaryEntry, event?: any) {
      symbol.ready = true;
      if (event && event.type === 'error') {
        Debug.warning("Decoding of image symbol failed", symbol, event);
      }
    }
  }

  function decodeImage(definition: ImageDefinition, oncomplete: (event: any) => void) {
    var image = definition.image = new Image();
    image.src = URL.createObjectURL(new Blob([definition.data], {type: definition.mimeType}));
    return new Promise(function(resolve, reject) {
      image.onload = resolve;
      image.onerror = resolve;
    }).then(oncomplete);
  }

  function parseSpriteTimeline(unparsed: DictionaryEntry, data: Uint8Array, stream: Stream,
                               dataView: DataView, useAVM1: boolean) {
    SWF.enterTimeline("parseSpriteTimeline");
    var timeline: any = {
      id: unparsed.id,
      type: 'sprite',
      frames: []
    }
    var spriteTagEnd = unparsed.byteOffset + unparsed.byteLength;
    var frames = timeline.frames;
    var label: string = null;
    var commands: UnparsedTag[] = [];
    var soundStreamHead: Parser.SoundStream = null;
    var soundStreamBlock: Uint8Array = null;
    var actionBlocks: Uint8Array[] = null;
    var initActionBlocks:  {spriteId: number; actionsData: Uint8Array}[] = null;
    // Skip ID.
    stream.pos = unparsed.byteOffset + 2;
    // TODO: check if numFrames or the real number of ShowFrame tags wins. (Probably the former.)
    timeline.frameCount = dataView.getUint16(stream.pos, true);
    stream.pos += 2;
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
        break;
      }

      if (Parser.ControlTags[tagCode]) {
        commands.push(new UnparsedTag(tagCode, stream.pos, tagLength));
        stream.pos += tagLength;
        continue;
      }

      switch (tagCode) {
        case SWFTag.CODE_DO_ACTION:
          if (useAVM1) {
            if (!actionBlocks) {
              actionBlocks = [];
            }
            actionBlocks.push(data.subarray(stream.pos, stream.pos + tagLength));
          }
          break;
        case SWFTag.CODE_DO_INIT_ACTION:
          if (useAVM1) {
            if (!initActionBlocks) {
              initActionBlocks = [];
            }
            var spriteId = dataView.getUint16(stream.pos, true);
            stream.pos += 2;
            var actionsData = data.subarray(stream.pos, stream.pos + tagLength);
            initActionBlocks.push({spriteId: spriteId, actionsData: actionsData});
          }
          break;
        case SWFTag.CODE_FRAME_LABEL:
          var tagEnd = stream.pos + tagLength;
          label = Parser.readString(data, stream, 0);
          // TODO: support SWF6+ anchors.
          stream.pos = tagEnd;
          tagLength = 0;
          break;
        case SWFTag.CODE_SHOW_FRAME:
          frames.push(new SWFFrame(label, commands, soundStreamHead, soundStreamBlock,
                                   actionBlocks, initActionBlocks, null));
          label = null;
          commands = [];
          soundStreamHead = null;
          soundStreamBlock = null;
          actionBlocks = null;
          initActionBlocks = null;
          break;
        case SWFTag.CODE_END:
          stream.pos = spriteTagEnd;
          tagLength = 0;
          break;
        default:
          // Ignore other tags.
      }
      stream.pos += tagLength;
      release || assert(stream.pos <= spriteTagEnd);
    }
    SWF.leaveTimeline();
    return timeline;
  }

  export class SWFFrame {
    labelName: string;
    displayListCommands: UnparsedTag[];
    soundStreamHead: Parser.SoundStream;
    soundStreamBlock: Uint8Array;
    actionBlocks: Uint8Array[];
    initActionBlocks: InitActionBlock[];
    exports: SymbolExport[];
    constructor(labelName: string, commands: UnparsedTag[],
                soundStreamHead: Parser.SoundStream,
                soundStreamBlock: Uint8Array,
                actionBlocks: Uint8Array[],
                initActionBlocks: InitActionBlock[],
                exports: SymbolExport[]) {
      this.labelName = labelName;
      release || commands && Object.freeze(commands);
      this.displayListCommands = commands;
      release || actionBlocks && Object.freeze(actionBlocks);
      this.soundStreamHead = soundStreamHead;
      this.soundStreamBlock = soundStreamBlock;
      this.actionBlocks = actionBlocks;
      release || initActionBlocks && Object.freeze(initActionBlocks);
      this.initActionBlocks = initActionBlocks;
      release || exports && Object.freeze(exports);
      this.exports = exports;
    }
  }

  export class ABCBlock {
    name: string;
    flags: number;
    data: Uint8Array;
  }

  export class InitActionBlock {
    spriteId: number;
    actionsData: Uint8Array;
  }

  export class SymbolExport {
    constructor(public symbolId: number, public className: string) {}
  }

  export class UnparsedTag {
    constructor(public tagCode: number, public byteOffset: number, public byteLength: number) {}
  }

  export class DictionaryEntry extends UnparsedTag {
    public id: number;
    constructor(id: number, tagCode: number, byteOffset: number, byteLength: number) {
      super(tagCode, byteOffset, byteLength);
      this.id = id;
    }
  }

  export class EagerlyParsedDictionaryEntry extends DictionaryEntry {
    type: string;
    definition: Object;
    ready: boolean;
    constructor(id: number, unparsed: UnparsedTag, type: string, definition: any) {
      super(id, unparsed.tagCode, unparsed.byteOffset, unparsed.byteLength);
      this.type = type;
      this.definition = definition;
      this.ready = false;
    }
  }

  function readSWFLength(bytes: Uint8Array) {
    // We read the length manually because creating a DataView just for that is silly.
    return bytes[4] | bytes[5] << 8 | bytes[6] << 16 | bytes[7] << 24;
  }

  var inFirefox = typeof navigator !== 'undefined' && navigator.userAgent.indexOf('Firefox') >= 0;

  function defineSymbol(swfTag, symbols) {
    var symbol;

    switch (swfTag.code) {
      case SwfTag.CODE_DEFINE_BITS:
      case SwfTag.CODE_DEFINE_BITS_JPEG2:
      case SwfTag.CODE_DEFINE_BITS_JPEG3:
      case SwfTag.CODE_DEFINE_BITS_JPEG4:
        symbol = Shumway.SWF.Parser.defineImage(swfTag);
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
        symbol = Shumway.SWF.Parser.defineShape(swfTag);
        break;
      case SwfTag.CODE_DEFINE_SOUND:
        symbol = Shumway.SWF.Parser.defineSound(swfTag, symbols);
        break;
      case SWFTag.CODE_DEFINE_SPRITE:
        // Sprites are fully defined at this point.
        symbol = swfTag;
        break;
      case SwfTag.CODE_DEFINE_BINARY_DATA:
        symbol = {
          type: 'binary',
          id: swfTag.id,
          // TODO: make transferable
          data: swfTag.data
        };
        break;
      case SwfTag.CODE_DEFINE_TEXT:
      case SwfTag.CODE_DEFINE_TEXT2:
        symbol = Shumway.SWF.Parser.defineLabel(swfTag);
        break;
      default:
        return swfTag;
    }

    if (!symbol) {
      return {command: 'error', message: 'unknown symbol type: ' + swfTag.code};
    }

    symbol.isSymbol = true;
    return symbol;
  }
}
