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
  import SWFFile = Shumway.SWF.SWFFile;

  export class LoadProgressUpdate {
    constructor(public bytesLoaded: number,
                public framesLoaded: number,
                public abcBlocksLoaded: number,
                public mappedSymbolsLoaded: number) {
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
      var file = this._file = createFileInstanceForHeader(bytes, bytes.length);
      this._listener.onLoadOpen(file);
      this.processSWFFileUpdate(file);
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
      this.processSWFFileUpdate(file);
    }
    processError(error) {
      Debug.warning('Loading error encountered:', error);
    }
    processLoadClose() {
      if (this._file.bytesLoaded !== this._file.bytesTotal) {
        Debug.warning("Not Implemented: processing loadClose when loading was aborted");
      }
    }

    private processSWFFileUpdate(file: SWFFile) {
      var update = new LoadProgressUpdate(file.bytesLoaded,
                                          file.frames.length,
                                          file.abcBlocks.length,
                                          file.symbolClassesList.length);
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
}
