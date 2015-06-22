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
// Class: ShaderParameterType
module Shumway.AVMX.AS.flash.display {
  export class ShaderParameterType extends ASObject {
    
    static classInitializer: any = null;

    constructor () {
      super();
    }
    
    static FLOAT: string = "float";
    static FLOAT2: string = "float2";
    static FLOAT3: string = "float3";
    static FLOAT4: string = "float4";
    static INT: string = "int";
    static INT2: string = "int2";
    static INT3: string = "int3";
    static INT4: string = "int4";
    static BOOL: string = "bool";
    static BOOL2: string = "bool2";
    static BOOL3: string = "bool3";
    static BOOL4: string = "bool4";
    static MATRIX2X2: string = "matrix2x2";
    static MATRIX3X3: string = "matrix3x3";
    static MATRIX4X4: string = "matrix4x4";
  }
}
