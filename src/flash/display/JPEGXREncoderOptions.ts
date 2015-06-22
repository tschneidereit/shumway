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
// Class: JPEGXREncoderOptions
module Shumway.AVMX.AS.flash.display {
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class JPEGXREncoderOptions extends ASObject {

    static classInitializer: any = null;

    constructor(quantization: number /*uint*/ = 20, colorSpace: string = "auto",
                trimFlexBits: number /*uint*/ = 0)
    {
      super();
      this.quantization = quantization >>> 0;
      this.colorSpace = axCoerceString(colorSpace);
      this.trimFlexBits = trimFlexBits >>> 0;
    }

    quantization: number /*uint*/;
    colorSpace: string;
    trimFlexBits: number /*uint*/;
  }
}
