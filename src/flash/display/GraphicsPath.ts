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
// Class: GraphicsPath
module Shumway.AVMX.AS.flash.display {
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class GraphicsPath extends ASObject implements IGraphicsPath, IGraphicsData {
    
    static classInitializer: any = null;

    constructor (commands: Int32Vector = null, data: Int32Vector = null, winding: string = "evenOdd") {
      super();
      this.commands = commands;
      this.data = data;
      this.winding = axCoerceString(winding);
    }
    
    commands: Int32Vector;
    data: Int32Vector;
    _winding: string;
    winding: string;
    moveTo: (x: number, y: number) => void;
    lineTo: (x: number, y: number) => void;
    curveTo: (controlX: number, controlY: number, anchorX: number, anchorY: number) => void;
    cubicCurveTo: (controlX1: number, controlY1: number, controlX2: number, controlY2: number, anchorX: number, anchorY: number) => void;
    wideLineTo: (x: number, y: number) => void;
    wideMoveTo: (x: number, y: number) => void;
    ensureLists: () => void;
  }
}
