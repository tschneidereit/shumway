/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const RESOURCE_NAME = 'shumway';
const EXT_PREFIX = 'shumway@research.mozilla.org';

let Cc = Components.classes;
let Ci = Components.interfaces;
let Cm = Components.manager;
let Cu = Components.utils;

Cu.import('resource://gre/modules/XPCOMUtils.jsm');
Cu.import('resource://gre/modules/Services.jsm');

let Ph = Cc["@mozilla.org/plugin/host;1"].getService(Ci.nsIPluginHost);
let registerOverlayPreview = 'registerPlayPreviewMimeType' in Ph;

function getBoolPref(pref, def) {
  try {
    return Services.prefs.getBoolPref(pref);
  } catch (ex) {
    return def;
  }
}

function log(str) {
  dump(str + '\n');
}

// Register/unregister a constructor as a component.
function Factory() {}

Factory.prototype = {
  QueryInterface: XPCOMUtils.generateQI([Ci.nsIFactory]),
  _targetConstructor: null,

  register: function register(targetConstructor) {
    this._targetConstructor = targetConstructor;
    var proto = targetConstructor.prototype;
    var registrar = Cm.QueryInterface(Ci.nsIComponentRegistrar);
    registrar.registerFactory(proto.classID, proto.classDescription,
                              proto.contractID, this);
  },

  unregister: function unregister() {
    var proto = this._targetConstructor.prototype;
    var registrar = Cm.QueryInterface(Ci.nsIComponentRegistrar);
    registrar.unregisterFactory(proto.classID, this);
    this._targetConstructor = null;
  },

  // nsIFactory
  createInstance: function createInstance(aOuter, iid) {
    if (aOuter !== null)
      throw Cr.NS_ERROR_NO_AGGREGATION;
    return (new (this._targetConstructor)).QueryInterface(iid);
  },

  // nsIFactory
  lockFactory: function lockFactory(lock) {
    // No longer used as of gecko 1.7.
    throw Cr.NS_ERROR_NOT_IMPLEMENTED;
  }
};

let factory1 = new Factory();
let factory2 = new Factory();

let FlashStreamConverterUrl = null;

// As of Firefox 13 bootstrapped add-ons don't support automatic registering and
// unregistering of resource urls and components/contracts. Until then we do
// it programatically. See ManifestDirective ManifestParser.cpp for support.

function startup(aData, aReason) {
  // Setup the resource url.
  var ioService = Services.io;
  var resProt = ioService.getProtocolHandler('resource')
                  .QueryInterface(Ci.nsIResProtocolHandler);
  var aliasURI = ioService.newURI('content/', 'UTF-8', aData.resourceURI);
  resProt.setSubstitution(RESOURCE_NAME, aliasURI);

  // Load the component and register it.
  FlashStreamConverterUrl = aData.resourceURI.spec +
    'components/FlashStreamConverter.js';
  Cu.import(FlashStreamConverterUrl);
  factory1.register(FlashStreamConverter1);
  factory2.register(FlashStreamConverter2);

  if (registerOverlayPreview) {
    var ignoreCTP = getBoolPref('shumway.ignoreCTP', false);
    Ph.registerPlayPreviewMimeType('application/x-shockwave-flash', ignoreCTP);
  }
}

function shutdown(aData, aReason) {
  if (aReason == APP_SHUTDOWN)
    return;
  var ioService = Services.io;
  var resProt = ioService.getProtocolHandler('resource')
                  .QueryInterface(Ci.nsIResProtocolHandler);
  // Remove the resource url.
  resProt.setSubstitution(RESOURCE_NAME, null);
  // Remove the contract/component.
  factory1.unregister();
  factory2.unregister();

  if (registerOverlayPreview)
    Ph.unregisterPlayPreviewMimeType('application/x-shockwave-flash');

  // Unload the converter
  Cu.unload(FlashStreamConverterUrl);
  FlashStreamConverterUrl = null;
}

function install(aData, aReason) {
}

function uninstall(aData, aReason) {
}

