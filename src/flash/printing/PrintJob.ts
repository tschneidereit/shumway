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
// Class: PrintJob
module Shumway.AVMX.AS.flash.printing {
  export class PrintJob extends flash.events.EventDispatcher {
    
    static classInitializer: any = null;

    constructor () {
      super();
    }
    
    static isSupported: boolean;
    
    paperHeight: number /*int*/;
    paperWidth: number /*int*/;
    pageHeight: number /*int*/;
    pageWidth: number /*int*/;
    orientation: string;
    start: () => boolean;
    send: () => void;
    addPage: (sprite: flash.display.Sprite, printArea: flash.geom.Rectangle = null,
              options: flash.printing.PrintJobOptions = null, frameNum: number /*int*/ = 0) => void;
  }
}
