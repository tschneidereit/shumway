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
// Class: GraphicsPathCommand
module Shumway.AVMX.AS.flash.display {
  export class GraphicsPathCommand extends ASObject {
    
    static classInitializer: any = null;

    constructor () {
      super();
    }
    
    static NO_OP: number /*int*/ = undefined;
    static MOVE_TO: number /*int*/ = 1;
    static LINE_TO: number /*int*/ = 2;
    static CURVE_TO: number /*int*/ = 3;
    static WIDE_MOVE_TO: number /*int*/ = 4;
    static WIDE_LINE_TO: number /*int*/ = 5;
    static CUBIC_CURVE_TO: number /*int*/ = 6;
  }
}
