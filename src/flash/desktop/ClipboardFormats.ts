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
// Class: ClipboardFormats
module Shumway.AVMX.AS.flash.desktop {
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class ClipboardFormats extends ASObject {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;

    constructor () {
      super();
    }
    
    static FLASH_PREFIX: string = "flash:";
    static AIR_PREFIX: string = "air:";
    static REFERENCE_PREFIX: string = "air:reference:";
    static SERIALIZATION_PREFIX: string = "air:serialization:";
    static TEXT_FORMAT: string = "air:text";
    static HTML_FORMAT: string = "air:html";
    static RICH_TEXT_FORMAT: string = "air:rtf";
    static URL_FORMAT: string = "air:url";
    static FILE_LIST_FORMAT: string = "air:file list";
    static BITMAP_FORMAT: string = "air:bitmap";
    static FILE_PROMISE_LIST_FORMAT: string = "air:file promise list";
  }
}
