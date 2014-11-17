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
// Class: Sprite
module Shumway.AVM2.AS.flash.display {
  import assert = Shumway.Debug.assert;
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;

  import Timeline = Shumway.Timeline;

  export class Sprite extends flash.display.DisplayObjectContainer {

    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = function (symbol: Timeline.SpriteSymbol) {
      var self: Sprite = this;

      self._graphics = null;
      self._buttonMode = false;
      self._dropTarget = null;
      self._hitArea = null;
      self._useHandCursor = true;

      self._hitTarget = null;

      if (symbol) {
        if (symbol.isRoot) {
          self._root = self;
        }
        if (symbol.numFrames && symbol.frames.length > 0) {
          // For a SWF's root symbol, all frames are added after initialization, with
          // _initializeChildren called after the first frame is added.
          self._initializeChildren(symbol.frames[0]);
        }
      }
    };
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];

    constructor () {
      false && super();
      DisplayObjectContainer.instanceConstructorNoInitialize.call(this);
      this._constructChildren();
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    
    private _buttonMode: boolean;
    private _dropTarget: flash.display.DisplayObject;
    private _hitArea: flash.display.Sprite;
    private _useHandCursor: boolean;

    _hitTarget: flash.display.Sprite;

    _initializeChildren(frame: Timeline.FrameDelta): void {
      for (var depth in frame.stateAtDepth) {
        var state = frame.stateAtDepth[depth];
        if (state) {
          var character = this.createAnimatedDisplayObject(state, false);
          this.addTimelineObjectAtDepth(character, state.depth);
          if (state.symbol.isAVM1Object) {
            this._initAvm1Bindings(character, state);
          }
        }
      }
    }

    _initAvm1Bindings(instance: DisplayObject, state: Shumway.Timeline.AnimationState) {
      var instanceAVM1 = avm1lib.getAVM1Object(instance);
      assert(instanceAVM1);

      if (state.variableName) {
        instanceAVM1.asSetPublicProperty('variable', state.variableName);
      }

      var events = state.events;
      if (events) {
        var eventsBound = [];
        for (var i = 0; i < events.length; i++) {
          var event = events[i];
          var eventNames = event.eventNames;
          var fn = event.handler.bind(instance);
          for (var j = 0; j < eventNames.length; j++) {
            var eventName = eventNames[j];
            var avm2EventTarget = instance;
            if (eventName === 'mouseDown' || eventName === 'mouseUp' || eventName === 'mouseMove') {
              // FIXME regressed, avm1 mouse events shall be received all the time.
              // avm2EventTarget = instance.stage;
            }
            avm2EventTarget.addEventListener(eventName, fn, false);
            eventsBound.push({eventName: eventName, fn: fn, target: avm2EventTarget});
          }
        }
        if (eventsBound.length > 0) {
          instance.addEventListener('removed', function (eventsBound) {
            for (var i = 0; i < eventsBound.length; i++) {
              eventsBound[i].target.removeEventListener(eventsBound[i].eventName, eventsBound[i].fn, false);
            }
          }.bind(instance, eventsBound), false);
        }
      }
    }

    _canHaveGraphics(): boolean {
      return true;
    }

    _getGraphics(): flash.display.Graphics {
      return this._graphics;
    }

    get graphics(): flash.display.Graphics {
      return this._ensureGraphics();
    }

    get buttonMode(): boolean {
      return this._buttonMode;
    }

    set buttonMode(value: boolean) {
      this._buttonMode = !!value;
    }

    get dropTarget(): flash.display.DisplayObject {
      notImplemented("public flash.display.Sprite::get dropTarget"); return;
      // return this._dropTarget;
    }

    get hitArea(): flash.display.Sprite {
      return this._hitArea;
    }

    set hitArea(value: flash.display.Sprite) {
      value = value;
      if (this._hitArea === value) {
        return;
      }
      if (value && value._hitTarget) {
        value._hitTarget._hitArea = null;
      }
      this._hitArea = value;
      if (value) {
        value._hitTarget = this;
      }
    }

    get useHandCursor(): boolean {
      return this._useHandCursor;
    }

    set useHandCursor(value: boolean) {
      this._useHandCursor = !!value;
    }

    get soundTransform(): flash.media.SoundTransform {
      notImplemented("public flash.display.Sprite::get soundTransform"); return;
      // return this._soundTransform;
    }
    set soundTransform(sndTransform: flash.media.SoundTransform) {
      sndTransform = sndTransform;
      notImplemented("public flash.display.Sprite::set soundTransform"); return;
      // this._soundTransform = sndTransform;
    }
    startDrag(lockCenter: boolean = false, bounds: flash.geom.Rectangle = null): void {
      lockCenter = !!lockCenter; bounds = bounds;
      notImplemented("public flash.display.Sprite::startDrag"); return;
    }
    stopDrag(): void {
      notImplemented("public flash.display.Sprite::stopDrag"); return;
    }
    startTouchDrag(touchPointID: number /*int*/, lockCenter: boolean = false, bounds: flash.geom.Rectangle = null): void {
      touchPointID = touchPointID | 0; lockCenter = !!lockCenter; bounds = bounds;
      notImplemented("public flash.display.Sprite::startTouchDrag"); return;
    }
    stopTouchDrag(touchPointID: number /*int*/): void {
      touchPointID = touchPointID | 0;
      notImplemented("public flash.display.Sprite::stopTouchDrag"); return;
    }

    _containsPoint(globalX: number, globalY: number, localX: number, localY: number,
                   testingType: HitTestingType, objects: DisplayObject[]): HitTestingResult {
      var result = this._boundsAndMaskContainPoint(globalX, globalY, localX, localY, testingType);
      if (!result && testingType === HitTestingType.Mouse && this._hitArea && this._mouseEnabled) {
        var matrix = this._hitArea._getInvertedConcatenatedMatrix();
        var hitAreaLocalX = matrix.transformX(globalX, globalY);
        var hitAreaLocalY = matrix.transformY(globalX, globalY);
        result = this._hitArea._boundsAndMaskContainPoint(globalX, globalY,
                                                          hitAreaLocalX, hitAreaLocalY,
                                                          testingType);
      }
      if (result === HitTestingResult.None || testingType < HitTestingType.HitTestShape) {
        return result;
      }
      return this._containsPointImpl(globalX, globalY, localX, localY, testingType, objects, true);
    }

    _containsPointDirectly(localX: number, localY: number,
                           globalX: number, globalY: number): boolean {
      if (this._hitArea) {
        return !!this._hitArea._containsGlobalPoint(globalX, globalY,
                                                    HitTestingType.HitTestShape, null);
      }
      var graphics = this._getGraphics();
      return !!graphics && graphics._containsPoint(localX, localY, true, 0);
    }
  }
}
