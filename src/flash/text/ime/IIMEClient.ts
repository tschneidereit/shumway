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
// Class: IIMEClient
module Shumway.AVMX.AS.flash.text.ime {
  export interface IIMEClient {
    
    compositionStartIndex: number /*int*/;
    compositionEndIndex: number /*int*/;
    verticalTextLayout: boolean;
    selectionAnchorIndex: number /*int*/;
    selectionActiveIndex: number /*int*/;
    updateComposition: (text: string, attributes: ASVector<any>, compositionStartIndex: number /*int*/, compositionEndIndex: number /*int*/) => void;
    confirmComposition: (text: string = null, preserveSelection: boolean = false) => void;
    getTextBounds: (startIndex: number /*int*/, endIndex: number /*int*/) => flash.geom.Rectangle;
    selectRange: (anchorIndex: number /*int*/, activeIndex: number /*int*/) => void;
    getTextInRange: (startIndex: number /*int*/, endIndex: number /*int*/) => string;
  }
}
