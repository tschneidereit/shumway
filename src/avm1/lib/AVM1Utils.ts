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

///<reference path='../references.ts' />

module Shumway.AVM1.Lib {
  import ASObject = Shumway.AVMX.AS.ASObject;
  import flash = Shumway.AVMX.AS.flash;
  import AXClass = Shumway.AVMX.AXClass;

  export var DEPTH_OFFSET = 16384;

  export interface IAVM1SymbolBase {
    isAVM1Instance: boolean;
    as3Object: flash.display.InteractiveObject;
    context: AVM1Context;
    initAVM1SymbolInstance(context: AVM1Context, as3Object: flash.display.InteractiveObject);
    updateAllEvents();
  }

  export class AVM1EventHandler {
    constructor(public propertyName: string,
                public eventName: string,
                public argsConverter: Function = null) { }

    public onBind(target: IAVM1SymbolBase): void {}
    public onUnbind(target: IAVM1SymbolBase): void {}
  }

  function normalizeEventName(context: AVM1Context, eventName: string): string {
    return context.isPropertyCaseSensitive ? eventName : eventName.toLowerCase();
  }

  export class AVM1SymbolBase<T extends flash.display.InteractiveObject> extends AVM1Object implements IAVM1SymbolBase, IAVM1EventPropertyObserver {
    public get isAVM1Instance(): boolean {
      return !!this._as3Object;
    }

    _as3Object: T;
    _as3ObjectTemplate: any;

    public get as3Object(): T {
      return this._as3Object;
    }

    public get as3ObjectOrTemplate(): T {
      return this._as3Object || this._getAS3ObjectTemplate();
    }

    public initAVM1SymbolInstance(context: AVM1Context, as3Object: T) {
      AVM1Object.call(this, context);

      release || Debug.assert(as3Object);
      this._as3Object = as3Object;
    }

    private _getAS3ObjectTemplate(): T {
      if (!this._as3ObjectTemplate) {
        var template;
        var proto = this.alPrototype;
        while (proto && !(<any>proto).initAVM1SymbolInstance) {
          template = (<any>proto)._as3ObjectTemplate;
          if (template) {
            break;
          }
          proto = proto.alPrototype;
        }
        this._as3ObjectTemplate = Object.create(template || null);
      }
      return this._as3ObjectTemplate;
    }

    private _eventsMap: MapObject<AVM1EventHandler>;
    private _events: AVM1EventHandler[];
    private _eventsListeners: MapObject<Function>;

    public bindEvents(events: AVM1EventHandler[], autoUnbind: boolean = true) {
      this._events = events;
      var eventsMap = Object.create(null);
      this._eventsMap = eventsMap;
      this._eventsListeners = Object.create(null);
      var observer = this;
      var context: AVM1Context = (<any>this).context;
      events.forEach(function (event: AVM1EventHandler) {
        var propertyName = normalizeEventName(context, event.propertyName);
        eventsMap[propertyName] = event;
        context.registerEventPropertyObserver(propertyName, observer);
        observer._updateEvent(event);
      });

      if (autoUnbind) {
        observer.as3Object.addEventListener('removedFromStage', function removedHandler() {
          observer.as3Object.removeEventListener('removedFromStage', removedHandler);
          observer.unbindEvents();
        });
      }
    }

    public unbindEvents() {
      var events = this._events;
      var observer = this;
      var context = this.context;
      events.forEach(function (event: AVM1EventHandler) {
        context.unregisterEventPropertyObserver(event.propertyName, observer);
        observer._removeEventListener(event);
      });
      this._events = null;
      this._eventsMap = null;
      this._eventsListeners = null;
    }

    public updateAllEvents() {
      this._events.forEach(function (event: AVM1EventHandler) {
        this._updateEvent(event);
      }, this)
    }

    private _updateEvent(event: AVM1EventHandler) {
      if (avm1HasEventProperty(this.context, this, event.propertyName)) {
        this._addEventListener(event);
      } else {
        this._removeEventListener(event);
      }
    }

    private _addEventListener(event: AVM1EventHandler) {
      var propertyName = normalizeEventName(this.context, event.propertyName);
      var listener: any = this._eventsListeners[propertyName];
      if (!listener) {
        listener = function avm1EventHandler() {
          var args = event.argsConverter ? event.argsConverter.apply(null, arguments) : null;
          avm1BroadcastNativeEvent(this.context, this, propertyName, args);
        }.bind(this);
        this.as3Object.addEventListener(event.eventName, listener);
        event.onBind(this);
        this._eventsListeners[propertyName] = listener;
      }
    }

    private _removeEventListener(event: AVM1EventHandler) {
      var propertyName = normalizeEventName(this.context, event.propertyName);
      var listener: any = this._eventsListeners[propertyName];
      if (listener) {
        event.onUnbind(this);
        this.as3Object.removeEventListener(event.eventName, listener);
        this._eventsListeners[propertyName] = null;
      }
    }

    public onEventPropertyModified(propertyName: string) {
      var propertyName = normalizeEventName(this.context, propertyName);
      var event = this._eventsMap[propertyName];
      this._updateEvent(event);
    }

    // Common DisplayObject properties

    public get_alpha(): number {
      return this.as3Object.alpha * 100;
    }

    public set_alpha(value: number) {
      value = alToNumber(this.context, value);
      if (isNaN(value)) {
        return;
      }
      this.as3Object.alpha = value / 100;
    }

    public getBlendMode(): string {
      return this.as3Object.blendMode;
    }

    public setBlendMode(value: string) {
      value = typeof value === 'number' ? BlendModesMap[value] : alCoerceString(this.context, value);
      this.as3Object.blendMode = value || null;
    }

    public getCacheAsBitmap(): boolean {
      return this.as3Object.cacheAsBitmap;
    }

    public setCacheAsBitmap(value: boolean) {
      value = alToBoolean(this.context, value);
      this.as3Object.cacheAsBitmap = value;
    }

    public getFilters(): AVM1Object {
      return convertFromAS3Filters(this.context, this.as3Object.filters);
    }

    public setFilters(value) {
      this.as3Object.filters = convertToAS3Filters(this.context, value);
    }

    public get_focusrect(): boolean {
      return this.as3Object.focusRect || false; // suppressing null
    }

    public set_focusrect(value: boolean) {
      value = alToBoolean(this.context, value);
      this.as3Object.focusRect = value;
    }

    public get_height() {
      return this.as3Object.height;
    }

    public set_height(value: number) {
      value = alToNumber(this.context, value);
      if (isNaN(value)) {
        return;
      }
      this.as3Object.height = value;
    }

    public get_highquality(): number {
      switch (this.get_quality()) {
        case 'BEST':
          return 2;
        case 'HIGH':
          return 1;
        default: // case 'LOW':
          return 0;
      }
    }

    public set_highquality(value: number) {
      var quality: string;
      switch (alToInteger(this.context, value)) {
        case 2:
          quality = 'BEST';
          break;
        case 1:
          quality = 'HIGH';
          break;
        default:
          quality = 'LOW';
          break;
      }
      this.set_quality(quality);
    }

    public getMenu() {
      Debug.somewhatImplemented('AVM1SymbolBase.getMenu');
      // return this.as3Object.contextMenu;
    }

    public setMenu(value) {
      Debug.somewhatImplemented('AVM1SymbolBase.setMenu');
      // this.as3Object.contextMenu = value;
    }

    public get_name(): string {
      return this.as3Object.name;
    }

    public set_name(value: string) {
      value = alCoerceString(this.context, value);
      this.as3Object.name = value;
    }

    public get_parent(): AVM1MovieClip {
      var parent = getAVM1Object(this.as3Object.parent, this.context);
      // In AVM1, the _parent property is `undefined`, not `null` if the element has no parent.
      return <AVM1MovieClip>parent || undefined;
    }

    public set_parent(value: AVM1MovieClip) {
      // Ignored setter.
    }

    public getOpaqueBackground(): number {
      return this.as3Object.opaqueBackground;
    }

    public setOpaqueBackground(value: number) {
      if (isNullOrUndefined(value)) {
        this.as3Object.opaqueBackground = null;
      } else {
        this.as3Object.opaqueBackground = alToInt32(this.context, value);
      }
    }

    public get_quality(): string {
      Debug.somewhatImplemented('AVM1SymbolBase.get_quality');
      return 'HIGH';
    }

    public set_quality(value) {
      Debug.somewhatImplemented('AVM1SymbolBase.set_quality');
    }

    public get_root(): AVM1MovieClip {
      var as3Object: flash.display.InteractiveObject = this.as3Object;
      while (as3Object && as3Object !== as3Object.root) {
        var as2Object = <AVM1MovieClip>getAVM1Object(as3Object, this.context);
        if (as2Object.get_lockroot()) {
          return as2Object;
        }
        as3Object = as3Object.parent;
      }
      if (!as3Object) {
        return undefined;
      }
      return <AVM1MovieClip>getAVM1Object(as3Object, this.context);
    }

    public get_rotation(): number {
      return this.as3Object.rotation;
    }

    public set_rotation(value: number) {
      value = alToNumber(this.context, value);
      if (isNaN(value)) {
        return;
      }
      this.as3Object.rotation = value;
    }

    public getScale9Grid(): AVM1Rectangle {
      return AVM1Rectangle.fromAS3Rectangle(this.context, this.as3Object.scale9Grid);
    }

    public setScale9Grid(value: AVM1Rectangle) {
      this.as3Object.scale9Grid = isNullOrUndefined(value) ? null : toAS3Rectangle(value);
    }

    public getScrollRect(): AVM1Rectangle {
      return AVM1Rectangle.fromAS3Rectangle(this.context, this.as3Object.scrollRect);
    }

    public setScrollRect(value: AVM1Rectangle) {
      this.as3Object.scrollRect = isNullOrUndefined(value) ? null : toAS3Rectangle(value);
    }

    public get_soundbuftime(): number {
      Debug.somewhatImplemented('AVM1SymbolBase.get_soundbuftime');
      return 0;
    }

    public set_soundbuftime(value: number) {
      Debug.somewhatImplemented('AVM1SymbolBase.set_soundbuftime');
    }

    public getTabEnabled(): boolean {
      return this.as3ObjectOrTemplate.tabEnabled;
    }

    public setTabEnabled(value: boolean) {
      value = alToBoolean(this.context, value);
      this.as3ObjectOrTemplate.tabEnabled = value;
    }

    public getTabIndex(): number {
      var tabIndex = this.as3Object.tabIndex;
      return tabIndex < 0 ? undefined : tabIndex;
    }

    public setTabIndex(value: number) {
      if (isNullOrUndefined(value)) {
        this.as3Object.tabIndex = -1;
      } else {
        this.as3Object.tabIndex = alToInteger(this.context, value);
      }
    }

    public get_target(): string {
      var nativeObject: flash.display.DisplayObject = this.as3Object;
      if (nativeObject === nativeObject.root) {
        return '/';
      }
      var path = '';
      do {
        if (isNullOrUndefined(nativeObject)) {
          release || Debug.assert(false);
          return undefined; // something went wrong
        }
        path = '/' + nativeObject.name + path;
        nativeObject = nativeObject.parent;
      } while (nativeObject !== nativeObject.root);
      return path;
    }

    public getTransform(): AVM1Object {
      var transformCtor = <AVM1Function>this.context.globals.Transform;
      return transformCtor.alConstruct([this]);
    }

    public setTransform(value: AVM1Transform) {
      if (!(value instanceof AVM1Transform)) {
        return;
      }
      var as3Transform = value.as3Transform;
      this.as3Object.transform = as3Transform;
    }

    public get_visible(): boolean {
      return this.as3Object.visible;
    }

    public set_visible(value: boolean) {
      value = alToBoolean(this.context, value);
      this.as3Object.visible = value;
    }

    public get_url(): string {
      return this.as3Object.loaderInfo.url;
    }

    public get_width(): number {
      return this.as3Object.width;
    }

    public set_width(value: number) {
      value = alToNumber(this.context, value);
      if (isNaN(value)) {
        return;
      }
      this.as3Object.width = value;
    }

    public get_x(): number {
      return this.as3Object.x;
    }

    public set_x(value: number) {
      value = alToNumber(this.context, value);
      if (isNaN(value)) {
        return;
      }
      this.as3Object.x = value;
    }

    public get_xmouse(): number {
      return this.as3Object.mouseX;
    }

    public get_xscale(): number {
      return this.as3Object.scaleX * 100;
    }

    public set_xscale(value: number) {
      value = alToNumber(this.context, value);
      if (isNaN(value)) {
        return;
      }
      this.as3Object.scaleX = value / 100;
    }

    public get_y(): number {
      return this.as3Object.y;
    }

    public set_y(value: number) {
      value = alToNumber(this.context, value);
      if (isNaN(value)) {
        return;
      }
      this.as3Object.y = value;
    }

    public get_ymouse(): number {
      return this.as3Object.mouseY;
    }

    public get_yscale(): number {
      return this.as3Object.scaleY * 100;
    }

    public set_yscale(value: number) {
      value = alToNumber(this.context, value);
      if (isNaN(value)) {
        return;
      }
      this.as3Object.scaleY = value / 100;
    }

    public getDepth() {
      return this.as3Object._depth - DEPTH_OFFSET;
    }
  }

  export var BlendModesMap = [undefined, "normal", "layer", "multiply",
    "screen", "lighten", "darken", "difference", "add", "subtract", "invert",
    "alpha", "erase", "overlay", "hardlight"];

  export function avm1HasEventProperty(context: AVM1Context, target: any, propertyName: string): boolean {
    if (target.alHasProperty(propertyName) &&
        (target.alGet(propertyName) instanceof AVM1Function)) {
      return true;
    }
    var listenersField = target.alGet('_listeners');
    if (!(listenersField instanceof Natives.AVM1ArrayNative)) {
      return false;
    }
    var listeners: any[] = listenersField.value;
    return listeners.some(function (listener) {
      return (listener instanceof AVM1Object) && listener.alHasProperty(propertyName);
    });
  }

  function avm1BroadcastNativeEvent(context: AVM1Context, target: any, propertyName: string, args: any[] = null): void {
    var handler: AVM1Function = target.alGet(propertyName);
    if (handler instanceof AVM1Function) {
      context.executeFunction(handler, target, args);
    }
    var _listeners = target.alGet('_listeners');
    if (_listeners instanceof Natives.AVM1ArrayNative) {
      _listeners.value.forEach(function (listener) {
        if (!(listener instanceof AVM1Object)) {
          return;
        }
        var handlerOnListener: AVM1Function = listener.alGet(propertyName);
        if (handlerOnListener instanceof AVM1Function) {
          context.executeFunction(handlerOnListener, target, args);
        }
      });
    }
  }

  export function avm1BroadcastEvent(context: AVM1Context, target: any, propertyName: string, args: any[] = null): void {
    var handler: AVM1Function = target.alGet(propertyName);
    if (handler instanceof AVM1Function) {
      handler.alCall(target, args);
    }
    var _listeners = target.alGet('_listeners');
    if (_listeners instanceof Natives.AVM1ArrayNative) {
      _listeners.value.forEach(function (listener) {
        if (!(listener instanceof AVM1Object)) {
          return;
        }
        var handlerOnListener: AVM1Function = listener.alGet(propertyName);
        if (handlerOnListener instanceof AVM1Function) {
          handlerOnListener.alCall(target, args);
        }
      });
    }
  }

  export class AVM1Utils {
    static resolveTarget<T extends IAVM1SymbolBase>(context: AVM1Context, target_mc: any = undefined): any {
      return context.resolveTarget(target_mc);
    }

    // Temporary solution as suggested by Yury. Will be refactored soon.
    static resolveMovieClip<T extends IAVM1SymbolBase>(context: AVM1Context, target: any = undefined): any {
      return target ? context.resolveTarget(target) : undefined;
    }

    static resolveLevel(context: AVM1Context, level: number): AVM1MovieClip {
      level = +level;
      return context.resolveLevel(level);
    }

    static resolveLevelOrTarget(context: AVM1Context, target: any): AVM1MovieClip {
      return typeof target === 'number' ?
             <AVM1MovieClip>context.resolveLevel(target) :
             context.resolveTarget(target);
    }
  }

  function createAVM1NativeObject(ctor, nativeObject: flash.display.DisplayObject, context: AVM1Context) {
    // We need to walk on __proto__ to find right ctor.prototype.
    var template;
    var proto = ctor.alGetPrototypeProperty();
    while (proto && !(<any>proto).initAVM1SymbolInstance) {
      if ((<any>proto)._as3ObjectTemplate && !template) {
        template = (<any>proto)._as3ObjectTemplate;
      }
      proto = proto.alPrototype;
    }
    release || Debug.assert(proto);
    var avm1Object = Object.create(proto);
    (<any>proto).initAVM1SymbolInstance.call(avm1Object, context, nativeObject);
    avm1Object.alPrototype = ctor.alGetPrototypeProperty();
    avm1Object.alSetOwnConstructorProperty(ctor);
    (<any>nativeObject)._as2Object = avm1Object;
    ctor.alCall(avm1Object);
    if (template) {
      // transfer properties from the template
      for (var prop in template) {
        nativeObject[prop] = template[prop];
      }
    }
    return avm1Object;
  }

  export function getAVM1Object(as3Object, context: AVM1Context): AVM1Object {
    if (!as3Object) {
      return null;
    }
    if (as3Object._as2Object) {
      return as3Object._as2Object;
    }
    var sec = context.sec;
    if (sec.flash.display.MovieClip.axClass.axIsType(as3Object)) {
      var theClass = as3Object._symbol &&
                     context.getSymbolClass(as3Object._symbol.data.id);
      if (theClass) {
        return createAVM1NativeObject(theClass, as3Object, context);
      }
      return createAVM1NativeObject(context.globals.MovieClip, as3Object, context);
    }
    if (sec.flash.display.SimpleButton.axClass.axIsType(as3Object)) {
      return createAVM1NativeObject(context.globals.Button, as3Object, context);
    }
    if (sec.flash.text.TextField.axClass.axIsType(as3Object)) {
      return createAVM1NativeObject(context.globals.TextField, as3Object, context);
    }
    if (sec.flash.display.BitmapData.axClass.axIsType(as3Object)) {
      return new as3Object;
    }

    return null;
  }

  export function wrapAVM1NativeMembers(context: AVM1Context, wrap: AVM1Object, obj: any, members: string[], prefixFunctions: boolean = false): void  {
    function wrapFunction(fn) {
      if (isNullOrUndefined(fn)) {
        return undefined;
      }
      release || Debug.assert(typeof fn === 'function');
      if (!prefixFunctions) {
        return new AVM1NativeFunction(context, fn);
      }
      return new AVM1NativeFunction(context, function () {
        var args = Array.prototype.slice.call(arguments, 0);
        args.unshift(context);
        return fn.apply(this, args);
      });
    }
    function getMemberDescriptor(memberName): PropertyDescriptor {
      var desc;
      for (var p = obj; p; p = Object.getPrototypeOf(p)) {
        desc = Object.getOwnPropertyDescriptor(p, memberName);
        if (desc) {
          return desc;
        }
      }
      return null;
    }

    if (!members) {
      return;
    }
    members.forEach(function (memberName) {
      if (memberName[memberName.length - 1] === '#') {
        // Property mapping
        var getterName = 'get' + memberName[0].toUpperCase() + memberName.slice(1, -1);
        var getter = obj[getterName];
        var setterName = 'set' + memberName[0].toUpperCase() + memberName.slice(1, -1);
        var setter = obj[setterName];
        release || Debug.assert(getter || setter, 'define getter or setter')
        wrap.alSetOwnProperty(memberName.slice(0, -1), {
          flags: AVM1PropertyFlags.ACCESSOR | AVM1PropertyFlags.DONT_DELETE | AVM1PropertyFlags.DONT_ENUM,
          get: wrapFunction(getter),
          set: wrapFunction(setter)
        })
        return;
      }

      var desc = getMemberDescriptor(memberName);
      if (!desc) {
        return;
      }
      if (desc.get || desc.set) {
        release || Debug.assert(false, 'Redefine ' + memberName + ' property getter/setter as functions');
        return;
      }

      var value = desc.value;
      if (typeof value === 'function') {
        value = wrapFunction(value);
      }
      wrap.alSetOwnProperty(memberName, {
        flags: AVM1PropertyFlags.DATA | AVM1PropertyFlags.DONT_DELETE | AVM1PropertyFlags.DONT_ENUM,
        value: value
      })
    });
  }

  export function wrapAVM1NativeClass(context: AVM1Context, wrapAsFunction: boolean, cls: typeof AVM1Object, staticMembers: string[], members: string[], call?: Function, cstr?: Function): AVM1Object  {
    var wrappedFn = wrapAsFunction ?
      new AVM1NativeFunction(context, call || function () { }, function () {
        // Creating simple AVM1 object
        var obj = new cls(context);
        obj.alPrototype = wrappedPrototype;
        obj.alSetOwnConstructorProperty(wrappedFn);
        if (cstr) {
          cstr.apply(obj, arguments);
        }
        return obj;
      }) :
      new AVM1Object(context);
    wrapAVM1NativeMembers(context, wrappedFn, cls, staticMembers, true);
    var wrappedPrototype = new cls(context);
    wrappedPrototype.alPrototype = context.builtins.Object.alGetPrototypeProperty();
    wrapAVM1NativeMembers(context, wrappedPrototype, cls.prototype, members, false);
    alDefineObjectProperties(wrappedFn, {
      prototype: {
        value: wrappedPrototype
      }
    });
    alDefineObjectProperties(wrappedPrototype, {
      constructor: {
        value: wrappedFn,
        writable: true
      }
    });
    return wrappedFn;
  }

  // TODO: type arguments strongly
  export function initializeAVM1Object(as3Object: any,
                                       context: AVM1Context,
                                       placeObjectTag: any) {
    var instanceAVM1 = <AVM1SymbolBase<flash.display.DisplayObject>>getAVM1Object(as3Object, context);
    release || Debug.assert(instanceAVM1);

    if (placeObjectTag.variableName) {
      instanceAVM1.alPut('variable', placeObjectTag.variableName);
    }

    var events = placeObjectTag.events;
    if (!events) {
      return;
    }
    var stageListeners = [];
    var as3Stage = (<any>context.globals.Stage)._as3Stage;
    for (var j = 0; j < events.length; j++) {
      var swfEvent = events[j];
      var actionsData;
      if (swfEvent.actionsBlock) {
        actionsData = context.actionsDataFactory.createActionsData(
          swfEvent.actionsBlock,
          's' + placeObjectTag.symbolId + 'd' + placeObjectTag.depth + 'e' + j);
        swfEvent.actionsBlock = null;
        swfEvent.compiled = actionsData;
      } else {
        actionsData = swfEvent.compiled;
      }
      release || Debug.assert(actionsData);
      var handler = clipEventHandler.bind(null, actionsData, instanceAVM1);
      var flags = swfEvent.flags;
      for (var eventFlag in ClipEventMappings) {
        eventFlag |= 0;
        if (!(flags & (eventFlag | 0))) {
          continue;
        }
        var eventMapping = ClipEventMappings[eventFlag];
        var eventName = eventMapping.name;
        if (!eventName) {
          Debug.warning(AVM1ClipEvents[eventFlag] + ' ClipEvent not implemented');
          continue;
        }

        // AVM1 MovieClips are set to button mode if one of the button-related event listeners is
        // set. This behaviour is triggered regardless of the actual value they are set to.
        if (eventMapping.isButtonEvent) {
          as3Object.buttonMode = true;
        }

        // Some AVM1 MovieClip events (e.g. mouse and key events) are bound to
        // the stage rather then object itself -- binding listeners there.
        if (eventMapping.isStageEvent) {
          stageListeners.push({eventName: eventName, handler: handler});
          as3Stage.addEventListener(eventName, handler);
        } else {
          as3Object.addEventListener(eventName, handler);
        }
      }
    }
    if (stageListeners.length > 0) {
      as3Object.addEventListener('removedFromStage', function () {
        for (var i = 0; i < stageListeners.length; i++) {
          as3Stage.removeEventListener(stageListeners[i].eventName, stageListeners[i].fn, false);
        }
      }, false);
    }
  }

  function clipEventHandler(actionsData: AVM1.AVM1ActionsData,
                            receiver: IAVM1SymbolBase) {
    return receiver.context.executeActions(actionsData, receiver);
  }

  import AVM1ClipEvents = SWF.Parser.AVM1ClipEvents;
  var ClipEventMappings: Map<number, {name: string; isStageEvent: boolean; isButtonEvent: boolean}>;
  ClipEventMappings = Object.create(null);
  ClipEventMappings[AVM1ClipEvents.Load] = {name: 'load', isStageEvent: false, isButtonEvent: false};
  // AVM1's enterFrame happens at the same point in the cycle as AVM2's frameConstructed.
  ClipEventMappings[AVM1ClipEvents.EnterFrame] = {name: 'frameConstructed', isStageEvent: false, isButtonEvent: false};
  ClipEventMappings[AVM1ClipEvents.Unload] = {name: 'unload', isStageEvent: false, isButtonEvent: false};
  ClipEventMappings[AVM1ClipEvents.MouseMove] = {name: 'mouseMove', isStageEvent: true, isButtonEvent: false};
  ClipEventMappings[AVM1ClipEvents.MouseDown] = {name: 'mouseDown', isStageEvent: true, isButtonEvent: false};
  ClipEventMappings[AVM1ClipEvents.MouseUp] = {name: 'mouseUp', isStageEvent: true, isButtonEvent: false};
  ClipEventMappings[AVM1ClipEvents.KeyDown] = {name: 'keyDown', isStageEvent: true, isButtonEvent: false};
  ClipEventMappings[AVM1ClipEvents.KeyUp] = {name: 'keyUp', isStageEvent: true, isButtonEvent: false};
  ClipEventMappings[AVM1ClipEvents.Data] = {name: null, isStageEvent: false, isButtonEvent: false};
  ClipEventMappings[AVM1ClipEvents.Initialize] = {name: 'initialize', isStageEvent: false, isButtonEvent: false};
  ClipEventMappings[AVM1ClipEvents.Press] = {name: 'mouseDown', isStageEvent: true, isButtonEvent: true};
  ClipEventMappings[AVM1ClipEvents.Release] = {name: 'click', isStageEvent: false, isButtonEvent: true};
  ClipEventMappings[AVM1ClipEvents.ReleaseOutside] = {name: 'releaseOutside', isStageEvent: false, isButtonEvent: true};
  ClipEventMappings[AVM1ClipEvents.RollOver] = {name: 'mouseOver', isStageEvent: true, isButtonEvent: true};
  ClipEventMappings[AVM1ClipEvents.RollOut] = {name: 'mouseOut', isStageEvent: true, isButtonEvent: true};
  ClipEventMappings[AVM1ClipEvents.DragOver] = {name: null, isStageEvent: false, isButtonEvent: false};
  ClipEventMappings[AVM1ClipEvents.DragOut] =  {name: null, isStageEvent: false, isButtonEvent: false};
  ClipEventMappings[AVM1ClipEvents.KeyPress] =  {name: null, isStageEvent: true, isButtonEvent: false};
  ClipEventMappings[AVM1ClipEvents.Construct] =  {name: 'construct', isStageEvent: false, isButtonEvent: false};

}
