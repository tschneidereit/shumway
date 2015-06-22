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
// Class: XMLSocket
module Shumway.AVMX.AS.flash.net {
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class XMLSocket extends flash.events.EventDispatcher {
    
    static classInitializer: any = null;

    constructor (host: string = null, port: number /*int*/ = 0) {
      super();
      host = axCoerceString(host); port = port | 0;
    }
    
    timeout: number /*int*/;
    connected: boolean;
    connect: (host: string, port: number /*int*/) => void;
    send: (object: any) => void;
    close: () => void;
  }
}
