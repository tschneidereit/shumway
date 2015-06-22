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
// Class: MouseAutomationAction
module Shumway.AVMX.AS.flash.automation {
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class MouseAutomationAction extends flash.automation.AutomationAction {
    constructor (type: string, stageX: number = 0, stageY: number = 0, delta: number /*int*/ = 0) {
      type = axCoerceString(type); stageX = +stageX; stageY = +stageY; delta = delta | 0;
      super();
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    _stageX: number;
    stageX: number;
    _stageY: number;
    stageY: number;
    _delta: number /*int*/;
    delta: number /*int*/;
    // Instance AS -> JS Bindings
  }
}
