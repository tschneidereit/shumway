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
// Class: GraphicsTrianglePath
module Shumway.AVMX.AS.flash.display {
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class GraphicsTrianglePath extends ASObject implements IGraphicsPath, IGraphicsData {
    
    static classInitializer: any = null;

    constructor(vertices: Float64Vector = null, indices: Int32Vector = null,
                uvtData: Float64Vector = null, culling: string = "none")
    {
      super();
      // TODO: coerce to vector types
      this.vertices = vertices;
      this.indices = indices;
      this.uvtData = uvtData;
      this.culling = axCoerceString(culling);
    }
    
    indices: Int32Vector;
    vertices: Float64Vector;
    uvtData: Float64Vector;
    _culling: string;
    culling: string;
  }
}
