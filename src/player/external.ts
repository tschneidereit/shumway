/**
 * Copyright 2015 Mozilla Foundation
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

module Shumway.Player {
  export class ShumwayComExternalInterface implements IExternalInterfaceService {
    private _externalCallback: (functionName: string, args: any[]) => any;

    get enabled() {
      return true;
    }

    initJS(callback: (functionName: string, args: any[]) => any) {
      ShumwayCom.externalCom({action: 'init'});
      ShumwayCom.setExternalCallback(function (call) {
        return callback(call.functionName, call.args);
      });
      this._externalCallback = callback;
    }

    registerCallback(functionName: string) {
      var cmd: any = {action: 'register', functionName: functionName, remove: false};
      ShumwayCom.externalCom(cmd);
    }

    unregisterCallback(functionName: string) {
      var cmd: any = {action: 'register', functionName: functionName, remove: true};
      ShumwayCom.externalCom(cmd);
    }

    eval(expression: string): any {
      var cmd: any = {action: 'eval', expression: expression};
      return ShumwayCom.externalCom(cmd);
    }

    call(request: string): any {
      var cmd: any = {action: 'call', request: request};
      return ShumwayCom.externalCom(cmd);
    }

    getId(): string {
      var cmd: any = {action: 'getId'};
      return ShumwayCom.externalCom(cmd);
    }
  }

  /**
   * Implementation of IExternalInterfaceService that just does the minimal amount of work
   * required to pretend that ExternalInterface is available.
   *
   * Doesn't actually execute anything when `call` is used and never invokes registered callbacks.
   */
  export class PlayerInternalExternalInterface implements IExternalInterfaceService {

    get enabled() {
      return true;
    }

    initJS(callback: (functionName: string, args: any[]) => any) {
      Debug.warnOnce('SWF running in Shell or Inspector uses ExternalInterface, might not work' +
                     ' correctly');
    }

    registerCallback(functionName: string) {
      // Empty stub.
    }

    unregisterCallback(functionName: string) {
      // Empty stub.
    }

    eval(expression: string): any {
      return undefined;
    }

    call(request: string): any {
      return undefined;
    }

    getId(): string {
      return '';
    }
  }

  export class ShumwayComFileLoadingService implements IFileLoadingService {
    private _baseUrl: string = null;
    private _nextSessionId: number = 1; // 0 - is reserved
    private _sessions: FileLoadingSession[] = [];

    public init(baseUrl: string): void {
      this._baseUrl = baseUrl;
      var service = this;
      ShumwayCom.setLoadFileCallback(function (args) {
        var session = service._sessions[args.sessionId];
        if (session) {
          service._notifySession(session, args);
        }
      });
    }

    private _notifySession(session: FileLoadingSession, args): void {
      var sessionId = args.sessionId;
      switch (args.topic) {
        case "open":
          session.onopen();
          break;
        case "close":
          session.onclose();
          this._sessions[sessionId] = null;
          console.log('Session #' + sessionId + ': closed');
          break;
        case "error":
          session.onerror && session.onerror(args.error);
          break;
        case "progress":
          console.log('Session #' + sessionId + ': loaded ' + args.loaded + '/' + args.total);
          var data = args.array;
          if (!(data instanceof Uint8Array)) {
            data = new Uint8Array(data);
          }
          session.onprogress && session.onprogress(data, {bytesLoaded: args.loaded, bytesTotal: args.total});
          break;
      }
    }

    public createSession(): FileLoadingSession {
      var sessionId = this._nextSessionId++;
      var service = this;
      var session = {
        open: function (request) {
          var path = service.resolveUrl(request.url);
          console.log('Session #' + sessionId + ': loading ' + path);
          ShumwayCom.loadFile({url: path, method: request.method,
            mimeType: request.mimeType, postData: request.data,
            checkPolicyFile: request.checkPolicyFile, sessionId: sessionId});
        },
        close: function () {
          if (service._sessions[sessionId]) {
            ShumwayCom.abortLoad(sessionId);
          }
        }
      };
      return (this._sessions[sessionId] = session);
    }

    resolveUrl(url: string): string {
      return new (<any>window).URL(url, this._baseUrl).href;
    }

    navigateTo(url, target) {
      ShumwayCom.navigateTo({
        url: this.resolveUrl(url),
        target: target
      });
    }
  }

  export class ShumwayComClipboardService implements IClipboardService {
    setClipboard(data: string): void  {
      ShumwayCom.setClipboard(data);
    }
  }

  export class ShumwayComTelemetryService implements ITelemetryService {
    reportTelemetry(data: any): void {
      arguments.length; // protection from removal by closure
      ShumwayCom.reportTelemetry(data);
    }
  }

  export class BrowserFileLoadingService implements IFileLoadingService {
    private _baseUrl: string;
    private _fileReadChunkSize: number;


    createSession() {
      var service = this;
      var reader: Shumway.BinaryFileReader;
      return {
        open: function (request) {
          var self: any = this;
          var path = service.resolveUrl(request.url);
          console.log('FileLoadingService: loading ' + path + ", data: " + request.data);
          reader = new Shumway.BinaryFileReader(path, request.method, request.mimeType,
                                                request.data);
          reader.readChunked(
            service._fileReadChunkSize,
            function (data, progress) {
              self.onprogress(data, {bytesLoaded: progress.loaded, bytesTotal: progress.total});
            },
            function (e) { self.onerror(e); },
            self.onopen,
            self.onclose,
            self.onhttpstatus);
        },
        close: function () {
          reader.abort();
          reader = null;
        }
      };
    }

    init(baseUrl: string, fileReadChunkSize: number = 0) {
      this._baseUrl = baseUrl;
      this._fileReadChunkSize = fileReadChunkSize;
    }

    resolveUrl(url: string): string {
      return new (<any>window).URL(url, this._baseUrl).href;
    }

    navigateTo(url: string, target: string) {
      window.open(this.resolveUrl(url), target || '_blank');
    }
  }

  export class ShumwayComResourcesLoadingService implements ISystemResourcesLoadingService {
    private _pendingPromises: Array<PromiseWrapper<any>>;

    public constructor(preload: boolean) {
      this._pendingPromises = [];

      if (preload) {
        this.load(SystemResourceId.BuiltinAbc);
        this.load(SystemResourceId.PlayerglobalAbcs);
        this.load(SystemResourceId.PlayerglobalManifest);
      }

      ShumwayCom.setSystemResourceCallback(this._onSystemResourceCallback.bind(this));
    }

    private _onSystemResourceCallback(id: SystemResourceId, data: any): void {
      this._pendingPromises[id].resolve(data);
    }

    public load(id: SystemResourceId): Promise<any> {
      var result = this._pendingPromises[id];
      if (!result) {
        result = new PromiseWrapper<any>();
        this._pendingPromises[id] = result;

        ShumwayCom.loadSystemResource(id);
      }
      return result.promise;
    }
  }

  export class BrowserSystemResourcesLoadingService implements ISystemResourcesLoadingService {
    public constructor(public builtinPath: string,
                       public viewerPlayerglobalInfo?: {abcs: string; catalog: string;},
                       public shellPath?: string) {
    }

    public load(id: SystemResourceId): Promise<any> {
      switch (id) {
        case SystemResourceId.BuiltinAbc:
          return this._promiseFile(this.builtinPath, 'arraybuffer');
        case SystemResourceId.PlayerglobalAbcs:
          return this._promiseFile(this.viewerPlayerglobalInfo.abcs, 'arraybuffer');
        case SystemResourceId.PlayerglobalManifest:
          return this._promiseFile(this.viewerPlayerglobalInfo.catalog, 'json');
        case SystemResourceId.ShellAbc:
          return this._promiseFile(this.shellPath, 'arraybuffer');
        default:
          return Promise.reject(new Error('Unsupported system resource id: ' + id));
      }
    }

    private _promiseFile(path, responseType) {
      return new Promise(function (resolve, reject) {
        SWF.enterTimeline('Load file', path);
        var xhr = new XMLHttpRequest();
        xhr.open('GET', path);
        xhr.responseType = responseType;
        xhr.onload = function () {
          SWF.leaveTimeline();
          var response = xhr.response;
          if (response) {
            if (responseType === 'json' && xhr.responseType !== 'json') {
              // some browsers (e.g. Safari) have no idea what json is
              response = JSON.parse(response);
            }
            resolve(response);
          } else {
            reject('Unable to load ' + path + ': ' + xhr.statusText);
          }
        };
        xhr.onerror = function () {
          SWF.leaveTimeline();
          reject('Unable to load: xhr error');
        };
        xhr.send();
      });
    }
  }

  function qualifyLocalConnectionName(connectionName: string,
                                      assertNoPrefix: boolean): string {
    release || Debug.assert(typeof connectionName === 'string');
    // Connection names that don't start with "_" must be qualified with a domain prefix,
    // followed by ":". The prefix is supplied automatically based on the currently running
    // script. Only for LocalConnection#send is it allowed to already be contained in the name.
    if (!release && assertNoPrefix) {
      Debug.assert(connectionName.indexOf(':') === -1);
    }
    if (connectionName[0] !== '_') {
      if (connectionName.indexOf(':') === -1) {
        var currentURL = new jsGlobal.URL(Shumway.AVMX.getCurrentABC().env.url);
        connectionName = currentURL.hostname + ':' + connectionName;
      }
      // Note: for LocalConnection#send, the name can contain an arbitrary number of ":" chars,
      // so no validity check is required.
      if (!release && assertNoPrefix) {
        Debug.assert(connectionName.split(':').length === 2);
      }
    }
    return connectionName;
  }

  /**
   * Creates a proper error object in the given SecurityDomain and fills it with information in
   * a way that makes it resemble the given (probably error) object as closely as possible while
   * at the same time guaranteeing that no code will be executed as a result of reading
   * properties of the object. Additionally, the created object can only be one of the builtin
   * Error classes.
   */
  function createErrorFromUnknownObject(sec: ISecurityDomain, obj: any,
                                        defaultErrorClassName: string,
                                        defaultErrorInfo: AVMX.ErrorInfo): AVMX.AXObject {
    if (!obj || typeof obj !== 'object') {
      return sec.createError(defaultErrorClassName, defaultErrorInfo, obj);
    }
    var mn = obj.axClass ?
             obj.axClass.name :
             AVMX.Multiname.FromFQNString('Error', AVMX.NamespaceType.Public);
    var axClass: AVMX.AXClass = <AVMX.AXClass>sec.system.getProperty(mn, true, true);
    if (!sec.AXClass.axIsType(axClass)) {
      mn = AVMX.Multiname.FromFQNString('Error', AVMX.NamespaceType.Public);
      axClass = <AVMX.AXClass>sec.system.getProperty(mn, true, true);
      release || Debug.assert(sec.AXClass.axIsType(axClass));
    }
    var messagePropDesc = ObjectUtilities.getPropertyDescriptor(obj, '$Bgmessage');
    var message = messagePropDesc && messagePropDesc.value || '';
    var idPropDesc = ObjectUtilities.getPropertyDescriptor(obj, '_errorID');
    var id = idPropDesc && idPropDesc.value || 0;
    return axClass.axConstruct([message, id]);
  }

  export class BaseLocalConnectionService implements ILocalConnectionService {
    protected _localConnections = Object.create(null);
    createConnection(connectionName: string,
                     receiver: ILocalConnectionReceiver): LocalConnectionConnectResult {
      return undefined;
    }

    closeConnection(connectionName: string,
                    receiver: ILocalConnectionReceiver): LocalConnectionCloseResult {
      return undefined;
    }

    hasConnection(connectionName: string): boolean {
      return false;
    }

    _sendMessage(connectionName: string, methodName: string, argsBuffer: ArrayBuffer,
                 sender: ILocalConnectionSender, senderDomain: string, senderIsSecure: boolean) {
      return undefined;
    }

    send(connectionName: string, methodName: string, argsBuffer: ArrayBuffer,
         sender: ILocalConnectionSender, senderDomain: string, senderIsSecure: boolean): void {
      connectionName = qualifyLocalConnectionName(connectionName, false);
      release || Debug.assert(typeof methodName === 'string');
      release || Debug.assert(argsBuffer instanceof ArrayBuffer);
      var self = this;
      function invokeMessageHandler() {
        var status = self.hasConnection(connectionName) ? 'status' : 'error';
        var statusEvent = new sender.sec.flash.events.StatusEvent('status', false, false, null,
                                                                  status);
        try {
          sender.dispatchEvent(statusEvent);
        } catch (e) {
          console.warn("Exception encountered during statusEvent handling in LocalConnection" +
                       " sender.", e);
        }

        if (status === 'error') {
          // If no receiver is found for the connectionName, we're done.
          return;
        }
        release || Debug.assert(typeof senderDomain === 'string');
        release || Debug.assert(typeof senderIsSecure === 'boolean');
        self._sendMessage(connectionName, methodName, argsBuffer, sender, senderDomain,
                          senderIsSecure);
      }
      Promise.resolve(true).then(invokeMessageHandler);
    }

    allowDomains(connectionName: string, receiver: ILocalConnectionReceiver, domains: string[],
                 secure: boolean) {
      Debug.somewhatImplemented('LocalConnection#allowDomain');
    }
  }

  export class ShumwayComLocalConnectionService extends BaseLocalConnectionService {

    createConnection(connectionName: string,
                     receiver: ILocalConnectionReceiver): LocalConnectionConnectResult {
      connectionName = qualifyLocalConnectionName(connectionName, true);
      release || Debug.assert(receiver);
      if (this.hasConnection(connectionName)) {
        return LocalConnectionConnectResult.AlreadyTaken;
      }

      function callback(methodName: string, argsBuffer: ArrayBuffer): any {
        try {
          receiver.handleMessage(methodName, argsBuffer);
          return null;
        } catch (e) {
          console.log('error under handleMessage: ', e);
          return e;
        }
      }
      var result = ShumwayCom.getLocalConnectionService().createLocalConnection(connectionName,
                                                                                callback);
      if (result !== LocalConnectionConnectResult.Success) {
        return result;
      }
      this._localConnections[connectionName] = receiver;
      return LocalConnectionConnectResult.Success;
    }
    closeConnection(connectionName: string,
                    receiver: ILocalConnectionReceiver): LocalConnectionCloseResult {
      connectionName = qualifyLocalConnectionName(connectionName, true);
      if (this._localConnections[connectionName] !== receiver) {
        return LocalConnectionCloseResult.NotConnected;
      }
      ShumwayCom.getLocalConnectionService().closeLocalConnection(connectionName);
      delete this._localConnections[connectionName];
      return LocalConnectionCloseResult.Success;
    }

    hasConnection(connectionName: string): boolean {
      return ShumwayCom.getLocalConnectionService().hasLocalConnection(connectionName);
    }

    _sendMessage(connectionName: string, methodName: string, argsBuffer: ArrayBuffer,
                 sender: ILocalConnectionSender, senderDomain: string, senderIsSecure: boolean) {
      var service = ShumwayCom.getLocalConnectionService();
      service.sendLocalConnectionMessage(connectionName, methodName, argsBuffer, sender,
                                         senderDomain, senderIsSecure);
    }

    allowDomains(connectionName: string, receiver: ILocalConnectionReceiver, domains: string[],
                 secure: boolean) {
      connectionName = qualifyLocalConnectionName(connectionName, true);
      if (this._localConnections[connectionName] !== receiver) {
        console.warn('Trying to allow domains for invalid connection ' + connectionName);
        return;
      }
      ShumwayCom.getLocalConnectionService().allowDomainsForLocalConnection(connectionName, domains,
                                                                            secure);
    }
  }

  export class PlayerInternalLocalConnectionService extends BaseLocalConnectionService {
    createConnection(connectionName: string,
                     receiver: ILocalConnectionReceiver): LocalConnectionConnectResult {
      connectionName = qualifyLocalConnectionName(connectionName, true);
      release || Debug.assert(receiver);
      if (this._localConnections[connectionName]) {
        return LocalConnectionConnectResult.AlreadyTaken;
      }
      this._localConnections[connectionName] = receiver;
      return LocalConnectionConnectResult.Success;
    }
    closeConnection(connectionName: string,
                    receiver: ILocalConnectionReceiver): LocalConnectionCloseResult {
      connectionName = qualifyLocalConnectionName(connectionName, true);
      if (this._localConnections[connectionName] !== receiver) {
        return LocalConnectionCloseResult.NotConnected;
      }
      delete this._localConnections[connectionName];
      return LocalConnectionCloseResult.Success;
    }


    hasConnection(connectionName: string): boolean {
      return connectionName in this._localConnections;
    }

    _sendMessage(connectionName: string, methodName: string, argsBuffer: ArrayBuffer,
                 sender: ILocalConnectionSender, senderURL: string) {
      var receiver: ILocalConnectionReceiver = this._localConnections[connectionName];
      release || Debug.assert(receiver);
      try {
        receiver.handleMessage(methodName, argsBuffer);
      } catch (e) {
        Debug.warning('Unexpected error encountered while sending LocalConnection message.');
      }
    }
  }
}
