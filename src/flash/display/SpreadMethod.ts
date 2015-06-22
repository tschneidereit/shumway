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
// Class: SpreadMethod
module Shumway.AVMX.AS.flash.display {
  import GradientSpreadMethod = Shumway.GradientSpreadMethod;
  export class SpreadMethod extends ASObject {
    
    static classInitializer: any = null;

    constructor () {
      super();
    }
    
    static PAD: string = "pad";
    static REFLECT: string = "reflect";
    static REPEAT: string = "repeat";
    
    static fromNumber(n: number): string {
      switch (n) {
        case GradientSpreadMethod.Pad:
          return SpreadMethod.PAD;
        case GradientSpreadMethod.Reflect:
          return SpreadMethod.REFLECT;
        case GradientSpreadMethod.Repeat:
          return SpreadMethod.REPEAT;
        default:
          return null;
      }
    }

    static toNumber(value: string): number {
      switch (value) {
        case SpreadMethod.PAD:
          return GradientSpreadMethod.Pad;
        case SpreadMethod.REFLECT:
          return GradientSpreadMethod.Reflect;
        case SpreadMethod.REPEAT:
          return GradientSpreadMethod.Repeat;
        default:
          return -1;
      }
    }
  }
}
