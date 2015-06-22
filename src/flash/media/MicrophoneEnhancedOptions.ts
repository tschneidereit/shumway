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
// Class: MicrophoneEnhancedOptions
module Shumway.AVMX.AS.flash.media {
  export class MicrophoneEnhancedOptions extends ASObject {
    
    static classInitializer: any = null;

    constructor () {
      super();
    }
    
    mode: string;
    echoPath: number /*int*/;
    nonLinearProcessing: boolean;
    autoGain: boolean;
    isVoiceDetected: number /*int*/;
  }
}
