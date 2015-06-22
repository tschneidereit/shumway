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
// Class: GraphicsStroke
module Shumway.AVMX.AS.flash.display {
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class GraphicsStroke extends ASObject implements IGraphicsStroke, IGraphicsData {
    
    static classInitializer: any = null;

    constructor(thickness: number = NaN, pixelHinting: boolean = false,
                scaleMode: string = "normal", caps: string = "none", joints: string = "round",
                miterLimit: number = 3, fill: flash.display.IGraphicsFill = null)
    {
      super();
      this.thickness = +thickness;
      this.pixelHinting = !!pixelHinting;
      this.scaleMode = axCoerceString(scaleMode);
      this.caps = axCoerceString(caps);
      this.joints = axCoerceString(joints);
      this.miterLimit = +miterLimit;
      this.fill = fill;
    }
    
    thickness: number;
    pixelHinting: boolean;
    miterLimit: number;
    fill: flash.display.IGraphicsFill;
    scaleMode: string;
    caps: string;
    joints: string;
  }
}
