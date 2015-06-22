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
// Class: GroupSpecifier
module Shumway.AVMX.AS.flash.net {
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class GroupSpecifier extends ASObject {
    
    static classInitializer: any = null;

    constructor (name: string) {
      super();
      name = axCoerceString(name);
    }
    
    static encodePostingAuthorization: (password: string) => string;
    static encodePublishAuthorization: (password: string) => string;
    static encodeIPMulticastAddressSpec: (address: string, port: any = null, source: string = null) => string;
    static encodeBootstrapPeerIDSpec: (peerID: string) => string;
    
    makeUnique: () => void;
    routingEnabled: boolean;
    multicastEnabled: boolean;
    objectReplicationEnabled: boolean;
    postingEnabled: boolean;
    peerToPeerDisabled: boolean;
    ipMulticastMemberUpdatesEnabled: boolean;
    setPublishPassword: (password: string = null, salt: string = null) => void;
    setPostingPassword: (password: string = null, salt: string = null) => void;
    serverChannelEnabled: boolean;
    addBootstrapPeer: (peerID: string) => void;
    addIPMulticastAddress: (address: string, port: any = null, source: string = null) => void;
    groupspecWithoutAuthorizations: () => string;
    groupspecWithAuthorizations: () => string;
    authorizations: () => string;
  }
}
