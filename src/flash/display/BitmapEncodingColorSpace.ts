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
// Class: BitmapEncodingColorSpace
module Shumway.AVMX.AS.flash.display {
  export class BitmapEncodingColorSpace extends ASObject {
    
    static classInitializer: any = null;

    constructor () {
      super();
    }
    
    static COLORSPACE_AUTO: string = "auto";
    static COLORSPACE_4_4_4: string = "4:4:4";
    static COLORSPACE_4_2_2: string = "4:2:2";
    static COLORSPACE_4_2_0: string = "4:2:0";
  }
}
