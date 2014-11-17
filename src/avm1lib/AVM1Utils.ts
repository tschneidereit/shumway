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
 * limitations undxr the License.
 */

///<reference path='references.ts' />
module Shumway.AVM2.AS.avm1lib {
  import ASNative = Shumway.AVM2.AS.ASNative;
  import ASObject = Shumway.AVM2.AS.ASObject;
  import flash = Shumway.AVM2.AS.flash;
  import AVM1Context = Shumway.AVM1.AVM1Context;

  export class AVM1Utils extends ASNative {

    // Called whenever the class is initialized.
    static classInitializer:any = null;

    // Called whenever an instance of the class is initialized.
    static initializer:any = null;

    // List of static symbols to link.
    static classSymbols: string [] = ["createFlashObject!"];//["getAVM1Object!"];

    // List of instance symbols to link.
    static instanceSymbols: string [] = null;

    constructor() {
      false && super();
    }

    // JS -> AS Bindings
    // static getTarget:(A:ASObject) => any;
    // static addEventHandlerProxy:(A:ASObject, B:string, C:string, D:ASFunction = null) => any;
    static createFlashObject: () => any;

    // AS -> JS Bindings
    static addProperty(obj: ASObject, propertyName: string, getter: () => any,
                       setter: (v:any) => any, enumerable:boolean = true): any
    {
      obj.asDefinePublicProperty(propertyName, {
        get: getter,
        set: setter || undefined,
        enumerable: enumerable,
        configurable: true
      });
    }

    static resolveTarget(target_mc: any = undefined): any {
      return AVM1Context.instance.resolveTarget(target_mc);
    }

    // Temporary solution as suggested by Yury. Will be refactored soon.
    static resolveMovieClip(target: any = undefined): any {
      return target ? AVM1Context.instance.resolveTarget(target) : undefined;
    }

    static resolveLevel(level: number): any {
      level = +level;
      return AVM1Context.instance.resolveLevel(level);
    }

    static get currentStage(): any {
      return AVM1Context.instance.root._nativeAS3Object.stage;
    }

    static get swfVersion(): any {
      return AVM1Context.instance.loaderInfo.swfVersion;
    }

    static getAVM1Object(as3Object) {
      return avm1lib.getAVM1Object(as3Object);
    }

    static _installObjectMethods(): any {
      var c = ASObject, p = c.asGetPublicProperty('prototype');
      c.asSetPublicProperty('registerClass', function registerClass(name, theClass) {
        AVM1Context.instance.registerClass(name, theClass);
      });
      p.asDefinePublicProperty('addProperty', {
        value: function addProperty(name, getter, setter) {
          if (typeof name !== 'string' || name === '') {
            return false;
          }
          if (typeof getter !== 'function') {
            return false;
          }
          if (typeof setter !== 'function' && setter !== null) {
            return false;
          }
          this.asDefinePublicProperty(name, {
            get: getter,
            set: setter || undefined,
            configurable: true,
            enumerable: true
          });
          return true;
        },
        writable: false,
        enumerable: false,
        configurable: false
      });
    }

    static addEventHandlerProxy(obj: ASObject, propertyName: string, eventName: string,
                                argsConverter?: Function) {

      var currentHandler: Function = null;
      var handlerRunner: Function = null;

      function getter(): Function {
        return currentHandler;
      }

      function setter(newHandler: Function) {
        if (!this._as3Object) { // prototype/class ?
          var defaultListeners = this._as2DefaultListeners || (this._as2DefaultListeners = []);
          defaultListeners.push({setter: setter, value: newHandler});
          // see also initDefaultListeners()
          return;
        }
        // AVM1 MovieClips don't receive roll/release events by default until they set one of the
        // following properties. This behaviour gets triggered whenever those properties are set,
        // despite of the actual value they are set to.
        if (propertyName === 'onRelease' ||
            propertyName === 'onReleaseOutside' ||
            propertyName === 'onRollOut' ||
            propertyName === 'onRollOver') {
          this._as3Object.mouseEnabled = true;
          this._as3Object.buttonMode = true;
        }
        if (currentHandler === newHandler) {
          return;
        }
        if (currentHandler != null) {
          this._as3Object.removeEventListener(eventName, handlerRunner);
        }
        currentHandler = newHandler;
        if (currentHandler != null) {
          handlerRunner = (function (obj: Object, handler: Function) {
            return function handlerRunner() {
              var args = argsConverter != null ? argsConverter(arguments) : null;
              return handler.apply(obj, args);
            };
          })(this, currentHandler);
          this._as3Object.addEventListener(eventName, handlerRunner);
        } else {
          handlerRunner = null;
        }
      }
      AVM1Utils.addProperty(obj, propertyName, getter, setter, false);
    }
  }

  export function initDefaultListeners(thisArg) {
    var defaultListeners = thisArg.asGetPublicProperty('_as2DefaultListeners');
    if (!defaultListeners) {
      return;
    }
    for (var i = 0; i < defaultListeners.length; i++) {
      var p = defaultListeners[i];
      p.asGetPublicProperty('setter').call(thisArg, p.value);
    }
  }

  export function createFlashObject() {
    return AVM1Utils.createFlashObject();
  }

  export function getAVM1Object(as3Object) {
    if (!as3Object) {
      return null;
    }
    if (as3Object._as2Object) {
      return as3Object._as2Object;
    }
    if (flash.display.MovieClip.isType(as3Object)) {
      if (<flash.display.MovieClip>as3Object._avm1SymbolClass) {
        return Shumway.AVM2.AS.avm1lib.AVM1MovieClip._initFromConstructor(
          <flash.display.MovieClip>as3Object._avm1SymbolClass, as3Object);
      }
      return new Shumway.AVM2.AS.avm1lib.AVM1MovieClip(as3Object);
    }
    if (flash.display.SimpleButton.isType(as3Object)) {
      return new Shumway.AVM2.AS.avm1lib.AVM1Button(as3Object);
    }
    if (flash.text.TextField.isType(as3Object)) {
      return new Shumway.AVM2.AS.avm1lib.AVM1TextField(as3Object);
    }
    if (flash.display.BitmapData.isType(as3Object)) {
      return new as3Object;
    }

    return null;
  }
}
