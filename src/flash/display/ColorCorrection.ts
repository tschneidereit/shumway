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
// Class: ColorCorrection
module Shumway.AVMX.AS.flash.display {
  export class ColorCorrection extends ASObject {
    
    static classInitializer: any = null;

    constructor () {
      super();
    }
    
    static DEFAULT: string = "default";
    static ON: string = "on";
    static OFF: string = "off";


    static fromNumber(n: number): string {
      switch (n) {
        case 0:
          return ColorCorrection.DEFAULT;
        case 1:
          return ColorCorrection.ON;
        case 2:
          return ColorCorrection.OFF;
        default:
          return null;
      }
    }

    static toNumber(value: string): number {
      switch (value) {
        case ColorCorrection.DEFAULT:
          return 0;
        case ColorCorrection.ON:
          return 1;
        case ColorCorrection.OFF:
          return 2;
        default:
          return -1;
      }
    }
  }
}
